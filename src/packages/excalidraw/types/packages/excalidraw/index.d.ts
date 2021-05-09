import React from "react";
import "./publicPath";
import "../../css/app.scss";
import "../../css/styles.scss";
import { ExcalidrawAPIRefValue, ExcalidrawProps } from "../../types";
declare type PublicExcalidrawProps = Omit<ExcalidrawProps, "forwardedRef">;
declare const _default: React.MemoExoticComponent<React.ForwardRefExoticComponent<PublicExcalidrawProps & React.RefAttributes<ExcalidrawAPIRefValue>>>;
export default _default;
export { getSceneVersion, getElementMap, isInvisiblySmallElement, } from "../../element";
export { defaultLang, languages } from "../../i18n";
export { restore, restoreElements, restoreAppState } from "../../data/restore";
export { exportToBlob, exportToCanvas, exportToSvg, exportToClipboard, } from "../utils";
export { getDefaultAppState } from "../../appState";
export { cleanAppStateForExport, clearAppStateForLocalStorage, } from "../../appState";
export { serializeAsJSON } from "../../data/json";
