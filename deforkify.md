# Deforkify: retire `@dwelle/excalidraw` in favor of upstream `@excalidraw/excalidraw`

2026-10-20 · Opus 5.5 (1M context), xhigh

## TL;DR

- **The fork is already thin.** `master` is upstream `master` (`bee01e3a1`) plus 3 commits: 36 files, +530/−269. The big fork-only features have already landed upstream:
  - export rewrite → `exportScene` (#12347)
  - render overrides (#12100)
  - "hide Show hints" (on upstream's `release` branch as `17d8904f7`)
- **E+ is the only consumer.** It actually depends on a short list of fork-only things:
  1. `api.app` (20 call sites, 6 distinct `App` members)
  2. the `.exc-style` theming scope
  3. mobile `renderTopRightUI` rendering alongside the defaults
  4. the comment-tool cursor
  5. the `useAppStateValue` re-sync fix
  6. 4 extra root exports (`icons`, `actions`, `duplicateElements`, `SetViewportOptions`)

  Everything else in the fork is unused by E+, dead, or fork release infra.
- **Upstream work needed:** ~4 small fix PRs and ~3 small API PRs (DOM nodes getter, embeddable preloading, theme token scope). The rest are E+-side edits.
- **End state:** E+ depends on `@excalidraw/excalidraw@next`, with `@excalidraw/common|element|math` at the same version, published from upstream's `release` branch. The fork is archived.

## Current state

### Consumers

Only E+ ([excalidraw-plus](https://github.com/excalidraw-plus/excalidraw-plus) and its worktrees). It pins:

- `@dwelle/excalidraw@0.5.0-5e7e32b` (this fork)
- `@excalidraw/common@0.18.0-43a92e6`, `@excalidraw/element@0.18.0-43a92e6` (upstream `next` builds)
- `@excalidraw/utils@0.1.6` (published by hand)

E+ has no path aliases or pnpm patches for the package.

### Release mechanics today

| | Fork | Upstream |
|---|---|---|
| Trigger | push to `master` ([autorelease-fork.yml](.github/workflows/autorelease-fork.yml)) | push to `release` (`autorelease-excalidraw.yml`) |
| Script | [scripts/autorelease-fork.js](scripts/autorelease-fork.js): renames to `@dwelle/excalidraw`, `0.5.0-<hash>`, `@latest` | `scripts/release.js --tag=next`: publishes `common`, `fractional-indexing`, `math`, `element`, `excalidraw` as `0.18.0-<hash>` `@next` |
| Internal packages | **inlined** into the bundle ([scripts/buildPackage.js](scripts/buildPackage.js) drops `external`, [packages/excalidraw/package.json](packages/excalidraw/package.json) drops the `@excalidraw/{common,element,math}` deps) | `external`, declared as deps |
| Current | `latest: 0.5.0-5e7e32b` | `next: 0.18.0-17d8904` (2026-10-19). `release` = master@`e1b7aacb3` + "hide Show hints" |

Because of the inlining, E+ ships `@excalidraw/element` twice: once inside `@dwelle/excalidraw`, once as a direct dep. Today this costs bundle size, not correctness. E+'s client code only imports stateless helpers from `@excalidraw/element`. The stateful ones (`Scene`, `setCustomTextMetricsProvider`) run only in the separate `public-api` server process. Upstream's externals model dedupes this, provided E+ pins all `@excalidraw/*` packages to one version.

## Inventory

`git diff upstream/master master`, cross-checked against `~/dev/excalidraw-plus` (branch `dwelle/export-scene`, `da4e13782`). In E+ links below, `EP` = `../excalidraw-plus/apps/excalidraw-plus/src`.

### A. Generic fixes: upstream as-is

| # | Change | Fork location | E+ needs it? | Notes |
|---|---|---|---|---|
| A1 | `useAppStateValue` re-reads the latest value when (re)subscribing, and adds `_internal` to the effect deps | [useAppStateValue.ts:119-129](packages/excalidraw/hooks/useAppStateValue.ts#L119-L129) | **Yes** | Without it, `useExcalidrawStateValue("viewBackgroundColor")` ([ExcalidrawScene.tsx:149](../excalidraw-plus/apps/excalidraw-plus/src/pages/ExcalidrawScene/ExcalidrawScene.tsx#L149)) stays stale after a scene switch until the next change. Add a regression test. Drop the redundant `scrollConstraints: null` stub ([useAppStateValue.ts:51](packages/excalidraw/hooks/useAppStateValue.ts#L51), [appStateHooks.test.tsx:20](packages/excalidraw/tests/appStateHooks.test.tsx#L20)): `getDefaultAppState()` already sets it ([appState.ts:105](packages/excalidraw/appState.ts#L105)). |
| A2 | Mobile: render `renderTopRightUI` **alongside** the default top-right UI (pen mode + sidebar trigger) instead of replacing it | [MobileMenu.tsx:71-87](packages/excalidraw/components/MobileMenu.tsx#L71-L87) | **Yes** | E+'s `renderTopRightUI` always returns a Fragment ([Excalidraw.tsx:805-828](../excalidraw-plus/apps/excalidraw-plus/src/components/Excalidraw.tsx#L805-L828)). Upstream's `??` would hide the pen-mode button and E+'s `DefaultSidebar.Trigger` on phones. The fork's version matches desktop, which already renders both ([LayerUI.tsx:416-424](packages/excalidraw/components/LayerUI.tsx#L416-L424)). It is a behavior change for other hosts, so it needs a CHANGELOG note. |
| A3 | Unmount guard: throw only in dev/test. In prod, `console.warn` and still call the original method | [App.tsx:3932-3940](packages/excalidraw/components/App.tsx#L3932-L3940) | Not today, but see below | **Upstream bug found during the audit:** `componentWillUnmount` sets `this.api = { ...this.api, isDestroyed: true }` ([App.tsx:3923](packages/excalidraw/components/App.tsx#L3923)) on a *new* object. The reference a host got from `onExcalidrawAPI` never sees `isDestroyed: true` or the wrapped methods, so E+'s ~15 `isDestroyed` guards (e.g. [ExcalidrawEditor.collaboration.ts](../excalidraw-plus/apps/excalidraw-plus/src/components/ExcalidrawEditor/ExcalidrawEditor.collaboration.ts)) never fire, upstream or fork. Fix both in one PR: flag the original object as destroyed (or make `isDestroyed` a getter), still hand the provider a new reference, and use the warn-in-prod policy. Once the host's reference is wrapped, upstream's throw-in-prod would start crashing E+'s unguarded paths, so the two must ship together. |
| A4 | Clear the element canvas cache on editor unmount (`clearRenderCache()`) | [renderElement.ts:724-731](packages/element/src/renderElement.ts#L724-L731), [App.tsx:3979](packages/excalidraw/components/App.tsx#L3979) | Indirectly (memory) | Mirrors the existing `ShapeCache.destroy()` next to it. Upstream it without the `export let` rebinding, e.g. wrap the `WeakMap` in a small cache object with `destroy()`. |
| A5 | `MultiDimension` imports `getCommonBounds` from `@excalidraw/element` instead of `@excalidraw/utils` | [MultiDimension.tsx:6](packages/excalidraw/components/Stats/MultiDimension.tsx#L6) | No | The editor package shouldn't reach into `utils`. Chore PR. |
| A6 | `MermaidToExcalidraw.test.tsx` uses `pointFrom<LocalPoint>` for mock points | [MermaidToExcalidraw.test.tsx:67-70](packages/excalidraw/tests/MermaidToExcalidraw.test.tsx#L67-L70) | No | Fold it into the A5 chore PR. |

### B. E+ needs it, upstream has no equivalent: new public API

#### B1. `ExcalidrawImperativeAPI.app` (fork: [App.tsx:794](packages/excalidraw/components/App.tsx#L794), [types.ts:1472](packages/excalidraw/types.ts#L1472))

20 call sites in E+. No `.app.state`, `.app.scene` or `.app.setState` access, so it's tractable. Per member:

| `App` member | E+ usage | Replacement |
|---|---|---|
| `getSceneElements()` | [commentThreads.ts:84](../excalidraw-plus/libs/global/excalidraw-utils/src/lib/commentThreads.ts#L84) | E+: public `api.getSceneElements()`, drop-in |
| `canvas` (static) | wheel re-dispatch ([Frame.tsx:78](../excalidraw-plus/apps/excalidraw-plus/src/components/Excalidraw/Frame.tsx#L78), `ExcalidrawEditor.lifecycle.ts:95`); ResizeObserver, rects and popover `collisionBoundary` in comments (`SceneComments.tsx:114-120`, `CommentsThread.tsx:97-98`, `ThreadCreate.tsx:111`); image-load ordering (`excalidraw-file-manager.ts:612,616`); dead `isOutsideViewport` (`excalidraw-utils.ts:157,165`) | **Upstream:** read-only `api.getDOMElements(): { container, staticCanvas, interactiveCanvas }`. Small, uncontroversial, and better than relying on class names. Fallback: a scoped `querySelector("canvas.excalidraw__canvas.static")` from E+'s wrapper. Delete the dead `isOutsideViewport` in E+. |
| `interactiveCanvas` | middle-click pointerdown re-dispatch for panning ([Frame.tsx:91](../excalidraw-plus/apps/excalidraw-plus/src/components/Excalidraw/Frame.tsx#L91)) | same `api.getDOMElements()` |
| `excalidrawContainerValue.container` | drag/drop listeners (`Frames/useSlideTemplateDrop.ts:23`) | same `api.getDOMElements()`. E+ already finds the container with `querySelector(".excalidraw-container")` elsewhere. |
| `initializedEmbeds` (private, `@ts-ignore`) | pre-activating the next slide's iframes (`libs/client/hooks/src/lib/usePreloadPresiEmbeddables.ts:37`) | **Upstream:** `api.preloadEmbeddables(elementIds)`. It adds the ids to the lazy-mount set ([App.tsx:1836-1841](packages/excalidraw/components/App.tsx#L1836-L1841)) and triggers a re-render. Presentations need it, and it's a reasonable public feature. |
| `actionManager.executeAction(actions.actionSaveFileToDisk)` | custom "Save to file" menu item ([Excalidraw.tsx:475](../excalidraw-plus/apps/excalidraw-plus/src/components/Excalidraw.tsx#L475), links `ExcalidrawReadOnly.tsx:122`) | E+: `serializeAsJSON` (a root export) plus a file save. Or upstream a `MainMenu.DefaultItems.SaveToFile` item: there's no default item for `actionSaveFileToDisk` today ([DefaultItems.tsx](packages/excalidraw/components/main-menu/DefaultItems.tsx)). |

#### B2. Theme token scope (`.exc-style`)

- **Fork:** [theme.scss:5-6](packages/excalidraw/css/theme.scss#L5-L6), [theme.scss:179-187](packages/excalidraw/css/theme.scss#L179-L187), [styles.scss:41-42](packages/excalidraw/css/styles.scss#L41-L42), [Button.scss](packages/excalidraw/components/Button.scss).
- **E+ uses it heavily.** It wraps presentation chrome outside the editor in `.exc-style` (`PresentationSceneEditor.tsx:244`, `PresentationEditScene.tsx:296`, `PresentationRemote.tsx:201`), relies on it in CSS (`Excalidraw.css:5`, `Main.css:747`, `global-styles/global.css:203,224,294`), and renders `.excalidraw-button` outside `.excalidraw` (`CanvasButton`, `PresentationToolbarButton`, `TemporaryMarketplaceLink`).
- **Dark mode** for that chrome comes only from the fork's `.dark .exc-style` rule (E+ toggles `.dark` on `<html>` in `UserSettingsContext.tsx:108`).
- **Proposal:** upstream a documented tokens-only scope class that carries the CSS variables, `--ui-font` and `.excalidraw-button` styles, but **no layout**. Dark mode comes via `.theme--dark` on the scope element, not a global `.dark` ancestor, which upstream is unlikely to accept. E+ then toggles `theme--dark` on its wrappers.
- **Fix the regression while porting:** the fork's split has already regressed. The layout rules (`position`, `overflow`, `display:flex`, `user-select`) also sit in the shared `.exc-style, .excalidraw` block ([styles.scss:54-87](packages/excalidraw/css/styles.scss#L54-L87)), and a second `.excalidraw` block duplicates them ([styles.scss:108-125](packages/excalidraw/css/styles.scss#L108-L125)).
- **Fallback:** E+ copies the tokens it needs into `global-styles`. It's brittle, since tokens drift with every editor release.

#### B3. Comment-tool cursor

- **Fork:** hardcoded for `activeTool.customType === "comment"` ([App.cursor.ts:146-163](packages/excalidraw/components/App.cursor.ts#L146-L163)).
- **E+:** activates the tool in `CommentTool.tsx:36-39,117-120` and `Excalidraw.commandPalette.tsx:591-594`, and never sets a cursor itself.
- **Try E+-side first:** call the public `api.setCursor()` when the comment tool activates and `api.resetCursor()` when it deactivates. Upstream's cursor logic leaves custom tools alone ([App.cursor.ts:164](packages/excalidraw/components/App.cursor.ts#L164)).
- **If hover or pointer-up paths reset the cursor,** upstream a generic per-custom-tool cursor instead, e.g. `setActiveTool({ type: "custom", customType, cursor })`.

### C. E+-side edits only (no upstream work)

| # | Fork item | E+ change |
|---|---|---|
| C1 | `id` prop / `onChange` 4th arg ([types.ts:846](packages/excalidraw/types.ts#L846), [App.tsx:4535](packages/excalidraw/components/App.tsx#L4535)) | The prop is passed but the argument is never read. Remove `id` at [Excalidraw.tsx:745](../excalidraw-plus/apps/excalidraw-plus/src/components/Excalidraw.tsx#L745) ("does nothing ATM"), `PresentationEditScene.tsx:318` and `ExcalidrawReadOnly.tsx:142`, plus the `ExcalidrawReadOnly` prop typing at `:32`. TypeScript-only change. |
| C2 | `initialData.scrollX/scrollY` ([App.tsx:3703-3708](packages/excalidraw/components/App.tsx#L3703-L3708)) | Not used at runtime: E+ restores scroll via `appState` (`ExcalidrawEditor.initialData.ts:97-114`) and `initialState.viewport`. Delete the stale fields from `libs/global/types/src/lib/excalidraw-types.ts:69-70`. |
| C3 | `duplicateElements` root export | Import from `@excalidraw/element` (`Frames/frameUtils.ts:13`, `Frames/slideTemplates.ts:10`). |
| C4 | `icons` namespace export | Copy `ExportIcon` and `handIcon` into `@client/icons` (`Excalidraw.tsx:473`, links `ExcalidrawReadOnly.tsx:120`, `PresentationEditModeToggle.tsx:98`). |
| C5 | `actions` namespace export | Goes away with the B1 "Save to file" replacement. |
| C6 | `SetViewportOptions` type | `import type … from "@excalidraw/excalidraw/viewport"`. Upstream's exports map serves `./*` types. Used in `Frames/frameAtoms.ts:3` and `libs/global/constants/src/lib/presentations-constants.ts:1`. Or add a trivial root type export upstream. |
| C7 | "Show hints" hidden in Preferences and command palette ([f499d71a4](https://github.com/dwelle/excalidraw/commit/f499d71a4)) | Already on upstream `release`. E+ gets it as long as it consumes `next` builds from `release`, not upstream `master`. |
| C8 | Session export theme is module-level, so the export dark-mode choice survives scene switches ([App.tsx:584](packages/excalidraw/components/App.tsx#L584), [App.tsx:1102-1104](packages/excalidraw/components/App.tsx#L1102-L1104)) | No E+ code depends on it. Upstream keeps it per instance, so it resets on scene switch. **Decide:** accept the reset (recommended: tiny UX delta), or upstream module-level "session" semantics. Upstream would barely notice, since excalidraw.com never remounts. |

### D. Dead code and regressions in the fork: delete

Unused by both the fork and E+:

- [components/HomeButton.tsx](packages/excalidraw/components/HomeButton.tsx): it imports a `HomeButton.scss` that doesn't exist. Delete `HomeIcon` ([icons.tsx:91-100](packages/excalidraw/components/icons.tsx#L91-L100)) with it.
- [components/Menu.scss](packages/excalidraw/components/Menu.scss): never imported. E+'s `.Island.menu-container` rule (`ExcalidrawScene.scss:111`) is dead too.
- `.mobile-misc-tools-container-left` ([styles.scss:920-940](packages/excalidraw/css/styles.scss#L920-L940)) and `LIBRARY_SIDEBAR_WIDTH` ([constants.ts:402](packages/common/src/constants.ts#L402)).
- The `user` prop type ([types.ts:914-916](packages/excalidraw/types.ts#L914-L916)): never read.
- Closing the canvas menu when `UIOptions.canvasActions` is falsy ([App.tsx:4445-4452](packages/excalidraw/components/App.tsx#L4445-L4452)): never true, because [index.tsx:123-131](packages/excalidraw/index.tsx#L123-L131) always merges it into an object.
- The `ExcalidrawContainerContext.id` optional-type change ([App.tsx:494](packages/excalidraw/components/App.tsx#L494)).
- Locale tweaks ([en.json:239-241](packages/excalidraw/locales/en.json#L239-L241)): `"Save to file..."` and the unused `exportToPng`/`exportToSvg` keys. Only marketplace's `MainMenu.DefaultItems.Export` label reverts to "Save to...".
- Fork root exports E+ doesn't use ([index.tsx:566-581](packages/excalidraw/index.tsx#L566-L581)): `getDefaultAppState`, `cleanAppStateForExport`, `clearAppStateForLocalStorage`, `libraryItemsAtom`, `duplicateElement`, `parseMermaidToExcalidraw`.
- **Regression:** `onWindowMessage` became a method ([App.tsx:1106](packages/excalidraw/components/App.tsx#L1106)) but is still registered unbound ([App.tsx:4026](packages/excalidraw/components/App.tsx#L4026)), so `this.ownerDocument` throws on every YouTube/Vimeo `postMessage`. Restore upstream's arrow property.
- Noise: the `isPointHittingLink` import reorder ([App.tsx:418](packages/excalidraw/components/App.tsx#L418)), `./charts` → `./charts/index` ([index.tsx:530](packages/excalidraw/index.tsx#L530)), and the [AppMainMenu.tsx](excalidraw-app/components/AppMainMenu.tsx) import reorder.
- [packages/excalidraw/main.js](packages/excalidraw/main.js): legacy CJS entry pointing at `dist/excalidraw.*.min.js` files the build no longer produces.

### E. Fork infra and playground: retire with the fork

- **Packaging:** `@dwelle` rename, version `0.5.0` vs `0.18.0`, empty `keywords`, inlined internal packages ([buildPackage.js](scripts/buildPackage.js), [package.json](packages/excalidraw/package.json)), [scripts/autorelease-fork.js](scripts/autorelease-fork.js), [autorelease-fork.yml](.github/workflows/autorelease-fork.yml), [autorelease-preview.yml](.github/workflows/autorelease-preview.yml).
- **Removed upstream CI:** `test.yml`, `semantic-pr-title.yml`, `build-docker.yml`.
- **Root scripts:** `clean-setup`, `pull`, a stale `publish` that points at `src/packages/...`, `autorelease-fork` ([package.json:52-95](package.json#L52-L95)). Also `NODE_ENV=production` in [.env.production](.env.production).
- **`excalidraw-app` playground:** comment-tool toggle, `C` hotkey, a "test" `Sidebar`/`Footer`, removal of upstream's image-loading `onExport` progress, and `classList.remove("dark")` ([App.tsx](excalidraw-app/App.tsx)). This is a manual test bed for E+ features and never goes upstream. Use the E+ dev server or `examples/` instead.
- **`@excalidraw/utils`:** the fork has `0.1.5` ([packages/utils/package.json](packages/utils/package.json)), upstream has `0.1.2`, npm has `0.1.6` (what E+ uses). Bump upstream's `packages/utils/package.json` to match npm and publish utils from upstream from now on.

### In-flight fork branches

These must target upstream directly instead of landing on fork `master`:

- `pr/custom-fonts`: custom font registry (`FontRegistry`, `FontsCache`, ~6k lines). Already marked `[pr]`. Rebase onto upstream `master` and open it there.
- `barnabasmolnar/animations-v3` and `tmp/tta`: built on the old fork base (`[pr] export rewrite`, `stuff`). The editor side of animations landed as #12100 and playback moved into E+. Rebase whatever remains onto upstream, or drop it.

## Plan

### Phase 1: clean the fork (no E+ behavior change)

1. Delete everything in **D** on fork `master`, and restore upstream `onWindowMessage`. Run `yarn test:typecheck` and `yarn test:update`, let autorelease publish, then bump E+ and smoke-test it. This shrinks the diff so later rebases only carry the real items.

### Phase 2: upstream PRs, roughly in dependency order

2. Chore PR: A5 + A6.
3. Fix PRs:
   - A1, with a regression test for the stale value after an API swap.
   - A4.
   - A2, with a CHANGELOG note.
   - A3: the `isDestroyed` host-reference bug plus the warn-in-prod policy, in one PR with a test that the `onExcalidrawAPI` reference observes destruction.
4. API PRs:
   - B1a `api.getDOMElements()`.
   - B1b `api.preloadEmbeddables(ids)`.
   - B2: theme token scope class, including the `styles.scss` layout split done properly.
   - Optional: `MainMenu.DefaultItems.SaveToFile`, a `SetViewportOptions` root type export, and a per-custom-tool cursor if B3's E+-side attempt fails.
5. After each merge, rebase the fork (`yarn pull`) and drop the corresponding fork hunk, so the delta keeps shrinking.

### Phase 3: migrate E+ off the fork-only surface (works against the current fork)

6. C1–C6: remove the `id` props, delete stale types, import `duplicateElements` from `@excalidraw/element`, copy the 2 icons, add a `serializeAsJSON`-based "Save to file", and switch the `SetViewportOptions` import.
7. B3 E+-side: set the comment cursor via `api.setCursor()`, then verify it survives hovering elements and pointer-up.
8. Replace `api.app.getSceneElements()` with `api.getSceneElements()`. Delete the dead `isOutsideViewport`.
9. Once the B1/B2 PRs land (and the fork is rebased on them), move E+ to `api.getDOMElements()` and `api.preloadEmbeddables()`, and to the new scope class plus a `theme--dark` toggle on E+'s wrappers. **No `api.app` left after this step.**

### Phase 4: switch and retire

10. Push upstream `master` to `release`, keeping release-only commits like "hide Show hints" rebased on top, so `next` publishes.
11. In E+, install the matching upstream packages:
    ```sh
    pnpm i --save-exact @excalidraw/excalidraw@next @excalidraw/common@next @excalidraw/element@next @excalidraw/math@next
    ```
    Drop `@dwelle/excalidraw`, then update every place that names it:
    - imports `@dwelle/excalidraw` → `@excalidraw/excalidraw`, including type subpaths, which upstream's exports map serves identically
    - `index.css` imports (3)
    - `vi.mock("@dwelle/excalidraw")` (8 test files)
    - vitest `server.deps.inline` (`apps/excalidraw-plus`, `libs/client/excalidraw-file-manager`, `libs/client/presentation-animations`)
    - font copy paths `node_modules/@dwelle/excalidraw/dist/prod/fonts` (`apps/excalidraw-plus`, `apps/links`, `apps/marketplace` `project.json`)
    - the `install:excalidraw` script, `.ncurc.json`, `scripts/toggle-excalidraw-env.mjs`, and `serverExternalPackages` in `apps/landing-page-cms/next.config.mjs`
    - the dead `.chunk.js` `manualChunks` rule in `apps/excalidraw-plus/vite.config.ts:300`
12. Verify E+:
    - typecheck. The exhaustive AppState maps in `services/scene.ts` and `last-known-scene-versions.ts` flag any AppState drift.
    - vitest
    - a manual pass over the editor, scene switching (background colour, A1), presentation mode and edit mode (embed preloading, chrome theming in light and dark), comments (cursor, popover bounds), Save to file, and phone layout (top-right UI, A2)
13. Archive the fork: disable `autorelease-fork.yml`, `npm deprecate @dwelle/excalidraw` with a pointer to `@excalidraw/excalidraw`, and keep the repo read-only.

## Risks and open questions

- **Release cadence.** Upstream `next` only moves when someone pushes to `release`. Today the fork publishes on every `master` push. Decide whether `release` tracks `master` automatically (minus release-only commits, e.g. a CI rebase job), or E+ accepts manual release pushes.
- **Version skew.** E+ must bump all `@excalidraw/*` packages together. A mismatched `common`/`element` silently re-introduces the duplicate copies.
- **Behavior changes for other upstream hosts** (A2, A3). Both need CHANGELOG entries, and A2 may need an opt-out prop if anyone relies on replacing the mobile defaults.
- **B2 acceptance.** If upstream won't take a public token scope class, E+ owns a copy of the tokens and must re-sync them on editor bumps. Track that as recurring cost.
