import { Point } from "../types";
import { FONT_FAMILY } from "../constants";
export declare type ChartType = "bar" | "line";
export declare type FillStyle = "hachure" | "cross-hatch" | "solid";
export declare type FontFamilyKeys = keyof typeof FONT_FAMILY;
export declare type FontFamilyValues = typeof FONT_FAMILY[FontFamilyKeys];
export declare type FontString = string & {
    _brand: "fontString";
};
export declare type GroupId = string;
export declare type PointerType = "mouse" | "pen" | "touch";
export declare type StrokeSharpness = "round" | "sharp";
export declare type StrokeStyle = "solid" | "dashed" | "dotted";
export declare type TextAlign = "left" | "center" | "right";
export declare type VerticalAlign = "top" | "middle";
declare type _ExcalidrawElementBase = Readonly<{
    id: string;
    x: number;
    y: number;
    strokeColor: string;
    backgroundColor: string;
    fillStyle: FillStyle;
    strokeWidth: number;
    strokeStyle: StrokeStyle;
    strokeSharpness: StrokeSharpness;
    roughness: number;
    opacity: number;
    width: number;
    height: number;
    angle: number;
    /** Random integer used to seed shape generation so that the roughjs shape
        doesn't differ across renders. */
    seed: number;
    /** Integer that is sequentially incremented on each change. Used to reconcile
        elements during collaboration or when saving to server. */
    version: number;
    /** Random integer that is regenerated on each change.
        Used for deterministic reconciliation of updates during collaboration,
        in case the versions (see above) are identical. */
    versionNonce: number;
    isDeleted: boolean;
    /** List of groups the element belongs to.
        Ordered from deepest to shallowest. */
    groupIds: readonly GroupId[];
    /** Ids of (linear) elements that are bound to this element. */
    boundElementIds: readonly ExcalidrawLinearElement["id"][] | null;
}>;
export declare type ExcalidrawSelectionElement = _ExcalidrawElementBase & {
    type: "selection";
};
export declare type ExcalidrawRectangleElement = _ExcalidrawElementBase & {
    type: "rectangle";
};
export declare type ExcalidrawDiamondElement = _ExcalidrawElementBase & {
    type: "diamond";
};
export declare type ExcalidrawEllipseElement = _ExcalidrawElementBase & {
    type: "ellipse";
};
/**
 * These are elements that don't have any additional properties.
 */
export declare type ExcalidrawGenericElement = ExcalidrawSelectionElement | ExcalidrawRectangleElement | ExcalidrawDiamondElement | ExcalidrawEllipseElement;
/**
 * ExcalidrawElement should be JSON serializable and (eventually) contain
 * no computed data. The list of all ExcalidrawElements should be shareable
 * between peers and contain no state local to the peer.
 */
export declare type ExcalidrawElement = ExcalidrawGenericElement | ExcalidrawTextElement | ExcalidrawLinearElement | ExcalidrawFreeDrawElement;
export declare type NonDeleted<TElement extends ExcalidrawElement> = TElement & {
    isDeleted: false;
};
export declare type NonDeletedExcalidrawElement = NonDeleted<ExcalidrawElement>;
export declare type ExcalidrawTextElement = _ExcalidrawElementBase & Readonly<{
    type: "text";
    fontSize: number;
    fontFamily: FontFamilyValues;
    text: string;
    baseline: number;
    textAlign: TextAlign;
    verticalAlign: VerticalAlign;
}>;
export declare type ExcalidrawBindableElement = ExcalidrawRectangleElement | ExcalidrawDiamondElement | ExcalidrawEllipseElement | ExcalidrawTextElement;
export declare type PointBinding = {
    elementId: ExcalidrawBindableElement["id"];
    focus: number;
    gap: number;
};
export declare type Arrowhead = "arrow" | "bar" | "dot";
export declare type ExcalidrawLinearElement = _ExcalidrawElementBase & Readonly<{
    type: "line" | "arrow";
    points: readonly Point[];
    lastCommittedPoint: Point | null;
    startBinding: PointBinding | null;
    endBinding: PointBinding | null;
    startArrowhead: Arrowhead | null;
    endArrowhead: Arrowhead | null;
}>;
export declare type ExcalidrawFreeDrawElement = _ExcalidrawElementBase & Readonly<{
    type: "freedraw";
    points: readonly Point[];
    pressures: readonly number[];
    simulatePressure: boolean;
    lastCommittedPoint: Point | null;
}>;
export {};
