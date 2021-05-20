import { AppState } from "../types";
import { ImportedLibraryData } from "./types";
export declare const getMimeType: (blob: Blob | string) => string;
export declare const loadFromBlob: (blob: Blob, localAppState: AppState | null) => Promise<import("./restore").RestoredDataState>;
export declare const loadLibraryFromBlob: (blob: Blob) => Promise<ImportedLibraryData>;
export declare const canvasToBlob: (canvas: HTMLCanvasElement) => Promise<Blob>;
