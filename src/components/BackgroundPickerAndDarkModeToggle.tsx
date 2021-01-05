import React from "react";
import { ActionManager } from "../actions/manager";
import { AppState } from "../types";

export const BackgroundPickerAndDarkModeToggle = ({
  appState,
  setAppState,
  actionManager,
}: {
  actionManager: ActionManager;
  appState: AppState;
  setAppState: React.Component<any, AppState>["setState"];
}) => (
  <div style={{ display: "flex" }}>
    {actionManager.renderAction("changeViewBackgroundColor")}
  </div>
);
