import { isImageElement } from "@excalidraw/element";

import { CaptureUpdateAction } from "@excalidraw/element";

import { register } from "./register";

import type { AppClassProperties, AppState } from "../types";

const getSelectedPdfDownloadUrl = (
  app: AppClassProperties,
  appState: Readonly<AppState>,
): string | null => {
  const selectedElements = app.scene.getSelectedElements({
    selectedElementIds: appState.selectedElementIds,
    includeBoundTextElement: false,
    includeElementsInFrames: true,
  });

  for (const element of selectedElements) {
    if (!isImageElement(element)) {
      continue;
    }

    const url = element.customData?.pdfOriginalDownloadUrl;
    if (typeof url === "string" && url.length > 0) {
      return url;
    }
  }

  return null;
};

const triggerDownload = (url: string) => {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "";
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
};

export const actionDownloadOriginalPdf = register({
  name: "downloadOriginalPdf",
  label: "labels.downloadOriginalPdf",
  trackEvent: { category: "element", action: "downloadOriginalPdf" },
  viewMode: true,
  predicate: (_elements, appState, _appProps, app) => {
    return getSelectedPdfDownloadUrl(app, appState) != null;
  },
  perform: (_elements, appState, _data, app) => {
    const downloadUrl = getSelectedPdfDownloadUrl(app, appState);
    if (!downloadUrl) {
      return false;
    }

    triggerDownload(downloadUrl);

    return {
      captureUpdate: CaptureUpdateAction.EVENTUALLY,
    };
  },
});
