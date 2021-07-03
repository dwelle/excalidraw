/// <reference types="react" />
import { ActionsManagerInterface } from "../actions/types";
import { NonDeletedExcalidrawElement } from "../element/types";
import { AppState, CanvasActions } from "../types";
import "./ExportDialog.scss";
export declare type ExportCB = (elements: readonly NonDeletedExcalidrawElement[], scale?: number) => void;
export declare const JSONExportDialog: ({ elements, appState, actionManager, exportOpts, canvas, }: {
    appState: AppState;
    elements: readonly NonDeletedExcalidrawElement[];
    actionManager: ActionsManagerInterface;
    exportOpts: CanvasActions["export"];
    canvas: HTMLCanvasElement | null;
}) => JSX.Element;
