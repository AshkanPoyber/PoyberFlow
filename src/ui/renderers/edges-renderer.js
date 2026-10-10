/* ============================================================
   Edges Renderer — draws edges in an SVG layer.

   The SVG layer sits *inside* the viewport wrapper, so it shares
   the same coordinate system as the nodes. No manual screen↔world
   conversion is needed here.

   Every edge is rendered as:
     <g data-edge-id="...">
       <path class="edge-hitbox" />     (thicker, invisible — for clicks)
       <path class="edge-visible" />    (the actual styled line)
     </g>
   ============================================================ */

import { el } from "../../utils/dom.js";
import { buildBezierPath } from "../../utils/geometry.js";
import { findNode } from "../../graph/graph.js";
import { getNodeDefinition } from "../../nodes/registry.js";

const NODE_WIDTH = 220;
const NODE_HEIGHT_FALLBACK = 80;

/**
 * Measure a node's card in world space.
 * Uses the DOM element to get an accurate height if available.
 */
function measureNodeCard(nodeEl) {
  if (!nodeEl) return { width: NODE_WIDTH, height: NODE_HEIGHT_FALLBACK };
  const card = nodeEl.firstElementChild;
  if (!card) return { width: NODE_WIDTH, height: NODE_HEIGHT_FALLBACK };
  const rect = card.getBoundingClientRect();
  return { width: NODE_WIDTH, height: rect.height / getZoomRatio(card) };
}

function getZoomRatio(/* card */) {
  // We don't actually need zoom here because getBoundingClientRect
  // returns scaled size when transform: scale() is applied.
  // But node.position is in world space, so we divide out the zoom.
  // Simpler: read zoom from the workspace's transform style.
  // For R3, we approximate by using the state viewport through
  // a data attribute set by the viewport renderer.
  const workspace = document.getElementById("workspace-viewport");
  if (!workspace) return 1;
  const match = /scale\(([\d.]+)\)/.exec(workspace.style.transform);
  return match ? parseFloat(match[1]) : 1;
}

/**
 * Compute edge endpoints in world space.
 */
function computeEdgeEndpoints(edge, workflow, nodeEls) {
  const sourceNode = findNode(workflow.nodes, edge.source);
  const targetNode = findNode(workflow.nodes, edge.target);
  if (!sourceNode || !targetNode) return null;

  const sourceDef = getNodeDefinition(sourceNode.type);
  const targetDef = getNodeDefinition(targetNode.type);
  if (!sourceDef || !targetDef) return null;

  const sourceHandle =
    sourceDef.outputs.find((h) => h.id === edge.sourceHandle) ||
    sourceDef.outputs[0];
  const targetHandle =
    targetDef.inputs.find((h) => h.id === edge.targetHandle) ||
    targetDef.inputs[0];
  if (!sourceHandle || !targetHandle) return null;

  const sourceSize = measureNodeCard(nodeEls.get(sourceNode.id));
  const targetSize = measureNodeCard(nodeEls.get(targetNode.id));

  const sourcePos = handlePos(
    sourceNode,
    sourceDef.outputs,
    sourceHandle,
    sourceSize,
  );
  const targetPos = handlePos(
    targetNode,
    targetDef.inputs,
    targetHandle,
    targetSize,
  );

  return { x1: sourcePos.x, y1: sourcePos.y, x2: targetPos.x, y2: targetPos.y };
}

function handlePos(node, list, handle, size) {
  const layoutTop = 8;
  const gap = 22;
  const index = list.findIndex((h) => h.id === handle.id);
  const top = layoutTop + index * gap + gap / 2;
  const isInput =
    list === node.inputs || (node.inputs && node.inputs.includes(handle));
  const x = isInput ? node.position.x : node.position.x + size.width;
  const y = node.position.y + top;
  return { x, y };
}

/**
 * Look up the accent color for a node type (used to color edges).
 */
function accentFor(node) {
  const def = getNodeDefinition(node.type);
  if (!def || !def.accentVar) return "var(--color-brand)";
  return `var(${def.accentVar})`;
}

/* ---------- SVG helpers ---------- */

const SVG_NS = "http://www.w3.org/2000/svg";

function svgEl(tag, attrs = {}) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null) continue;
    node.setAttribute(k, String(v));
  }
  return node;
}

/* ---------- Renderer ---------- */

export function createEdgesRenderer(edgesLayerEl, nodeElementsRef) {
  const elements = new Map(); // edgeId -> <g>

  return function render(state) {
    const { edges, nodes } = state.workflow;
    const selected = new Set(state.selection.edgeIds);
    const seen = new Set();

    // Only consider edges whose endpoints both exist.
    for (const edge of edges) {
      const endpoints = computeEdgeEndpoints(
        edge,
        state.workflow,
        nodeElementsRef.current,
      );
      if (!endpoints) continue;

      seen.add(edge.id);
      let group = elements.get(edge.id);

      if (!group) {
        group = svgEl("g", { "data-edge-id": edge.id });

        const hit = svgEl("path", {
          class: "edge-hitbox",
          fill: "none",
          stroke: "transparent",
          "stroke-width": 16,
          "stroke-linecap": "round",
        });
        const visible = svgEl("path", {
          class: "edge-visible",
          fill: "none",
          "stroke-width": 2,
          "stroke-linecap": "round",
        });

        group.appendChild(hit);
        group.appendChild(visible);
        edgesLayerEl.appendChild(group);
        elements.set(edge.id, group);
      }

      const sourceNode = findNode(nodes, edge.source);
      const color = sourceNode ? accentFor(sourceNode) : "var(--color-brand)";
      const isSelected = selected.has(edge.id);

      const visible = group.querySelector(".edge-visible");
      const hit = group.querySelector(".edge-hitbox");

      const d = buildBezierPath(
        endpoints.x1,
        endpoints.y1,
        endpoints.x2,
        endpoints.y2,
      );

      visible.setAttribute("d", d);
      visible.setAttribute("stroke", color);
      visible.setAttribute("stroke-width", isSelected ? 3 : 2);
      visible.style.opacity = isSelected ? "1" : "0.85";

      hit.setAttribute("d", d);

      group.classList.toggle("is-selected", isSelected);
    }

    // Remove stale edges
    for (const [id, group] of elements) {
      if (!seen.has(id)) {
        group.remove();
        elements.delete(id);
      }
    }
  };
}
