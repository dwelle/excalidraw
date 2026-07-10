# Element animations (fade & fly)

This document describes the element animation system: why it exists, how it's designed, the public API, the behavioral contracts host apps must follow, and known limitations.

## Purpose

The primary consumer is excalidraw-plus, which has a presentations feature where **frames act as slides** and elements within a slide need to animate (fade in/out, fly in/out) as the user steps through a presentation.

All presentation state — _what_ to animate, _when_, in _what order_ — lives in the host app. This package only provides the animation **primitives** that the host drives through the imperative API. Animations are intended to run while the editor is in **read-only / view mode** (see [Limitations](#limitations)).

## Design

### Render-time overrides, not element mutation

The core decision: animated values never touch the elements themselves. Animated opacity and position live in **override maps** (`elementId → opacity`, `elementId → {x, y} offset`) that the renderers resolve at draw time, on top of the untouched element data.

Why this matters:

- **Store / undo / collab stay clean.** No mutations means no store increments, no undo entries, no deltas broadcast to collaborators.
- **Element canvas caches stay warm.** `ShapeCache` and the per-element canvases are keyed off the real elements; animating never invalidates shape generation (the expensive part of rendering). A fade or fly re-blits cached canvases at a different alpha/offset.
- **Exports render true state.** `exportToCanvas`/`exportToSvg` build their own render config without overrides, so an export taken mid-animation shows the real scene.

Position overrides are **offsets** (`dx`/`dy`), not absolute coordinates, so they compose with any concurrent change to the element's real position.

### The `ElementAnimator`

The entire engine lives in [`elementAnimator.ts`](./elementAnimator.ts), instantiated once per `App`. It owns:

- the override maps (`opacityOverrides`, `positionOverrides`),
- per-element animation states (from/to values, easing, duration, delay, elapsed),
- batch bookkeeping (see [Batches & handles](#batches--handles)),
- a single `AnimationController` rAF loop per editor instance that advances all running animations and writes new override values each frame.

It's decoupled from `App` through four constructor dependencies (`animationKey`, `getScene`, `getViewportSceneSize`, `onRepaint`), so it can be unit-tested without mounting the editor. `App` keeps thin public delegates (`animateElements`, `cancelElementAnimation`, `clearElementAnimationOverrides`) that the imperative API exposes.

### Repaint mechanism

The override maps are mutated in place, and `StaticCanvas` memoizes on a shallow compare of its `renderConfig` — so map mutations alone would never repaint. The animator therefore maintains a monotonically increasing `version` counter, bumped on every override change and passed into `renderConfig` as `renderAnimationVersion`. Each frame that actually changes a value bumps the version and triggers a React render (`setState({})`, the same pattern the editor uses for panning/dragging); frames where nothing changed (e.g. during a stagger delay) skip the repaint entirely.

## API

### `api.animateElements(request | request[]): ElementAnimationHandle`

```ts
type ElementAnimationRequest =
  | {
      type: "fade";
      elements: readonly (ExcalidrawElement | string)[]; // elements or ids
      duration?: number; // ms, default 250
      delay?: number; // ms, default 0
      stagger?: number; // ms between stagger slots, default 0
      phase?: "in" | "out"; // default "in"
      easing?: "linear" | "easeOut" | "easeInOut"; // default "easeInOut"
    }
  | {
      type: "fly";
      from: "left" | "right" | "top" | "bottom";
      // ...same shared fields; easing defaults to "easeOut"
    };
```

All request/handle types are exported from the package (`ElementAnimationRequest`, `ElementAnimationHandle`, `ElementAnimationResult`, `ElementAnimationEasing`, `ElementAnimationPhase`, `ElementAnimationFlyFrom`, ...).

Semantics:

- **Elements are resolved by id against the live scene** at call time; stale element references are fine, ids are fine, unknown/deleted ids are skipped.
- **Fade** tweens opacity `0 ↔ element.opacity` (the element's own opacity is the visible endpoint, so a 50%-opacity element fades to 50%, not 100%).
- **Fly** combines the fade with a position offset large enough to start (or end) fully off-viewport, computed from the viewport size at call time.
- **`phase: "in"`** animates _toward_ visible/rest; **`"out"`** animates away.
- Passing an **array of requests** runs them as one batch (one handle, one `finished` promise) — e.g. fade one group in while flying another out.

#### Bound text grouping & stagger

Each user-passed element expands into a **group** that animates as one unit: the element plus its bound text (or, if you pass a bound text element, its container). This mirrors canvas selection behavior — a labeled shape is functionally one item.

`stagger` assigns delay slots **per group, not per expanded element**: animating `[rectA, rectB]` (both labeled) with `stagger: 100` starts rectA _and its label_ at t=0, rectB and its label at t=100.

#### Batches & handles

Every `animateElements` call creates a batch and returns a handle:

```ts
type ElementAnimationHandle = {
  id: string;
  elementIds: readonly string[]; // full expanded id list
  finished: Promise<ElementAnimationResult>; // never rejects
  finish: () => ElementAnimationResult; // jump to end state now
  cancel: () => ElementAnimationResult; // drop overrides now
  getStatus: () =>
    | "running"
    | "finished"
    | "cancelled"
    | "interrupted"
    | "destroyed";
};
```

- `finished` resolves when the **last** element of the batch settles — this is the intended sequencing primitive (`await handle.finished; nextStep()`).
- `finish()` snaps all still-running elements to their **end** values (overrides pinned at the target); `cancel()` **removes** their overrides (elements snap back to true rendering). Both are idempotent and return the same result object on repeated calls.
- **Interruption:** starting a new animation on an element that's already animating releases it from the old batch (old batch resolves `interrupted` once empty) and the new animation **starts from the current animated value** — mid-fade reversals are smooth, a fly-out interrupting a fly-in returns from wherever the element currently is.
- Empty batches (no resolvable elements) resolve `finished` immediately.
- Elements deleted mid-animation are released and their overrides dropped.
- On editor unmount all pending batches resolve with status `"destroyed"`.

### `api.cancelElementAnimation(id)`

Stops the animation on a single element and removes its overrides (also removes pinned overrides of already-finished animations for that element).

### `api.clearElementAnimationOverrides()`

Nukes everything: stops all animations, clears both override maps, settles all batches as `cancelled`. **Call this on every slide/step transition** — see the contract below.

### `resolveRenderOpacity` prop (steady-state visibility)

```ts
resolveRenderOpacity?: (element: NonDeletedExcalidrawElement) => number | undefined;
```

Lets the host control render-time opacity for the _steady state_ — typically "elements not yet revealed in this slide render at 0". Return `undefined` to fall back to the element's own opacity.

Contract (also in the prop's JSDoc):

- **Must be cheap** — called for every element on every static-canvas render.
- **Memoize with `useCallback` keyed on the state it reads** (e.g. the set of revealed element ids). A **new function identity is what triggers a canvas repaint** — mutating captured state without changing identity won't repaint, and an inline arrow forces a full canvas redraw on every React render of the host.
- **Precedence: animation overrides beat the resolver** — see below.

## The override-precedence contract

Render-time opacity resolves in this order:

1. animation override (present while animating **and after finishing**),
2. host `resolveRenderOpacity`,
3. the element's own `opacity`.

The crucial consequence: **terminal override values are pinned until explicitly cleared.** After a fade-out, the 0-opacity override is what keeps the element hidden; after a fade-in, the pinned value masks any later change to the element's opacity _and_ whatever the resolver returns.

This gives the host one simple rule:

> **Clear overrides (`clearElementAnimationOverrides()`) on every slide/step transition.**

That single call handles forward navigation, backward navigation, arbitrary slide jumps, and keeps the override maps from growing over a long presentation. The typical step-back flow is: update resolver state (new identity) so the element's steady state is "hidden", and clear overrides — the element disappears instantly.

### Tentative idea: `releaseOverridesOnFinish` (not implemented)

There's an alternative model worth naming, in case the pinning contract ever starts to chafe: _"animations are transitions; the resolver owns steady state."_ Under that model, an animation's override would be **dropped at finish**, handing rendering straight back to `resolveRenderOpacity` / `element.opacity`. Backward navigation would then "just work" (resolver says hidden → hidden) without any clearing.

We deliberately did **not** build this, because it trades one discipline for a stricter one: it's only flash-free if the host updates its resolver state _at animation start_ (mark the element revealed when kicking off its fade-in, so that when the override vanishes the resolver already agrees — and symmetrically for fade-out). The current model's single clear-on-transition rule is simpler, and the shipped host integration is built on pinning semantics.

**The signal to revisit:** if, when implementing backward navigation within a slide's build steps, the host finds itself fighting the overrides — sprinkling `cancelElementAnimation` calls to un-pin individual elements — that's the sign the transition model fits the host better. Even then, the right move is an **opt-in per-request flag** (e.g. `releaseOverridesOnFinish: true` on `ElementAnimationRequest`) rather than changing the default: additive, no migration for existing callers.

## Limitations

- **Interactive canvas ignores overrides.** Selection borders, binding highlights and hit-testing all use the elements' true coordinates: a mid-flight element is clickable at its real position, a faded-out element is still selectable. This is why animations are intended for read-only / presentation contexts.
- **Exports ignore overrides** (by design — exports show true state).
- **Bound arrows between shapes don't follow a flying shape.** Only bound _text_ is grouped with its container. An arrow connecting two shapes can't meaningfully fly with one of them; animate whole groups instead.
- **Fly offsets are computed at call time** from the current viewport; zooming mid-flight doesn't recompute them (irrelevant in practice for presentations).
- Frame clipping applies to the element's _rendered_ (offset) position, so an element flying into a clipped frame is revealed at the frame boundary — generally the desirable look for slides.

## Testing

- [`tests/animateElements.test.tsx`](./tests/animateElements.test.tsx) covers phase presets, interruption chaining, stagger completion order, bound-text stagger grouping, and `finish()`/`cancel()` idempotency.
- The animator's internals are reachable in tests via `(h.app as any).elementAnimator` (`states`, `opacityOverrides`, `positionOverrides`).
- Use `vi.useFakeTimers()` + `window.EXCALIDRAW_THROTTLE_RENDER = false`; the rAF loop falls back to timeouts when throttling is disabled, so `vi.advanceTimersByTimeAsync(ms)` drives animation time deterministically.
