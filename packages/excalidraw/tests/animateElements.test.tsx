import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Excalidraw } from "../index";

import { API } from "./helpers/api";
import { act, render } from "./test-utils";

const { h } = window;

const advanceTimers = async (ms: number) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
};

describe("animateElements()", () => {
  afterEach(() => {
    vi.useRealTimers();
    window.EXCALIDRAW_THROTTLE_RENDER = undefined;
  });

  it("uses the phase preset on first run and current override on interruption", async () => {
    await render(
      <Excalidraw
        initialData={{
          elements: [API.createElement({ type: "rectangle", id: "rect" })],
        }}
      />,
    );

    vi.useFakeTimers();
    window.EXCALIDRAW_THROTTLE_RENDER = false;

    const element = h.elements[0]!;
    let firstHandle!: ReturnType<typeof h.app.api.animateElements>;

    act(() => {
      firstHandle = h.app.api.animateElements({
        elements: [element],
        type: "fade",
        duration: 300,
        phase: "in",
      });
    });

    const firstAnimation = (h.app as any).elementAnimationStates.get(
      element.id,
    );
    expect(firstAnimation.opacityFrom).toBe(0);

    await advanceTimers(150);

    const currentOverride = (h.app as any).elementOpacityOverrides.get(
      element.id,
    );
    expect(currentOverride).toBeGreaterThan(0);
    expect(currentOverride).toBeLessThan(100);
    let secondHandle!: ReturnType<typeof h.app.api.animateElements>;

    act(() => {
      secondHandle = h.app.api.animateElements({
        elements: [element],
        type: "fade",
        duration: 300,
        phase: "out",
      });
    });

    const secondAnimation = (h.app as any).elementAnimationStates.get(
      element.id,
    );
    expect(secondAnimation.opacityFrom).toBeCloseTo(currentOverride, 4);

    await advanceTimers(1000);

    await expect(firstHandle.finished).resolves.toMatchObject({
      status: "interrupted",
    });
    await expect(secondHandle.finished).resolves.toMatchObject({
      status: "finished",
    });
  });

  it("resolves after the last staggered element finishes", async () => {
    await render(
      <Excalidraw
        initialData={{
          elements: [
            API.createElement({ type: "rectangle", id: "a" }),
            API.createElement({ type: "rectangle", id: "b", x: 120 }),
            API.createElement({ type: "rectangle", id: "c", x: 240 }),
          ],
        }}
      />,
    );

    vi.useFakeTimers();
    window.EXCALIDRAW_THROTTLE_RENDER = false;

    let handle!: ReturnType<typeof h.app.api.animateElements>;
    act(() => {
      handle = h.app.api.animateElements({
        elements: h.elements,
        type: "fade",
        duration: 200,
        delay: 50,
        stagger: 40,
      });
    });

    let result: Awaited<typeof handle.finished> | undefined;
    void handle.finished.then((value: Awaited<typeof handle.finished>) => {
      result = value;
    });

    await advanceTimers(250);
    expect(result).toBeUndefined();
    expect(handle.getStatus()).toBe("running");

    await advanceTimers(200);
    expect(result).toMatchObject({ status: "finished" });
    expect(handle.getStatus()).toBe("finished");
  });

  it("settles finish() idempotently through the shared promise", async () => {
    await render(
      <Excalidraw
        initialData={{
          elements: [API.createElement({ type: "rectangle", id: "rect" })],
        }}
      />,
    );

    vi.useFakeTimers();
    window.EXCALIDRAW_THROTTLE_RENDER = false;

    let handle!: ReturnType<typeof h.app.api.animateElements>;
    act(() => {
      handle = h.app.api.animateElements({
        elements: h.elements,
        type: "fade",
        duration: 300,
      });
    });

    let firstResult!: ReturnType<typeof handle.finish>;
    let secondResult!: ReturnType<typeof handle.finish>;
    let cancelResult!: ReturnType<typeof handle.cancel>;
    act(() => {
      firstResult = handle.finish();
      secondResult = handle.finish();
      cancelResult = handle.cancel();
    });

    expect(firstResult.status).toBe("finished");
    expect(secondResult).toEqual(firstResult);
    expect(cancelResult).toEqual(firstResult);
    await expect(handle.finished).resolves.toEqual(firstResult);
  });

  it("settles cancel() idempotently and resolves empty batches immediately", async () => {
    await render(<Excalidraw />);

    vi.useFakeTimers();
    window.EXCALIDRAW_THROTTLE_RENDER = false;

    let emptyHandle!: ReturnType<typeof h.app.api.animateElements>;
    act(() => {
      emptyHandle = h.app.api.animateElements({
        elements: [],
        type: "fade",
      });
    });

    await expect(emptyHandle.finished).resolves.toMatchObject({
      status: "finished",
      elementIds: [],
    });
    expect(emptyHandle.finish().status).toBe("finished");
    expect(emptyHandle.cancel().status).toBe("finished");

    const element = API.createElement({ type: "rectangle", id: "rect" });
    act(() => {
      h.app.updateScene({ elements: [element] });
    });

    let handle!: ReturnType<typeof h.app.api.animateElements>;
    act(() => {
      handle = h.app.api.animateElements({
        elements: [element],
        type: "fade",
        duration: 300,
      });
    });

    let firstResult!: ReturnType<typeof handle.cancel>;
    let secondResult!: ReturnType<typeof handle.cancel>;
    let finishResult!: ReturnType<typeof handle.finish>;
    act(() => {
      firstResult = handle.cancel();
      secondResult = handle.cancel();
      finishResult = handle.finish();
    });

    expect(firstResult.status).toBe("cancelled");
    expect(secondResult).toEqual(firstResult);
    expect(finishResult).toEqual(firstResult);
    await expect(handle.finished).resolves.toEqual(firstResult);
  });
});
