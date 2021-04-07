import React from "react";
import { RoughCanvas } from "roughjs/bin/canvas";
import { ActionManager } from "../actions/manager";
import { Library } from "../data/library";
import { MaybeTransformHandleType } from "../element/transformHandles";
import { ExcalidrawElement, NonDeleted } from "../element/types";
import { SceneHistory } from "../history";
import { isOverScrollBars } from "../scene";
import { AppProps, AppState, SceneData } from "../types";
import { ResolvablePromise } from "../utils";
export declare type PointerDownState = Readonly<{
    origin: Readonly<{
        x: number;
        y: number;
    }>;
    originInGrid: Readonly<{
        x: number;
        y: number;
    }>;
    scrollbars: ReturnType<typeof isOverScrollBars>;
    lastCoords: {
        x: number;
        y: number;
    };
    originalElements: Map<string, NonDeleted<ExcalidrawElement>>;
    resize: {
        handleType: MaybeTransformHandleType;
        isResizing: boolean;
        offset: {
            x: number;
            y: number;
        };
        arrowDirection: "origin" | "end";
        center: {
            x: number;
            y: number;
        };
    };
    hit: {
        element: NonDeleted<ExcalidrawElement> | null;
        allHitElements: NonDeleted<ExcalidrawElement>[];
        wasAddedToSelection: boolean;
        hasBeenDuplicated: boolean;
        hasHitCommonBoundingBoxOfSelectedElements: boolean;
    };
    drag: {
        hasOccurred: boolean;
        offset: {
            x: number;
            y: number;
        } | null;
    };
    eventListeners: {
        onMove: null | ((event: PointerEvent) => void);
        onUp: null | ((event: PointerEvent) => void);
        onKeyDown: null | ((event: KeyboardEvent) => void);
        onKeyUp: null | ((event: KeyboardEvent) => void);
    };
}>;
export declare type ExcalidrawImperativeAPI = {
    updateScene: InstanceType<typeof App>["updateScene"];
    resetScene: InstanceType<typeof App>["resetScene"];
    getSceneElementsIncludingDeleted: InstanceType<typeof App>["getSceneElementsIncludingDeleted"];
    history: {
        clear: InstanceType<typeof App>["resetHistory"];
    };
    setScrollToContent: InstanceType<typeof App>["setScrollToContent"];
    getSceneElements: InstanceType<typeof App>["getSceneElements"];
    getAppState: () => InstanceType<typeof App>["state"];
    refresh: InstanceType<typeof App>["refresh"];
    importLibrary: InstanceType<typeof App>["importLibraryFromUrl"];
    setToastMessage: InstanceType<typeof App>["setToastMessage"];
    readyPromise: ResolvablePromise<ExcalidrawImperativeAPI>;
    ready: true;
};
declare class App extends React.Component<AppProps, AppState> {
    canvas: HTMLCanvasElement | null;
    rc: RoughCanvas | null;
    unmounted: boolean;
    actionManager: ActionManager;
    private excalidrawContainerRef;
    static defaultProps: Partial<AppProps>;
    private scene;
    private resizeObserver;
    constructor(props: AppProps);
    private renderCanvas;
    render(): JSX.Element;
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
    setScrollToContent: (remoteElements: readonly ExcalidrawElement[]) => void;
    clearToast: () => void;
    setToastMessage: (toastMessage: string) => void;
    restoreFileFromShare: () => Promise<void>;
    updateScene: <K extends keyof AppState>(sceneData: {
        elements?: SceneData["elements"];
        appState?: Pick<AppState, K> | undefined;
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
            history: SceneHistory;
            app: InstanceType<typeof App>;
            library: typeof Library;
        };
    }
}
export default App;
