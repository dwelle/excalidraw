import "./UserList.scss";
import React from "react";
import { AppState } from "../types";
import { ActionManager } from "../actions/manager";
declare type UserListProps = {
    className?: string;
    mobile?: boolean;
    collaborators: AppState["collaborators"];
    layout: "vertical" | "horizontal";
    actionManager: ActionManager;
};
export declare const UserList: React.MemoExoticComponent<({ className, mobile, collaborators, layout, actionManager, }: UserListProps) => JSX.Element>;
export {};
