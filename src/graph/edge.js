/* ============================================================
   Edge helpers — pure data operations on edges.
   No DOM. No store.
   ============================================================ */

import { createEdgeId } from "../utils/id.js";

export function createEdge({ source, sourceHandle, target, targetHandle }) {
  return {
    id: createEdgeId(),
    source,
    sourceHandle,
    target,
    targetHandle,
  };
}

export function addEdge(edges, edge) {
  return [...edges, edge];
}

export function removeEdge(edges, edgeId) {
  return edges.filter((e) => e.id !== edgeId);
}

export function findEdge(edges, edgeId) {
  return edges.find((e) => e.id === edgeId) || null;
}

export function removeEdgesForNode(edges, nodeId) {
  return edges.filter((e) => e.source !== nodeId && e.target !== nodeId);
}

export function edgesForNode(edges, nodeId) {
  return edges.filter((e) => e.source === nodeId || e.target === nodeId);
}

/**
 * Prevent duplicates: same source/sourceHandle/target/targetHandle.
 */
export function edgeExists(edges, edge) {
  return edges.some(
    (e) =>
      e.source === edge.source &&
      e.sourceHandle === edge.sourceHandle &&
      e.target === edge.target &&
      e.targetHandle === edge.targetHandle,
  );
}
