import { ExcalidrawElement, NonDeletedExcalidrawElement, NonDeleted } from "../element/types";
import { LinearElementEditor } from "../element/linearElementEditor";
declare type ElementIdKey = InstanceType<typeof LinearElementEditor>["elementId"];
declare type ElementKey = ExcalidrawElement | ElementIdKey;
declare type SceneStateCallback = () => void;
declare type SceneStateCallbackRemover = () => void;
declare class Scene {
    private static sceneMapByElement;
    private static sceneMapById;
    static mapElementToScene(elementKey: ElementKey, scene: Scene): void;
    static getScene(elementKey: ElementKey): Scene | null;
    private callbacks;
    private nonDeletedElements;
    private elements;
    private elementsMap;
    getElementsIncludingDeleted(): readonly ExcalidrawElement[];
    getElements(): readonly NonDeletedExcalidrawElement[];
    getElement(id: ExcalidrawElement["id"]): ExcalidrawElement | null;
    getNonDeletedElement(id: ExcalidrawElement["id"]): NonDeleted<ExcalidrawElement> | null;
    getNonDeletedElements(ids: readonly ExcalidrawElement["id"][]): NonDeleted<ExcalidrawElement>[];
    replaceAllElements(nextElements: readonly ExcalidrawElement[]): void;
    informMutation(): void;
    addCallback(cb: SceneStateCallback): SceneStateCallbackRemover;
    destroy(): void;
}
export default Scene;
