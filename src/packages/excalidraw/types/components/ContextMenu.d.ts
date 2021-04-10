import "./ContextMenu.scss";
import { Action } from "../actions/types";
import { ActionManager } from "../actions/manager";
import { AppState } from "../types";
export declare type ContextMenuOption = "separator" | Action;
declare type ContextMenuProps = {
    options: ContextMenuOption[];
    onCloseRequest?(): void;
    top: number;
    left: number;
    actionManager: ActionManager;
    appState: Readonly<AppState>;
};
declare type ContextMenuParams = {
    options: (ContextMenuOption | false | null | undefined)[];
    top: ContextMenuProps["top"];
    left: ContextMenuProps["left"];
    actionManager: ContextMenuProps["actionManager"];
    appState: Readonly<AppState>;
    container: HTMLElement;
};
declare const _default: {
    push(params: ContextMenuParams): void;
};
export default _default;
