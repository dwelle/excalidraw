import React from "react";
import { Action, ActionsManagerInterface, UpdaterFn, ActionName, ActionResult } from "./types";
import { ExcalidrawElement } from "../element/types";
import { AppProps, AppState } from "../types";
import Library from "../data/library";
declare type App = {
    canvas: HTMLCanvasElement | null;
    focusContainer: () => void;
    props: AppProps;
    library: Library;
};
export declare class ActionManager implements ActionsManagerInterface {
    actions: Record<ActionName, Action>;
    updater: (actionResult: ActionResult | Promise<ActionResult>) => void;
    getAppState: () => Readonly<AppState>;
    getElementsIncludingDeleted: () => readonly ExcalidrawElement[];
    app: App;
    constructor(updater: UpdaterFn, getAppState: () => AppState, getElementsIncludingDeleted: () => readonly ExcalidrawElement[], app: App);
    registerAction(action: Action): void;
    registerAll(actions: readonly Action[]): void;
    handleKeyDown(event: React.KeyboardEvent | KeyboardEvent): boolean;
    executeAction(action: Action): void;
    renderAction: (name: ActionName, id?: string | undefined) => JSX.Element | null;
}
export {};
