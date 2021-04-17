/// <reference types="react" />
import { NonDeletedExcalidrawElement } from "../element/types";
import "./HintViewer.scss";
import { AppState } from "../types";
interface Hint {
    appState: AppState;
    elements: readonly NonDeletedExcalidrawElement[];
}
export declare const HintViewer: ({ appState, elements }: Hint) => JSX.Element | null;
export {};
