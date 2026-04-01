// -----------------------------------------------------------------------------
// ExcalidrawImageElement & related helpers
// -----------------------------------------------------------------------------

import { MIME_TYPES, SVG_NS } from "@excalidraw/common";

import type {
  AppClassProperties,
  DataURL,
  BinaryFiles,
} from "@excalidraw/excalidraw/types";

import { isInitializedImageElement } from "./typeChecks";

import type {
  ExcalidrawElement,
  FileId,
  InitializedExcalidrawImageElement,
} from "./types";

export const loadHTMLImageElement = (dataURL: DataURL) => {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      resolve(image);
    };
    image.onerror = (error) => {
      reject(error);
    };
    image.src = dataURL;
  });
};

const DARK_MODE_SVG_INVERT_STRENGTH = 93;
const PARTIAL_DARK_INVERT_ROOT_CLASS = "partial-dark-invert-target";
const PARTIAL_DARK_INVERT_FORCE_CLASS = "partial-dark-invert-force";
const PARTIAL_DARK_INVERT_STYLE_ID = "partial-dark-invert-style";
const PARTIAL_DARK_INVERT_NO_CLASS = "partial-dark-invert-no";
const PARTIAL_DARK_INVERT_VECTOR_SELECTOR =
  ":is(text, tspan, use, path, rect, circle, ellipse, line, polyline, polygon)";

const getHrefFragmentId = (element: Element): string | null => {
  const href =
    element.getAttribute("href") ||
    element.getAttribute("xlink:href") ||
    element.getAttributeNS("http://www.w3.org/1999/xlink", "href");

  if (!href?.startsWith("#")) {
    return null;
  }

  return href.slice(1);
};

const dataURLToString = (dataURL: DataURL): string | null => {
  const commaIdx = dataURL.indexOf(",");
  if (commaIdx === -1) {
    return null;
  }

  const meta = dataURL.slice(0, commaIdx);
  const payload = dataURL.slice(commaIdx + 1);

  try {
    return meta.includes(";base64")
      ? atob(payload)
      : decodeURIComponent(payload);
  } catch {
    return null;
  }
};

const svgStringToDataURL = (svg: string): DataURL => {
  const encoded = btoa(unescape(encodeURIComponent(svg)));
  return `data:${MIME_TYPES.svg};base64,${encoded}` as DataURL;
};

const addClass = (element: Element, className: string) => {
  const classes = (element.getAttribute("class") ?? "")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);

  if (!classes.includes(className)) {
    classes.push(className);
    element.setAttribute("class", classes.join(" "));
  }
};

const getPartialDarkInvertCss = () => {
  const root = `.${PARTIAL_DARK_INVERT_ROOT_CLASS}`;
  const forceRoot = `.${PARTIAL_DARK_INVERT_ROOT_CLASS}.${PARTIAL_DARK_INVERT_FORCE_CLASS}`;
  const noInvertSelectors = [
    `${root} image`,
    `${root} use.${PARTIAL_DARK_INVERT_NO_CLASS}`,
  ].join(", ");
  const forceNoInvertSelectors = [
    `${forceRoot} image`,
    `${forceRoot} use.${PARTIAL_DARK_INVERT_NO_CLASS}`,
  ].join(", ");

  return [
    "@media (prefers-color-scheme: dark) {",
    `  ${root} ${PARTIAL_DARK_INVERT_VECTOR_SELECTOR} {`,
    `    filter: invert(${DARK_MODE_SVG_INVERT_STRENGTH}%) hue-rotate(180deg);`,
    "  }",
    `  ${noInvertSelectors} {`,
    "    filter: none !important;",
    "  }",
    "}",
    `${forceRoot} ${PARTIAL_DARK_INVERT_VECTOR_SELECTOR} {`,
    `  filter: invert(${DARK_MODE_SVG_INVERT_STRENGTH}%) hue-rotate(180deg);`,
    "}",
    `${forceNoInvertSelectors} {`,
    "  filter: none !important;",
    "}",
  ].join("\n");
};

const setOrUpdatePartialDarkInvertStyle = (svg: SVGElement) => {
  const css = getPartialDarkInvertCss();
  const styleNode = svg.querySelector(
    `style#${PARTIAL_DARK_INVERT_STYLE_ID}`,
  ) as SVGStyleElement | null;

  if (styleNode) {
    styleNode.textContent = css;
    return;
  }

  const styleEl = svg.ownerDocument.createElementNS(SVG_NS, "style");
  styleEl.setAttribute("id", PARTIAL_DARK_INVERT_STYLE_ID);
  styleEl.textContent = css;
  svg.insertBefore(styleEl, svg.firstChild);
};

const markImageBackedUses = (svg: SVGElement) => {
  const imageIds = new Set<string>();
  svg.querySelectorAll("image[id]").forEach((imageEl) => {
    const id = imageEl.getAttribute("id");
    if (id) {
      imageIds.add(id);
    }
  });

  if (!imageIds.size) {
    return;
  }

  svg.querySelectorAll("use").forEach((useEl) => {
    const refId = getHrefFragmentId(useEl);
    if (refId && imageIds.has(refId)) {
      addClass(useEl, PARTIAL_DARK_INVERT_NO_CLASS);
    }
  });
};

const createDarkModeTextOnlySvgDataURL = (dataURL: DataURL): DataURL | null => {
  if (
    typeof DOMParser === "undefined" ||
    typeof XMLSerializer === "undefined" ||
    typeof btoa === "undefined" ||
    typeof atob === "undefined"
  ) {
    return null;
  }

  const svgString = dataURLToString(dataURL);
  if (!svgString) {
    return null;
  }

  const doc = new DOMParser().parseFromString(svgString, MIME_TYPES.svg);
  const svg = doc.querySelector("svg");
  if (!isHTMLSVGElement(svg) || doc.querySelector("parsererror")) {
    return null;
  }

  addClass(svg, PARTIAL_DARK_INVERT_ROOT_CLASS);
  addClass(svg, PARTIAL_DARK_INVERT_FORCE_CLASS);
  markImageBackedUses(svg);
  setOrUpdatePartialDarkInvertStyle(svg);
  return svgStringToDataURL(new XMLSerializer().serializeToString(svg));
};

/** NOTE: updates cache even if already populated with given image. Thus,
 * you should filter out the images upstream if you want to optimize this. */
export const updateImageCache = async ({
  fileIds,
  files,
  imageCache,
}: {
  fileIds: FileId[];
  files: BinaryFiles;
  imageCache: AppClassProperties["imageCache"];
}) => {
  const updatedFiles = new Map<FileId, true>();
  const erroredFiles = new Map<FileId, true>();

  await Promise.all(
    fileIds.reduce((promises, fileId) => {
      const fileData = files[fileId as string];
      if (fileData && !updatedFiles.has(fileId)) {
        updatedFiles.set(fileId, true);
        return promises.concat(
          (async () => {
            try {
              if (fileData.mimeType === MIME_TYPES.binary) {
                throw new Error("Only images can be added to ImageCache");
              }

              const imagePromise = loadHTMLImageElement(fileData.dataURL);

              const darkModeTextSvgDataURL =
                fileData.mimeType === MIME_TYPES.svg
                  ? createDarkModeTextOnlySvgDataURL(fileData.dataURL)
                  : null;

              const darkModeTextSvgImagePromise =
                darkModeTextSvgDataURL != null
                  ? loadHTMLImageElement(darkModeTextSvgDataURL)
                  : null;

              const data = {
                image: imagePromise,
                mimeType: fileData.mimeType,
                dataURL: fileData.dataURL,
                ...(darkModeTextSvgImagePromise
                  ? { darkModeTextSvgImage: darkModeTextSvgImagePromise }
                  : {}),
              } as const;

              // store the promise immediately to indicate there's an in-progress
              // initialization
              imageCache.set(fileId, data);

              const image = await imagePromise;

              const darkModeTextSvgImage = darkModeTextSvgImagePromise
                ? await darkModeTextSvgImagePromise.catch(() => null)
                : null;

              imageCache.set(fileId, {
                image,
                mimeType: fileData.mimeType,
                dataURL: fileData.dataURL,
                ...(darkModeTextSvgImage ? { darkModeTextSvgImage } : {}),
              });
            } catch (error: any) {
              erroredFiles.set(fileId, true);
            }
          })(),
        );
      }
      return promises;
    }, [] as Promise<any>[]),
  );

  return {
    imageCache,
    /** includes errored files because they cache was updated nonetheless */
    updatedFiles,
    /** files that failed when creating HTMLImageElement */
    erroredFiles,
  };
};

export const getInitializedImageElements = (
  elements: readonly ExcalidrawElement[],
) =>
  elements.filter((element) =>
    isInitializedImageElement(element),
  ) as InitializedExcalidrawImageElement[];

export const isHTMLSVGElement = (node: Node | null): node is SVGElement => {
  // lower-casing due to XML/HTML convention differences
  // https://johnresig.com/blog/nodename-case-sensitivity
  return node?.nodeName.toLowerCase() === "svg";
};

export const normalizeSVG = (SVGString: string) => {
  const doc = new DOMParser().parseFromString(SVGString, MIME_TYPES.svg);
  const svg = doc.querySelector("svg");
  const errorNode = doc.querySelector("parsererror");
  if (errorNode || !isHTMLSVGElement(svg)) {
    throw new Error("Invalid SVG");
  } else {
    if (!svg.hasAttribute("xmlns")) {
      svg.setAttribute("xmlns", SVG_NS);
    }

    let width = svg.getAttribute("width");
    let height = svg.getAttribute("height");

    // Do not use % or auto values for width/height
    // to avoid scaling issues when rendering at different sizes/zoom levels
    if (width?.includes("%") || width === "auto") {
      width = null;
    }
    if (height?.includes("%") || height === "auto") {
      height = null;
    }

    const viewBox = svg.getAttribute("viewBox");

    if (!width || !height) {
      width = width || "50";
      height = height || "50";

      if (viewBox) {
        const match = viewBox.match(
          /\d+ +\d+ +(\d+(?:\.\d+)?) +(\d+(?:\.\d+)?)/,
        );
        if (match) {
          [, width, height] = match;
        }
      }

      svg.setAttribute("width", width);
      svg.setAttribute("height", height);
    }

    // Make sure viewBox is set
    if (!viewBox) {
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    }

    return svg.outerHTML;
  }
};
