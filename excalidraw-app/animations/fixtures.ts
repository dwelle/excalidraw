import { convertToExcalidrawElements } from "@excalidraw/excalidraw";
import { newEmbeddableElement } from "@excalidraw/element";

import type { ExcalidrawElementSkeleton } from "@excalidraw/element";
import type { ExcalidrawElement, FileId } from "@excalidraw/element/types";
import type { Radians } from "@excalidraw/math";
import type {
  BinaryFileData,
  DataURL,
  ElementRenderOverrides,
} from "@excalidraw/excalidraw/types";

import type { ElementAnimationRequest } from "./ElementAnimator";

export const slides = [
  {
    name: "Opening",
    description:
      "Bound labels, link badges, simultaneous effects and staggered reveals.",
  },
  {
    name: "Connected & grouped",
    description:
      "Move a shape while its arrow stays in place. Both group members are explicit targets; rotation and image content stay unchanged.",
  },
  {
    name: "Frames & boundaries",
    description:
      "Compare a clipped frame child with an unframed shape. In edit mode, preview the frame fade to check child and title opacity.",
  },
];

const imageId = "animation-prototype-image" as FileId;

export const beats = (
  slide: number,
  duration: number,
): ElementAnimationRequest[][] => {
  const title: ElementAnimationRequest[] = [
    { elements: [`${slide}-title`], type: "fade", duration },
  ];
  if (slide === 1) {
    return [
      title,
      [{ elements: ["1-source"], type: "fly", from: "left", duration }],
      [
        {
          elements: ["1-group-a", "1-group-b"],
          type: "fly",
          from: "right",
          duration,
        },
      ],
      [
        {
          elements: ["1-image", "1-rotated"],
          type: "fly",
          from: "bottom",
          duration,
          stagger: 160,
        },
      ],
    ];
  }
  if (slide === 2) {
    return [
      title,
      [{ elements: ["2-clipped"], type: "fly", from: "right", duration }],
      [{ elements: ["2-outside"], type: "fly", from: "left", duration }],
    ];
  }
  return [
    title,
    [
      { elements: ["0-left"], type: "fly", from: "left", duration },
      { elements: ["0-right"], type: "fade", duration },
    ],
    [
      {
        elements: ["0-last", "0-embed"],
        type: "fly",
        from: "bottom",
        duration,
        stagger: 160,
      },
    ],
  ];
};

export const visibilityFor = (
  counts: readonly number[],
  elements: readonly ExcalidrawElement[],
): ElementRenderOverrides => {
  const hidden = new Map<string, { opacity: number }>();
  slides.forEach((_, slide) => {
    beats(slide, 0)
      .slice(counts[slide])
      .flat()
      .forEach((request) => {
        for (const target of request.elements) {
          hidden.set(typeof target === "string" ? target : target.id, {
            opacity: 0,
          });
        }
      });
  });
  // Visibility needs bound-text expansion even when the motion helper also
  // expands targets. Without it, unrevealed labels would remain visible.
  for (const element of elements) {
    if (
      element.type === "text" &&
      element.containerId &&
      hidden.has(element.containerId)
    ) {
      hidden.set(element.id, { opacity: 0 });
    }
  }
  return hidden;
};

export const createDemoElements = () => {
  const skeleton = slides.flatMap<ExcalidrawElementSkeleton>(
    ({ name }, slide) => {
      const x = slide * 1100;
      const elements: ExcalidrawElementSkeleton[] = [
        {
          type: "rectangle",
          id: `${slide}-title`,
          x: x + 70,
          y: 55,
          width: 620,
          height: 75,
          backgroundColor: "#e5dbff",
          label: { text: name, fontSize: 30 },
        },
      ];
      if (slide === 0) {
        elements.push(
          {
            type: "rectangle",
            id: "0-left",
            x: x + 70,
            y: 200,
            width: 270,
            height: 100,
            backgroundColor: "#a5d8ff",
            link: "https://excalidraw.com",
            label: { text: "Fly + bound label" },
          },
          {
            type: "rectangle",
            id: "0-right",
            x: x + 420,
            y: 200,
            width: 270,
            height: 100,
            backgroundColor: "#d0bfff",
            label: { text: "Fade with previous" },
          },
          {
            type: "rectangle",
            id: "0-last",
            x: x + 70,
            y: 360,
            width: 270,
            height: 100,
            backgroundColor: "#ffec99",
            label: { text: "Staggered reveal" },
          },
          {
            ...newEmbeddableElement({
              type: "embeddable",
              x: x + 420,
              y: 360,
              width: 270,
              height: 100,
            }),
            id: "0-embed",
          },
        );
      } else if (slide === 1) {
        elements.push(
          {
            type: "rectangle",
            id: "1-source",
            x: x + 70,
            y: 190,
            width: 180,
            height: 80,
            backgroundColor: "#a5d8ff",
            label: { text: "Moving shape" },
          },
          {
            type: "rectangle",
            id: "1-target",
            x: x + 510,
            y: 190,
            width: 180,
            height: 80,
            backgroundColor: "#d0bfff",
            label: { text: "Fixed shape" },
          },
          {
            type: "arrow",
            id: "1-arrow",
            x: x + 260,
            y: 230,
            width: 240,
            height: 0,
            start: { id: "1-source" },
            end: { id: "1-target" },
            label: { text: "Fixed binding", fontSize: 16 },
          },
          {
            type: "rectangle",
            id: "1-group-a",
            x: x + 70,
            y: 330,
            width: 130,
            height: 110,
            backgroundColor: "#b2f2bb",
            groupIds: ["demo-group"],
            label: { text: "Group A" },
          },
          {
            type: "ellipse",
            id: "1-group-b",
            x: x + 220,
            y: 330,
            width: 130,
            height: 110,
            backgroundColor: "#b2f2bb",
            groupIds: ["demo-group"],
            label: { text: "Group B" },
          },
          {
            type: "image",
            id: "1-image",
            fileId: imageId,
            status: "saved",
            x: x + 385,
            y: 330,
            width: 140,
            height: 105,
            angle: (-Math.PI / 14) as Radians,
          },
          {
            type: "rectangle",
            id: "1-rotated",
            x: x + 565,
            y: 330,
            width: 120,
            height: 110,
            angle: (Math.PI / 10) as Radians,
            backgroundColor: "#ffec99",
            label: { text: "Rotated" },
          },
        );
      } else {
        elements.push(
          {
            type: "rectangle",
            id: "2-clipped",
            x: x + 620,
            y: 210,
            width: 240,
            height: 110,
            backgroundColor: "#ffc9c9",
            label: { text: "Clipped child" },
          },
          {
            type: "image",
            id: "2-image",
            fileId: imageId,
            status: "saved",
            x: x + 260,
            y: 220,
            width: 230,
            height: 172,
          },
          {
            type: "rectangle",
            id: "2-outside",
            x: x - 70,
            y: 375,
            width: 250,
            height: 90,
            backgroundColor: "#b2f2bb",
            label: { text: "Outside the frame" },
          },
        );
      }
      elements.push({
        type: "frame",
        id: `slide-${slide}`,
        name,
        // Non-zero coordinates also avoid the skeleton converter's auto-fit fallback.
        x: x + 1,
        y: 1,
        width: 760,
        height: 520,
        children: elements.flatMap((element) =>
          element.id && element.id !== "2-outside" ? [element.id] : [],
        ),
      });
      return elements;
    },
  );
  return convertToExcalidrawElements(skeleton, { regenerateIds: false });
};

/** Reuse a local app asset; image decoding uses the editor's mounted window. */
export const loadDemoImage = async (
  ownerDocument: Document,
): Promise<BinaryFileData> => {
  const ownerWindow = ownerDocument.defaultView!;
  const response = await ownerWindow.fetch("/screenshots/illustration.png");
  if (!response.ok) {
    throw new Error("Could not load the demo image");
  }
  const blob = await response.blob();
  const dataURL = await new Promise<DataURL>((resolve, reject) => {
    const reader = new ownerWindow.FileReader();
    reader.onload = () => resolve(reader.result as DataURL);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
  return { id: imageId, mimeType: "image/png", dataURL, created: 0 };
};
