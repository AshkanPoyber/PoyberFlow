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
import { attachEdgeSelection } from "./interaction/edge-selection.js";
import { attachRectangleSelection } from "./interaction/rectangle-selection.js";
import { attachConnectionDrag } from "./interaction/connection-drag.js";
import { attachKeyboardShortcuts } from "./interaction/keyboard-shortcuts.js";
import { attachPan } from "./interaction/pan.js";
import { attachZoom } from "./interaction/zoom.js";

import {
  registerNode,
  getNodeDefinition,
  getAllNodeDefinitions,
} from "./nodes/registry.js";
import { startNodeDefinition } from "./nodes/start-node.js";
import { outputNodeDefinition } from "./nodes/output-node.js";
import { httpNodeDefinition } from "./nodes/http-node.js";
import { ifNodeDefinition } from "./nodes/if-node.js";
import { delayNodeDefinition } from "./nodes/delay-node.js";

import { createNode } from "./graph/node-factory.js";
import { addNode } from "./graph/graph.js";
import { AddNodeCommand } from "./history/commands/add-node-command.js";
import { MoveNodesCommand } from "./history/commands/move-nodes-command.js";

import {
  loadActiveWorkflow,
  loadWorkflow,
  saveWorkflow,
} from "./storage/local.js";
import { attachAutosave } from "./storage/autosave.js";
import { createToastManager } from "./ui/panels/toast-manager.js";

import { el } from "./utils/dom.js";
import { CURRENT_VERSION } from "./storage/schema.js";

import { attachValidation } from "./state/validation-state.js";
import { createValidationBanner } from "./ui/panels/validation-banner.js";
import { focusIssue } from "./interaction/validation-focus.js";

import { setMockMode, isMockMode } from "./engine/mock-fetcher.js";

import { createExecutionPanel } from "./ui/panels/execution-panel.js";
import { focusExecutionNode } from "./interaction/execution-focus.js";

import { createCommandPalette } from "./ui/panels/command-palette.js";
import { showTemplatesDialog } from "./ui/panels/templates-dialog.js";
import { attachContextMenu } from "./interaction/context-menu-handler.js";

import { createRunController } from "./interaction/run-controls.js";

import { registerProject, setCurrentProject } from "./storage/projects.js";

/* ---------- R11 additions ---------- */
import { createMiniMap } from "./ui/panels/mini-map.js";
import { attachFocusMode } from "./interaction/focus-mode.js";
import { computeAutoLayout } from "./utils/auto-layout.js";

/* ---------- 1. Node registrations ---------- */
registerNode(startNodeDefinition);
registerNode(outputNodeDefinition);
registerNode(httpNodeDefinition);
registerNode(ifNodeDefinition);
registerNode(delayNodeDefinition);

/* ---------- 2. Store ---------- */
const store = createStore(createInitialState());

/* ---------- 3. Restore from LocalStorage (if any) ---------- */
{
  const restored = loadActiveWorkflow();
  if (restored.ok) {
    const p = restored.payload;
    const { workflow, viewport } = store.getState();
    store.setState({
      workflow: {
        ...workflow,
        metadata: {
          ...workflow.metadata,
          ...p.metadata,
          version: CURRENT_VERSION,
        },
        nodes: p.workflow.nodes,
        edges: p.workflow.edges,
      },
      viewport: {
        x: p.viewport?.x ?? viewport.x,
        y: p.viewport?.y ?? viewport.y,
        zoom: p.viewport?.zoom ?? viewport.zoom,
      },
    });
  }
}

/* ---------- 4. Theme ---------- */
initTheme(store);

/* ---------- 5. History ---------- */
const history = createHistory(store);

/* ---------- 6. Camera ---------- */
const camera = createCamera(store);

/* ---------- 7. Helpers ---------- */

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

/* ---------- 8. Layout ---------- */

const app = document.getElementById("app");
const middle = el("div", { class: "flex-1 flex min-h-0" });

const {
  root: workspaceRoot,
  viewport,
  edgesLayer,
  nodesLayer,
} = createWorkspace();

const toast = createToastManager(app);

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
const rightSidebar = createRightSidebar({ store, history });

/* ---------- 9. Run controller (global) ---------- */

const runControllerGlobal = createRunController({ store, toast });

/* ---------- 10. Templates ---------- */

function openTemplates() {
  showTemplatesDialog({
    rootEl: app,
    onSelect: (tpl) => {
      const { nodes, edges } = tpl.build();
      const { workflow } = store.getState();

      store.setState({
        workflow: { ...workflow, nodes, edges },
        selection: { nodeIds: [], edgeIds: [] },
      });

      history.clear?.();

      toast.show({ kind: "success", text: `Template loaded: ${tpl.name}` });
    },
  });
}

/* ---------- 11. Workflow switching ---------- */

function switchWorkflow(id) {
  saveWorkflow(store.getState());

  const restored = loadWorkflow(id);
  if (!restored.ok) {
    toast.show({
      kind: "error",
      text: "Could not load workflow: " + restored.error,
    });
    return;
  }

  const p = restored.payload;
  const { workflow, viewport } = store.getState();
  store.setState({
    workflow: {
      ...workflow,
      metadata: {
        ...workflow.metadata,
        ...p.metadata,
        version: CURRENT_VERSION,
      },
      nodes: p.workflow.nodes,
      edges: p.workflow.edges,
    },
    viewport: {
      x: p.viewport?.x ?? viewport.x,
      y: p.viewport?.y ?? viewport.y,
      zoom: p.viewport?.zoom ?? viewport.zoom,
    },
    selection: { nodeIds: [], edgeIds: [] },
  });

  setCurrentProject(id);
  history.clear?.();

  toast.show({
    kind: "success",
    text: `Switched to ${p.metadata.name || "workflow"}`,
  });
}

/* ---------- 12. Auto Layout (R11) ---------- */

function runAutoLayout() {
  const { workflow } = store.getState();
  if (workflow.nodes.length === 0) return;

  const positions = computeAutoLayout(workflow.nodes, workflow.edges);
  const moves = [];
  for (const n of workflow.nodes) {
    const next = positions.get(n.id);
    if (!next) continue;
    if (n.position.x === next.x && n.position.y === next.y) continue;
    moves.push({ id: n.id, from: { ...n.position }, to: next });
  }

  if (moves.length === 0) return;

  history.push(new MoveNodesCommand(moves));
  toast.show({ kind: "success", text: "Auto layout applied" });

  requestAnimationFrame(() => {
    const r = workspaceRoot.getBoundingClientRect();
    camera.fitToScreen(r, store.getState().workflow.nodes);
  });
}

/* ---------- 13. Command Palette ---------- */

function buildCommands() {
  const cmds = [];

  for (const def of getAllNodeDefinitions()) {
    cmds.push({
      label: `Add ${def.label}`,
      hint: def.description || "",
      icon: def.icon,
      shortcut: "",
      run: () => handleAddNode(def),
    });
  }

  cmds.push(
    {
      label: "Run workflow",
      icon: "fa-solid fa-play",
      hint: "Execute the current workflow",
      run: () => runControllerGlobal.run(),
    },
    {
      label: "Stop execution",
      icon: "fa-solid fa-stop",
      hint: "Cancel a running workflow",
      run: () => runControllerGlobal.stop(),
    },
    {
      label: "Undo",
      icon: "fa-solid fa-rotate-left",
      shortcut: "Ctrl+Z",
      run: () => history.undo(),
    },
    {
      label: "Redo",
      icon: "fa-solid fa-rotate-right",
      shortcut: "Ctrl+Shift+Z",
      run: () => history.redo(),
    },
    {
      label: "Save workflow",
      icon: "fa-regular fa-floppy-disk",
      shortcut: "Ctrl+S",
      run: () => {
        saveWorkflow(store.getState());
        toast.show({ kind: "success", text: "Workflow saved" });
      },
    },
    {
      label: "Open templates…",
      icon: "fa-solid fa-shapes",
      run: () => openTemplates(),
    },
    {
      label: "Auto layout",
      icon: "fa-solid fa-wand-magic-sparkles",
      run: () => runAutoLayout(),
    },
    {
      label: "Reset view",
      icon: "fa-solid fa-rotate-left",
      run: () => camera.reset(),
    },
    {
      label: "Fit to screen",
      icon: "fa-solid fa-expand",
      run: () => {
        const r = workspaceRoot.getBoundingClientRect();
        camera.fitToScreen(r, store.getState().workflow.nodes);
      },
    },
  );

  return cmds;
}

const commandPalette = createCommandPalette({
  rootEl: app,
  commands: buildCommands(),
});

/* ---------- 14. Focus Mode (R11) ---------- */

const focusMode = attachFocusMode({
  app,
  leftSidebar,
  rightSidebar,
});

/* ---------- 15. Top bar ---------- */

const topBar = createTopBar(store, {
  camera,
  workspaceEl: workspaceRoot,
  history,
  toast,
  rootEl: app,
  commandPalette,
  runController: runControllerGlobal,
  onOpenTemplates: openTemplates,
  onSwitchWorkflow: (id) => switchWorkflow(id),
  onAutoLayout: runAutoLayout,
  onToggleFocus: () => focusMode.toggle(),
});

middle.append(leftSidebar, workspaceRoot, rightSidebar);
app.append(topBar, middle);

/* ---------- 16. Renderers ---------- */

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

/* ---------- 17. Panels over workspace ---------- */

const validationBanner = createValidationBanner({
  store,
  onFocusIssue: (issue) =>
    focusIssue({ store, camera, workspaceEl: workspaceRoot }, issue),
});
workspaceRoot.appendChild(validationBanner);

const executionPanel = createExecutionPanel({
  store,
  onFocusNode: (nodeId) =>
    focusExecutionNode({ store, camera, workspaceEl: workspaceRoot }, nodeId),
});
workspaceRoot.appendChild(executionPanel);

/* ---------- 18. Mini Map (R11) ---------- */

const miniMap = createMiniMap({
  store,
  camera,
  workspaceEl: workspaceRoot,
});
workspaceRoot.appendChild(miniMap);

/* ---------- 19. Interactions ---------- */

attachNodeSelection({ workspaceEl: workspaceRoot, store });
attachEdgeSelection({ workspaceEl: workspaceRoot, store });
attachRectangleSelection({
  workspaceEl: workspaceRoot,
  viewportEl: viewport,
  store,
  camera,
});
attachNodeDrag({ workspaceEl: workspaceRoot, store, history, camera });
attachPan({ workspaceEl: workspaceRoot, camera, store });
attachZoom({ workspaceEl: workspaceRoot, camera });
attachConnectionDrag({
  workspaceEl: workspaceRoot,
  viewportEl: viewport,
  edgesLayerEl: edgesLayer,
  store,
  history,
});
attachKeyboardShortcuts({ store, history });
attachValidation(store);

/* ---------- 20. Context menu ---------- */

attachContextMenu({
  workspaceEl: workspaceRoot,
  store,
  history,
  camera,
  commandPalette,
});

/* ---------- 21. Auto-save ---------- */

attachAutosave(store, {
  onSaved: (payload) => {
    if (payload?.metadata) registerProject(payload.metadata);
  },
  onError: (err) => {
    toast.show({ kind: "error", text: `Auto-save failed: ${err}` });
  },
});

/* ---------- 22. Register current project ---------- */

registerProject(store.getState().workflow.metadata);

/* ---------- 23. Seed if empty ---------- */

{
  const { workflow } = store.getState();
  if (workflow.nodes.length === 0) {
    const startDef = getNodeDefinition("start");
    if (startDef) {
      const startNode = createNode(startDef, { x: 320, y: 220 });
      store.setState({
        workflow: {
          ...workflow,
          nodes: addNode(workflow.nodes, startNode),
        },
      });
    }
  }
}

/* ---------- 24. Ctrl+K shortcut ---------- */

window.addEventListener("keydown", (e) => {
  const mod = e.ctrlKey || e.metaKey;
  if (mod && e.key.toLowerCase() === "k") {
    e.preventDefault();
    commandPalette.open();
  }
});

/* ---------- 25. First paint ---------- */

renderAll(store.getState());

/* ---------- 26. Mock mode ---------- */

{
  const params = new URLSearchParams(window.location.search);
  if (params.get("mock") === "1") {
    setMockMode(true);
    console.info("[PoyberFlow] Mock mode enabled via ?mock=1");
  }
}

/* ---------- 27. Dev helpers ---------- */

if (import.meta?.url) {
  window.__poyberflow = {
    store,
    history,
    camera,
    setMockMode,
    isMockMode,
  };
}
