import { Dialog } from "./Dialog";
import { FilledButton } from "./FilledButton";
import { ExcalidrawLogo } from "./ExcalidrawLogo";

import "./PdfPremiumDialog.scss";

export const PdfPremiumDialog = ({ onClose }: { onClose: () => void }) => {
  const plusLpUrl = import.meta.env.VITE_APP_PLUS_LP;

  return (
    <Dialog
      onCloseRequest={onClose}
      title={false}
      size="small"
      className="PdfPremiumDialog"
    >
      <div className="PdfPremiumDialog__body">
        <div className="PdfPremiumDialog__icon">
          <ExcalidrawLogo
            style={{
              ["--color-logo-icon" as any]: "#fff",
              width: "2.2rem",
              height: "2.2rem",
            }}
          />
        </div>
        <h2 className="PdfPremiumDialog__title">
          PDF import is an Excalidraw+ feature
        </h2>
        <p className="PdfPremiumDialog__description">
          Drop PDFs directly onto the canvas with Excalidraw+. Upgrade to unlock
          this and many more features
        </p>
        <a
          href={`${plusLpUrl}/plus?utm_source=excalidraw&utm_medium=app&utm_content=pdf_drop`}
          target="_blank"
          rel="noopener noreferrer"
          className="PdfPremiumDialog__cta"
        >
          <FilledButton size="large">Learn more about Excalidraw+</FilledButton>
        </a>
      </div>
    </Dialog>
  );
};
