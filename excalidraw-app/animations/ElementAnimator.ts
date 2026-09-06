import {
  getBoundTextElementId,
  getCommonBounds,
  isTextElement,
} from "@excalidraw/element";

import type { ExcalidrawElement } from "@excalidraw/element/types";
import type {
  ElementRenderOverride,
  ElementRenderOverrides,
  ExcalidrawImperativeAPI,
} from "@excalidraw/excalidraw/types";

type Easing = "linear" | "easeOut" | "easeInOut";
type RequestBase = {
  elements: readonly (ExcalidrawElement | string)[];
  duration?: number;
  delay?: number;
  stagger?: number;
  phase?: "in" | "out";
  easing?: Easing;
};
export type ElementAnimationRequest = RequestBase &
  (
    | { type: "fade" }
    | { type: "fly"; from: "left" | "right" | "top" | "bottom" }
  );
type Result = {
  status: "finished" | "cancelled" | "interrupted" | "destroyed";
};
export type ElementAnimationHandle = {
  finished: Promise<Result>;
  cancel: () => void;
};
type Batch = {
  ids: Set<string>;
  status: Result["status"];
  resolve: (result: Result) => void;
};
type Value = Required<ElementRenderOverride>;
type Transition = {
  batch: Batch;
  start: number;
  duration: number;
  from: Value;
  to: Value;
  easing: Easing;
};
type Editor = Pick<
  ExcalidrawImperativeAPI,
  | "getSceneElementsMapIncludingDeleted"
  | "getAppState"
  | "setElementRenderOverrides"
  | "isDestroyed"
>;

// Base snapshots can outlive a caller's mutable map or atom value. Own the
// supported values as well as the map, just like the editor's snapshot setter.
const copyBaseOverrides = (
  base: ElementRenderOverrides,
): ElementRenderOverrides =>
  new Map(
    [...base].map(([id, { opacity, offset }]) => [
      id,
      {
        ...(opacity !== undefined ? { opacity } : {}),
        ...(offset ? { offset: { x: offset.x, y: offset.y } } : {}),
      },
    ]),
  );

const easingAt = (t: number, easing: Easing) => {
  if (easing === "linear") {
    return t;
  }
  if (easing === "easeOut") {
    return 1 - (1 - t) ** 4;
  }
  return t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
};

/**
 * Host-owned effect runner. The editor only receives complete visual snapshots.
 * Base visibility comes from E+'s reveal counts; active transitions override it.
 * Completion/cancellation hands rendering back to that base (no pinned values).
 */
export class ElementAnimator {
  private base: ElementRenderOverrides = new Map();
  private transitions = new Map<string, Transition>();
  private values = new Map<string, Value>();
  private frame: number | null = null;
  private disposed = false;

  constructor(private editor: Editor, private ownerWindow: Window) {}

  /** Commit visibility and optionally cancel motion in one visual update. */
  setBaseOverrides = (
    base: ElementRenderOverrides,
    { cancelAnimations = false }: { cancelAnimations?: boolean } = {},
  ) => {
    if (this.disposed) {
      return;
    }
    this.base = copyBaseOverrides(base);
    if (cancelAnimations) {
      this.stopAll("cancelled");
    }
    this.publish();
  };

  /** All requests run together; only animations on overlapping targets are replaced. */
  animateElements = (
    input: ElementAnimationRequest | readonly ElementAnimationRequest[],
    { baseOverrides }: { baseOverrides?: ElementRenderOverrides } = {},
  ): ElementAnimationHandle => {
    if (this.disposed || this.editor.isDestroyed) {
      return {
        finished: Promise.resolve({ status: "destroyed" }),
        cancel: () => {},
      };
    }
    const requests: readonly ElementAnimationRequest[] = Array.isArray(input)
      ? input
      : [input];
    const nextBase = baseOverrides && copyBaseOverrides(baseOverrides);
    const map = this.editor.getSceneElementsMapIncludingDeleted();
    const now = this.ownerWindow.performance.now();
    let resolve!: Batch["resolve"];
    const finished = new Promise<Result>((resolveResult) => {
      resolve = resolveResult;
    });
    const batch: Batch = { ids: new Set(), status: "finished", resolve };

    for (const request of requests) {
      const seen = new Set<string>();
      let slot = 0;
      for (const target of request.elements) {
        const element = map.get(
          typeof target === "string" ? target : target.id,
        );
        if (!element || element.isDeleted || seen.has(element.id)) {
          continue;
        }
        const candidateContainer =
          isTextElement(element) && element.containerId
            ? map.get(element.containerId)
            : null;
        const container =
          candidateContainer && !candidateContainer.isDeleted
            ? candidateContainer
            : element;
        const labelId = getBoundTextElementId(container);
        const label = labelId ? map.get(labelId) : null;
        const group = [
          ...new Set([
            container,
            element,
            ...(label && !label.isDeleted ? [label] : []),
          ]),
        ].filter((member) => !seen.has(member.id));
        group.forEach((member) => seen.add(member.id));
        const duration = Number.isFinite(request.duration)
          ? Math.max(request.duration!, 0)
          : 250;
        const delay = Number.isFinite(request.delay)
          ? Math.max(request.delay!, 0)
          : 0;
        const stagger = Number.isFinite(request.stagger)
          ? Math.max(request.stagger!, 0)
          : 0;
        const start = now + delay + slot++ * stagger;
        let offset = { x: 0, y: 0 };
        if (request.type === "fly") {
          const [x1, y1, x2, y2] = getCommonBounds(group);
          const state = this.editor.getAppState();
          const dx = Math.max(state.width / state.zoom.value, x2 - x1) + 64;
          const dy = Math.max(state.height / state.zoom.value, y2 - y1) + 64;
          offset =
            request.from === "left"
              ? { x: -dx, y: 0 }
              : request.from === "right"
              ? { x: dx, y: 0 }
              : request.from === "top"
              ? { x: 0, y: -dy }
              : { x: 0, y: dy };
        }
        for (const member of group) {
          const previous = this.transitions.get(member.id);
          const current = this.values.get(member.id);
          if (previous && previous.batch !== batch) {
            this.release(previous.batch, member.id, "interrupted");
          }
          const resting: Value = {
            opacity: member.opacity,
            offset: { x: 0, y: 0 },
          };
          const hidden: Value = { opacity: 0, offset };
          const isIn = request.phase !== "out";
          const from = current ?? (isIn ? hidden : resting);
          this.transitions.set(member.id, {
            batch,
            start,
            duration,
            from,
            to: isIn ? resting : hidden,
            easing:
              request.easing ??
              (request.type === "fly" ? "easeOut" : "easeInOut"),
          });
          this.values.set(member.id, from);
          batch.ids.add(member.id);
        }
      }
    }
    // Do not publish the new steady state before the transition's initial value.
    if (nextBase) {
      this.base = nextBase;
    }
    const changed = this.advance(now);
    if (batch.ids.size || nextBase || changed) {
      this.publish();
    }
    this.schedule();
    if (!batch.ids.size) {
      batch.resolve({ status: batch.status });
    }
    return {
      finished,
      cancel: () => {
        if (!batch.ids.size) {
          return;
        }
        for (const id of [...batch.ids]) {
          if (this.transitions.get(id)?.batch === batch) {
            this.transitions.delete(id);
            this.values.delete(id);
            this.release(batch, id, "cancelled");
          }
        }
        this.schedule();
        this.publish();
      },
    };
  };

  clearAnimations = () => {
    if (!this.transitions.size) {
      return;
    }
    this.stopAll("cancelled");
    this.publish();
  };

  dispose = () => {
    if (this.disposed) {
      return;
    }
    this.disposed = true;
    this.stopAll("destroyed");
    this.base = new Map();
    if (!this.editor.isDestroyed) {
      this.editor.setElementRenderOverrides(null);
    }
  };

  private publish() {
    if (!this.disposed && !this.editor.isDestroyed) {
      this.editor.setElementRenderOverrides(
        new Map([...this.base, ...this.values]),
      );
    }
  }

  private release(batch: Batch, id: string, status: Result["status"]) {
    batch.ids.delete(id);
    if (status !== "finished") {
      batch.status = status;
    }
    if (!batch.ids.size) {
      batch.resolve({ status: batch.status });
    }
  }

  private stopAll(status: Result["status"]) {
    for (const [id, transition] of this.transitions) {
      this.release(transition.batch, id, status);
    }
    this.transitions.clear();
    this.values.clear();
    this.schedule();
  }

  private advance(now: number) {
    const elements = this.editor.getSceneElementsMapIncludingDeleted();
    let changed = false;
    for (const [id, transition] of this.transitions) {
      const elapsed = now - transition.start;
      const element = elements.get(id);
      if (!element || element.isDeleted || elapsed >= transition.duration) {
        this.transitions.delete(id);
        this.values.delete(id);
        this.release(transition.batch, id, "finished");
        changed = true;
        continue;
      }
      // A frame timestamp can precede performance.now() from the task that
      // started an effect. It is still a pre-start frame, not negative progress.
      const progress =
        elapsed < 0
          ? 0
          : easingAt(elapsed / transition.duration, transition.easing);
      const lerp = (from: number, to: number) => from + (to - from) * progress;
      const next: Value = {
        opacity: lerp(transition.from.opacity, transition.to.opacity),
        offset: {
          x: lerp(transition.from.offset.x, transition.to.offset.x),
          y: lerp(transition.from.offset.y, transition.to.offset.y),
        },
      };
      const current = this.values.get(id);
      if (
        next.opacity !== current?.opacity ||
        next.offset.x !== current.offset.x ||
        next.offset.y !== current.offset.y
      ) {
        this.values.set(id, next);
        changed = true;
      }
    }
    return changed;
  }

  private schedule() {
    if (!this.transitions.size || this.disposed || this.editor.isDestroyed) {
      if (this.frame !== null) {
        this.ownerWindow.cancelAnimationFrame(this.frame);
        this.frame = null;
      }
      return;
    }
    if (this.frame === null) {
      this.frame = this.ownerWindow.requestAnimationFrame((now) => {
        this.frame = null;
        if (this.editor.isDestroyed) {
          this.dispose();
          return;
        }
        if (this.advance(now)) {
          this.publish();
        }
        this.schedule();
      });
    }
  }
}
