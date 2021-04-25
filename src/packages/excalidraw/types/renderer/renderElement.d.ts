import { ExcalidrawElement, ExcalidrawTextElement, NonDeletedExcalidrawElement } from "../element/types";
import { RoughCanvas } from "roughjs/bin/canvas";
import { Drawable, Options } from "roughjs/bin/core";
import { RoughSVG } from "roughjs/bin/svg";
import { SceneState } from "../scene/types";
import { Zoom } from "../types";
export interface ExcalidrawElementWithCanvas {
    element: ExcalidrawElement | ExcalidrawTextElement;
    canvas: HTMLCanvasElement;
    canvasZoom: Zoom["value"];
    canvasOffsetX: number;
    canvasOffsetY: number;
}
export declare const getShapeForElement: (element: ExcalidrawElement) => Drawable | Drawable[] | null | undefined;
export declare const invalidateShapeForElement: (element: ExcalidrawElement) => boolean;
export declare const generateRoughOptions: (element: ExcalidrawElement) => Options;
export declare const renderElement: (element: NonDeletedExcalidrawElement, rc: RoughCanvas, context: CanvasRenderingContext2D, renderOptimizations: boolean, sceneState: SceneState) => void;
export declare const renderElementToSvg: (element: NonDeletedExcalidrawElement, rsvg: RoughSVG, svgRoot: SVGElement, offsetX?: number | undefined, offsetY?: number | undefined) => void;
