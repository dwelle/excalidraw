import "./Modal.scss";
import React from "react";
export declare const Modal: (props: {
    className?: string;
    children: React.ReactNode;
    maxWidth?: number;
    onCloseRequest(): void;
    labelledBy: string;
}) => React.ReactPortal | null;
