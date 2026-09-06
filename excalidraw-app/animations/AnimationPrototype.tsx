import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Excalidraw } from "@excalidraw/excalidraw";

import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

import { ElementAnimator } from "./ElementAnimator";
import {
  beats,
  createDemoElements,
  loadDemoImage,
  slides,
  visibilityFor,
} from "./fixtures";

import "./AnimationPrototype.scss";

import type { ElementAnimationHandle } from "./ElementAnimator";

/** Standalone host simulation: no persistence or collaboration on the demo route. */
export const AnimationPrototype = () => {
  const mount = useRef<HTMLDivElement>(null);
  const [api, setAPI] = useState<ExcalidrawImperativeAPI | null>(null);
  const animator = useRef<ElementAnimator | null>(null);
  const animatorEditor = useRef<ExcalidrawImperativeAPI | null>(null);
  const preview = useRef<ElementAnimationHandle | null>(null);
  const position = useRef({ slide: 0, counts: slides.map(() => 0) });
  const [navigation, setNavigation] = useState(position.current);
  const [presenting, setPresenting] = useState(true);
  const [duration, setDuration] = useState(800);
  const [previewing, setPreviewing] = useState(false);
  const [selection, setSelection] = useState<string[]>([]);
  const [lastResult, setLastResult] = useState("Ready");
  const documentChanges = useRef(0);
  const [changeCount, setChangeCount] = useState(0);
  const data = useMemo(
    () => ({
      elements: createDemoElements(),
      appState: { viewBackgroundColor: "#f8f9fa" },
    }),
    [],
  );
  const initialOverrides = useMemo(
    () =>
      visibilityFor(
        slides.map(() => 0),
        data.elements,
      ),
    [data],
  );
  const baseFor = (counts: number[]) =>
    visibilityFor(counts, api?.getSceneElements() ?? data.elements);

  // Initialization can precede the parent effect. Both paths use the same
  // instance so the animator remains the sole writer of editor snapshots.
  const getAnimator = useCallback((editor: ExcalidrawImperativeAPI) => {
    const ownerWindow = mount.current?.ownerDocument.defaultView;
    if (!ownerWindow) {
      return null;
    }
    if (animatorEditor.current !== editor || !animator.current) {
      animator.current?.dispose();
      animator.current = new ElementAnimator(editor, ownerWindow);
      animatorEditor.current = editor;
    }
    return animator.current;
  }, []);

  useEffect(() => {
    if (!api) {
      return;
    }
    const runner = getAnimator(api);
    runner?.setBaseOverrides(initialOverrides);
    return () => {
      runner?.dispose();
      if (animator.current === runner) {
        animator.current = null;
        animatorEditor.current = null;
      }
    };
  }, [api, getAnimator, initialOverrides]);

  useEffect(() => {
    const ownerDocument = mount.current?.ownerDocument;
    if (!api || !ownerDocument) {
      return;
    }
    let active = true;
    loadDemoImage(ownerDocument)
      .then((file) => {
        if (active && !api.isDestroyed) {
          api.addFiles([file]);
        }
      })
      .catch((error) => {
        if (active) {
          setLastResult(String(error));
        }
      });
    return () => {
      active = false;
    };
  }, [api]);

  useEffect(() => {
    if (!api) {
      return;
    }
    return api.onChange((_, state) => {
      documentChanges.current++;
      setChangeCount(documentChanges.current);
      setSelection(Object.keys(state.selectedElementIds));
    });
  }, [api]);

  const cancelPreview = () => {
    preview.current?.cancel();
    preview.current = null;
    setPreviewing(false);
  };

  const focusSlide = (slide: number, animate = true) => {
    api?.setViewport({
      target: `slide-${slide}`,
      fit: "contain",
      offsets: { top: 60, right: 60, bottom: 60, left: 60 },
      animation: animate ? { duration: 300 } : false,
    });
  };

  const moveToSlide = (slide: number, revealed = 0) => {
    cancelPreview();
    const counts = [...position.current.counts];
    counts[slide] = revealed;
    position.current = { slide, counts };
    setNavigation(position.current);
    animator.current?.setBaseOverrides(
      presenting ? baseFor(counts) : new Map(),
      { cancelAnimations: true },
    );
    focusSlide(slide);
  };

  const step = (reverse: boolean) => {
    const { slide, counts } = position.current;
    const count = counts[slide];
    const currentBeats = beats(slide, duration);
    if (
      (!reverse && count === currentBeats.length) ||
      (reverse && count === 0)
    ) {
      const nextSlide =
        (slide + (reverse ? -1 : 1) + slides.length) % slides.length;
      moveToSlide(nextSlide, reverse ? beats(nextSlide, duration).length : 0);
      return;
    }
    const nextCount = count + (reverse ? -1 : 1);
    const nextCounts = [...counts];
    nextCounts[slide] = nextCount;
    position.current = { slide, counts: nextCounts };
    setNavigation(position.current);
    // Commit intent immediately; the next press never waits on completion.
    animator.current?.animateElements(
      currentBeats[reverse ? nextCount : count].map((request) => ({
        ...request,
        phase: reverse ? "out" : "in",
      })),
      { baseOverrides: baseFor(nextCounts) },
    );
  };

  const toggleMode = () => {
    cancelPreview();
    animator.current?.setBaseOverrides(
      !presenting ? baseFor(position.current.counts) : new Map(),
      { cancelAnimations: true },
    );
    setPresenting(!presenting);
  };

  const previewAll = async () => {
    if (!animator.current || previewing) {
      return;
    }
    focusSlide(position.current.slide);
    let delay = 300;
    const requests = beats(position.current.slide, duration).flatMap((beat) => {
      const scheduled = beat.map((request) => ({ ...request, delay }));
      delay +=
        Math.max(
          ...beat.map(
            (request) =>
              duration + (request.stagger ?? 0) * (request.elements.length - 1),
          ),
        ) + 500;
      return scheduled;
    });
    const handle = animator.current.animateElements(requests);
    preview.current = handle;
    setPreviewing(true);
    const result = await handle.finished;
    if (preview.current === handle) {
      preview.current = null;
      setPreviewing(false);
      setLastResult(result.status);
    }
  };

  const initialize = useCallback(
    (editor: ExcalidrawImperativeAPI) => {
      getAnimator(editor)?.setBaseOverrides(initialOverrides);
      editor.setViewport({
        target: "slide-0",
        fit: "contain",
        offsets: { top: 60, right: 60, bottom: 60, left: 60 },
        animation: false,
      });
    },
    [getAnimator, initialOverrides],
  );

  return (
    <div className="animation-prototype" ref={mount}>
      <aside>
        <a href="/">← Whiteboard</a>
        <h1>Presentation animations</h1>
        <p>Host-driven beats and previews using temporary render overrides.</p>
        <button onClick={toggleMode} disabled={!api}>
          {presenting ? "Edit & preview" : "Present"}
        </button>
        <label>
          Effect duration
          <select
            value={duration}
            onChange={(event) => setDuration(Number(event.target.value))}
          >
            <option value={250}>250 ms</option>
            <option value={800}>800 ms</option>
            <option value={1800}>1.8 seconds</option>
          </select>
        </label>
        <nav aria-label="Slides">
          {slides.map(({ name }, index) => (
            <button
              key={name}
              aria-pressed={index === navigation.slide}
              onClick={() => moveToSlide(index)}
            >
              {index + 1}. {name}
            </button>
          ))}
        </nav>
        <p>{slides[navigation.slide].description}</p>
        {presenting ? (
          <>
            <p className="animation-prototype__progress">
              Step {navigation.counts[navigation.slide] + 1} of{" "}
              {beats(navigation.slide, duration).length + 1}
            </p>
            <div className="animation-prototype__row">
              <button onClick={() => step(true)}>Previous</button>
              <button onClick={() => step(false)}>Next</button>
            </div>
            <button onClick={() => moveToSlide(navigation.slide)}>
              Restart slide
            </button>
            <p>
              Try Next → Previous during a flight. Beats can overlap; reversing
              starts at the current visual position.
            </p>
          </>
        ) : (
          <>
            <button
              disabled={!selection.length}
              onClick={() =>
                animator.current?.animateElements({
                  elements: selection,
                  type: "fly",
                  from: "left",
                  duration,
                })
              }
            >
              Preview selection
            </button>
            <button
              onClick={() =>
                animator.current?.animateElements({
                  elements: [`slide-${navigation.slide}`],
                  type: "fade",
                  duration,
                })
              }
            >
              Preview frame fade
            </button>
            <button disabled={previewing} onClick={previewAll}>
              Preview all beats
            </button>
            <button disabled={!previewing} onClick={cancelPreview}>
              Cancel preview
            </button>
            <p>
              Select a shape to preview its effect. Labels, link badges and
              embed placeholders follow their elements.
            </p>
            <output>{previewing ? "Preview running…" : lastResult}</output>
          </>
        )}
        <details>
          <summary>Diagnostics</summary>
          <p>
            Document change notifications:{" "}
            <output data-testid="document-changes">{changeCount}</output>
          </p>
          <p>
            Navigation and edits can increment this count. Element animation
            frames should not.
          </p>
        </details>
      </aside>
      <main>
        <Excalidraw
          initialData={data}
          onExcalidrawAPI={setAPI}
          viewModeEnabled={presenting}
          onInitialize={initialize}
        />
      </main>
    </div>
  );
};
