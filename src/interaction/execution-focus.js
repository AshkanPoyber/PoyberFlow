/* ============================================================
   Execution Focus — focus a node when clicking a log entry.
   ============================================================ */

import { findNode } from "../graph/graph.js";

export function focusExecutionNode({ store, camera, workspaceEl }, nodeId) {
  if (!nodeId) return;
  const { workflow } = store.getState();
  const node = findNode(workflow.nodes, nodeId);
  if (!node) return;

  store.setState({
    selection: { nodeIds: [node.id], edgeIds: [] },
  });

  const rect = workspaceEl.getBoundingClientRect();
  const NODE_WIDTH = 220;
  const NODE_HEIGHT = 80;
  const { zoom } = camera.get();

  const nodeCenterX = node.position.x + NODE_WIDTH / 2;
  const nodeCenterY = node.position.y + NODE_HEIGHT / 2;

  const x = rect.width / 2 - nodeCenterX * zoom;
  const y = rect.height / 2 - nodeCenterY * zoom;

  camera.set({ x, y, zoom });
}
