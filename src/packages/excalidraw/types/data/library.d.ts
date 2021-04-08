import { LibraryItems } from "../types";
export declare class Library {
    private static libraryCache;
    static csrfToken: string;
    static resetLibrary: () => void;
    /** imports library (currently merges, removing duplicates) */
    static importLibrary(blob: Blob): Promise<void>;
    static loadLibrary: () => Promise<LibraryItems>;
    static saveLibrary: (items: LibraryItems) => void;
}
