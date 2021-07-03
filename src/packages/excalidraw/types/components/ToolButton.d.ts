import "./ToolIcon.scss";
import React from "react";
declare type ToolIconSize = "s" | "m";
declare type ToolButtonBaseProps = {
    icon?: React.ReactNode;
    "aria-label": string;
    "aria-keyshortcuts"?: string;
    "data-testid"?: string;
    label?: string;
    title?: string;
    name?: string;
    id?: string;
    size?: ToolIconSize;
    keyBindingLabel?: string;
    showAriaLabel?: boolean;
    hidden?: boolean;
    visible?: boolean;
    selected?: boolean;
    className?: string;
};
declare type ToolButtonProps = (ToolButtonBaseProps & {
    type: "button";
    children?: React.ReactNode;
    onClick?(): void;
}) | (ToolButtonBaseProps & {
    type: "icon";
    children?: React.ReactNode;
    onClick?(): void;
}) | (ToolButtonBaseProps & {
    type: "radio";
    checked: boolean;
    onChange?(): void;
});
export declare const ToolButton: React.ForwardRefExoticComponent<ToolButtonProps & React.RefAttributes<unknown>>;
export {};
