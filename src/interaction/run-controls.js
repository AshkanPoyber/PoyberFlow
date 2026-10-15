/* ============================================================
   Run Controls — orchestrates a single execution from the UI.
   ============================================================ */

import { executeWorkflow } from "../engine/executor.js";
import {
  resetRuntime,
  setExecuting,
  setNodeStatus,
  setEdgeStatus,
  setSummary,
  log,
  logRunMarker,
} from "../state/runtime.js";
import { validateWorkflow } from "../engine/validator.js";

export function createRunController({ store, toast }) {
  let currentAbort = null;

  function isRunning() {
    return Boolean(currentAbort);
  }

  async function run() {
    if (isRunning()) return;

    const { workflow } = store.getState();

    const validation = validateWorkflow(workflow);
    if (!validation.ok) {
      toast.show({
        kind: "error",
        text: `Cannot run: ${validation.errors.length} error(s) in the workflow.`,
      });
      return;
    }

    // Reset runtime before starting a fresh run (keeps logs).
    resetRuntime(store);
    setExecuting(store, true, { startedAt: Date.now() });

    // Visual marker in the log stream.
    logRunMarker(store, "New run");

    const controller = new AbortController();
    currentAbort = controller;

    toast.show({ kind: "info", text: "Workflow started." });

    const result = await executeWorkflow(workflow, {
      abortSignal: controller.signal,
      onNodeStatus: (nodeId, status, extra) =>
        setNodeStatus(store, nodeId, status, extra),
      onEdgeStatus: (edgeId, status, extra) =>
        setEdgeStatus(store, edgeId, status, extra),
      onLog: (entry) => log(store, entry),
      onResults: (results) => {
        const { runtime } = store.getState();
        store.setState({
          runtime: { ...runtime, lastResults: results },
        });
      },
      onFinish: () => {},
    });

    currentAbort = null;
    setExecuting(store, false, { finishedAt: Date.now() });

    // Build a summary for the UI.
    if (result.ok) {
      const successCount =
        result.visited.length - (result.skipped?.length || 0);
      setSummary(store, {
        ok: true,
        steps: result.steps,
        durationMs: result.durationMs,
        successCount,
        skippedCount: result.skipped?.length || 0,
        errorCount: 0,
      });

      toast.show({
        kind: "success",
        text: `Workflow finished · ${result.steps} step(s) · ${formatMs(
          result.durationMs,
        )}`,
      });
    } else if (result.error?.name === "CancelledError") {
      setSummary(store, {
        ok: false,
        cancelled: true,
        steps: result.steps,
        durationMs: result.durationMs,
      });
      toast.show({ kind: "warning", text: "Workflow cancelled." });
    } else {
      setSummary(store, {
        ok: false,
        steps: result.steps,
        durationMs: result.durationMs,
        errorCount: 1,
        errorMessage: result.error?.message,
      });
      toast.show({
        kind: "error",
        text: result.error?.message || "Workflow failed.",
      });
    }
  }

  function stop() {
    if (!currentAbort) return;
    currentAbort.abort();
  }

  return { run, stop, isRunning };
}

/* ---------- Helpers ---------- */

function formatMs(ms) {
  if (!Number.isFinite(ms)) return "";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}
