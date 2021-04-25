import { ExcalidrawElement } from "./element/types";
import { AppState } from "./types";
export declare const moveOneLeft: (elements: readonly ExcalidrawElement[], appState: AppState) => (import("./element/types").ExcalidrawLinearElement | import("./element/types").ExcalidrawSelectionElement | import("./element/types").ExcalidrawRectangleElement | import("./element/types").ExcalidrawDiamondElement | import("./element/types").ExcalidrawEllipseElement | import("./element/types").ExcalidrawTextElement)[];
export declare const moveOneRight: (elements: readonly ExcalidrawElement[], appState: AppState) => (import("./element/types").ExcalidrawLinearElement | import("./element/types").ExcalidrawSelectionElement | import("./element/types").ExcalidrawRectangleElement | import("./element/types").ExcalidrawDiamondElement | import("./element/types").ExcalidrawEllipseElement | import("./element/types").ExcalidrawTextElement)[];
export declare const moveAllLeft: (elements: readonly ExcalidrawElement[], appState: AppState) => readonly ExcalidrawElement[];
export declare const moveAllRight: (elements: readonly ExcalidrawElement[], appState: AppState) => readonly ExcalidrawElement[];
