/// <reference types="react" />
import { LibraryItem } from "../types";
import "./LibraryUnit.scss";
export declare const LibraryUnit: ({ elements, pendingElements, onRemoveFromLibrary, onClick, }: {
    elements?: LibraryItem | undefined;
    pendingElements?: LibraryItem | undefined;
    onRemoveFromLibrary: () => void;
    onClick: () => void;
}) => JSX.Element;
