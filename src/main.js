/* ============================================================
   PoyberFlow — entry point.

   Wires together:
   - state
   - theme
   - layout
   - renderers
   - interactions
   - history
   ============================================================ */

import { createStore } from "./core/store.js";
import { createInitialState } from "./state/initial-state.js";
import { createHistory } from "./history/history.js";

import { initTheme } from "./ui/theme/theme-manager.js";
import { createTopBar } from "./ui/layout/top-bar.js";
import { createLeftSidebar } from "./ui/layout/left-sidebar.js";
import { createRightSidebar } from "./ui/layout/right-sidebar.js";
import { createWorkspace } from "./ui/layout/workspace.js";

import { createViewportRenderer } from "./ui/renderers/viewport-renderer.js";
import { createGridRenderer } from "./ui/renderers/grid-renderer.js";
import { createNodesRenderer } from "./ui/renderers/node-renderer.js";

import { attachNodeDrag } from "./interaction/node-drag.js";
import { attachNodeSelection } from "./interaction/node-selection.js";

import { registerNode, getNodeDefinition } from "./nodes/registry.js";
import { startNodeDefinition } from "./nodes/start-node.js";
import { createNode } from "./graph/node-factory.js";

import { addNode } from "./graph/graph.js";

import { el } from "./utils/dom.js";

/* ---------- 1. Node registrations ---------- */
registerNode(startNodeDefinition);

/* ---------- 2. Store ---------- */
const store = createStore(createInitialState());

/* ---------- 3. Theme ---------- */
initTheme(store);

/* ---------- 4. History ---------- */
const history = createHistory(store);

/* ---------- 5. Layout ---------- */
const app = document.getElementById("app");

const topBar = createTopBar(store);
const middle = el("div", { class: "flex-1 flex min-h-0" });

const leftSidebar = createLeftSidebar();
const { root: workspaceRoot, viewport, nodesLayer } = createWorkspace();
const rightSidebar = createRightSidebar(store);

middle.append(leftSidebar, workspaceRoot, rightSidebar);
app.append(topBar, middle);

/* ---------- 6. Renderers ---------- */
const renderViewport = createViewportRenderer(viewport);
const renderGrid = createGridRenderer(workspaceRoot);
const renderNodes = createNodesRenderer(nodesLayer);

function renderAll(state) {
  renderViewport(state);
  renderGrid(state);
  renderNodes(state);
}

store.subscribe(renderAll);

/* ---------- 7. Interactions ---------- */
attachNodeSelection({ workspaceEl: workspaceRoot, store });
attachNodeDrag({ workspaceEl: workspaceRoot, store, history });

/* ---------- 8. Seed initial graph ---------- */
{
  const def = getNodeDefinition("start");
  if (def) {
    const startNode = createNode(def, { x: 320, y: 220 });
    const { workflow } = store.getState();
    store.setState({
      workflow: {
        ...workflow,
        nodes: addNode(workflow.nodes, startNode),
      },
    });
  }
}

/* ---------- 9. First paint ---------- */
renderAll(store.getState());

/* ---------- 10. Debug helpers (dev only) ---------- */
if (import.meta?.url) {
  window.__poyberflow = { store, history };
}
