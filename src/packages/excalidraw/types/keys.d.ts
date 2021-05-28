export declare const isDarwin: boolean;
export declare const isWindows: boolean;
export declare const CODES: {
    readonly EQUAL: "Equal";
    readonly MINUS: "Minus";
    readonly NUM_ADD: "NumpadAdd";
    readonly NUM_SUBTRACT: "NumpadSubtract";
    readonly NUM_ZERO: "Numpad0";
    readonly BRACKET_RIGHT: "BracketRight";
    readonly BRACKET_LEFT: "BracketLeft";
    readonly ONE: "Digit1";
    readonly TWO: "Digit2";
    readonly NINE: "Digit9";
    readonly QUOTE: "Quote";
    readonly ZERO: "Digit0";
    readonly SLASH: "Slash";
    readonly C: "KeyC";
    readonly D: "KeyD";
    readonly G: "KeyG";
    readonly F: "KeyF";
    readonly H: "KeyH";
    readonly V: "KeyV";
    readonly X: "KeyX";
    readonly Z: "KeyZ";
    readonly R: "KeyR";
};
export declare const KEYS: {
    readonly ARROW_DOWN: "ArrowDown";
    readonly ARROW_LEFT: "ArrowLeft";
    readonly ARROW_RIGHT: "ArrowRight";
    readonly ARROW_UP: "ArrowUp";
    readonly BACKSPACE: "Backspace";
    readonly ALT: "Alt";
    readonly CTRL_OR_CMD: "metaKey" | "ctrlKey";
    readonly DELETE: "Delete";
    readonly ENTER: "Enter";
    readonly ESCAPE: "Escape";
    readonly QUESTION_MARK: "?";
    readonly SPACE: " ";
    readonly TAB: "Tab";
    readonly A: "a";
    readonly D: "d";
    readonly E: "e";
    readonly G: "g";
    readonly L: "l";
    readonly O: "o";
    readonly P: "p";
    readonly Q: "q";
    readonly R: "r";
    readonly S: "s";
    readonly T: "t";
    readonly V: "v";
    readonly X: "x";
    readonly Y: "y";
    readonly Z: "z";
};
export declare type Key = keyof typeof KEYS;
export declare const isArrowKey: (key: string) => boolean;
export declare const getResizeCenterPointKey: (event: MouseEvent | KeyboardEvent) => boolean;
export declare const getResizeWithSidesSameLengthKey: (event: MouseEvent | KeyboardEvent) => boolean;
export declare const getRotateWithDiscreteAngleKey: (event: MouseEvent | KeyboardEvent) => boolean;
