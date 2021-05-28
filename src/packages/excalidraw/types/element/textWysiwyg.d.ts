import { ExcalidrawElement } from "./types";
import { AppState } from "../types";
export declare const textWysiwyg: ({ id, appState, onChange, onSubmit, getViewportCoords, element, canvas, excalidrawContainer, }: {
    id: ExcalidrawElement["id"];
    appState: AppState;
    onChange?: ((text: string) => void) | undefined;
    onSubmit: (data: {
        text: string;
        viaKeyboard: boolean;
    }) => void;
    getViewportCoords: (x: number, y: number) => [number, number];
    element: ExcalidrawElement;
    canvas: HTMLCanvasElement | null;
    excalidrawContainer: HTMLDivElement | null;
}) => void;
