# Transient element render overrides

The editor accepts a complete visual snapshot. Hosts can use it for animations, previews or other temporary visual states without changing the document. Timing, effect presets and playback policy belong to the host.

## API

```ts
import type { ElementRenderOverrides } from "@excalidraw/excalidraw";

const snapshot: ElementRenderOverrides = new Map([
  ["hidden-element", { opacity: 0 }],
  ["moving-element", { opacity: 65, offset: { x: -120, y: 0 } }],
]);
api.setElementRenderOverrides(snapshot);
api.setElementRenderOverrides(null); // restore ordinary rendering
```

```ts
type ElementRenderOverride = Readonly<{
  opacity?: number;
  offset?: Readonly<{ x: number; y: number }>;
}>;
type ElementRenderOverrides = ReadonlyMap<string, ElementRenderOverride>;
```

Each call **replaces the complete snapshot**, including missing IDs and fields. Missing values use ordinary rendering. There is one snapshot per mounted editor; the host composes contributions before submitting. This is not an incremental patch API.

- `opacity` is absolute, on the element's existing 0–100 scale. Omitted opacity uses `element.opacity`. Finite values are clamped.
- `offset` translates in scene units after normal layout. It does not change stored coordinates. Omit it or supply both finite coordinates; `null` is invalid.
- Non-finite opacity or offset coordinates throw `TypeError`. Validation and copying finish before publication, so a rejected call leaves the previous snapshot intact.
- Entries without either supported field are discarded. There are no overrides for size, rotation, text, colors, bindings or arbitrary element properties.
- The editor copies the map and supported nested values synchronously. Later mutations of the caller's map or objects cannot change the submitted snapshot.

## Lifetime and rendering

Unknown or deleted IDs have no effect while absent. Overrides survive ordinary scene updates, including replacing the scene's elements. The host should replace the snapshot when changing documents. `resetScene()` and unmount clear it; calls after unmount do nothing.

Overrides affect canvas visuals, DOM embeds, frame names and link badges. They preserve element identity and shape caches. They do not enter `AppState`, history, collaboration data or exports, and do not emit `onChange`.

Submission requests an update through the normal React and canvas rendering path. It does not promise an immediate canvas flush; multiple submissions can be coalesced. Each submitted snapshot currently requests a full `App` React render. The document-change lifecycle is skipped only for an explicitly requested visual update whose props and state are unchanged. A real update batched with it still runs the normal lifecycle.

Visible-element calculation is memoized on scene, snapshot, viewport and the selection/frame-drag inputs that affect ordering. Keeping a snapshot installed does not by itself repaint the static canvas on unrelated cursor, toast or sidebar updates. A new snapshot invalidates that calculation. Copy cost scales with the number of submitted entries; culling considers the scene and drawing considers visible elements. The API exposes no mutable map, version counter or clock.

## Geometry and interaction limits

Translation is **per ID**. To move a container and its bound label, submit both IDs. Groups and connected shapes are not expanded automatically. To move a whole frame, submit the frame and its children. Frame opacity multiplies child opacity, so fading a frame alone also fades its children; setting the same opacity on both multiplies it twice. Synthetic embed labels and link badges inherit their owner's values.

Canvas viewport culling and frame clipping use visual positions. Frame clipping still depends on `frameRendering.enabled` and `frameRendering.clip`. Live DOM embeds retain their existing lack of frame clipping; their translation, opacity and viewport culling work, and canvas embed placeholders clip against frames.

Interactive geometry keeps using document positions: hit testing, hover cursors, selection outlines, text editing and bindings are unchanged. Hidden elements can still be selected or have their links activated, including in view mode. Hosts can use the existing `onLinkOpen` callback to prevent opening links for hidden IDs; that does not change hover or selection geometry.

Connected arrows do not follow translated shapes. A bound arrow label's hole follows the **arrow's offset**, while the label follows its own offset. Keep those offsets equal to move them together. Overrides do not recompute layout, masks, group membership or bindings; they are not a general geometry animation API. Group membership checks while dragging into a highlighted frame still use document geometry, which can differ from the visual positions of independently translated group members.
