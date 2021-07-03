import { AppProps, CanvasActions, ExportOpts } from "./types";
import { FontFamilyValues } from "./element/types";
export declare const APP_NAME = "Excalidraw";
export declare const DRAGGING_THRESHOLD = 10;
export declare const LINE_CONFIRM_THRESHOLD = 8;
export declare const ELEMENT_SHIFT_TRANSLATE_AMOUNT = 5;
export declare const ELEMENT_TRANSLATE_AMOUNT = 1;
export declare const TEXT_TO_CENTER_SNAP_THRESHOLD = 30;
export declare const SHIFT_LOCKING_ANGLE: number;
export declare const CURSOR_TYPE: {
    TEXT: string;
    CROSSHAIR: string;
    GRABBING: string;
    POINTER: string;
    MOVE: string;
    AUTO: string;
};
export declare const POINTER_BUTTON: {
    MAIN: number;
    WHEEL: number;
    SECONDARY: number;
    TOUCH: number;
};
export declare enum EVENT {
    COPY = "copy",
    PASTE = "paste",
    CUT = "cut",
    KEYDOWN = "keydown",
    KEYUP = "keyup",
    MOUSE_MOVE = "mousemove",
    RESIZE = "resize",
    UNLOAD = "unload",
    BLUR = "blur",
    DRAG_OVER = "dragover",
    DROP = "drop",
    GESTURE_END = "gestureend",
    BEFORE_UNLOAD = "beforeunload",
    GESTURE_START = "gesturestart",
    GESTURE_CHANGE = "gesturechange",
    POINTER_MOVE = "pointermove",
    POINTER_UP = "pointerup",
    STATE_CHANGE = "statechange",
    WHEEL = "wheel",
    TOUCH_START = "touchstart",
    TOUCH_END = "touchend",
    HASHCHANGE = "hashchange",
    VISIBILITY_CHANGE = "visibilitychange",
    SCROLL = "scroll"
}
export declare const ENV: {
    TEST: string;
    DEVELOPMENT: string;
};
export declare const CLASSES: {
    SHAPE_ACTIONS_MENU: string;
};
export declare const FONT_FAMILY: {
    Virgil: number;
    Helvetica: number;
    Cascadia: number;
};
export declare const WINDOWS_EMOJI_FALLBACK_FONT = "Segoe UI Emoji";
export declare const DEFAULT_FONT_SIZE = 20;
export declare const DEFAULT_FONT_FAMILY: FontFamilyValues;
export declare const DEFAULT_TEXT_ALIGN = "left";
export declare const DEFAULT_VERTICAL_ALIGN = "top";
export declare const DEFAULT_VERSION = "{version}";
export declare const CANVAS_ONLY_ACTIONS: string[];
export declare const GRID_SIZE = 20;
export declare const MIME_TYPES: {
    excalidraw: string;
    excalidrawlib: string;
};
export declare const EXPORT_DATA_TYPES: {
    readonly excalidraw: "excalidraw";
    readonly excalidrawClipboard: "excalidraw/clipboard";
    readonly excalidrawLibrary: "excalidrawlib";
};
export declare const EXPORT_SOURCE: string;
export declare const STORAGE_KEYS: {
    readonly LOCAL_STORAGE_LIBRARY: "excalidraw-library";
};
export declare const TAP_TWICE_TIMEOUT = 300;
export declare const TOUCH_CTX_MENU_TIMEOUT = 500;
export declare const TITLE_TIMEOUT = 10000;
export declare const TOAST_TIMEOUT = 5000;
export declare const VERSION_TIMEOUT = 30000;
export declare const SCROLL_TIMEOUT = 100;
export declare const ZOOM_STEP = 0.1;
export declare const IDLE_THRESHOLD = 60000;
export declare const ACTIVE_THRESHOLD = 3000;
export declare const MODES: {
    VIEW: string;
    ZEN: string;
    GRID: string;
};
export declare const THEME_FILTER: any;
export declare const URL_QUERY_KEYS: {
    readonly addLibrary: "addLibrary";
};
export declare const URL_HASH_KEYS: {
    readonly addLibrary: "addLibrary";
};
export declare const DEFAULT_UI_OPTIONS: Merge<AppProps["UIOptions"], {
    canvasActions: Merge<Required<CanvasActions>, {
        export: ExportOpts;
    }>;
}>;
export declare const MQ_MAX_WIDTH_PORTRAIT = 800;
export declare const MQ_MAX_WIDTH_LANDSCAPE = 1000;
export declare const MQ_MAX_HEIGHT_LANDSCAPE = 500;
export declare const MAX_DECIMALS_FOR_SVG_EXPORT = 2;
export declare const EXPORT_SCALES: number[];
export declare const DEFAULT_EXPORT_PADDING = 10;
