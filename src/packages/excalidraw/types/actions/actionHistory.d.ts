import { Action } from "./types";
import { SceneHistory } from "../history";
declare type ActionCreator = (history: SceneHistory) => Action;
export declare const createUndoAction: ActionCreator;
export declare const createRedoAction: ActionCreator;
export {};
