import { AppState } from "../types";
import { ExcalidrawElement } from "../element/types";
declare type ExportOpts = {
    elements: readonly ExcalidrawElement[];
    appState?: Partial<Omit<AppState, "offsetTop" | "offsetLeft">>;
    getDimensions?: (width: number, height: number) => {
        width: number;
        height: number;
        scale: number;
    };
};
export declare const exportToCanvas: ({ elements, appState, getDimensions, }: ExportOpts) => HTMLCanvasElement;
export declare const exportToBlob: (opts: ExportOpts & {
    mimeType?: string;
    quality?: number;
}) => Promise<Blob | null>;
export declare const exportToSvg: ({ elements, appState, exportPadding, metadata, }: Omit<ExportOpts, "getDimensions"> & {
    exportPadding?: number | undefined;
    metadata?: string | undefined;
}) => SVGSVGElement;
export declare const exportToClipboard: (opts: ExportOpts & {
    mimeType?: string;
    quality?: number;
}) => Promise<void>;
export { serializeAsJSON } from "../data/json";
