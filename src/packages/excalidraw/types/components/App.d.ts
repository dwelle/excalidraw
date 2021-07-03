import React from "react";
import { RoughCanvas } from "roughjs/bin/canvas";
import { ActionManager } from "../actions/manager";
import Library from "../data/library";
import { ExcalidrawElement } from "../element/types";
import History from "../history";
import { AppProps, AppState, LibraryItems, SceneData } from "../types";
export declare const useIsMobile: () => boolean;
export declare const useExcalidrawContainer: () => {
    container: HTMLDivElement | null;
    id?: string | null | undefined;
};
declare class App extends React.Component<AppProps, AppState> {
    canvas: HTMLCanvasElement | null;
    rc: RoughCanvas | null;
    unmounted: boolean;
    actionManager: ActionManager;
    isMobile: boolean;
    detachIsMobileMqHandler?: () => void;
    private excalidrawContainerRef;
    static defaultProps: Partial<AppProps>;
    private scene;
    private resizeObserver;
    private nearestScrollableContainer;
    library: Library;
    libraryItemsFromStorage: LibraryItems | undefined;
    private id;
    private history;
    private excalidrawContainerValue;
    constructor(props: AppProps);
    private renderCanvas;
    render(): JSX.Element;
    focusContainer: () => void;
    getSceneElementsIncludingDeleted: () => readonly ExcalidrawElement[];
    getSceneElements: () => readonly import("../element/types").NonDeletedExcalidrawElement[];
    private syncActionResult;
    private onBlur;
    private onUnload;
    private disableEvent;
    private onFontLoaded;
    private importLibraryFromUrl;
    private resetHistory;
    /**
     * Resets scene & history.
     * ! Do not use to clear scene user action !
     */
    private resetScene;
    private initializeScene;
    componentDidMount(): Promise<void>;
    componentWillUnmount(): void;
    private onResize;
    private removeEventListeners;
    private addEventListeners;
    componentDidUpdate(prevProps: AppProps, prevState: AppState): void;
    private onScroll;
    private onCut;
    private onCopy;
    private cutAll;
    private copyAll;
    private static resetTapTwice;
    private onTapStart;
    private onTapEnd;
    private pasteFromClipboard;
    private addElementsFromPasteOrLibrary;
    private addTextFromPaste;
    setAppState: (obj: any) => void;
    removePointer: (event: React.PointerEvent<HTMLElement>) => void;
    toggleLock: () => void;
    toggleZenMode: () => void;
    toggleStats: () => void;
    scrollToContent: (target?: ExcalidrawElement | readonly ExcalidrawElement[]) => void;
    clearToast: () => void;
    setToastMessage: (toastMessage: string) => void;
    restoreFileFromShare: () => Promise<void>;
    updateScene: <K extends keyof AppState>(sceneData: {
        elements?: SceneData["elements"];
        appState?: Pick<AppState, K> | null | undefined;
        collaborators?: SceneData["collaborators"];
        commitToHistory?: SceneData["commitToHistory"];
    }) => void;
    private onSceneUpdated;
    private updateCurrentCursorPosition;
    private onKeyDown;
    private onKeyUp;
    private selectShapeTool;
    private onGestureStart;
    private onGestureChange;
    private onGestureEnd;
    private handleTextWysiwyg;
    private deselectElements;
    private getTextElementAtPosition;
    private getElementAtPosition;
    private getElementsAtPosition;
    private startTextEditing;
    private handleCanvasDoubleClick;
    private handleCanvasPointerMove;
    private handleTouchMove;
    private handleCanvasPointerDown;
    private maybeOpenContextMenuAfterPointerDownOnTouchDevices;
    private maybeCleanupAfterMissingPointerUp;
    private handleCanvasPanUsingWheelOrSpaceDrag;
    private updateGestureOnPointerDown;
    private initialPointerDownState;
    private handleDraggingScrollBar;
    private clearSelectionIfNotUsingSelection;
    /**
     * @returns whether the pointer event has been completely handled
     */
    private handleSelectionOnPointerDown;
    private isASelectedElement;
    private isHittingCommonBoundingBoxOfSelectedElements;
    private handleTextOnPointerDown;
    private handleFreeDrawElementOnPointerDown;
    private handleLinearElementOnPointerDown;
    private createGenericElementOnPointerDown;
    private onKeyDownFromPointerDownHandler;
    private onKeyUpFromPointerDownHandler;
    private onPointerMoveFromPointerDownHandler;
    private handlePointerMoveOverScrollbars;
    private onPointerUpFromPointerDownHandler;
    private updateBindingEnabledOnPointerMove;
    private maybeSuggestBindingAtCursor;
    private maybeSuggestBindingForLinearElementAtCursor;
    private maybeSuggestBindingForAll;
    private clearSelection;
    private handleCanvasRef;
    private handleAppOnDrop;
    loadFileToCanvas: (file: Blob) => void;
    private handleCanvasContextMenu;
    private maybeDragNewGenericElement;
    private maybeHandleResize;
    /** @private use this.handleCanvasContextMenu */
    private _openContextMenu;
    private handleWheel;
    private getTextWysiwygSnappedToCenterPosition;
    private savePointer;
    private resetShouldCacheIgnoreZoomDebounced;
    private updateDOMRect;
    refresh: () => void;
    private getCanvasOffsets;
    private updateLanguage;
}
declare global {
    interface Window {
        h: {
            elements: readonly ExcalidrawElement[];
            state: AppState;
            setState: React.Component<any, AppState>["setState"];
            app: InstanceType<typeof App>;
            history: History;
        };
    }
}
export default App;
