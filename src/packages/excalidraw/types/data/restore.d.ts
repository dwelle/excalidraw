import { ExcalidrawElement } from "../element/types";
import { AppState } from "../types";
import { ImportedDataState } from "./types";
declare type RestoredAppState = Omit<AppState, "offsetTop" | "offsetLeft" | "width" | "height">;
export declare const AllowedExcalidrawElementTypes: Record<ExcalidrawElement["type"], true>;
export declare type RestoredDataState = {
    elements: ExcalidrawElement[];
    appState: RestoredAppState;
};
export declare const restoreElements: (elements: ImportedDataState["elements"]) => ExcalidrawElement[];
export declare const restoreAppState: (appState: ImportedDataState["appState"], localAppState: Partial<AppState> | null) => RestoredAppState;
export declare const restore: (data: ImportedDataState | null, localAppState: Partial<AppState> | null | undefined) => RestoredDataState;
export {};
