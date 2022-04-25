import React, { useEffect, forwardRef } from "react";
import "./publicPath";

import { InitializeApp } from "../../components/InitializeApp";
import App from "../../components/App";

import "../../css/app.scss";
import "../../css/styles.scss";

import { AppProps, ExcalidrawAPIRefValue, ExcalidrawProps } from "../../types";
import { defaultLang } from "../../i18n";
import {
  DEFAULT_UI_OPTIONS,
  DEFAULT_CUSTOM_ELEMENT_CONFIG,
} from "../../constants";
import { Provider } from "jotai";
import { jotaiScope, jotaiStore } from "../../jotai";

const ExcalidrawBase = (props: ExcalidrawProps) => {
  const {
    onHomeButtonClick,
    onChange,
    initialData,
    excalidrawRef,
    onCollabButtonClick,
    isCollaborating = false,
    onPointerUpdate,
    renderTopRightUI,
    renderFooter,
    langCode = defaultLang.code,
    viewModeEnabled,
    zenModeEnabled,
    gridModeEnabled,
    libraryReturnUrl,
    theme,
    name,
    renderCustomStats,
    onPaste,
    detectScroll = true,
    handleKeyboardGlobally = false,
    onLibraryChange,
    autoFocus = false,
    generateIdForFile,
    onLinkOpen,
    renderCustomElementWidget,
    onElementClick,
    id,
  } = props;

  const canvasActions = props.UIOptions?.canvasActions;

  const UIOptions: AppProps["UIOptions"] = {
    canvasActions: canvasActions
      ? {
          ...DEFAULT_UI_OPTIONS.canvasActions,
          ...canvasActions,
        }
      : false,
  };
  const customElementsConfig: AppProps["customElementsConfig"] =
    props.customElementsConfig?.map((customElementConfig) => ({
      ...DEFAULT_CUSTOM_ELEMENT_CONFIG,
      ...customElementConfig,
    }));

  if (canvasActions && typeof canvasActions.export === "object") {
    canvasActions.export.saveFileToDisk =
      canvasActions.export?.saveFileToDisk ||
      DEFAULT_UI_OPTIONS.canvasActions.export.saveFileToDisk;
  }

  useEffect(() => {
    // Block pinch-zooming on iOS outside of the content area
    const handleTouchMove = (event: TouchEvent) => {
      // @ts-ignore
      if (typeof event.scale === "number" && event.scale !== 1) {
        event.preventDefault();
      }
    };

    document.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });

    return () => {
      document.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  return (
    <InitializeApp langCode={langCode}>
      <Provider unstable_createStore={() => jotaiStore} scope={jotaiScope}>
        <App
          id={id}
          onHomeButtonClick={onHomeButtonClick}
          onChange={onChange}
          initialData={initialData}
          excalidrawRef={excalidrawRef}
          onCollabButtonClick={onCollabButtonClick}
          isCollaborating={isCollaborating}
          onPointerUpdate={onPointerUpdate}
          renderTopRightUI={renderTopRightUI}
          renderFooter={renderFooter}
          langCode={langCode}
          viewModeEnabled={viewModeEnabled}
          zenModeEnabled={zenModeEnabled}
          gridModeEnabled={gridModeEnabled}
          libraryReturnUrl={libraryReturnUrl}
          theme={theme}
          name={name}
          renderCustomStats={renderCustomStats}
          UIOptions={UIOptions}
          onPaste={onPaste}
          detectScroll={detectScroll}
          handleKeyboardGlobally={handleKeyboardGlobally}
          onLibraryChange={onLibraryChange}
          autoFocus={autoFocus}
          generateIdForFile={generateIdForFile}
          onLinkOpen={onLinkOpen}
          renderCustomElementWidget={renderCustomElementWidget}
          customElementsConfig={customElementsConfig}
          onElementClick={onElementClick}
        />
      </Provider>
    </InitializeApp>
  );
};

type PublicExcalidrawProps = Omit<ExcalidrawProps, "forwardedRef">;

const areEqual = (
  prevProps: PublicExcalidrawProps,
  nextProps: PublicExcalidrawProps,
) => {
  const {
    initialData: prevInitialData,
    UIOptions: prevUIOptions = {},
    ...prev
  } = prevProps;
  const {
    initialData: nextInitialData,
    UIOptions: nextUIOptions = {},
    ...next
  } = nextProps;

  // comparing UIOptions
  const prevUIOptionsKeys = Object.keys(prevUIOptions) as (keyof Partial<
    typeof DEFAULT_UI_OPTIONS
  >)[];
  const nextUIOptionsKeys = Object.keys(nextUIOptions) as (keyof Partial<
    typeof DEFAULT_UI_OPTIONS
  >)[];

  if (prevUIOptionsKeys.length !== nextUIOptionsKeys.length) {
    return false;
  }

  const isUIOptionsSame = prevUIOptionsKeys.every((key) => {
    if (key === "canvasActions") {
      const canvasOptionKeys = Object.keys(
        prevUIOptions.canvasActions!,
      ) as (keyof Partial<typeof DEFAULT_UI_OPTIONS.canvasActions>)[];
      canvasOptionKeys.every((key) => {
        if (!prevUIOptions?.canvasActions || !nextUIOptions?.canvasActions) {
          return prevUIOptions?.canvasActions === nextUIOptions?.canvasActions;
        }
        if (
          key === "export" &&
          prevUIOptions?.canvasActions?.export &&
          nextUIOptions?.canvasActions?.export
        ) {
          if (
            typeof prevUIOptions.canvasActions.export === "function" ||
            typeof nextUIOptions.canvasActions.export === "function"
          ) {
            return (
              prevUIOptions.canvasActions.export ===
              nextUIOptions.canvasActions.export
            );
          }
          return (
            prevUIOptions.canvasActions.export.saveFileToDisk ===
            nextUIOptions.canvasActions.export.saveFileToDisk
          );
        }
        return (
          prevUIOptions?.canvasActions?.[key] ===
          nextUIOptions?.canvasActions?.[key]
        );
      });
    }
    return true;
  });

  const prevKeys = Object.keys(prevProps) as (keyof typeof prev)[];
  const nextKeys = Object.keys(nextProps) as (keyof typeof next)[];
  return (
    isUIOptionsSame &&
    prevKeys.length === nextKeys.length &&
    prevKeys.every((key) => prev[key] === next[key])
  );
};

const forwardedRefComp = forwardRef<
  ExcalidrawAPIRefValue,
  PublicExcalidrawProps
>((props, ref) => <ExcalidrawBase {...props} excalidrawRef={ref} />);

export const Excalidraw = React.memo(forwardedRefComp, areEqual);

export {
  getSceneVersion,
  isInvisiblySmallElement,
  getNonDeletedElements,
} from "../../element";
export { defaultLang, languages } from "../../i18n";
export {
  restore,
  restoreAppState,
  restoreElements,
  restoreLibraryItems,
} from "../../data/restore";
export {
  exportToBlob,
  exportToCanvas,
  exportToSvg,
  serializeAsJSON,
  serializeLibraryAsJSON,
  loadLibraryFromBlob,
  loadFromBlob,
  getFreeDrawSvgPath,
} from "../../packages/utils";
export { isLinearElement } from "../../element/typeChecks";
export {
  mutateElement,
  newElementWith,
  bumpVersion,
} from "../../element/mutateElement";

export { sceneCoordsToViewportCoords } from "../../utils";
export { FONT_FAMILY, THEME } from "../../constants";
export { exportToClipboard } from "../utils";
export { getDefaultAppState } from "../../appState";
export {
  cleanAppStateForExport,
  clearAppStateForLocalStorage,
} from "../../appState";

export { jotaiScope, jotaiStore } from "../../jotai";
export { libraryItemsAtom } from "../../data/library";
