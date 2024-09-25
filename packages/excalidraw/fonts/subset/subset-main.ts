import {
  WorkerInTheMainChunkError,
  WorkerUrlNotDefinedError,
} from "../../errors";
import { isServerEnv, promiseTry } from "../../utils";
import { WorkerPool } from "../../workers";
import type { Commands } from "./subset-shared.chunk";

let shouldUseWorkers = typeof Worker !== "undefined";

/**
 * Tries to subset glyphs in a font based on the used codepoints, returning the font as dataurl.
 * Under the hood utilizes worker threads (Web Workers, if available), otherwise fallbacks to the main thread.
 *
 * @param arrayBuffer font data buffer in the woff2 format
 * @param codePoints codepoints used to subset the glyphs
 *
 * @returns font with subsetted glyphs (all glyphs in case of errors) converted into a dataurl
 */
export const subsetWoff2GlyphsByCodepoints = async (
  arrayBuffer: ArrayBuffer,
  codePoints: Array<number>,
): Promise<string> => {
  const { Commands, subsetToBase64, toBase64 } =
    await lazyLoadSharedSubsetChunk();

  if (!shouldUseWorkers) {
    return subsetToBase64(arrayBuffer, codePoints);
  }

  return promiseTry(async () => {
    try {
      const workerPool = await getOrCreateWorkerPool(codePoints);
      // copy the buffer to avoid working on top of the detached array buffer in the fallback
      // i.e. in case the worker throws, the array buffer does not get automatically detached, even if the worker is terminated
      const arrayBufferCopy = arrayBuffer.slice(0);
      const result = await workerPool.postMessage(
        {
          command: Commands.Subset,
          arrayBuffer: arrayBufferCopy,
        } as const,
        { transfer: [arrayBufferCopy] },
      );

      // encode on the main thread to avoid copying large binary strings (as dataurl) between threads
      return toBase64(result);
    } catch (e) {
      // don't use workers if they are failing
      shouldUseWorkers = false;

      if (
        // don't log the expected errors server-side
        !(
          isServerEnv() &&
          (e instanceof WorkerUrlNotDefinedError ||
            e instanceof WorkerInTheMainChunkError)
        )
      ) {
        // eslint-disable-next-line no-console
        console.error(
          "Failed to use workers for subsetting, falling back to the main thread.",
          e,
        );
      }

      // fallback to the main thread
      // TODO_CHINESE: consider adding test cases for the fallback (and also in case the fallback fails as well)
      return subsetToBase64(arrayBuffer, codePoints);
    }
  });
};

// lazy-loaded and cached chunks
let subsetWorker: Promise<typeof import("./subset-worker.chunk")> | null = null;
let subsetShared: Promise<typeof import("./subset-shared.chunk")> | null = null;

const lazyLoadWorkerSubsetChunk = async () => {
  if (!subsetWorker) {
    subsetWorker = import("./subset-worker.chunk");
  }

  return subsetWorker;
};

const lazyLoadSharedSubsetChunk = async () => {
  if (!subsetShared) {
    // load dynamically to force create a shared chunk reused between main thread and the worker thread
    subsetShared = import("./subset-shared.chunk");
  }

  return subsetShared;
};

// TODO: could be extended with multiple commands in the future
type SubsetWorkerData = {
  command: typeof Commands.Subset;
  arrayBuffer: ArrayBuffer;
};

type SubsetWorkerResult<T extends SubsetWorkerData["command"]> =
  T extends typeof Commands.Subset ? ArrayBuffer : never;

let workerPool: Promise<
  WorkerPool<SubsetWorkerData, SubsetWorkerResult<SubsetWorkerData["command"]>>
> | null = null;

/**
 * Lazy initialize or get the worker pool singleton.
 *
 * @throws implicitly if anything goes wrong - worker pool creation, loading wasm, initializing worker, etc.
 */
const getOrCreateWorkerPool = (codePoints: Array<number>) => {
  if (!workerPool) {
    // immediate concurrent-friendly return, to ensure we have only one pool instance
    workerPool = promiseTry(async () => {
      const { WorkerUrl } = await lazyLoadWorkerSubsetChunk();
      const { Commands } = await lazyLoadSharedSubsetChunk();

      const pool = WorkerPool.create<
        SubsetWorkerData,
        SubsetWorkerResult<SubsetWorkerData["command"]>
      >(WorkerUrl, {
        initWorker: (worker: Worker) => {
          // initialize the newly created worker with codepoints
          worker.postMessage({ command: Commands.Init, codePoints });
        },
      });

      return pool;
    });
  }

  return workerPool;
};
