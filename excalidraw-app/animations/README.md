# Host animation prototype

The [editor contract](../../packages/excalidraw/ANIMATIONS.md) exposes one atomic `setElementRenderOverrides()` snapshot. This fork keeps effect presets, reveal state, timing, interruption and completion in `ElementAnimator.ts`, outside the editor package. It replaces the earlier fork's `animateElements`, `cancelElementAnimation`, `clearElementAnimationOverrides` and `resolveRenderOpacity` editor APIs.

## Host API

The helper follows the actual E+ presentation flow: discrete beats, including `withPrevious` groups; reveal counts committed before effects finish; overlapping navigation events; and authoring previews with cancellation and completion. There is no playhead or play/pause/seek abstraction.

```ts
const ownerWindow = mountedNode.ownerDocument.defaultView!;
const animator = new ElementAnimator(api, ownerWindow);

// Presenter navigation: compute visibility from the next reveal counts.
// Include unrevealed targets AND their bound labels across all slides.
const baseOverrides = getVisibilityForRevealCounts(nextRevealCounts);
animator.animateElements(beatRequests, { baseOverrides });

// Authoring preview: ordinary rendering is the base; requests may have delays.
const preview = animator.animateElements(scheduledPreviewRequests);
const result = await preview.finished;
// Cleanup while running: preview.cancel();

// Slide jump: stop motion and commit visibility in one submission.
animator.setBaseOverrides(nextVisibility, { cancelAnimations: true });

// Host unmount: settle pending handles, cancel rAF, clear the editor snapshot.
animator.dispose();
```

`animateElements` accepts one request or an array. Requests support `fade` and `fly` (left/right/top/bottom), in/out phase, duration, delay, stagger and easing. `finished` resolves with `finished`, `cancelled`, `interrupted` or `destroyed`; it does not reject on cancellation. A partially interrupted batch keeps that result when its remaining elements finish.

The animator copies base maps and their supported nested values, both in `setBaseOverrides` and the `baseOverrides` option. Each active frame merges the base with transient values, then submits one snapshot. The initial transition and new base are submitted together. Completion or cancellation removes transient values and returns control to the base: **an outgoing effect needs a hidden base to stay hidden afterwards**. There are no retained terminal values.

Only overlapping targets are interrupted. Cancelling a settled handle, clearing idle animations, or submitting an empty/absent-target batch without a new base does not repaint. Deleted targets are released using direct scene-map lookups. The mounted editor's window supplies `performance.now()` and rAF; the driver stops when no transitions remain.

### Preserved effect semantics

These choices retain existing E+ behavior and remain host policy:

- Containers expand to their bound labels; requesting a bound label also expands to its container. Both share a fly distance and stagger slot. This reverse expansion also existed in the earlier editor animator.
- Groups, frames and connected arrows are not expanded automatically. The caller supplies group members or frame children explicitly. A frame-only fade relies on the renderer's child-opacity inheritance.
- Duplicate targets across requests in one batch use the last request. Within one request, targets already expanded are deduplicated.
- Reversal starts from the last submitted visual value and uses the complete requested duration. A short reversal can therefore feel slow. Try the 1.8-second demo setting before choosing distance-scaled duration as a product change.
- Fly defaults to `easeOut` for both phases; fade defaults to `easeInOut`. E+ currently explicitly requests `easeOut` for fly. Mirroring the exit curve is a separate preset decision, not an editor requirement.
- rAF timestamps can slightly precede a preceding task's `performance.now()`. Negative elapsed time means pre-start progress, including at zero-duration delay boundaries.

## Try the fixtures

Open [the local prototype](http://localhost:3001/animation-prototype). This standalone route has no persistence or collaboration. The animator is the sole snapshot writer, including during editor initialization.

The three slides exercise different cases:

1. **Opening:** bound labels, a link badge, simultaneous fade/fly and a staggered embed placeholder.
2. **Connected & grouped:** a shape bound to an arrow that stays behind, two explicit group targets, a rotated image and a rotated shape. Four beats also exercise navigation between slides with different beat counts.
3. **Frames & boundaries:** a frame child extending beyond the slide, an image and an unframed shape. Edit mode has a frame-only fade preview to check inherited opacity and the frame title.

Next/Previous commit reveal counts immediately, so effects can overlap or reverse. Backward entry reveals the previous slide fully; outgoing visibility survives viewport movement. Slide selection and restart cancel motion and reset destination visibility. Edit mode supports selection preview, frame fade and preview-all with cancellation. Preview-all allows 300 ms for viewport movement and the same 500 ms beat gap used by E+.

Diagnostics counts document-change notifications. Edits, selection and viewport movement may increment it; animation frames should not. The fixtures make the renderer's geometry limits visible; they do not establish a policy for automatically animating connected arrows or groups.

## E+ migration

The design was checked against `presentationAnimations.ts`, `usePresentationAnimations.ts`, animation authoring, navigation and socket handlers in the E+ presentation worktree. That checkout has not been changed by this POC.

| Current E+ call | Host integration |
| --- | --- |
| `resolveRenderOpacity` from `usePresentationRenderOpacity` | Flatten all-slide hidden IDs, including bound text, into a base snapshot. |
| `excalidrawAPI.animateElements(specs)` | `animator.animateElements(specs, { baseOverrides })`. |
| `clearElementAnimationOverrides()` on slide change | `animator.setBaseOverrides(next, { cancelAnimations: true })`. |
| Preview `.cancel()` and `.finished` | Same handle shape. |
| Editor animation request types | Import the types from the host helper. |
| Host/editor unmount | `animator.dispose()`. |

Use one animator per mounted editor, with its owner window. Keep existing reveal counts, beat grouping and realtime messages; each receiving client runs its own helper. Cancel or replace work explicitly on document switches. Remove old comments describing pinned-override precedence during the port.

A Jotai effect can publish a new base for ordinary visibility changes. For animated navigation, compute the next base synchronously from the pure reveal-count helpers and pass it with the requests. Existing non-zero-duration effects will often mask a later effect-driven base update, but that relies on timing; zero-duration effects can finish before it arrives. Passing both together avoids that dependency.

**Keep bound-text expansion for visibility.** E+'s `withBoundTextTargets` participates in `resolveFrameAnimations` and `getFrameHiddenElementIds`; deleting it wholesale leaves unrevealed labels visible. Motion expansion can be consolidated separately when porting.

The open E+ authoring editor had frame rendering and clipping enabled during inspection. Confirm presentation entry and remote playback preserve those flags during integration. Decide separately whether unrevealed links should remain actionable; the existing `onLinkOpen` callback can block navigation without extending the visual snapshot API.

## Rendering measurements

Measured in Chromium 155 on 2026-09-06, using the development app with React 19, Strict Mode and temporary React Profiler/static-render instrumentation. The viewport was 959 × 940 at DPR 1, with a roughly 120 Hz rAF cadence. These are local synthetic measurements, not production FPS guarantees.

Each case ran the actual host animator on an image and a bound-label shape (three animated IDs). Thirty host frames warmed the path, followed by 90 sampled frames. The mixed scene contains 34 elements including text, arrows, groups, frames and images. The hidden-deck case adds 2,000 offscreen rectangles, for 2,015 base entries. The dense-slide case adds another 300 visible shapes/images, reusing the same decoded image file. This does not model many distinct image decodes or a real large E+ deck.

All values below are **p95 milliseconds**. Host time includes evaluation, merge, copy and scheduling. React time is the Profiler's render duration. Canvas time wraps the complete static renderer, including cached-shape drawing. Submission-to-draw includes React scheduling/commit and any canvas scheduling delay, ending when static drawing commands return. These percentiles should not be added together.

| Canvas scheduling | Scene | Host frame | React render | Static canvas | Submission to draw completion |
| --- | --- | --: | --: | --: | --: |
| Direct | Mixed, 34 elements | 0.2 | 0.5 | 0.7 | 1.8 |
| Direct | Hidden deck, 2,034 elements | 0.6 | 1.4 | 0.6 | 2.8 |
| Direct | Dense slide, 2,334 elements | 1.0 | 1.5 | 7.3 | 9.3 |
| Throttled | Mixed, 34 elements | 0.2 | 0.4 | 0.5 | 9.1 |
| Throttled | Hidden deck, 2,034 elements | 0.4 | 1.0 | 0.4 | 9.1 |
| Throttled | Dense slide, 2,334 elements | 0.5 | 1.3 | 5.2 | 13.9 |

Every case produced 90 submissions and 90 corresponding static draws, with zero `onChange` notifications during animation. Copy plus submission alone was 0.1–0.4 ms at p95 across the cases. A simultaneous Chrome performance trace recorded main-thread tasks up to 12.9 ms within the animation regions. The dense direct-render case had a 16.8 ms maximum rAF gap and 20.4 ms p95 from the supplied rAF timestamp to draw completion, showing scheduling pressure that the submission-only benchmark missed.

The trace does not provide a per-frame GPU/presentation timestamp for this canvas path. Canvas durations measure CPU work issuing drawing commands; they do not include asynchronous GPU completion or display scanout. Tracing, profiling and development checks also add overhead. To repeat the measurement, wrap the prototype's editor in a React Profiler, time the full `_renderStaticScene` call, and correlate each draw with its committed snapshot and host rAF submission; timing only the public setter is insufficient. Temporary instrumentation was removed after capture.

The editor package defaults to direct rendering; `excalidraw-app/App.tsx` enables `EXCALIDRAW_THROTTLE_RENDER` globally, including for this route. The inspected E+ app left that flag unset. The throttled path introduced roughly one extra 8.3 ms frame before drawing in the lightweight cases. This is a canvas scheduling distinction, not evidence that exposing an editor clock alone would remove the delay.

**Keep complete snapshots and host rAF for this POC.** Merge/copy cost scales with total hidden plus active entries; liveness checks now scale with active transitions. At the measured sizes, canvas drawing and React cost matter more than snapshot copying. If production decks expose a problem, profile them first, then address the costly phase or internal scheduling. Neither an incremental public API nor an editor frame subscription is justified by these results yet.

## Validation

The focused tests cover snapshot ownership and atomic replacement, invalid input, lifecycle isolation, unrelated-update repaint counts, viewport and frame-drag memoization, shape-cache reuse, visual culling/clipping, export isolation, frame/embed opacity, reset/unmount, reveal handoff, reversal, interruption, bound-label expansion, stagger, delay boundaries, deletion, idle cancellation and disposal.

Browser checks passed for the richer fixtures, image loading, backward navigation and varying beat counts, 1.8-second reversal, preview cancellation, inherited frame/title opacity and unchanged document data during effects.

The focused suites pass **31/31 tests**. Including the existing renderer/export suites gives 64 passing tests and one known failure: the arrow-label SVG test still calls the obsolete three-argument export API. A separate export-test timeout during the concurrent checks passed when that suite was rerun alone with a 15-second timeout. No snapshots were changed. TypeScript reports only the existing `COLOR_PALETTE.black` and obsolete export-call errors; lint passes for the changed TypeScript files.

```sh
yarn vitest run packages/excalidraw/tests/renderOverrides.test.tsx excalidraw-app/animations/ElementAnimator.test.ts
yarn vitest run packages/excalidraw/renderer/helpers.test.ts packages/excalidraw/tests/export.test.tsx packages/excalidraw/tests/scene/export.test.ts --testTimeout=15000
yarn tsc --noEmit
```
