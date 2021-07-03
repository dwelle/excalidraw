/// <reference types="react" />
import { NonDeleted, ExcalidrawLinearElement, ExcalidrawElement, PointBinding, ExcalidrawBindableElement } from "./types";
import { Point, AppState } from "../types";
import History from "../history";
import Scene from "../scene/Scene";
export declare class LinearElementEditor {
    elementId: ExcalidrawElement["id"] & {
        _brand: "excalidrawLinearElementId";
    };
    activePointIndex: number | null;
    /** whether you're dragging a point */
    isDragging: boolean;
    lastUncommittedPoint: Point | null;
    pointerOffset: {
        x: number;
        y: number;
    };
    startBindingElement: ExcalidrawBindableElement | null | "keep";
    endBindingElement: ExcalidrawBindableElement | null | "keep";
    constructor(element: NonDeleted<ExcalidrawLinearElement>, scene: Scene);
    static POINT_HANDLE_SIZE: number;
    /**
     * @param id the `elementId` from the instance of this class (so that we can
     *  statically guarantee this method returns an ExcalidrawLinearElement)
     */
    static getElement(id: InstanceType<typeof LinearElementEditor>["elementId"]): NonDeleted<ExcalidrawLinearElement> | null;
    /** @returns whether point was dragged */
    static handlePointDragging(appState: AppState, setState: React.Component<any, AppState>["setState"], scenePointerX: number, scenePointerY: number, maybeSuggestBinding: (element: NonDeleted<ExcalidrawLinearElement>, startOrEnd: "start" | "end") => void): boolean;
    static handlePointerUp(event: PointerEvent, editingLinearElement: LinearElementEditor, appState: AppState): LinearElementEditor;
    static handlePointerDown(event: React.PointerEvent<HTMLCanvasElement>, appState: AppState, setState: React.Component<any, AppState>["setState"], history: History, scenePointer: {
        x: number;
        y: number;
    }): {
        didAddPoint: boolean;
        hitElement: NonDeleted<ExcalidrawElement> | null;
    };
    static handlePointerMove(event: React.PointerEvent<HTMLCanvasElement>, scenePointerX: number, scenePointerY: number, editingLinearElement: LinearElementEditor, gridSize: number | null): LinearElementEditor;
    static getPointsGlobalCoordinates(element: NonDeleted<ExcalidrawLinearElement>): number[][];
    static getPointAtIndexGlobalCoordinates(element: NonDeleted<ExcalidrawLinearElement>, indexMaybeFromEnd: number): Point;
    static pointFromAbsoluteCoords(element: NonDeleted<ExcalidrawLinearElement>, absoluteCoords: Point): Point;
    static getPointIndexUnderCursor(element: NonDeleted<ExcalidrawLinearElement>, zoom: AppState["zoom"], x: number, y: number): number;
    static createPointAt(element: NonDeleted<ExcalidrawLinearElement>, scenePointerX: number, scenePointerY: number, gridSize: number | null): Point;
    /**
     * Normalizes line points so that the start point is at [0,0]. This is
     * expected in various parts of the codebase. Also returns new x/y to account
     * for the potential normalization.
     */
    static getNormalizedPoints(element: ExcalidrawLinearElement): {
        points: (readonly [number, number])[];
        x: number;
        y: number;
    };
    static normalizePoints(element: NonDeleted<ExcalidrawLinearElement>): void;
    static movePointByOffset(element: NonDeleted<ExcalidrawLinearElement>, pointIndex: number, offset: {
        x: number;
        y: number;
    }): void;
    static movePoint(element: NonDeleted<ExcalidrawLinearElement>, pointIndex: number | "new", targetPosition: Point | "delete", otherUpdates?: {
        startBinding?: PointBinding;
        endBinding?: PointBinding;
    }): void;
}
