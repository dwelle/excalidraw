import { RoughCanvas } from "roughjs/bin/canvas";
import { RoughSVG } from "roughjs/bin/svg";
import { AppState } from "../types";
import { NonDeletedExcalidrawElement } from "../element/types";
import { SceneState } from "../scene/types";
export declare const renderScene: (elements: readonly NonDeletedExcalidrawElement[], appState: AppState, selectionElement: NonDeletedExcalidrawElement | null, scale: number, rc: RoughCanvas, canvas: HTMLCanvasElement, sceneState: SceneState, { renderScrollbars, renderSelection, renderOptimizations, renderGrid, }?: {
    renderScrollbars?: boolean | undefined;
    renderSelection?: boolean | undefined;
    renderOptimizations?: boolean | undefined;
    renderGrid?: boolean | undefined;
}) => {
    atLeastOneVisibleElement: boolean;
    scrollBars?: undefined;
} | {
    atLeastOneVisibleElement: boolean;
    scrollBars: import("../scene/types").ScrollBars | undefined;
};
export declare const renderSceneToSvg: (elements: readonly NonDeletedExcalidrawElement[], rsvg: RoughSVG, svgRoot: SVGElement, { offsetX, offsetY, }?: {
    offsetX?: number | undefined;
    offsetY?: number | undefined;
}) => void;
