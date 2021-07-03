import { AppState, NormalizedZoomValue } from "./types";
export declare const getDefaultAppState: () => Omit<AppState, "offsetTop" | "offsetLeft" | "width" | "height">;
export declare const clearAppStateForLocalStorage: (appState: Partial<AppState>) => {
    zoom?: Readonly<{
        value: NormalizedZoomValue;
        translation: Readonly<{
            x: number;
            y: number;
        }>;
    }> | undefined;
    scrollX?: number | undefined;
    scrollY?: number | undefined;
    elementType?: "line" | "selection" | "rectangle" | "diamond" | "ellipse" | "text" | "arrow" | "freedraw" | undefined;
    elementLocked?: boolean | undefined;
    exportBackground?: boolean | undefined;
    exportEmbedScene?: boolean | undefined;
    exportWithDarkMode?: boolean | undefined;
    exportScale?: number | undefined;
    currentItemStrokeColor?: string | undefined;
    currentItemBackgroundColor?: string | undefined;
    currentItemFillStyle?: import("./element/types").FillStyle | undefined;
    currentItemStrokeWidth?: number | undefined;
    currentItemStrokeStyle?: import("./element/types").StrokeStyle | undefined;
    currentItemRoughness?: number | undefined;
    currentItemOpacity?: number | undefined;
    currentItemFontFamily?: number | undefined;
    currentItemFontSize?: number | undefined;
    currentItemTextAlign?: import("./element/types").TextAlign | undefined;
    currentItemStrokeSharpness?: import("./element/types").StrokeSharpness | undefined;
    currentItemStartArrowhead?: import("./element/types").Arrowhead | null | undefined;
    currentItemEndArrowhead?: import("./element/types").Arrowhead | null | undefined;
    currentItemLinearStrokeSharpness?: import("./element/types").StrokeSharpness | undefined;
    viewBackgroundColor?: string | undefined;
    cursorButton?: "up" | "down" | undefined;
    scrolledOutside?: boolean | undefined;
    name?: string | undefined;
    openMenu?: "canvas" | "shape" | null | undefined;
    lastPointerDownWith?: import("./element/types").PointerType | undefined;
    selectedElementIds?: {
        [id: string]: boolean;
    } | undefined;
    previousSelectedElementIds?: {
        [id: string]: boolean;
    } | undefined;
    shouldCacheIgnoreZoom?: boolean | undefined;
    zenModeEnabled?: boolean | undefined;
    theme?: "light" | "dark" | undefined;
    gridSize?: number | null | undefined;
    selectedGroupIds?: {
        [groupId: string]: boolean;
    } | undefined;
    editingGroupId?: string | null | undefined;
    showStats?: boolean | undefined;
    currentChartType?: import("./element/types").ChartType | undefined;
};
export declare const cleanAppStateForExport: (appState: Partial<AppState>) => {
    viewBackgroundColor?: string | undefined;
    gridSize?: number | null | undefined;
};
