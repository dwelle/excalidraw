import { LibraryItems } from "../types";
import App from "../components/App";
declare class Library {
    private libraryCache;
    private app;
    constructor(app: App);
    resetLibrary: () => Promise<void>;
    /** imports library (currently merges, removing duplicates) */
    importLibrary(blob: Blob): Promise<void>;
    loadLibrary: () => Promise<LibraryItems>;
    saveLibrary: (items: LibraryItems) => Promise<void>;
}
export default Library;
