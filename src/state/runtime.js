/* ============================================================
   Runtime helpers — centralised updates to state.runtime.

   Executor and UI call these helpers, so the runtime shape is
   only manipulated in one place.
   ============================================================ */

import { appendLog, makeLog } from "../engine/logger.js";

/* ---------- Node states ---------- */

export const NODE_STATUS = Object.freeze({
  IDLE: "idle",
  PENDING: "pending",
  RUNNING: "running",
  SUCCESS: "success",
  ERROR: "error",
  SKIPPED: "skipped",
});

function patchRuntime(store, patch) {
  const { runtime } = store.getState();
  store.setState({ runtime: { ...runtime, ...patch } });
}

export function setNodeStatus(store, nodeId, status, extra = {}) {
  const { runtime } = store.getState();
  const prev = runtime.nodeStates[nodeId] || {};
  const next = {
    ...runtime.nodeStates,
    [nodeId]: {
      ...prev,
      status,
      ...extra,
    },
  };
  patchRuntime(store, { nodeStates: next });
}

export function clearNodeStatuses(store) {
  patchRuntime(store, { nodeStates: {} });
}

/* ---------- Executing flag ---------- */

export function setExecuting(store, executing, extra = {}) {
  patchRuntime(store, { executing, ...extra });
}

/* ---------- Logs ---------- */

export function log(store, { level, nodeId = null, message, data = null }) {
  const { runtime } = store.getState();
  const entry = makeLog({ level, nodeId, message, data });
  patchRuntime(store, { logs: appendLog(runtime.logs, entry) });
}

export function clearLogs(store) {
  patchRuntime(store, { logs: [] });
}

/* ---------- Full reset ---------- */

export function resetRuntime(store) {
  store.setState({
    runtime: {
      executing: false,
      executionId: null,
      startedAt: null,
      finishedAt: null,
      nodeStates: {},
      logs: [],
    },
  });
}
