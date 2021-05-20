import { ExcalidrawElement } from "./types";
declare type ElementUpdate<TElement extends ExcalidrawElement> = Omit<Partial<TElement>, "id" | "version" | "versionNonce">;
export declare const mutateElement: <TElement extends Mutable<ExcalidrawElement>>(element: TElement, updates: ElementUpdate<TElement>) => void;
export declare const newElementWith: <TElement extends ExcalidrawElement>(element: TElement, updates: ElementUpdate<TElement>) => TElement;
/**
 * Mutates element and updates `version` & `versionNonce`.
 *
 * NOTE: does not trigger re-render.
 */
export declare const bumpVersion: (element: Mutable<ExcalidrawElement>) => Mutable<ExcalidrawElement>;
export {};
