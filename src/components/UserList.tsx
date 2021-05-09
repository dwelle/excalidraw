import "./UserList.scss";

import React from "react";
import clsx from "clsx";
import { AppState } from "../types";

type UserListProps = {
  children: React.ReactNode;
  className?: string;
  mobile?: boolean;
  collaborators: AppState["collaborators"];
  layout: "vertical" | "horizontal";
};

export const UserList = ({
  children,
  className,
  mobile,
  collaborators = new Map(),
  layout,
}: UserListProps) => {
  const threshold = layout === "vertical" ? 6 : 3;
  const offset =
    collaborators.size > threshold
      ? Math.min(collaborators.size - threshold, 15) * -2
      : 4;
  return (
    <div
      className={clsx(`UserList layout-${layout}`, className, {
        UserList_mobile: mobile,
      })}
      style={{
        ["--itemOffset" as any]: `${offset}px`,
      }}
    >
      {children}
    </div>
  );
};
