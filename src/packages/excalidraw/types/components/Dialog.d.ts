import React from "react";
import "./Dialog.scss";
import { AppState } from "../types";
export declare const Dialog: (props: {
    children: React.ReactNode;
    className?: string;
    small?: boolean;
    onCloseRequest(): void;
    title: React.ReactNode;
    autofocus?: boolean;
    theme?: AppState["theme"];
}) => JSX.Element;
