/* ============================================================
   Node Renderer — renders a single node element.

   Rules:
   - Reads from a node object + its definition.
   - Uses CSS variables for accent per node type.
   - Never mutates state.
   - Selection is driven by `state.selection.nodeIds`.
   ============================================================ */

import { el, clear } from "../../utils/dom.js";
import { NODE_WIDTH } from "../../core/constants.js";
import { getNodeDefinition } from "../../nodes/registry.js";

export function createNodeElement(node) {
  const def = getNodeDefinition(node.type);
  if (!def) {
    return el("div", {}, `Unknown node type: ${node.type}`);
  }

  const accent = def.accentVar ? `var(${def.accentVar})` : "var(--color-brand)";

  const root = el("div", {
    class: "absolute select-none group",
    dataset: { nodeId: node.id },
    style: {
      left: `${node.position.x}px`,
      top: `${node.position.y}px`,
      width: `${NODE_WIDTH}px`,
      // Let drag layer override cursor.
      cursor: "grab",
    },
  });

  // Card
  const card = el("div", {
    class:
      "rounded-node border border-border bg-surface shadow-node transition-all duration-150 overflow-hidden",
  });

  // Header
  const header = el(
    "div",
    {
      class:
        "flex items-center gap-2 px-3 py-2 border-b border-border bg-elevated",
    },
    [
      el(
        "div",
        {
          class: "w-6 h-6 rounded-md flex items-center justify-center",
          style: {
            backgroundColor:
              "color-mix(in srgb, " + accent + " 15%, transparent)",
            color: accent,
          },
        },
        [el("i", { class: `${def.icon} text-[11px]` })],
      ),
      el("div", { class: "flex-1 min-w-0" }, [
        el(
          "div",
          {
            class:
              "text-[12.5px] font-medium text-primary leading-tight truncate",
          },
          def.label,
        ),
      ]),
    ],
  );

  // Body
  const body = el("div", { class: "px-3 py-2.5" });
  if (typeof def.renderBody === "function") {
    def.renderBody(node, body);
  } else {
    body.appendChild(
      el("div", { class: "text-[12px] text-secondary" }, def.description || ""),
    );
  }

  card.appendChild(header);
  card.appendChild(body);
  root.appendChild(card);

  return root;
}

/**
 * Reconcile a nodes layer against the current graph.
 * Only creates/removes/updates what changed.
 */
export function createNodesRenderer(nodesLayer) {
  const elements = new Map(); // nodeId -> element

  return function render(state) {
    const { nodes } = state.workflow;
    const selected = new Set(state.selection.nodeIds);
    const seen = new Set();

    for (const node of nodes) {
      seen.add(node.id);
      let nodeEl = elements.get(node.id);

      if (!nodeEl) {
        nodeEl = createNodeElement(node);
        elements.set(node.id, nodeEl);
        nodesLayer.appendChild(nodeEl);
      } else {
        // Reposition if changed
        nodeEl.style.left = `${node.position.x}px`;
        nodeEl.style.top = `${node.position.y}px`;
      }

      // Selection state
      const card = nodeEl.firstElementChild;
      const isSelected = selected.has(node.id);
      card.classList.toggle("shadow-node-selected", isSelected);
      card.classList.toggle("shadow-node", !isSelected);
    }

    // Remove stale nodes
    for (const [id, nodeEl] of elements) {
      if (!seen.has(id)) {
        nodeEl.remove();
        elements.delete(id);
      }
    }
  };
}
