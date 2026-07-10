import { nanoid } from "nanoid";

import { easeOut } from "@excalidraw/common";
import {
  getBoundTextElement,
  getElementAbsoluteCoords,
  isTextElement,
} from "@excalidraw/element";
import { clamp } from "@excalidraw/math";

import type { Scene } from "@excalidraw/element";
import type {
  ExcalidrawElement,
  NonDeletedExcalidrawElement,
} from "@excalidraw/element/types";

import { AnimationController } from "./renderer/animation";

import type {
  ElementAnimationEasing,
  ElementAnimationFlyFrom,
  ElementAnimationHandle,
  ElementAnimationRequest,
  ElementAnimationResult,
  ElementAnimationStatus,
  ElementAnimationTerminalStatus,
} from "./types";

type ElementAnimationState = {
  batchId: string;
  opacityFrom: number;
  opacityTo: number;
  positionFrom: { x: number; y: number };
  positionTo: { x: number; y: number };
  easing: ElementAnimationEasing;
  duration: number;
  delay: number;
  elapsed: number;
};

type ElementAnimationBatch = {
  id: string;
  elementIds: readonly ExcalidrawElement["id"][];
  activeElementIds: Set<ExcalidrawElement["id"]>;
  status: ElementAnimationStatus;
  result: ElementAnimationResult | null;
  resolveFinished: (result: ElementAnimationResult) => void;
  finished: Promise<ElementAnimationResult>;
};

/**
 * Drives element animations (fade & fly) without mutating the elements
 * themselves — animated opacity/position live in override maps which the
 * renderers resolve at draw time, so the store, undo history and element
 * canvas caches stay untouched.
 */
export class ElementAnimator {
  /**
   * Bumped whenever overrides change so memoized canvases know to re-render
   * (the override maps are mutated in place and thus compare shallow-equal).
   */
  version = 0;

  readonly opacityOverrides = new Map<ExcalidrawElement["id"], number>();
  readonly positionOverrides = new Map<
    ExcalidrawElement["id"],
    { x: number; y: number }
  >();

  private readonly states = new Map<
    ExcalidrawElement["id"],
    ElementAnimationState
  >();
  private readonly batches = new Map<string, ElementAnimationBatch>();

  private readonly animationKey: string;
  private readonly getScene: () => Scene;
  private readonly getViewportSceneSize: () => {
    width: number;
    height: number;
  };
  private readonly onRepaint: () => void;

  constructor(opts: {
    animationKey: string;
    getScene: () => Scene;
    /** current viewport dimensions in scene (zoom-adjusted) units */
    getViewportSceneSize: () => { width: number; height: number };
    onRepaint: () => void;
  }) {
    this.animationKey = opts.animationKey;
    this.getScene = opts.getScene;
    this.getViewportSceneSize = opts.getViewportSceneSize;
    this.onRepaint = opts.onRepaint;
  }

  public animateElements = (
    animationInput:
      | ElementAnimationRequest
      | readonly ElementAnimationRequest[],
  ): ElementAnimationHandle => {
    const animations: readonly ElementAnimationRequest[] = Array.isArray(
      animationInput,
    )
      ? animationInput
      : [animationInput];
    const scene = this.getScene();
    const elementsMap = scene.getNonDeletedElementsMap();

    // each user-passed element expands into a group of element ids that must
    // animate as one unit (a container and its bound text are functionally a
    // single item), sharing a single stagger slot
    const expandAnimationElements = (
      elements: ElementAnimationRequest["elements"],
    ) => {
      const elementIdGroups: string[][] = [];
      const seenElementIds = new Set<string>();

      elements.forEach((elementOrId) => {
        const id =
          typeof elementOrId === "string" ? elementOrId : elementOrId.id;
        const element = scene.getNonDeletedElement(id);

        if (!element) {
          return;
        }

        const group: string[] = [];
        const addAnimatedElement = (elementId: string | null | undefined) => {
          if (!elementId || seenElementIds.has(elementId)) {
            return;
          }
          seenElementIds.add(elementId);
          group.push(elementId);
        };

        addAnimatedElement(element.id);

        const boundTextElement = getBoundTextElement(element, elementsMap);

        if (boundTextElement) {
          addAnimatedElement(boundTextElement.id);
        }

        if (isTextElement(element) && element.containerId) {
          addAnimatedElement(element.containerId);
        }

        if (group.length) {
          elementIdGroups.push(group);
        }
      });

      return elementIdGroups;
    };

    const expandedAnimations = animations.map((animation) => ({
      animation,
      elementIdGroups: expandAnimationElements(animation.elements),
    }));

    const batchElementIds: string[] = [];
    const seenBatchElementIds = new Set<string>();

    expandedAnimations.forEach(({ elementIdGroups }) => {
      for (const id of elementIdGroups.flat()) {
        if (!seenBatchElementIds.has(id)) {
          seenBatchElementIds.add(id);
          batchElementIds.push(id);
        }
      }
    });

    const handle = this.createHandle(batchElementIds);
    let shouldSync = false;

    expandedAnimations.forEach(({ animation, elementIdGroups }) => {
      const {
        duration = 250,
        delay = 0,
        stagger = 0,
        phase = "in",
        easing,
      } = animation;
      const normalizedDelay = Math.max(delay, 0);
      const normalizedStagger = Math.max(stagger, 0);

      elementIdGroups.forEach((group, groupIndex) => {
        const groupDelay = normalizedDelay + groupIndex * normalizedStagger;

        group.forEach((id) => {
          const element = scene.getNonDeletedElement(id);

          if (!element) {
            return;
          }

          shouldSync = true;

          if (animation.type === "fade") {
            this.animateElement({
              batchId: handle.id,
              id,
              opacityFrom:
                phase === "in" ? 0 : this.getElementVisibleOpacity(element),
              opacityTo:
                phase === "in" ? this.getElementVisibleOpacity(element) : 0,
              easing: easing ?? "easeInOut",
              duration,
              delay: groupDelay,
              skipSync: true,
            });
            return;
          }

          const flyOffset = this.getFlyPositionOffset(element, animation.from);

          this.animateElement({
            batchId: handle.id,
            id,
            opacityFrom:
              phase === "in" ? 0 : this.getElementVisibleOpacity(element),
            opacityTo:
              phase === "in" ? this.getElementVisibleOpacity(element) : 0,
            positionFrom: phase === "in" ? flyOffset : { x: 0, y: 0 },
            positionTo: phase === "in" ? { x: 0, y: 0 } : flyOffset,
            easing: easing ?? "easeOut",
            duration,
            delay: groupDelay,
            skipSync: true,
          });
        });
      });
    });

    if (shouldSync) {
      this.repaint();
      this.sync();
    }

    if (
      handle.getStatus() === "running" &&
      !this.batches.get(handle.id)?.activeElementIds.size
    ) {
      this.finalizeBatch(handle.id, "finished");
    }

    return handle;
  };

  public cancelElementAnimation = (id: ExcalidrawElement["id"]) => {
    const animation = this.states.get(id);
    const didDeleteOpacity = this.opacityOverrides.delete(id);
    const didDeletePosition = this.positionOverrides.delete(id);

    if (!animation) {
      if (didDeleteOpacity || didDeletePosition) {
        this.repaint();
      }
      return;
    }

    this.states.delete(id);
    this.releaseElement(animation.batchId, id, "cancelled");
    this.sync();

    if (didDeleteOpacity || didDeletePosition) {
      this.repaint();
    }
  };

  public clearOverrides = () => {
    if (
      this.opacityOverrides.size === 0 &&
      this.positionOverrides.size === 0 &&
      this.states.size === 0
    ) {
      return;
    }

    this.states.clear();
    this.opacityOverrides.clear();
    this.positionOverrides.clear();
    this.settleAllBatches("cancelled");
    this.sync();
    this.repaint();
  };

  public destroy = () => {
    this.settleAllBatches("destroyed");
    AnimationController.cancel(this.animationKey);
  };

  private repaint = () => {
    this.version++;
    this.onRepaint();
  };

  private getElementVisibleOpacity = (element: NonDeletedExcalidrawElement) => {
    return clamp(element.opacity, 0, 100);
  };

  private applyEasing = (progress: number, easing: ElementAnimationEasing) => {
    switch (easing) {
      case "linear":
        return progress;
      case "easeOut":
        return easeOut(progress);
      case "easeInOut":
        return progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    }
  };

  private getFlyPositionOffset = (
    element: NonDeletedExcalidrawElement,
    from: ElementAnimationFlyFrom,
  ) => {
    const [x1, y1, x2, y2] = getElementAbsoluteCoords(
      element,
      this.getScene().getNonDeletedElementsMap(),
    );
    const { width: viewportWidth, height: viewportHeight } =
      this.getViewportSceneSize();
    const elementWidth = x2 - x1;
    const elementHeight = y2 - y1;

    switch (from) {
      case "left":
        return { x: -(Math.max(viewportWidth, elementWidth) + 64), y: 0 };
      case "right":
        return { x: Math.max(viewportWidth, elementWidth) + 64, y: 0 };
      case "top":
        return { x: 0, y: -(Math.max(viewportHeight, elementHeight) + 64) };
      case "bottom":
        return { x: 0, y: Math.max(viewportHeight, elementHeight) + 64 };
    }
  };

  private animateElement = ({
    batchId,
    id,
    opacityFrom,
    opacityTo,
    positionFrom = { x: 0, y: 0 },
    positionTo = { x: 0, y: 0 },
    easing,
    duration,
    delay,
    skipSync = false,
  }: {
    batchId: string;
    id: ExcalidrawElement["id"];
    opacityFrom: number;
    opacityTo: number;
    positionFrom?: { x: number; y: number };
    positionTo?: { x: number; y: number };
    easing: ElementAnimationEasing;
    duration: number;
    delay: number;
    skipSync?: boolean;
  }) => {
    const normalizedOpacityFrom = clamp(opacityFrom, 0, 100);
    const normalizedOpacityTo = clamp(opacityTo, 0, 100);
    const normalizedDuration = Math.max(duration, 0);
    const normalizedDelay = Math.max(delay, 0);
    const activeAnimation = this.states.get(id);
    const nextOpacityFrom = activeAnimation
      ? clamp(
          this.opacityOverrides.get(id) ?? activeAnimation.opacityTo,
          0,
          100,
        )
      : normalizedOpacityFrom;
    const nextPositionFrom = activeAnimation
      ? this.positionOverrides.get(id) ?? activeAnimation.positionTo
      : positionFrom;

    if (activeAnimation && activeAnimation.batchId !== batchId) {
      this.releaseElement(activeAnimation.batchId, id, "interrupted");
    }

    this.opacityOverrides.set(id, nextOpacityFrom);

    if (nextPositionFrom.x !== 0 || nextPositionFrom.y !== 0) {
      this.positionOverrides.set(id, nextPositionFrom);
    } else {
      this.positionOverrides.delete(id);
    }

    if (normalizedDuration === 0 && normalizedDelay === 0) {
      this.states.delete(id);
      this.batches.get(batchId)?.activeElementIds.delete(id);
      this.opacityOverrides.set(id, normalizedOpacityTo);

      if (positionTo.x !== 0 || positionTo.y !== 0) {
        this.positionOverrides.set(id, positionTo);
      } else {
        this.positionOverrides.delete(id);
      }

      if (!skipSync) {
        this.repaint();
      }
      return;
    }

    this.states.set(id, {
      batchId,
      opacityFrom: nextOpacityFrom,
      opacityTo: normalizedOpacityTo,
      positionFrom: nextPositionFrom,
      positionTo,
      easing,
      duration: normalizedDuration,
      delay: normalizedDelay,
      elapsed: 0,
    });
    this.batches.get(batchId)?.activeElementIds.add(id);

    if (!skipSync) {
      this.repaint();
      this.sync();
    }
  };

  private sync = () => {
    if (this.states.size === 0) {
      AnimationController.cancel(this.animationKey);
      return;
    }

    if (AnimationController.running(this.animationKey)) {
      return;
    }

    AnimationController.start(this.animationKey, ({ deltaTime }) => {
      let shouldRerender = false;

      for (const [id, animation] of this.states) {
        const element = this.getScene().getNonDeletedElement(id);

        if (!element) {
          this.states.delete(id);
          this.releaseElement(animation.batchId, id, "finished");
          shouldRerender = this.opacityOverrides.delete(id) || shouldRerender;
          shouldRerender = this.positionOverrides.delete(id) || shouldRerender;
          continue;
        }

        animation.elapsed += deltaTime;

        const progress =
          animation.elapsed <= animation.delay
            ? 0
            : animation.duration === 0
            ? 1
            : Math.min(
                (animation.elapsed - animation.delay) / animation.duration,
                1,
              );
        const easedProgress = this.applyEasing(progress, animation.easing);

        const nextOpacity =
          animation.opacityFrom +
          (animation.opacityTo - animation.opacityFrom) * easedProgress;
        const nextPosition = {
          x:
            animation.positionFrom.x +
            (animation.positionTo.x - animation.positionFrom.x) * easedProgress,
          y:
            animation.positionFrom.y +
            (animation.positionTo.y - animation.positionFrom.y) * easedProgress,
        };

        const clampedOpacity = clamp(nextOpacity, 0, 100);

        if (this.opacityOverrides.get(id) !== clampedOpacity) {
          this.opacityOverrides.set(id, clampedOpacity);
          shouldRerender = true;
        }

        const currentPositionOverride =
          this.positionOverrides.get(id) ?? ({ x: 0, y: 0 } as const);

        if (
          currentPositionOverride.x !== nextPosition.x ||
          currentPositionOverride.y !== nextPosition.y
        ) {
          if (nextPosition.x === 0 && nextPosition.y === 0) {
            this.positionOverrides.delete(id);
          } else {
            this.positionOverrides.set(id, nextPosition);
          }
          shouldRerender = true;
        }

        if (animation.elapsed >= animation.delay + animation.duration) {
          this.states.delete(id);
          this.releaseElement(animation.batchId, id, "finished");
        }
      }

      if (shouldRerender) {
        this.repaint();
      }

      return this.states.size > 0 ? {} : undefined;
    });
  };

  private createHandle = (
    elementIds: readonly string[],
  ): ElementAnimationHandle => {
    let resolveFinished!: (result: ElementAnimationResult) => void;
    const finished = new Promise<ElementAnimationResult>((resolve) => {
      resolveFinished = resolve;
    });

    const batch: ElementAnimationBatch = {
      id: nanoid(),
      elementIds,
      activeElementIds: new Set<string>(),
      status: "running",
      result: null,
      resolveFinished,
      finished,
    };

    this.batches.set(batch.id, batch);

    return {
      id: batch.id,
      elementIds: batch.elementIds,
      finished: batch.finished,
      finish: () => batch.result ?? this.settleBatch(batch.id, "finished"),
      cancel: () => batch.result ?? this.settleBatch(batch.id, "cancelled"),
      getStatus: () => batch.result?.status ?? batch.status,
    };
  };

  private finalizeBatch = (
    batchId: string,
    status: ElementAnimationTerminalStatus,
  ) => {
    const batch = this.batches.get(batchId);

    if (!batch) {
      return null;
    }

    if (batch.result) {
      return batch.result;
    }

    batch.status = status;
    batch.result = {
      id: batch.id,
      status,
      elementIds: batch.elementIds,
    };
    batch.resolveFinished(batch.result);
    this.batches.delete(batch.id);

    return batch.result;
  };

  private releaseElement = (
    batchId: string,
    id: ExcalidrawElement["id"],
    statusOnEmpty: ElementAnimationTerminalStatus,
  ) => {
    const batch = this.batches.get(batchId);

    if (!batch) {
      return;
    }

    batch.activeElementIds.delete(id);

    if (batch.activeElementIds.size === 0) {
      this.finalizeBatch(batchId, statusOnEmpty);
    }
  };

  private settleBatch = (batchId: string, status: "finished" | "cancelled") => {
    const batch = this.batches.get(batchId);

    if (!batch) {
      return {
        id: batchId,
        status,
        elementIds: [],
      } as ElementAnimationResult;
    }

    if (batch.result) {
      return batch.result;
    }

    let shouldRerender = false;

    for (const id of [...batch.activeElementIds]) {
      const animation = this.states.get(id);

      if (!animation || animation.batchId !== batchId) {
        batch.activeElementIds.delete(id);
        continue;
      }

      this.states.delete(id);
      batch.activeElementIds.delete(id);

      if (status === "finished") {
        if (this.opacityOverrides.get(id) !== animation.opacityTo) {
          this.opacityOverrides.set(id, animation.opacityTo);
          shouldRerender = true;
        }

        if (animation.positionTo.x === 0 && animation.positionTo.y === 0) {
          shouldRerender = this.positionOverrides.delete(id) || shouldRerender;
        } else {
          const currentPosition = this.positionOverrides.get(id);

          if (
            !currentPosition ||
            currentPosition.x !== animation.positionTo.x ||
            currentPosition.y !== animation.positionTo.y
          ) {
            this.positionOverrides.set(id, animation.positionTo);
            shouldRerender = true;
          }
        }
      } else {
        shouldRerender = this.opacityOverrides.delete(id) || shouldRerender;
        shouldRerender = this.positionOverrides.delete(id) || shouldRerender;
      }
    }

    this.sync();

    if (shouldRerender) {
      this.repaint();
    }

    return this.finalizeBatch(batchId, status)!;
  };

  private settleAllBatches = (status: ElementAnimationTerminalStatus) => {
    for (const batchId of [...this.batches.keys()]) {
      if (status === "finished" || status === "cancelled") {
        this.settleBatch(batchId, status);
      } else {
        this.finalizeBatch(batchId, status);
      }
    }
  };
}
