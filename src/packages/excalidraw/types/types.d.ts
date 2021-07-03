/// <reference types="react" />
import { PointerType, ExcalidrawLinearElement, NonDeletedExcalidrawElement, NonDeleted, TextAlign, ExcalidrawElement, GroupId, ExcalidrawBindableElement, Arrowhead, ChartType, FontFamilyValues } from "./element/types";
import { SHAPES } from "./shapes";
import { Point as RoughPoint } from "roughjs/bin/geometry";
import { LinearElementEditor } from "./element/linearElementEditor";
import { SuggestedBinding } from "./element/binding";
import { ImportedDataState } from "./data/types";
import type App from "./components/App";
import type { ResolvablePromise } from "./utils";
import { Spreadsheet } from "./charts";
import { Language } from "./i18n";
import { ClipboardData } from "./clipboard";
import { isOverScrollBars } from "./scene";
import { MaybeTransformHandleType } from "./element/transformHandles";
export declare type Point = Readonly<RoughPoint>;
export declare type Collaborator = {
    pointer?: {
        x: number;
        y: number;
    };
    button?: "up" | "down";
    selectedElementIds?: AppState["selectedElementIds"];
    username?: string | null;
    userState?: UserIdleState;
    color?: {
        background: string;
        stroke: string;
    };
    picture?: string;
};
export declare type AppState = {
    isLoading: boolean;
    errorMessage: string | null;
    draggingElement: NonDeletedExcalidrawElement | null;
    resizingElement: NonDeletedExcalidrawElement | null;
    multiElement: NonDeleted<ExcalidrawLinearElement> | null;
    selectionElement: NonDeletedExcalidrawElement | null;
    isBindingEnabled: boolean;
    startBoundElement: NonDeleted<ExcalidrawBindableElement> | null;
    suggestedBindings: SuggestedBinding[];
    editingElement: NonDeletedExcalidrawElement | null;
    editingLinearElement: LinearElementEditor | null;
    elementType: typeof SHAPES[number]["value"];
    elementLocked: boolean;
    exportBackground: boolean;
    exportEmbedScene: boolean;
    exportWithDarkMode: boolean;
    exportScale: number;
    currentItemStrokeColor: string;
    currentItemBackgroundColor: string;
    currentItemFillStyle: ExcalidrawElement["fillStyle"];
    currentItemStrokeWidth: number;
    currentItemStrokeStyle: ExcalidrawElement["strokeStyle"];
    currentItemRoughness: number;
    currentItemOpacity: number;
    currentItemFontFamily: FontFamilyValues;
    currentItemFontSize: number;
    currentItemTextAlign: TextAlign;
    currentItemStrokeSharpness: ExcalidrawElement["strokeSharpness"];
    currentItemStartArrowhead: Arrowhead | null;
    currentItemEndArrowhead: Arrowhead | null;
    currentItemLinearStrokeSharpness: ExcalidrawElement["strokeSharpness"];
    viewBackgroundColor: string;
    scrollX: number;
    scrollY: number;
    cursorButton: "up" | "down";
    scrolledOutside: boolean;
    name: string;
    isResizing: boolean;
    isRotating: boolean;
    zoom: Zoom;
    openMenu: "canvas" | "shape" | null;
    openPopup: "canvasColorPicker" | "backgroundColorPicker" | "strokeColorPicker" | null;
    lastPointerDownWith: PointerType;
    selectedElementIds: {
        [id: string]: boolean;
    };
    previousSelectedElementIds: {
        [id: string]: boolean;
    };
    shouldCacheIgnoreZoom: boolean;
    showHelpDialog: boolean;
    toastMessage: string | null;
    zenModeEnabled: boolean;
    theme: "light" | "dark";
    gridSize: number | null;
    viewModeEnabled: boolean;
    /** top-most selected groups (i.e. does not include nested groups) */
    selectedGroupIds: {
        [groupId: string]: boolean;
    };
    /** group being edited when you drill down to its constituent element
      (e.g. when you double-click on a group's element) */
    editingGroupId: GroupId | null;
    width: number;
    height: number;
    offsetTop: number;
    offsetLeft: number;
    isLibraryOpen: boolean;
    fileHandle: import("browser-fs-access").FileSystemHandle | null;
    collaborators: Map<string, Collaborator>;
    showStats: boolean;
    currentChartType: ChartType;
    pasteDialog: {
        shown: false;
        data: null;
    } | {
        shown: true;
        data: Spreadsheet;
    };
};
export declare type NormalizedZoomValue = number & {
    _brand: "normalizedZoom";
};
export declare type Zoom = Readonly<{
    value: NormalizedZoomValue;
    translation: Readonly<{
        x: number;
        y: number;
    }>;
}>;
export declare type PointerCoords = Readonly<{
    x: number;
    y: number;
}>;
export declare type Gesture = {
    pointers: Map<number, PointerCoords>;
    lastCenter: {
        x: number;
        y: number;
    } | null;
    initialDistance: number | null;
    initialScale: number | null;
};
export declare class GestureEvent extends UIEvent {
    readonly rotation: number;
    readonly scale: number;
}
export declare type LibraryItem = readonly NonDeleted<ExcalidrawElement>[];
export declare type LibraryItems = readonly LibraryItem[];
export declare type ExcalidrawAPIRefValue = ExcalidrawImperativeAPI | {
    readyPromise?: ResolvablePromise<ExcalidrawImperativeAPI>;
    ready?: false;
};
declare type InitialData = ImportedDataState & {
    scrollX?: number;
    scrollY?: number;
};
export interface ExcalidrawProps {
    id?: string | null;
    onChange?: (elements: readonly ExcalidrawElement[], appState: AppState, id?: string | null) => void;
    onHomeButtonClick?: () => void;
    initialData?: InitialData | null | Promise<InitialData | null>;
    user?: {
        name?: string | null;
    };
    excalidrawRef?: ForwardRef<ExcalidrawAPIRefValue>;
    onCollabButtonClick?: () => void;
    isCollaborating?: boolean;
    onPointerUpdate?: (payload: {
        pointer: {
            x: number;
            y: number;
        };
        button: "down" | "up";
        pointersMap: Gesture["pointers"];
    }) => void;
    onPaste?: (data: ClipboardData, event: ClipboardEvent | null) => Promise<boolean> | boolean;
    renderTopRightUI?: (isMobile: boolean, appState: AppState) => JSX.Element;
    renderFooter?: (isMobile: boolean, appState: AppState) => JSX.Element;
    langCode?: Language["code"];
    viewModeEnabled?: boolean;
    zenModeEnabled?: boolean;
    gridModeEnabled?: boolean;
    libraryReturnUrl?: string;
    theme?: "dark" | "light";
    name?: string;
    renderCustomStats?: (elements: readonly NonDeletedExcalidrawElement[], appState: AppState) => JSX.Element;
    UIOptions?: UIOptions;
    detectScroll?: boolean;
    handleKeyboardGlobally?: boolean;
    onLibraryChange?: (libraryItems: LibraryItems) => void | Promise<any>;
    autoFocus?: boolean;
}
export declare type SceneData = {
    elements?: ImportedDataState["elements"];
    appState?: ImportedDataState["appState"];
    collaborators?: Map<string, Collaborator>;
    commitToHistory?: boolean;
};
export declare enum UserIdleState {
    ACTIVE = "active",
    AWAY = "away",
    IDLE = "idle"
}
export declare type ExportOpts = {
    saveFileToDisk?: boolean;
    onExportToBackend?: (exportedElements: readonly NonDeletedExcalidrawElement[], appState: AppState, canvas: HTMLCanvasElement | null) => void;
    renderCustomUI?: (exportedElements: readonly NonDeletedExcalidrawElement[], appState: AppState, canvas: HTMLCanvasElement | null) => JSX.Element;
};
export declare type CanvasActions = {
    changeViewBackgroundColor?: boolean;
    clearCanvas?: boolean;
    export?: false | ExportOpts | (() => void);
    loadScene?: boolean;
    saveToActiveFile?: boolean;
    theme?: boolean;
    saveAsImage?: boolean;
};
export declare type UIOptions = {
    canvasActions?: CanvasActions | false;
};
export declare type AppProps = ExcalidrawProps & {
    UIOptions: {
        canvasActions: Required<CanvasActions> | false;
    };
    detectScroll: boolean;
    handleKeyboardGlobally: boolean;
};
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
    withCmdOrCtrl: boolean;
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
    scrollToContent: InstanceType<typeof App>["scrollToContent"];
    getSceneElements: InstanceType<typeof App>["getSceneElements"];
    getAppState: () => InstanceType<typeof App>["state"];
    refresh: InstanceType<typeof App>["refresh"];
    importLibrary: InstanceType<typeof App>["importLibraryFromUrl"];
    setToastMessage: InstanceType<typeof App>["setToastMessage"];
    readyPromise: ResolvablePromise<ExcalidrawImperativeAPI>;
    ready: true;
    id: string;
};
export {};
