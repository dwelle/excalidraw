import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";

import "../excalidraw-app/sentry";

import ExcalidrawApp from "./App";
import { AnimationPrototype } from "./animations/AnimationPrototype";

window.__EXCALIDRAW_SHA__ = import.meta.env.VITE_APP_GIT_SHA;
const rootElement = document.getElementById("root")!;
const root = createRoot(rootElement);
registerSW();
root.render(
  <StrictMode>
    {rootElement.ownerDocument.defaultView?.location.pathname ===
    "/animation-prototype" ? (
      <AnimationPrototype />
    ) : (
      <ExcalidrawApp />
    )}
  </StrictMode>,
);
