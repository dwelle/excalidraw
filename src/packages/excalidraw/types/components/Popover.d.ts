import React from "react";
import "./Popover.scss";
declare type Props = {
    top?: number;
    left?: number;
    children?: React.ReactNode;
    onCloseRequest?(event: PointerEvent): void;
    fitInViewport?: boolean;
};
export declare const Popover: ({ children, left, top, onCloseRequest, fitInViewport, }: Props) => JSX.Element;
export {};
