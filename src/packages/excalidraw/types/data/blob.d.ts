import { AppState } from "../types";
import { LibraryData } from "./types";
export declare const getMimeType: (blob: Blob | string) => string;
export declare const loadFromBlob: (blob: Blob, localAppState: AppState | null) => Promise<import("./types").DataState>;
export declare const loadLibraryFromBlob: (blob: Blob) => Promise<LibraryData>;
export declare const canvasToBlob: (canvas: HTMLCanvasElement) => Promise<Blob>;
