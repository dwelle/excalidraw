import { NormalizedZoomValue, PointerCoords, Zoom } from "../types";
export declare const getNewZoom: (newZoomValue: NormalizedZoomValue, prevZoom: Zoom, canvasOffset: {
    left: number;
    top: number;
}, zoomOnViewportPoint?: PointerCoords) => Zoom;
export declare const getNormalizedZoom: (zoom: number) => NormalizedZoomValue;
