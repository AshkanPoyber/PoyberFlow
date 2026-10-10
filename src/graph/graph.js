/* ============================================================
   Graph — pure data helpers.
   No DOM. No store. No side effects on inputs.
   ============================================================ */

export function addNode(nodes, node) {
  return [...nodes, node];
}

export function removeNode(nodes, nodeId) {
  return nodes.filter((n) => n.id !== nodeId);
}

export function updateNode(nodes, nodeId, patch) {
  return nodes.map((n) => (n.id === nodeId ? { ...n, ...patch } : n));
}

export function findNode(nodes, nodeId) {
  return nodes.find((n) => n.id === nodeId) || null;
}

export function moveNode(nodes, nodeId, position) {
  return updateNode(nodes, nodeId, { position });
}

/* ---------- Edge helpers are in edge.js ---------- */
export {
  addEdge,
  removeEdge,
  findEdge,
  removeEdgesForNode,
  edgesForNode,
  edgeExists,
} from "./edge.js";
