import { NonDeletedExcalidrawElement } from "../element/types";
import { ExportType } from "../scene/types";
import { AppState } from "../types";
export { loadFromBlob } from "./blob";
export { loadFromJSON, saveAsJSON } from "./json";
export declare const exportCanvas: (type: ExportType, elements: readonly NonDeletedExcalidrawElement[], appState: AppState, { exportBackground, exportPadding, viewBackgroundColor, name, scale, shouldAddWatermark, }: {
    exportBackground: boolean;
    exportPadding?: number | undefined;
    viewBackgroundColor: string;
    name: string;
    scale?: number | undefined;
    shouldAddWatermark: boolean;
}) => Promise<void>;
