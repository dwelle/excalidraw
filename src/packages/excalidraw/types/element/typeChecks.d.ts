import { ExcalidrawElement, ExcalidrawTextElement, ExcalidrawLinearElement, ExcalidrawBindableElement, ExcalidrawGenericElement } from "./types";
export declare const isGenericElement: (element: ExcalidrawElement | null) => element is ExcalidrawGenericElement;
export declare const isTextElement: (element: ExcalidrawElement | null) => element is ExcalidrawTextElement;
export declare const isLinearElement: (element?: ExcalidrawElement | null | undefined) => element is ExcalidrawLinearElement;
export declare const isLinearElementType: (elementType: ExcalidrawElement["type"]) => boolean;
export declare const isBindingElement: (element?: ExcalidrawElement | null | undefined) => element is ExcalidrawLinearElement;
export declare const isBindingElementType: (elementType: ExcalidrawElement["type"]) => boolean;
export declare const isBindableElement: (element: ExcalidrawElement | null) => element is ExcalidrawBindableElement;
export declare const isExcalidrawElement: (element: any) => boolean;
