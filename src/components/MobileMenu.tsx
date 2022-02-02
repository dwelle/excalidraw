import React from "react";
import { AppProps, AppState } from "../types";
import { ActionManager } from "../actions/manager";
import { t } from "../i18n";
import Stack from "./Stack";
import { showSelectedShapeActions } from "../element";
import { NonDeletedExcalidrawElement } from "../element/types";
import { FixedSideContainer } from "./FixedSideContainer";
import { Island } from "./Island";
import { calculateScrollCenter } from "../scene";
import { SelectedShapeActions, ShapesSwitcher } from "./Actions";
import { Section } from "./Section";
import CollabButton from "./CollabButton";
import { SCROLLBAR_WIDTH, SCROLLBAR_MARGIN } from "../scene/scrollbars";
import { LockButton } from "./LockButton";
import { UserList } from "./UserList";
import { BackgroundPickerAndDarkModeToggle } from "./BackgroundPickerAndDarkModeToggle";
import { LibraryButton } from "./LibraryButton";
import { PenModeButton } from "./PenModeButton";
import { ToolButton } from "./ToolButton";
import { home } from "./icons";

type MobileMenuProps = {
  onHomeButtonClick?: () => void;
  appState: AppState;
  actionManager: ActionManager;
  renderJSONExportDialog: () => React.ReactNode;
  renderImageExportDialog: () => React.ReactNode;
  setAppState: React.Component<any, AppState>["setState"];
  elements: readonly NonDeletedExcalidrawElement[];
  libraryMenu: JSX.Element | null;
  onCollabButtonClick?: () => void;
  onLockToggle: () => void;
  onPenModeToggle: () => void;
  canvas: HTMLCanvasElement | null;
  isCollaborating: boolean;
  renderCustomFooter?: (isMobile: boolean, appState: AppState) => JSX.Element;
  viewModeEnabled: boolean;
  showThemeBtn: boolean;
  onImageAction: (data: { insertOnCanvasDirectly: boolean }) => void;
  renderTopRightUI?: (
    isMobile: boolean,
    appState: AppState,
    canvas: HTMLCanvasElement | null,
  ) => JSX.Element | null;
  UIOptions: AppProps["UIOptions"];
};

export const MobileMenu = ({
  onHomeButtonClick,
  appState,
  elements,
  libraryMenu,
  actionManager,
  renderJSONExportDialog,
  renderImageExportDialog,
  setAppState,
  onCollabButtonClick,
  onLockToggle,
  onPenModeToggle,
  canvas,
  isCollaborating,
  renderCustomFooter,
  viewModeEnabled,
  showThemeBtn,
  onImageAction,
  renderTopRightUI,
  UIOptions,
}: MobileMenuProps) => {
  const renderToolbar = () => {
    return (
      <FixedSideContainer side="top" className="App-top-bar">
        {/* placeholder for grid 3-column template */}
        <div></div>
        <Section heading="shapes">
          {(heading) => (
            <Stack.Col gap={4} align="center">
              <Stack.Row gap={1} className="App-toolbar-container">
                <Island padding={1} className="App-toolbar">
                  {heading}
                  <Stack.Row gap={1}>
                    <ShapesSwitcher
                      canvas={canvas}
                      elementType={appState.elementType}
                      setAppState={setAppState}
                      onImageAction={({ pointerType }) => {
                        onImageAction({
                          insertOnCanvasDirectly: pointerType !== "mouse",
                        });
                      }}
                    />
                  </Stack.Row>
                </Island>
                <ToolButton
                  key="home"
                  type="button"
                  className="HomeButton ToolIcon_type_floating"
                  title={"Home"}
                  aria-label={"Home"}
                  icon={home}
                  onClick={onHomeButtonClick}
                />
                <LockButton
                  checked={appState.elementLocked}
                  onChange={onLockToggle}
                  title={t("toolBar.lock")}
                  isMobile
                />
                <LibraryButton
                  appState={appState}
                  setAppState={setAppState}
                  isMobile
                />
                <PenModeButton
                  checked={appState.penMode}
                  onChange={onPenModeToggle}
                  title={t("toolBar.penMode")}
                  isMobile
                  penDetected={appState.penDetected}
                />
              </Stack.Row>
              {libraryMenu}
            </Stack.Col>
          )}
        </Section>
        <div style={{ display: "flex" }}>
          {renderTopRightUI?.(true, appState, canvas)}
        </div>
      </FixedSideContainer>
    );
  };

  const renderAppToolbar = () => {
    if (viewModeEnabled) {
      return UIOptions.canvasActions ? (
        <div className="App-toolbar-content">
          {actionManager.renderAction("toggleCanvasMenu")}
        </div>
      ) : (
        <div>Excalidraw</div>
      );
    }
    return (
      <div className="App-toolbar-content">
        {UIOptions.canvasActions &&
          actionManager.renderAction("toggleCanvasMenu")}
        {actionManager.renderAction("toggleEditMenu")}
        {actionManager.renderAction("undo")}
        {actionManager.renderAction("redo")}
        {actionManager.renderAction(
          appState.multiElement ? "finalize" : "duplicateSelection",
        )}
        {actionManager.renderAction("deleteSelectedElements")}
      </div>
    );
  };

  const renderCanvasActions = () => {
    if (viewModeEnabled) {
      return (
        <>
          {renderJSONExportDialog()}
          {renderImageExportDialog()}
        </>
      );
    }
    return (
      <>
        {actionManager.renderAction("clearCanvas")}
        {actionManager.renderAction("loadScene")}
        {renderJSONExportDialog()}
        {renderImageExportDialog()}
        {onCollabButtonClick && (
          <CollabButton
            isCollaborating={isCollaborating}
            collaboratorCount={appState.collaborators.size}
            onClick={onCollabButtonClick}
          />
        )}
        {
          <BackgroundPickerAndDarkModeToggle
            actionManager={actionManager}
            appState={appState}
            setAppState={setAppState}
            showThemeBtn={showThemeBtn}
          />
        }
      </>
    );
  };
  return (
    <>
      {!viewModeEnabled && renderToolbar()}
      <div
        className="App-bottom-bar"
        style={{
          marginBottom: SCROLLBAR_WIDTH + SCROLLBAR_MARGIN * 2,
          marginLeft: SCROLLBAR_WIDTH + SCROLLBAR_MARGIN * 2,
          marginRight: SCROLLBAR_WIDTH + SCROLLBAR_MARGIN * 2,
        }}
      >
        <Island padding={0}>
          {UIOptions.canvasActions && appState.openMenu === "canvas" ? (
            <Section className="App-mobile-menu" heading="canvasActions">
              <div className="panelColumn">
                <Stack.Col gap={4}>
                  {renderCanvasActions()}
                  {renderCustomFooter?.(true, appState)}
                  {appState.collaborators.size > 0 && (
                    <fieldset>
                      <legend>{t("labels.collaborators")}</legend>
                      <UserList
                        mobile
                        layout="horizontal"
                        collaborators={appState.collaborators}
                        actionManager={actionManager}
                      />
                    </fieldset>
                  )}
                </Stack.Col>
              </div>
            </Section>
          ) : appState.openMenu === "shape" &&
            !viewModeEnabled &&
            showSelectedShapeActions(appState, elements) ? (
            <Section className="App-mobile-menu" heading="selectedShapeActions">
              <SelectedShapeActions
                appState={appState}
                elements={elements}
                renderAction={actionManager.renderAction}
                elementType={appState.elementType}
              />
            </Section>
          ) : null}
          <footer className="App-toolbar">
            {renderAppToolbar()}
            {appState.scrolledOutside && !appState.openMenu && (
              <button
                className="scroll-back-to-content"
                onClick={() => {
                  setAppState({
                    ...calculateScrollCenter(elements, appState, canvas),
                  });
                }}
              >
                {t("buttons.scrollBackToContent")}
              </button>
            )}
          </footer>
        </Island>
      </div>
    </>
  );
};
