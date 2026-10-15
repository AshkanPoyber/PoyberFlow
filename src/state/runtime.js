/* ============================================================
   Runtime helpers — centralised updates to state.runtime.

   All runtime shape manipulation goes through here.
   ============================================================ */

import { appendLog, makeLog } from "../engine/logger.js";

/* ---------- Constants ---------- */

export const NODE_STATUS = Object.freeze({
  IDLE: "idle",
  PENDING: "pending",
  RUNNING: "running",
  SUCCESS: "success",
  ERROR: "error",
  SKIPPED: "skipped",
});

export const EDGE_STATUS = Object.freeze({
  IDLE: "idle",
  ACTIVE: "active",
  SUCCESS: "success",
  ERROR: "error",
});

/* ---------- Internal ---------- */

function patchRuntime(store, patch) {
  const { runtime } = store.getState();
  store.setState({ runtime: { ...runtime, ...patch } });
}

/* ---------- Node states ---------- */

export function setNodeStatus(store, nodeId, status, extra = {}) {
  const { runtime } = store.getState();
  const prev = runtime.nodeStates[nodeId] || {};
  patchRuntime(store, {
    nodeStates: {
      ...runtime.nodeStates,
      [nodeId]: { ...prev, status, ...extra },
    },
  });
}

export function clearNodeStatuses(store) {
  patchRuntime(store, { nodeStates: {} });
}

/* ---------- Edge states ---------- */

export function setEdgeStatus(store, edgeId, status, extra = {}) {
  const { runtime } = store.getState();
  const prev = runtime.edgeStates[edgeId] || {};
  patchRuntime(store, {
    edgeStates: {
      ...runtime.edgeStates,
      [edgeId]: { ...prev, status, ...extra },
    },
  });
}

export function clearEdgeStatuses(store) {
  patchRuntime(store, { edgeStates: {} });
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

export function logRunMarker(store, label = "New run") {
  const { runtime } = store.getState();
  const marker = {
    id: `marker-${Date.now()}`,
    kind: "marker",
    timestamp: Date.now(),
    label,
  };
  patchRuntime(store, { logs: appendLog(runtime.logs, marker) });
}

export function clearLogs(store) {
  patchRuntime(store, { logs: [] });
}

/* ---------- Summary ---------- */

export function setSummary(store, summary) {
  patchRuntime(store, { summary });
}

export function clearSummary(store) {
  patchRuntime(store, { summary: null });
}

/* ---------- Full reset (keeps logs) ---------- */

export function resetRuntime(store) {
  store.setState({
    runtime: {
      ...store.getState().runtime,
      executing: false,
      executionId: null,
      startedAt: null,
      finishedAt: null,
      nodeStates: {},
      edgeStates: {},
      summary: null,
      lastResults: {},
    },
  });
}
