import React from "react";
import { AppState } from "../types";
import { ActionManager } from "../actions/manager";
import { NonDeletedExcalidrawElement } from "../element/types";
declare type MobileMenuProps = {
    onHomeButtonClick?: () => void;
    appState: AppState;
    actionManager: ActionManager;
    exportButton: React.ReactNode;
    setAppState: React.Component<any, AppState>["setState"];
    elements: readonly NonDeletedExcalidrawElement[];
    libraryMenu: JSX.Element | null;
    onCollabButtonClick?: () => void;
    onLockToggle: () => void;
    canvas: HTMLCanvasElement | null;
    isCollaborating: boolean;
    renderCustomFooter?: (isMobile: boolean) => JSX.Element;
    viewModeEnabled: boolean;
    showThemeBtn: boolean;
};
export declare const MobileMenu: ({ onHomeButtonClick, appState, elements, libraryMenu, actionManager, exportButton, setAppState, onCollabButtonClick, onLockToggle, canvas, isCollaborating, renderCustomFooter, viewModeEnabled, showThemeBtn, }: MobileMenuProps) => JSX.Element;
export {};