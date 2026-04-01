import { MIME_TYPES } from "@excalidraw/common";

import { isImageElement, newElementWith } from "@excalidraw/element";

import { CaptureUpdateAction } from "@excalidraw/element";

import type { ExcalidrawImageElement } from "@excalidraw/element/types";

import { register } from "./register";

import type { AppClassProperties, AppState } from "../types";

const isSvgImageElement = (
  imageElement: ExcalidrawImageElement,
  app: AppClassProperties,
) => {
  if (imageElement.fileId == null) {
    return false;
  }

  return (
    app.files[imageElement.fileId]?.mimeType === MIME_TYPES.svg ||
    app.imageCache.get(imageElement.fileId)?.mimeType === MIME_TYPES.svg
  );
};

const getSelectedSvgImages = (
  app: AppClassProperties,
  appState: Readonly<AppState>,
) => {
  return app.scene
    .getSelectedElements({
      selectedElementIds: appState.selectedElementIds,
      includeBoundTextElement: false,
      includeElementsInFrames: true,
    })
    .filter(
      (element): element is ExcalidrawImageElement =>
        isImageElement(element) && isSvgImageElement(element, app),
    );
};

const shouldEnableSvgDarkModeInversion = (
  selectedSvgImages: readonly ExcalidrawImageElement[],
) =>
  selectedSvgImages.some(
    (element) => !!element.customData?.doNotInvertSVGInDarkMode,
  );

export const actionToggleSvgDarkModeInversion = register({
  name: "toggleSvgDarkModeInversion",
  label: (_elements, appState, app) => {
    const selectedSvgImages = getSelectedSvgImages(app, appState);
    return shouldEnableSvgDarkModeInversion(selectedSvgImages)
      ? "labels.enableSvgInversionInDarkMode"
      : "labels.disableSvgInversionInDarkMode";
  },
  trackEvent: {
    category: "element",
    action: "toggleSvgDarkModeInversion",
  },
  keywords: ["svg", "dark", "invert", "image"],
  predicate: (_elements, appState, _, app) => {
    return getSelectedSvgImages(app, appState).length > 0;
  },
  perform: (elements, appState, _, app) => {
    const selectedSvgImages = getSelectedSvgImages(app, appState);
    if (!selectedSvgImages.length) {
      return false;
    }

    const shouldEnable = shouldEnableSvgDarkModeInversion(selectedSvgImages);
    const selectedSvgImageIds = new Set(selectedSvgImages.map((el) => el.id));

    const nextElements = elements.map((element) => {
      if (!selectedSvgImageIds.has(element.id)) {
        return element;
      }

      return newElementWith(element, {
        customData: {
          ...(element.customData ?? {}),
          doNotInvertSVGInDarkMode: !shouldEnable,
        },
      });
    });

    return {
      elements: nextElements,
      appState,
      captureUpdate: CaptureUpdateAction.IMMEDIATELY,
    };
  },
});
