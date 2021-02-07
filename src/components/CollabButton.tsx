import React from "react";
import clsx from "clsx";
import { ToolButton } from "./ToolButton";
import { t } from "../i18n";
import useIsMobile from "../is-mobile";
import { shareIcon } from "./icons";

import "./CollabButton.scss";

const CollabButton = ({
  isCollaborating,
  collaboratorCount,
  onClick,
}: {
  isCollaborating: boolean;
  collaboratorCount: number;
  onClick: () => void;
}) => {
  return (
    <>
      <ToolButton
        className={clsx("CollabButton", {
          "is-collaborating": isCollaborating,
        })}
        onClick={onClick}
        icon={shareIcon}
        type="button"
        title={t("buttons.roomDialog")}
        aria-label={t("buttons.roomDialog")}
        showAriaLabel={useIsMobile()}
      />
    </>
  );
};

export default CollabButton;
