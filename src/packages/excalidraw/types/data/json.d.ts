import { ExcalidrawElement } from "../element/types";
import { AppState } from "../types";
import { ImportedDataState } from "./types";
import Library from "./library";
export declare const serializeAsJSON: (elements: readonly ExcalidrawElement[], appState: Partial<AppState>) => string;
export declare const saveAsJSON: (elements: readonly ExcalidrawElement[], appState: AppState) => Promise<{
    fileHandle: import("browser-fs-access").FileSystemHandle;
}>;
export declare const loadFromJSON: (localAppState: AppState) => Promise<import("./restore").RestoredDataState>;
export declare const isValidExcalidrawData: (data?: {
    type?: any;
    elements?: any;
    appState?: any;
} | undefined) => data is ImportedDataState;
export declare const isValidLibrary: (json: any) => any;
export declare const saveLibraryAsJSON: (library: Library) => Promise<void>;
export declare const importLibraryFromJSON: (library: Library) => Promise<void>;
