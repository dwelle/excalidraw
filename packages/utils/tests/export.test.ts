import * as clipboardModule from "@excalidraw/excalidraw/clipboard";
import * as imageModule from "@excalidraw/excalidraw/data/image";
import * as jsonModule from "@excalidraw/excalidraw/data/json";
import * as mockedSceneExportUtils from "@excalidraw/excalidraw/scene/export";
import { diagramFactory } from "@excalidraw/excalidraw/tests/fixtures/diagramFixture";
import { vi } from "vitest";

import * as utils from "../src";
import { MIME_TYPES } from "../src";

const exportToCanvasSpy = vi.spyOn(mockedSceneExportUtils, "exportToCanvas");
const exportToSvgSpy = vi.spyOn(mockedSceneExportUtils, "exportToSvg");

describe("exportToCanvas", async () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("with default arguments", async () => {
    const canvas = await utils.exportToCanvas({
      data: diagramFactory({ elementOverrides: { width: 100, height: 100 } }),
    });

    expect(canvas.width).toBe(100);
    expect(canvas.height).toBe(100);
  });

  it("when custom width and height", async () => {
    const canvas = await utils.exportToCanvas({
      data: {
        ...diagramFactory({ elementOverrides: { width: 100, height: 100 } }),
      },
      config: {
        getDimensions: () => ({ width: 200, height: 200, scale: 1 }),
      },
    });

    expect(canvas.width).toBe(200);
    expect(canvas.height).toBe(200);
  });

  it("restores elements before passing them to the scene exporter", async () => {
    const data = diagramFactory();
    const legacyElement = { ...data.elements[0], version: 0 };
    exportToCanvasSpy.mockResolvedValueOnce({} as HTMLCanvasElement);

    await utils.exportToCanvas({
      data: {
        ...data,
        elements: [legacyElement],
      },
    });

    const restoredElement = exportToCanvasSpy.mock.calls[0][0].data.elements[0];
    expect(restoredElement.version).toBeGreaterThan(0);
    expect(restoredElement.index).not.toBeNull();
    expect(legacyElement.version).toBe(0);
    expect(legacyElement.index).toBeNull();
  });
});

describe("exportToBlob", async () => {
  describe("mime type", () => {
    it("should change image/jpg to image/jpeg", async () => {
      const blob = await utils.exportToBlob({
        data: {
          ...diagramFactory(),

          appState: {
            exportBackground: true,
          },
        },
        config: {
          getDimensions: (width, height) => ({ width, height, scale: 1 }),
          // testing typo in MIME type (jpg → jpeg)
          mimeType: "image/jpg",
        },
      });
      expect(blob?.type).toBe(MIME_TYPES.jpg);
    });
    it("should default to image/png", async () => {
      const blob = await utils.exportToBlob({
        data: diagramFactory(),
      });
      expect(blob?.type).toBe(MIME_TYPES.png);
    });

    it("should warn when using quality with image/png", async () => {
      const consoleSpy = vi
        .spyOn(console, "warn")
        .mockImplementationOnce(() => void 0);
      await utils.exportToBlob({
        data: diagramFactory(),
        config: {
          mimeType: MIME_TYPES.png,
          quality: 1,
        },
      });
      expect(consoleSpy).toHaveBeenCalledWith(
        `"quality" will be ignored for "${MIME_TYPES.png}" mimeType`,
      );
    });
  });
});

describe("exportToSvg", () => {
  const passedElements = () => exportToSvgSpy.mock.calls[0][0].data.elements;
  const passedOptions = () => exportToSvgSpy.mock.calls[0][0].data.appState;

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("with default arguments", async () => {
    await utils.exportToSvg({
      data: diagramFactory({
        overrides: { appState: void 0 },
      }),
    });

    const passedOptionsWhenDefault = {
      ...passedOptions(),
      // To avoid varying snapshots
      name: "name",
    };
    expect(passedElements().length).toBe(3);
    expect(passedOptionsWhenDefault).toMatchSnapshot();
  });

  // Regression test: when all elements are deleted, exportToSvg should pass
  // zero elements to the lower-level export (line 184-188 of export.ts calls
  // getNonDeletedElements which filters them out).
  it("with deleted elements", async () => {
    await utils.exportToSvg({
      data: diagramFactory({
        overrides: { appState: void 0 },
        elementOverrides: { isDeleted: true },
      }),
    });

    expect(passedElements().length).toBe(0);
  });

  it("with exportPadding", async () => {
    await utils.exportToSvg({
      data: diagramFactory({
        overrides: { appState: { name: "diagram name" } },
      }),
      config: { padding: 0 },
    });

    expect(passedElements().length).toBe(3);
    expect(passedOptions()).toEqual(
      expect.objectContaining({ exportPadding: 0 }),
    );
  });

  it("with exportEmbedScene", async () => {
    await utils.exportToSvg({
      data: diagramFactory({
        overrides: {
          appState: { name: "diagram name", exportEmbedScene: true },
        },
      }),
    });

    expect(passedElements().length).toBe(3);
    expect(passedOptions().exportEmbedScene).toBe(true);
  });
});

// Elements persisted before `created` existed omit it (modeled with the cast
// below, as the declared input type is a complete element). Every public
// export entry point restores its input, so such elements must reach the
// lower-level code restored, with `created: null`.
describe("elements lacking creation metadata", () => {
  const legacyDiagram = () => {
    const { elements, ...rest } = diagramFactory({
      overrides: { appState: void 0 },
    });
    return {
      ...rest,
      elements: elements.map(
        ({ created, ...element }) => element,
      ) as unknown as typeof elements,
    };
  };
  const createdOf = (elements: readonly { created: number | null }[]) =>
    elements.map((element) => element.created);

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("exportToSvg and exportToCanvas restore the elements", async () => {
    const exportToSvgSpy = vi.spyOn(mockedSceneExportUtils, "exportToSvg");
    const diagram = legacyDiagram();

    await utils.exportToSvg({ data: diagram });

    expect(createdOf(exportToSvgSpy.mock.calls[0][0].data.elements)).toEqual([
      null,
      null,
      null,
    ]);
    expect(diagram.elements[0]).not.toHaveProperty("created");

    const exportToCanvasSpy = vi.spyOn(
      mockedSceneExportUtils,
      "exportToCanvas",
    );
    const canvas = await utils.exportToCanvas({ data: diagram });

    expect(createdOf(exportToCanvasSpy.mock.calls[0][0].data.elements)).toEqual(
      [null, null, null],
    );
    expect(canvas.width).toBeGreaterThan(0);
  });

  it("exportToBlob embeds the restored scene into png metadata", async () => {
    const serializeSpy = vi.spyOn(jsonModule, "serializeAsJSON");
    vi.spyOn(imageModule, "encodePngMetadata").mockImplementation(
      async ({ blob }) => blob,
    );

    await utils.exportToBlob({
      data: {
        ...legacyDiagram(),
        appState: { exportEmbedScene: true },
      },
      config: { mimeType: MIME_TYPES.png },
    });

    expect(serializeSpy).toHaveBeenCalledTimes(1);
    expect(createdOf(serializeSpy.mock.calls[0][0])).toEqual([
      null,
      null,
      null,
    ]);
  });

  it("exportToClipboard copies the restored elements as json", async () => {
    const copySpy = vi
      .spyOn(clipboardModule, "copyToClipboard")
      .mockResolvedValue(undefined);

    await utils.exportToClipboard({ data: legacyDiagram(), type: "json" });

    expect(copySpy).toHaveBeenCalledTimes(1);
    expect(createdOf(copySpy.mock.calls[0][0])).toEqual([null, null, null]);
  });
});
