import React, { useLayoutEffect, useRef, useState } from "react";

import type { ChartType } from "@excalidraw/element/types";

import { trackEvent } from "../analytics";
import { renderSpreadsheet } from "../charts";

import { t } from "../i18n";
import { exportToSvg } from "../scene/export";

import { COLOR_WHITE } from "../../common/src";

import { useApp } from "./App";
import { Dialog } from "./Dialog";

import "./PasteChartDialog.scss";

import type { ChartElements, Spreadsheet } from "../charts";
import type { UIAppState } from "../types";

type OnInsertChart = (chartType: ChartType, elements: ChartElements) => void;

const ChartPreviewBtn = (props: {
  spreadsheet: Spreadsheet | null;
  chartType: ChartType;
  selected: boolean;
  onClick: OnInsertChart;
}) => {
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [chartElements, setChartElements] = useState<ChartElements | null>(
    null,
  );

  useLayoutEffect(() => {
    if (!props.spreadsheet) {
      return;
    }

    const elements = renderSpreadsheet(
      props.chartType,
      props.spreadsheet,
      0,
      0,
    );
    setChartElements(elements);
    let svg: SVGSVGElement;
    const previewNode = previewRef.current!;

    (async () => {
      svg = await exportToSvg({
        data: {
          elements,
          appState: {
            exportBackground: false,
            viewBackgroundColor: COLOR_WHITE,
          },
          files: null,
        },
        config: {
          skipInliningFonts: true,
        },
      });
      svg.querySelector(".style-fonts")?.remove();
      previewNode.replaceChildren();
      previewNode.appendChild(svg);

      if (props.selected) {
        (previewNode.parentNode as HTMLDivElement).focus();
      }
    })();

    return () => {
      previewNode.replaceChildren();
    };
  }, [props.spreadsheet, props.chartType, props.selected]);

  return (
    <button
      type="button"
      className="ChartPreview"
      onClick={() => {
        if (chartElements) {
          props.onClick(props.chartType, chartElements);
        }
      }}
    >
      <div ref={previewRef} />
    </button>
  );
};

export const PasteChartDialog = ({
  setAppState,
  appState,
  onClose,
}: {
  appState: UIAppState;
  onClose: () => void;
  setAppState: React.Component<any, UIAppState>["setState"];
}) => {
  const { onInsertElements } = useApp();
  const handleClose = React.useCallback(() => {
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  const handleChartClick = (chartType: ChartType, elements: ChartElements) => {
    onInsertElements(elements);
    trackEvent("paste", "chart", chartType);
    setAppState({
      currentChartType: chartType,
      pasteDialog: {
        shown: false,
        data: null,
      },
    });
  };

  return (
    <Dialog
      size="small"
      onCloseRequest={handleClose}
      title={t("labels.pasteCharts")}
      className={"PasteChartDialog"}
      autofocus={false}
    >
      <div className={"container"}>
        <ChartPreviewBtn
          chartType="bar"
          spreadsheet={appState.pasteDialog.data}
          selected={appState.currentChartType === "bar"}
          onClick={handleChartClick}
        />
        <ChartPreviewBtn
          chartType="line"
          spreadsheet={appState.pasteDialog.data}
          selected={appState.currentChartType === "line"}
          onClick={handleChartClick}
        />
      </div>
    </Dialog>
  );
};
