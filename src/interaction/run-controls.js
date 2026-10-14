/* ============================================================
   Run Controls — orchestrates a single execution from the UI.

   Responsibilities:
   - Validate before running.
   - Reset runtime state.
   - Call the executor with store-connected callbacks.
   - Provide cancel via AbortController.
   - Show toasts for start / success / error / cancel.
   ============================================================ */

import { executeWorkflow } from "../engine/executor.js";
import {
  resetRuntime,
  setExecuting,
  setNodeStatus,
  log,
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

    // Reset runtime before starting a fresh run.
    resetRuntime(store);
    setExecuting(store, true, {
      startedAt: Date.now(),
    });

    const controller = new AbortController();
    currentAbort = controller;

    toast.show({ kind: "info", text: "Workflow started." });

    const result = await executeWorkflow(workflow, {
      abortSignal: controller.signal,
      onNodeStatus: (nodeId, status, extra) =>
        setNodeStatus(store, nodeId, status, extra),
      onLog: (entry) => log(store, entry),
      onFinish: () => {},
    });

    currentAbort = null;
    setExecuting(store, false, { finishedAt: Date.now() });

    if (result.ok) {
      toast.show({
        kind: "success",
        text: `Workflow finished in ${result.steps} step(s).`,
      });
    } else if (result.error?.name === "CancelledError") {
      toast.show({ kind: "warning", text: "Workflow cancelled." });
    } else {
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
