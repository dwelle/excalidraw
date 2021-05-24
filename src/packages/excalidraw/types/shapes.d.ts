/// <reference types="react" />
export declare const SHAPES: readonly [{
    readonly icon: JSX.Element;
    readonly value: "selection";
    readonly key: readonly ["v", "s"];
}, {
    readonly icon: JSX.Element;
    readonly value: "rectangle";
    readonly key: "r";
}, {
    readonly icon: JSX.Element;
    readonly value: "diamond";
    readonly key: "d";
}, {
    readonly icon: JSX.Element;
    readonly value: "ellipse";
    readonly key: "e";
}, {
    readonly icon: JSX.Element;
    readonly value: "arrow";
    readonly key: "a";
}, {
    readonly icon: JSX.Element;
    readonly value: "line";
    readonly key: readonly ["p", "l"];
}, {
    readonly icon: JSX.Element;
    readonly value: "freedraw";
    readonly key: "x";
}, {
    readonly icon: JSX.Element;
    readonly value: "text";
    readonly key: "t";
}];
export declare const findShapeByKey: (key: string) => "selection" | "rectangle" | "diamond" | "ellipse" | "arrow" | "line" | "freedraw" | "text" | null;
