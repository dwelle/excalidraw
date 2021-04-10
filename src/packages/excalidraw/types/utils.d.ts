import { FontFamily, FontString } from "./element/types";
import { Zoom } from "./types";
export declare const SVG_NS = "http://www.w3.org/2000/svg";
export declare const setDateTimeForTests: (dateTime: string) => void;
export declare const getDateTime: () => string;
export declare const capitalizeString: (str: string) => string;
export declare const isToolIcon: (target: Element | EventTarget | null) => target is HTMLElement;
export declare const isInputLike: (target: Element | EventTarget | null) => target is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | HTMLBRElement | HTMLDivElement;
export declare const isWritableElement: (target: Element | EventTarget | null) => target is HTMLInputElement | HTMLTextAreaElement | HTMLBRElement | HTMLDivElement;
export declare const getFontFamilyString: ({ fontFamily, }: {
    fontFamily: FontFamily;
}) => string;
/** returns fontSize+fontFamily string for assignment to DOM elements */
export declare const getFontString: ({ fontSize, fontFamily, }: {
    fontSize: number;
    fontFamily: FontFamily;
}) => FontString;
export declare const measureText: (text: string, font: FontString) => {
    width: number;
    height: number;
    baseline: number;
};
export declare const debounce: <T extends any[]>(fn: (...args: T) => void, timeout: number) => {
    (...args: T): void;
    flush(): void;
    cancel(): void;
};
export declare const selectNode: (node: Element) => void;
export declare const removeSelection: () => void;
export declare const distance: (x: number, y: number) => number;
export declare const resetCursor: (canvas: HTMLCanvasElement | null) => void;
export declare const setCursor: (canvas: HTMLCanvasElement | null, cursor: string) => void;
export declare const setCursorForShape: (canvas: HTMLCanvasElement | null, shape: string) => void;
export declare const isFullScreen: () => boolean;
export declare const allowFullScreen: () => Promise<void>;
export declare const exitFullScreen: () => Promise<void>;
export declare const getShortcutKey: (shortcut: string) => string;
export declare const viewportCoordsToSceneCoords: ({ clientX, clientY }: {
    clientX: number;
    clientY: number;
}, { zoom, offsetLeft, offsetTop, scrollX, scrollY, }: {
    zoom: Zoom;
    offsetLeft: number;
    offsetTop: number;
    scrollX: number;
    scrollY: number;
}) => {
    x: number;
    y: number;
};
export declare const sceneCoordsToViewportCoords: ({ sceneX, sceneY }: {
    sceneX: number;
    sceneY: number;
}, { zoom, offsetLeft, offsetTop, scrollX, scrollY, }: {
    zoom: Zoom;
    offsetLeft: number;
    offsetTop: number;
    scrollX: number;
    scrollY: number;
}) => {
    x: number;
    y: number;
};
export declare const getGlobalCSSVariable: (name: string) => string;
/**
 * Checks whether first directional character is RTL. Meaning whether it starts
 *  with RTL characters, or indeterminate (numbers etc.) characters followed by
 *  RTL.
 * See https://github.com/excalidraw/excalidraw/pull/1722#discussion_r436340171
 */
export declare const isRTL: (text: string) => boolean;
export declare const tupleToCoors: (xyTuple: readonly [number, number]) => {
    x: number;
    y: number;
};
/** use as a rejectionHandler to mute filesystem Abort errors */
export declare const muteFSAbortError: (error?: Error | undefined) => void;
export declare const findIndex: <T>(array: readonly T[], cb: (element: T, index: number, array: readonly T[]) => boolean, fromIndex?: number) => number;
export declare const findLastIndex: <T>(array: readonly T[], cb: (element: T, index: number, array: readonly T[]) => boolean, fromIndex?: number) => number;
export declare const isTransparent: (color: string) => boolean;
export declare type ResolvablePromise<T> = Promise<T> & {
    resolve: [T] extends [undefined] ? (value?: T) => void : (value: T) => void;
    reject: (error: Error) => void;
};
export declare const resolvablePromise: <T>() => ResolvablePromise<T>;
/**
 * @param func handler taking at most single parameter (event).
 */
export declare const withBatchedUpdates: <TFunction extends ((event: any) => void) | (() => void)>(func: Parameters<TFunction>["length"] extends 0 | 1 ? TFunction : never) => TFunction;
export declare const nFormatter: (num: number, digits: number) => string;
export declare const getVersion: () => string;
export declare const supportsEmoji: () => boolean;
export declare const getNearestScrollableContainer: (element: HTMLElement) => HTMLElement | Document;
