/* ============================================================
   Initial application state.
   ============================================================ */

import { createNodeId } from "../utils/id.js";

export function createInitialState() {
  const id = "workflow-" + createNodeId().split("-").slice(1).join("-");

  return {
    workflow: {
      metadata: {
        id,
        name: "Untitled Workflow",
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      nodes: [],
      edges: [],
    },
    runtime: {
      executing: false,
      executionId: null,
      startedAt: null,
      finishedAt: null,
      nodeStates: {},
      edgeStates: {},
      logs: [],
      summary: null,
      lastResults: {},
    },
    viewport: {
      x: 0,
      y: 0,
      zoom: 1,
    },
    selection: {
      nodeIds: [],
      edgeIds: [],
    },
    ui: {
      theme: "dark",
    },
    validation: {
      ok: true,
      errors: [],
      warnings: [],
      issues: [],
    },
  };
}
