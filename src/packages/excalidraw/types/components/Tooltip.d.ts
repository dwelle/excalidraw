import "./Tooltip.scss";
import React from "react";
declare type TooltipProps = {
    children: React.ReactNode;
    label: string;
    long?: boolean;
};
export declare const Tooltip: ({ children, label, long }: TooltipProps) => JSX.Element;
export {};
