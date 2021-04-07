import { ExcalidrawElement, NonDeletedExcalidrawElement } from "./element/types";
import { AppState } from "./types";
import { Spreadsheet } from "./charts";
export declare const probablySupportsClipboardReadText: boolean;
export declare const probablySupportsClipboardWriteText: boolean;
export declare const probablySupportsClipboardBlob: boolean;
export declare const copyToClipboard: (elements: readonly NonDeletedExcalidrawElement[], appState: AppState) => Promise<void>;
/**
 * Attemps to parse clipboard. Prefers system clipboard.
 */
export declare const parseClipboard: (event: ClipboardEvent | null) => Promise<{
    spreadsheet?: Spreadsheet;
    elements?: readonly ExcalidrawElement[];
    text?: string;
    errorMessage?: string;
}>;
export declare const copyCanvasToClipboardAsPng: (canvas: HTMLCanvasElement) => Promise<void>;
export declare const copyTextToSystemClipboard: (text: string | null) => Promise<void>;
