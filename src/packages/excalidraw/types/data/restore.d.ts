import { ExcalidrawElement } from "../element/types";
import { AppState } from "../types";
import { DataState, ImportedDataState } from "./types";
export declare const restoreElements: (elements: ImportedDataState["elements"]) => ExcalidrawElement[];
export declare const restoreAppState: (appState: ImportedDataState["appState"], localAppState: Partial<AppState> | null) => DataState["appState"];
export declare const restore: (data: ImportedDataState | null, localAppState: Partial<AppState> | null | undefined) => DataState;
