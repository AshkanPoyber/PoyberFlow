/* ============================================================
   Edges Renderer — draws edges in an SVG layer.

   Runtime states (active / success / error) come from
   state.runtime.edgeStates and drive the class names on each
   edge group, so the visual layer stays purely declarative.
   ============================================================ */

import { el } from "../../utils/dom.js";
import { buildBezierPath } from "../../utils/geometry.js";
import { findNode } from "../../graph/graph.js";
import { getNodeDefinition } from "../../nodes/registry.js";

const NODE_WIDTH = 220;
const NODE_HEIGHT_FALLBACK = 80;

/* ---------- Handle position math ---------- */

function handlePos(node, def, handleId, kind, size) {
  const list = kind === "input" ? def.inputs : def.outputs;
  const layoutTop = 8;
  const gap = 22;
  const index = list.findIndex((h) => h.id === handleId);
  const top = layoutTop + (index >= 0 ? index : 0) * gap + gap / 2;
  const x = kind === "input" ? node.position.x : node.position.x + size.width;
  const y = node.position.y + top;
  return { x, y };
}

function computeEdgeEndpoints(edge, workflow, nodeEls) {
  const sourceNode = findNode(workflow.nodes, edge.source);
  const targetNode = findNode(workflow.nodes, edge.target);
  if (!sourceNode || !targetNode) return null;

  const sourceDef = getNodeDefinition(sourceNode.type);
  const targetDef = getNodeDefinition(targetNode.type);
  if (!sourceDef || !targetDef) return null;

  const sourceSize = measureNodeCard(nodeEls.get(sourceNode.id));
  const targetSize = measureNodeCard(nodeEls.get(targetNode.id));

  const sourcePos = handlePos(
    sourceNode,
    sourceDef,
    edge.sourceHandle || sourceDef.outputs[0]?.id,
    "output",
    sourceSize,
  );
  const targetPos = handlePos(
    targetNode,
    targetDef,
    edge.targetHandle || targetDef.inputs[0]?.id,
    "input",
    targetSize,
  );

  return { x1: sourcePos.x, y1: sourcePos.y, x2: targetPos.x, y2: targetPos.y };
}

function measureNodeCard(nodeEl) {
  if (!nodeEl) return { width: NODE_WIDTH, height: NODE_HEIGHT_FALLBACK };
  const card = nodeEl.firstElementChild;
  if (!card) return { width: NODE_WIDTH, height: NODE_HEIGHT_FALLBACK };
  const rect = card.getBoundingClientRect();
  return { width: NODE_WIDTH, height: rect.height };
}

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
    const edgeStates = state.runtime?.edgeStates || {};
    const seen = new Set();

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
      const runtimeStatus = edgeStates[edge.id]?.status || null;

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
      group.classList.toggle("is-active", runtimeStatus === "active");
      group.classList.toggle("is-success", runtimeStatus === "success");
      group.classList.toggle("is-error", runtimeStatus === "error");
    }

    for (const [id, group] of elements) {
      if (!seen.has(id)) {
        group.remove();
        elements.delete(id);
      }
    }
  };
}
