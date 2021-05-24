/// <reference types="react" />
import "./ToolIcon.scss";
export declare type Appearence = "light" | "dark";
export declare const DarkModeToggle: (props: {
    value: Appearence;
    onChange: (value: Appearence) => void;
    title?: string | undefined;
}) => JSX.Element;
