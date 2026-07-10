# Rebase notes

Rebased `barnabasmolnar/animations-v3` onto local `master` at `f655a399d` (no fetch).

## Superseded commits

The original pre-animation range `bab591ddf` through `30ad80b0d` was not replayed. Its changes are already represented on `master`: the export/fork work was consolidated into `ebaed9465` and `f655a399d`, while the non-interactivity, `activeTool`, and arrow-label changes landed upstream as `2423819ee`, `5ca083436`, and `063e0256f`. Replaying the old range would have reapplied older versions over the newer implementations.

Only the three animation-specific commits (`9ded255a9`, `3c6f672cd`, and `360163c2e`) were replayed.

## Conflict resolutions

- `packages/excalidraw/tests/helpers/api.ts`: kept master's stricter `NonDeletedExcalidrawElement[]` parameter type for `setSelectedElements()`.
- `packages/excalidraw/types.ts`: retained both master's `InteractionConfig` and the animation branch's `RenderOpacityResolver`.
- `packages/excalidraw/tests/MermaidToExcalidraw.test.tsx`: kept master's explicit branded `LocalPoint` typing.
- `packages/utils/src/export.ts`: kept master's direct `getNonDeletedElements` import from `@excalidraw/element` instead of adding a duplicate import through `@excalidraw/excalidraw`.
