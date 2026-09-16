import React from "react";
import { vi } from "vitest";

import { KEYS } from "@excalidraw/common";

import { actionDuplicateSelection } from "../actions";
import { createPasteEvent, serializeAsClipboardJSON } from "../clipboard";
import { Excalidraw } from "../index";

import { API } from "./helpers/api";
import { Keyboard, Pointer } from "./helpers/ui";
import {
  GlobalTestState,
  render,
  unmountComponent,
  waitFor,
} from "./test-utils";

import type { ExcalidrawProps } from "../types";

const { h } = window;

const mouse = new Pointer("mouse");

vi.mock("@excalidraw/common", async (importOriginal) => {
  const module = await importOriginal<typeof import("@excalidraw/common")>();
  const { mockThrottleRAF } = await import("./helpers/mocks");

  return {
    __esmodule: true,
    ...module,
    isDarwin: false,
    KEYS: {
      ...module.KEYS,
      CTRL_OR_CMD: "ctrlKey",
    },
    throttleRAF: mockThrottleRAF,
  };
});

const onDuplicate = vi.fn<NonNullable<ExcalidrawProps["onDuplicate"]>>();

const getLastIdMap = () => {
  expect(onDuplicate).toHaveBeenCalledTimes(1);
  return onDuplicate.mock.calls[0][2];
};

beforeEach(async () => {
  unmountComponent();
  localStorage.clear();
  mouse.reset();
  onDuplicate.mockReset();

  await render(
    <Excalidraw
      autoFocus={true}
      handleKeyboardGlobally={true}
      onDuplicate={onDuplicate}
    />,
  );
  Object.assign(document, {
    elementFromPoint: () => GlobalTestState.canvas,
  });
});

describe("onDuplicate origIdToDuplicateId", () => {
  it("is passed on duplicate action", () => {
    const rectangle = API.createElement({ type: "rectangle" });
    const ellipse = API.createElement({ type: "ellipse" });
    API.setElements([rectangle, ellipse]);
    API.setSelectedElements([rectangle, ellipse]);

    h.app.actionManager.executeAction(actionDuplicateSelection);

    const origIdToDuplicateId = getLastIdMap();
    expect(origIdToDuplicateId.size).toBe(2);
    const duplicates = h.elements.filter(
      (element) => element.id !== rectangle.id && element.id !== ellipse.id,
    );
    expect(duplicates).toHaveLength(2);
    expect(origIdToDuplicateId.get(rectangle.id)).toBe(
      duplicates.find((element) => element.type === "rectangle")!.id,
    );
    expect(origIdToDuplicateId.get(ellipse.id)).toBe(
      duplicates.find((element) => element.type === "ellipse")!.id,
    );
  });

  it("is passed on alt-drag duplicate", () => {
    const rectangle = API.createElement({
      type: "rectangle",
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    });
    API.setElements([rectangle]);
    API.setSelectedElements([rectangle]);

    Keyboard.withModifierKeys({ alt: true }, () => {
      mouse.downAt(50, 50);
      mouse.up(20, 20);
    });

    const origIdToDuplicateId = getLastIdMap();
    expect(h.elements).toHaveLength(2);
    const duplicate = h.elements.find(
      (element) => element.id !== rectangle.id,
    )!;
    expect(origIdToDuplicateId.get(rectangle.id)).toBe(duplicate.id);
  });

  it("is passed on paste", async () => {
    const rectangle = API.createElement({ type: "rectangle" });
    const clipboardJSON = await serializeAsClipboardJSON({
      elements: [rectangle],
      files: null,
    });

    Keyboard.withModifierKeys({ ctrl: true }, () => {
      Keyboard.keyPress(KEYS.V);
      document.dispatchEvent(
        createPasteEvent({ types: { "text/plain": clipboardJSON } }),
      );
    });

    await waitFor(() => {
      expect(h.elements).toHaveLength(1);
    });
    const origIdToDuplicateId = getLastIdMap();
    expect(origIdToDuplicateId.get(rectangle.id)).toBe(h.elements[0].id);
  });
});
