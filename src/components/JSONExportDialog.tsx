import React, { useState } from "react";
import { ActionsManagerInterface } from "../actions/types";
import { NonDeletedExcalidrawElement } from "../element/types";
import { t } from "../i18n";
import { useIsMobile } from "./App";
import { AppState, CanvasActions, ExportOpts } from "../types";
import { Dialog } from "./Dialog";
import { exportToFileIcon, link } from "./icons";
import { ToolButton } from "./ToolButton";
import { actionSaveFileToDisk } from "../actions/actionExport";
import { Card } from "./Card";

import "./ExportDialog.scss";
import { supported as fsSupported } from "browser-fs-access";

export type ExportCB = (
  elements: readonly NonDeletedExcalidrawElement[],
  scale?: number,
) => void;

const JSONExportModal = ({
  elements,
  appState,
  actionManager,
  exportOpts,
  canvas,
}: {
  appState: AppState;
  elements: readonly NonDeletedExcalidrawElement[];
  actionManager: ActionsManagerInterface;
  onCloseRequest: () => void;
  exportOpts: ExportOpts;
  canvas: HTMLCanvasElement | null;
}) => {
  const { onExportToBackend } = exportOpts;
  return (
    <div className="ExportDialog ExportDialog--json">
      <div className="ExportDialog-cards">
        {exportOpts.saveFileToDisk && (
          <Card color="lime">
            <div className="Card-icon">{exportToFileIcon}</div>
            <h2>{t("exportDialog.disk_title")}</h2>
            <div className="Card-details">
              {t("exportDialog.disk_details")}
              {!fsSupported && actionManager.renderAction("changeProjectName")}
            </div>
            <ToolButton
              className="Card-button"
              type="button"
              title={t("exportDialog.disk_button")}
              aria-label={t("exportDialog.disk_button")}
              showAriaLabel={true}
              onClick={() => {
                actionManager.executeAction(actionSaveFileToDisk);
              }}
            />
          </Card>
        )}
        {onExportToBackend && (
          <Card color="pink">
            <div className="Card-icon">{link}</div>
            <h2>{t("exportDialog.link_title")}</h2>
            <div className="Card-details">{t("exportDialog.link_details")}</div>
            <ToolButton
              className="Card-button"
              type="button"
              title={t("exportDialog.link_button")}
              aria-label={t("exportDialog.link_button")}
              showAriaLabel={true}
              onClick={() => onExportToBackend(elements, appState, canvas)}
            />
          </Card>
        )}
        {exportOpts.renderCustomUI &&
          exportOpts.renderCustomUI(elements, appState, canvas)}
      </div>
    </div>
  );
};

export const JSONExportDialog = ({
  elements,
  appState,
  actionManager,
  exportOpts,
  canvas,
}: {
  appState: AppState;
  elements: readonly NonDeletedExcalidrawElement[];
  actionManager: ActionsManagerInterface;
  exportOpts: CanvasActions["export"];
  canvas: HTMLCanvasElement | null;
}) => {
  const [modalIsShown, setModalIsShown] = useState(false);

  const handleClose = React.useCallback(() => {
    setModalIsShown(false);
  }, []);

  return (
    <>
      <ToolButton
        onClick={() => {
          if (typeof exportOpts === "function") {
            actionManager.executeAction(actionSaveFileToDisk);
          } else {
            setModalIsShown(true);
          }
        }}
        data-testid="json-export-button"
        icon={exportToFileIcon}
        type="button"
        aria-label={t("buttons.export")}
        showAriaLabel={useIsMobile()}
        title={t("buttons.export")}
      />
      {modalIsShown && exportOpts && typeof exportOpts !== "function" && (
        <Dialog onCloseRequest={handleClose} title={t("buttons.export")}>
          <JSONExportModal
            elements={elements}
            appState={appState}
            actionManager={actionManager}
            onCloseRequest={handleClose}
            exportOpts={exportOpts}
            canvas={canvas}
          />
        </Dialog>
      )}
    </>
  );
};
