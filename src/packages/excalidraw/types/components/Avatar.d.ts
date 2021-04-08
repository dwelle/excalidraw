import "./Avatar.scss";
import React from "react";
declare type AvatarProps = {
    children: JSX.Element | string;
    onClick: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    color: string;
    border: string;
};
export declare const Avatar: ({ children, color, border, onClick }: AvatarProps) => JSX.Element;
export {};
