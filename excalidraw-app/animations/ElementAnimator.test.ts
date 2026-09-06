import { Scene, newElement, newTextElement } from "@excalidraw/element";
import { getDefaultAppState } from "@excalidraw/excalidraw/appState";

import type {
  ExcalidrawElement,
  NonDeletedExcalidrawElement,
} from "@excalidraw/element/types";
import type { ElementRenderOverrides } from "@excalidraw/excalidraw/types";

import { ElementAnimator } from "./ElementAnimator";

afterEach(() => vi.restoreAllMocks());

const setup = (initialElements: NonDeletedExcalidrawElement[]) => {
  const mount = document.createElement("div");
  const ownerWindow = mount.ownerDocument.defaultView!;
  let now = 0;
  let nextId = 0;
  const callbacks = new Map<number, FrameRequestCallback>();
  vi.spyOn(ownerWindow.performance, "now").mockImplementation(() => now);
  vi.spyOn(ownerWindow, "requestAnimationFrame").mockImplementation(
    (callback) => {
      callbacks.set(++nextId, callback);
      return nextId;
    },
  );
  vi.spyOn(ownerWindow, "cancelAnimationFrame").mockImplementation((id) => {
    callbacks.delete(id);
  });
  const scene = new Scene(initialElements, { skipValidation: true });
  let snapshot: ElementRenderOverrides = new Map();
  const submit = vi.fn((next: ElementRenderOverrides | null) => {
    snapshot = next ?? new Map();
  });
  const editor = {
    isDestroyed: false,
    getSceneElementsMapIncludingDeleted: () =>
      scene.getElementsMapIncludingDeleted(),
    getAppState: () => ({
      ...getDefaultAppState(),
      width: 500,
      height: 500,
      offsetLeft: 0,
      offsetTop: 0,
    }),
    setElementRenderOverrides: submit,
  };
  const animator = new ElementAnimator(editor, ownerWindow);
  const tick = (time: number) => {
    now = time;
    const pending = [...callbacks.values()];
    callbacks.clear();
    pending.forEach((callback) => callback(time));
  };
  return {
    animator,
    editor,
    submit,
    tick,
    callbacks,
    get snapshot() {
      return snapshot;
    },
    setElements: (next: ExcalidrawElement[]) => {
      scene.replaceAllElements(next, { skipValidation: true });
    },
  };
};

const rect = (id: string) => ({
  ...newElement({ type: "rectangle", x: 0, y: 0, width: 100, height: 100 }),
  id,
});

it("commits reveal state with the first animation frame and releases to base at completion", async () => {
  const a = rect("a");
  const b = rect("b");
  const run = setup([a, b]);
  run.animator.setBaseOverrides(
    new Map([
      [a.id, { opacity: 0 }],
      [b.id, { opacity: 0 }],
    ]),
  );
  run.submit.mockClear();
  const handle = run.animator.animateElements(
    { elements: [a], type: "fade", duration: 100, easing: "linear" },
    { baseOverrides: new Map([[b.id, { opacity: 0 }]]) },
  );
  expect(run.submit).toHaveBeenCalledTimes(1);
  expect(run.snapshot.get(a.id)?.opacity).toBe(0);
  run.tick(50);
  expect(run.snapshot.get(a.id)?.opacity).toBe(50);
  run.tick(100);
  expect(await handle.finished).toEqual({ status: "finished" });
  expect([...run.snapshot]).toEqual([[b.id, { opacity: 0 }]]);
  expect(run.callbacks.size).toBe(0);
});

it("reverses from the last visual value and retains partial batch interruption", async () => {
  const a = rect("a");
  const b = rect("b");
  const run = setup([a, b]);
  const first = run.animator.animateElements({
    elements: [a, b],
    type: "fade",
    duration: 100,
    easing: "linear",
  });
  run.tick(40);
  const reverse = run.animator.animateElements(
    {
      elements: [a],
      type: "fade",
      phase: "out",
      duration: 100,
      easing: "linear",
    },
    { baseOverrides: new Map([[a.id, { opacity: 0 }]]) },
  );
  expect(run.snapshot.get(a.id)?.opacity).toBe(40);
  run.tick(100);
  expect(await first.finished).toEqual({ status: "interrupted" });
  expect(run.snapshot.get(a.id)?.opacity).toBe(16);
  run.tick(140);
  expect(await reverse.finished).toEqual({ status: "finished" });
  expect(run.snapshot.get(a.id)).toEqual({ opacity: 0 });
});

it("keeps a wide container and bound label on the same trajectory and stagger slot", () => {
  const a = {
    ...rect("a"),
    width: 1000,
    boundElements: [{ type: "text" as const, id: "label" }],
  };
  const label = {
    ...newTextElement({
      x: 10,
      y: 10,
      text: "Hi",
      containerId: a.id,
    }),
    id: "label",
  };
  const b = rect("b");
  const run = setup([a, label, b]);
  run.animator.animateElements({
    elements: [a, label, b],
    type: "fly",
    from: "left",
    duration: 100,
    stagger: 50,
    easing: "linear",
  });
  expect(run.snapshot.get(a.id)?.offset).toEqual({ x: -1064, y: 0 });
  expect(run.snapshot.get(label.id)?.offset).toEqual(
    run.snapshot.get(a.id)?.offset,
  );
  run.tick(100);
  expect(run.snapshot.has(a.id)).toBe(false);
  expect(run.snapshot.has(label.id)).toBe(false);
  expect(run.snapshot.get(b.id)?.opacity).toBe(50);
});

it("settles zero duration at its exact delay boundary", async () => {
  const a = rect("a");
  const run = setup([a]);
  const handle = run.animator.animateElements({
    elements: [a],
    type: "fade",
    delay: 50,
    duration: 0,
  });
  run.tick(49);
  expect(run.snapshot.get(a.id)?.opacity).toBe(0);
  run.tick(50);
  expect(run.snapshot.has(a.id)).toBe(false);
  expect(await handle.finished).toEqual({ status: "finished" });
  expect(run.callbacks.size).toBe(0);
});

it("cancels scheduled previews without disturbing other effects or baseline visibility", async () => {
  const a = rect("a");
  const b = rect("b");
  const run = setup([a, b]);
  run.animator.setBaseOverrides(new Map([["outgoing-slide", { opacity: 0 }]]));
  const first = run.animator.animateElements({
    elements: [a],
    type: "fade",
    delay: 300,
    duration: 100,
  });
  const second = run.animator.animateElements({
    elements: [b],
    type: "fade",
    duration: 100,
  });
  first.cancel();
  run.submit.mockClear();
  first.cancel();
  expect(run.submit).not.toHaveBeenCalled();
  expect(await first.finished).toEqual({ status: "cancelled" });
  expect(run.snapshot.has(a.id)).toBe(false);
  expect(run.snapshot.has(b.id)).toBe(true);
  run.tick(100);
  expect(await second.finished).toEqual({ status: "finished" });
  expect([...run.snapshot]).toEqual([["outgoing-slide", { opacity: 0 }]]);
  run.submit.mockClear();
  second.cancel();
  run.animator.clearAnimations();
  expect(run.submit).not.toHaveBeenCalled();
});

it.each(["setter", "request option"])(
  "owns base map entries and nested offsets supplied through the %s",
  (source) => {
    const run = setup([rect("a")]);
    const value = { opacity: 0, offset: { x: 0, y: 0 } };
    const base = new Map([["hidden", value]]);
    if (source === "setter") {
      run.animator.setBaseOverrides(base);
    }
    run.animator.animateElements(
      { elements: ["a"], type: "fade", duration: 100 },
      source === "request option" ? { baseOverrides: base } : {},
    );
    value.opacity = 75;
    value.offset.x = 90;
    base.set("extra", { opacity: 10, offset: { x: 0, y: 0 } });
    run.tick(50);
    expect(run.snapshot.get("hidden")).toEqual({
      opacity: 0,
      offset: { x: 0, y: 0 },
    });
    expect(run.snapshot.has("extra")).toBe(false);
    run.animator.dispose();
  },
);

it("switches slides with one base replacement that cancels active effects", async () => {
  const a = rect("a");
  const run = setup([a]);
  const handle = run.animator.animateElements({
    elements: [a],
    type: "fade",
    duration: 500,
  });
  run.submit.mockClear();
  run.animator.setBaseOverrides(new Map([["next-slide", { opacity: 0 }]]), {
    cancelAnimations: true,
  });
  expect(run.submit).toHaveBeenCalledTimes(1);
  expect([...run.snapshot]).toEqual([["next-slide", { opacity: 0 }]]);
  expect(await handle.finished).toEqual({ status: "cancelled" });
  expect(run.callbacks.size).toBe(0);
});

it.each(["removed", "deleted"])(
  "settles %s targets and stops requesting frames",
  async (mode) => {
    const a = rect("a");
    const run = setup([a]);
    const handle = run.animator.animateElements({
      elements: [a],
      type: "fade",
    });
    run.setElements(mode === "removed" ? [] : [{ ...a, isDeleted: true }]);
    run.tick(10);
    expect(await handle.finished).toEqual({ status: "finished" });
    expect(run.snapshot.size).toBe(0);
    expect(run.callbacks.size).toBe(0);
  },
);

it("ignores missing/deleted targets without submitting an empty frame", async () => {
  const a = rect("a");
  const run = setup([a]);
  run.setElements([{ ...a, isDeleted: true }]);
  const handle = run.animator.animateElements({
    elements: [a, "missing"],
    type: "fade",
  });
  expect(await handle.finished).toEqual({ status: "finished" });
  expect(run.submit).not.toHaveBeenCalled();
  expect(run.callbacks.size).toBe(0);
});

it("disposes pending work and clears visual state without subsequent submissions", async () => {
  const a = rect("a");
  const run = setup([a]);
  const handle = run.animator.animateElements({
    elements: [a],
    type: "fade",
    delay: 300,
  });
  run.animator.dispose();
  expect(await handle.finished).toEqual({ status: "destroyed" });
  expect(run.submit).toHaveBeenLastCalledWith(null);
  expect(run.callbacks.size).toBe(0);
  run.submit.mockClear();
  run.tick(1000);
  handle.cancel();
  run.animator.dispose();
  expect(run.submit).not.toHaveBeenCalled();
});
