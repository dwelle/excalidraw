/// <reference types="react" />
import { ActionsManagerInterface } from "../actions/types";
import { NonDeletedExcalidrawElement } from "../element/types";
import { AppState } from "../types";
import "./ExportDialog.scss";
export declare const ErrorCanvasPreview: () => JSX.Element;
export declare type ExportCB = (elements: readonly NonDeletedExcalidrawElement[], scale?: number) => void;
export declare const ImageExportDialog: ({ elements, appState, exportPadding, actionManager, onExportToPng, onExportToSvg, onExportToClipboard, }: {
    appState: AppState;
    elements: readonly NonDeletedExcalidrawElement[];
    exportPadding?: number | undefined;
    actionManager: ActionsManagerInterface;
    onExportToPng: ExportCB;
    onExportToSvg: ExportCB;
    onExportToClipboard: ExportCB;
}) => JSX.Element;
