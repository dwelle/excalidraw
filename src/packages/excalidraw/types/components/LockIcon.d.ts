/// <reference types="react" />
import "./ToolIcon.scss";
declare type LockIconSize = "s" | "m";
declare type LockIconProps = {
    title?: string;
    name?: string;
    id?: string;
    checked: boolean;
    onChange?(): void;
    size?: LockIconSize;
    zenModeEnabled?: boolean;
};
export declare const LockIcon: (props: LockIconProps) => JSX.Element;
export {};
