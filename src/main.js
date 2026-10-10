/* ============================================================
   PoyberFlow — entry point.
   ============================================================ */

import { createStore } from "./core/store.js";
import { createInitialState } from "./state/initial-state.js";
import { createHistory } from "./history/history.js";
import { createCamera } from "./core/camera.js";

import { initTheme } from "./ui/theme/theme-manager.js";
import { createTopBar } from "./ui/layout/top-bar.js";
import { createLeftSidebar } from "./ui/layout/left-sidebar.js";
import { createRightSidebar } from "./ui/layout/right-sidebar.js";
import { createWorkspace } from "./ui/layout/workspace.js";

import { createViewportRenderer } from "./ui/renderers/viewport-renderer.js";
import { createGridRenderer } from "./ui/renderers/grid-renderer.js";
import { createNodesRenderer } from "./ui/renderers/node-renderer.js";
import { createEdgesRenderer } from "./ui/renderers/edges-renderer.js";

import { attachNodeDrag } from "./interaction/node-drag.js";
import { attachNodeSelection } from "./interaction/node-selection.js";
import { attachNodeDelete } from "./interaction/node-delete.js";
import { attachEdgeSelection } from "./interaction/edge-selection.js";
import { attachConnectionDrag } from "./interaction/connection-drag.js";
import { attachPan } from "./interaction/pan.js";
import { attachZoom } from "./interaction/zoom.js";

import { registerNode, getNodeDefinition } from "./nodes/registry.js";
import { startNodeDefinition } from "./nodes/start-node.js";
import { outputNodeDefinition } from "./nodes/output-node.js";
import { httpNodeDefinition } from "./nodes/http-node.js";
import { ifNodeDefinition } from "./nodes/if-node.js";
import { delayNodeDefinition } from "./nodes/delay-node.js";

import { createNode } from "./graph/node-factory.js";
import { addNode } from "./graph/graph.js";
import { AddNodeCommand } from "./history/commands/add-node-command.js";

import { el } from "./utils/dom.js";

/* ---------- 1. Node registrations ---------- */
registerNode(startNodeDefinition);
registerNode(outputNodeDefinition);
registerNode(httpNodeDefinition);
registerNode(ifNodeDefinition);
registerNode(delayNodeDefinition);

/* ---------- 2. Store ---------- */
const store = createStore(createInitialState());

/* ---------- 3. Theme ---------- */
initTheme(store);

/* ---------- 4. History ---------- */
const history = createHistory(store);

/* ---------- 5. Camera ---------- */
const camera = createCamera(store);

/* ---------- 6. Helpers ---------- */

function computeSpawnPosition(workspaceEl, nodeCount) {
  const rect = workspaceEl.getBoundingClientRect();
  const { x, y, zoom } = camera.get();

  const worldCenterX = (rect.width / 2 - x) / zoom;
  const worldCenterY = (rect.height / 2 - y) / zoom;

  const step = 28;
  const cascade = (nodeCount % 6) * step;

  return {
    x: Math.round(worldCenterX - 110 + cascade),
    y: Math.round(worldCenterY - 40 + cascade),
  };
}

/* ---------- 7. Layout ---------- */

const app = document.getElementById("app");
const middle = el("div", { class: "flex-1 flex min-h-0" });

const {
  root: workspaceRoot,
  viewport,
  edgesLayer,
  nodesLayer,
} = createWorkspace();

function handleAddNode(definition) {
  const { workflow } = store.getState();
  const position = computeSpawnPosition(workspaceRoot, workflow.nodes.length);
  const node = createNode(definition, position);
  history.push(new AddNodeCommand(node));
  store.setState({
    selection: { nodeIds: [node.id], edgeIds: [] },
  });
}

const leftSidebar = createLeftSidebar({ onAddNode: handleAddNode });
const rightSidebar = createRightSidebar(store);
const topBar = createTopBar(store, { camera, workspaceEl: workspaceRoot });

middle.append(leftSidebar, workspaceRoot, rightSidebar);
app.append(topBar, middle);

/* ---------- 8. Renderers ---------- */

// We need a shared reference so the edges renderer can measure node cards.
const nodeElementsRef = { current: new Map() };

const renderViewport = createViewportRenderer(viewport);
const renderGrid = createGridRenderer(workspaceRoot);
const renderNodes = createNodesRenderer(nodesLayer, nodeElementsRef);
const renderEdges = createEdgesRenderer(edgesLayer, nodeElementsRef);

function renderAll(state) {
  renderViewport(state);
  renderGrid(state);
  renderNodes(state);
  renderEdges(state);
}

store.subscribe(renderAll);

/* ---------- 9. Interactions ---------- */
attachNodeSelection({ workspaceEl: workspaceRoot, store });
attachEdgeSelection({ workspaceEl: workspaceRoot, store });
attachNodeDrag({ workspaceEl: workspaceRoot, store, history, camera });
attachNodeDelete({ store, history });
attachPan({ workspaceEl: workspaceRoot, camera, store });
attachZoom({ workspaceEl: workspaceRoot, camera });
attachConnectionDrag({
  workspaceEl: workspaceRoot,
  viewportEl: viewport,
  edgesLayerEl: edgesLayer,
  store,
  history,
});

/* ---------- 10. Seed initial graph ---------- */
{
  const startDef = getNodeDefinition("start");
  if (startDef) {
    const startNode = createNode(startDef, { x: 320, y: 220 });
    const { workflow } = store.getState();
    store.setState({
      workflow: {
        ...workflow,
        nodes: addNode(workflow.nodes, startNode),
      },
    });
  }
}

/* ---------- 11. First paint ---------- */
renderAll(store.getState());

/* ---------- 12. Dev helpers ---------- */
if (import.meta?.url) {
  window.__poyberflow = { store, history, camera };
}
