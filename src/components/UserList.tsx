import "./UserList.scss";

import React from "react";
import clsx from "clsx";
import { AppState } from "../types";
import { ActionManager } from "../actions/manager";
import { Tooltip } from "./Tooltip";

type UserListProps = {
  className?: string;
  mobile?: boolean;
  collaborators: AppState["collaborators"];
  layout: "vertical" | "horizontal";
  actionManager: ActionManager;
};

export const UserList = React.memo(
  ({
    className,
    mobile,
    collaborators = new Map(),
    layout,
    actionManager,
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
        {collaborators.size > 0 &&
          Array.from(collaborators)
            // Collaborator is either not initialized or is actually the current user.
            .filter(([_, client]) => Object.keys(client).length !== 0)
            .map(([clientId, client]) =>
              mobile ? (
                actionManager.renderAction("goToCollaborator", clientId)
              ) : (
                <Tooltip
                  label={client.username || "Unknown user"}
                  key={clientId}
                >
                  {actionManager.renderAction("goToCollaborator", clientId)}
                </Tooltip>
              ),
            )}
      </div>
    );
  },
);
