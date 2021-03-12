import "./Tooltip.scss";

import React, { useEffect } from "react";

type TooltipProps = {
  children: React.ReactNode;
  label: string;
  long?: boolean;
};

const getTooltipDiv = () => {
  const existingDiv = document.querySelector<HTMLDivElement>(
    ".ExcalidrawTooltip",
  );
  if (existingDiv) {
    return existingDiv;
  }
  const div = document.createElement("div");
  document.body.appendChild(div);
  div.classList.add("ExcalidrawTooltip");
  return div;
};

const updateTooltip = (
  item: HTMLDivElement,
  tooltip: HTMLDivElement,
  label: string,
  long: boolean,
) => {
  tooltip.classList.add("is-shown");
  tooltip.style.width = long ? "50ch" : "10ch";

  tooltip.textContent = label;

  const {
    x: itemX,
    bottom: itemBottom,
    width: itemWidth,
  } = item.getBoundingClientRect();

  const {
    width: labelWidth,
    height: labelHeight,
  } = tooltip.getBoundingClientRect();

  const viewportWidth = window.innerWidth;
  const left = itemX + itemWidth / 2 - labelWidth / 2;
  const offsetLeft =
    left + labelWidth >= viewportWidth ? left + labelWidth - viewportWidth : 0;

  const viewportHeight = window.innerHeight;
  const paddingTop = 3;
  const top = itemBottom + paddingTop;
  const offsetTop =
    top + labelHeight >= viewportHeight
      ? top + labelHeight - viewportHeight
      : 0;

  Object.assign(tooltip.style, {
    top: `${top - offsetTop}px`,
    left: `${left - offsetLeft}px`,
  });
};

export const Tooltip = ({ children, label, long = false }: TooltipProps) => {
  useEffect(() => {
    return () => getTooltipDiv().classList.remove("is-shown");
  }, []);

  return (
    <div
      onPointerEnter={(event) =>
        updateTooltip(
          event.currentTarget as HTMLDivElement,
          getTooltipDiv(),
          label,
          long,
        )
      }
      onPointerLeave={() => getTooltipDiv().classList.remove("is-shown")}
    >
      {children}
    </div>
  );
};
