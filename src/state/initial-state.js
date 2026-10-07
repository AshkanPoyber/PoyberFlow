/* ============================================================
   Initial application state.

   Note the strict separation:
   - workflow : pure graph data (safe for history / persistence)
   - runtime  : execution-time data (never persisted, never undone)
   - viewport : camera
   - selection: UI-level selection
   - ui       : chrome (theme, panels)
   ============================================================ */

export function createInitialState() {
  return {
    workflow: {
      metadata: {
        id: "workflow-untitled",
        name: "Untitled Workflow",
        version: 1,
      },
      nodes: [],
      edges: [],
    },
    runtime: {
      executing: false,
      nodeStates: {},
      logs: [],
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
  };
}
