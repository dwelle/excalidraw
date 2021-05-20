import { NonDeletedExcalidrawElement } from "../element/types";
import { AppState } from "../types";
export declare const SVG_EXPORT_TAG = "<!-- svg-source:excalidraw -->";
export declare const exportToCanvas: (elements: readonly NonDeletedExcalidrawElement[], appState: AppState, { exportBackground, exportPadding, viewBackgroundColor, scale, shouldAddWatermark, }: {
    exportBackground: boolean;
    exportPadding?: number | undefined;
    scale?: number | undefined;
    viewBackgroundColor: string;
    shouldAddWatermark: boolean;
}, createCanvas?: (width: number, height: number) => {
    canvas: HTMLCanvasElement;
    scale: number;
}) => HTMLCanvasElement;
export declare const exportToSvg: (elements: readonly NonDeletedExcalidrawElement[], { exportBackground, exportPadding, viewBackgroundColor, exportWithDarkMode, scale, shouldAddWatermark, metadata, }: {
    exportBackground: boolean;
    exportPadding?: number | undefined;
    scale?: number | undefined;
    viewBackgroundColor: string;
    exportWithDarkMode?: boolean | undefined;
    shouldAddWatermark: boolean;
    metadata?: string | undefined;
}) => SVGSVGElement;
export declare const getExportSize: (elements: readonly NonDeletedExcalidrawElement[], exportPadding: number, shouldAddWatermark: boolean, scale: number) => [number, number];
