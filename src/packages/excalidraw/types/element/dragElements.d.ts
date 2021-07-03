import { SHAPES } from "../shapes";
import Scene from "../scene/Scene";
import { NonDeletedExcalidrawElement } from "./types";
import { PointerDownState } from "../types";
export declare const dragSelectedElements: (pointerDownState: PointerDownState, selectedElements: NonDeletedExcalidrawElement[], pointerX: number, pointerY: number, scene: Scene, lockDirection?: boolean, distanceX?: number, distanceY?: number) => void;
export declare const getDragOffsetXY: (selectedElements: NonDeletedExcalidrawElement[], x: number, y: number) => [number, number];
export declare const dragNewElement: (draggingElement: NonDeletedExcalidrawElement, elementType: typeof SHAPES[number]["value"], originX: number, originY: number, x: number, y: number, width: number, height: number, isResizeWithSidesSameLength: boolean, isResizeCenterPoint: boolean) => void;
