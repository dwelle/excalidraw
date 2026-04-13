import { Dialog } from "./Dialog";
import { FilledButton } from "./FilledButton";

import premiumPdfIcon from "./assets/premium-pdf.svg";

import "./PdfPremiumDialog.scss";

export const PdfPremiumDialog = ({ onClose }: { onClose: () => void }) => {
  const plusLpUrl = import.meta.env.VITE_APP_PLUS_LP;
  const plusAppUrl = import.meta.env.VITE_APP_PLUS_APP;

  return (
    <Dialog
      onCloseRequest={onClose}
      title={false}
      size="small"
      className="PdfPremiumDialog"
    >
      <div className="PdfPremiumDialog__body">
        <div className="PdfPremiumDialog__icon">
          <img
            src={premiumPdfIcon}
            alt=""
            aria-hidden="true"
            className="PdfPremiumDialog__iconImage"
          />
        </div>
        <h2 className="PdfPremiumDialog__title">
          PDF import is an Excalidraw+ feature
        </h2>
        <p className="PdfPremiumDialog__description">
          Drop PDFs directly onto the canvas with Excalidraw+. Upgrade now and
          unlock other cool features!
        </p>
        <div className="PdfPremiumDialog__buttons">
          <a
            href={`${plusLpUrl}/plus?utm_source=excalidraw&utm_medium=app&utm_content=pdf_drop`}
            target="_blank"
            rel="noopener noreferrer"
            className="PdfPremiumDialog__cta"
          >
            <FilledButton size="large" variant="outlined" fullWidth>
              Explore Excalidraw+
            </FilledButton>
          </a>
          <a
            href={`${plusAppUrl}/signup`}
            target="_blank"
            rel="noopener noreferrer"
            className="PdfPremiumDialog__cta"
          >
            <FilledButton size="large" fullWidth>
              Sign up
            </FilledButton>
          </a>
        </div>
      </div>
    </Dialog>
  );
};
