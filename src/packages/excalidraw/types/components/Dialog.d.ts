import React from "react";
import "./Dialog.scss";
export declare const Dialog: (props: {
    children: React.ReactNode;
    className?: string;
    small?: boolean;
    onCloseRequest(): void;
    title: React.ReactNode;
    autofocus?: boolean;
}) => JSX.Element;
