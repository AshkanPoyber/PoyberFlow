/* ============================================================
   Validation Focus — when a user clicks an issue in the
   validation banner, select the target node and center it in
   the current viewport.
   ============================================================ */

import { findNode } from "../graph/graph.js";

export function focusIssue({ store, camera, workspaceEl }, issue) {
  if (!issue) return;

  const { workflow } = store.getState();

  if (issue.nodeId) {
    const node = findNode(workflow.nodes, issue.nodeId);
    if (!node) return;

    // Select the node
    store.setState({
      selection: { nodeIds: [node.id], edgeIds: [] },
    });

    // Center the camera on the node
    const rect = workspaceEl.getBoundingClientRect();
    const NODE_WIDTH = 220;
    const NODE_HEIGHT = 80;
    const { zoom } = camera.get();

    const nodeCenterX = node.position.x + NODE_WIDTH / 2;
    const nodeCenterY = node.position.y + NODE_HEIGHT / 2;

    const x = rect.width / 2 - nodeCenterX * zoom;
    const y = rect.height / 2 - nodeCenterY * zoom;

    camera.set({ x, y, zoom });
    return;
  }

  if (issue.edgeId) {
    store.setState({
      selection: { nodeIds: [], edgeIds: [issue.edgeId] },
    });
  }
}
