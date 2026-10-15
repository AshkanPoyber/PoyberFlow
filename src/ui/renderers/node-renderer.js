/* ============================================================
   Node Renderer — renders a single node element.

   Body content is produced by the node definition via
   `getBodyPreview(node)`. This keeps the renderer fully
   generic and lets every node type decide how it looks.
   ============================================================ */

import { el } from "../../utils/dom.js";
import { NODE_WIDTH } from "../../core/constants.js";
import { getNodeDefinition } from "../../nodes/registry.js";
import { renderHandles } from "./handles-renderer.js";

/* ---------- Body preview painters ---------- */

function paintTextBody(body, text) {
  body.appendChild(
    el("div", { class: "text-[12px] text-secondary leading-snug" }, text),
  );
}

function paintEmptyBody(body, text) {
  body.appendChild(
    el(
      "div",
      {
        class: "text-[11.5px] italic text-muted leading-snug",
      },
      text,
    ),
  );
}

function paintHttpBody(body, preview) {
  if (preview.empty) {
    paintEmptyBody(body, "Click to configure URL");
    return;
  }

  const row = el("div", { class: "flex items-center gap-2 min-w-0" }, [
    el(
      "span",
      {
        class:
          "shrink-0 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold tracking-wide",
        style: {
          backgroundColor:
            "color-mix(in srgb, var(--node-http-accent) 18%, transparent)",
          color: "var(--node-http-accent)",
        },
      },
      preview.method,
    ),
    el(
      "span",
      {
        class: "text-[11.5px] font-mono text-secondary truncate min-w-0",
        title: preview.url,
      },
      preview.url,
    ),
  ]);
  body.appendChild(row);
}

function paintIfBody(body, preview) {
  if (preview.empty) {
    paintEmptyBody(body, "Click to set a condition");
    return;
  }
  body.appendChild(
    el(
      "div",
      {
        class: "text-[11.5px] font-mono text-secondary leading-snug truncate",
        title: preview.condition,
      },
      preview.condition,
    ),
  );
}

function paintDelayBody(body, preview) {
  if (preview.empty) {
    paintEmptyBody(body, preview.text);
    return;
  }
  body.appendChild(
    el(
      "div",
      {
        class:
          "flex items-center gap-1.5 text-[11.5px] font-mono text-secondary",
      },
      [
        el("i", {
          class: "fa-regular fa-hourglass-half text-[10px] opacity-70",
        }),
        el("span", {}, preview.text),
      ],
    ),
  );
}

function paintBody(body, node, definition) {
  const preview =
    typeof definition.getBodyPreview === "function"
      ? definition.getBodyPreview(node)
      : definition.description || "";

  if (typeof preview === "string") return paintTextBody(body, preview);
  if (!preview) return paintTextBody(body, "");

  switch (preview.kind) {
    case "http":
      return paintHttpBody(body, preview);
    case "if":
      return paintIfBody(body, preview);
    case "delay":
      return paintDelayBody(body, preview);
    default:
      return paintTextBody(body, String(preview.text || ""));
  }
}

/* ---------- Node element ---------- */

export function createNodeElement(node) {
  const def = getNodeDefinition(node.type);
  if (!def) {
    return el("div", {}, `Unknown node type: ${node.type}`);
  }

  const accent = def.accentVar ? `var(${def.accentVar})` : "var(--color-brand)";

  const root = el("div", {
    class: "absolute select-none",
    dataset: { nodeId: node.id },
    style: {
      left: `${node.position.x}px`,
      top: `${node.position.y}px`,
      width: `${NODE_WIDTH}px`,
      cursor: "grab",
    },
  });

  const card = el("div", {
    class:
      "relative rounded-node border border-border bg-surface shadow-node transition-shadow duration-150 overflow-visible",
  });

  // Header
  const header = el(
    "div",
    {
      class:
        "flex items-center gap-2 px-3 py-2 border-b border-border bg-elevated rounded-t-node",
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
  paintBody(body, node, def);

  card.appendChild(header);
  card.appendChild(body);

  // Handles — appended to card so they can extend past its edges
  renderHandles(node, card);

  root.appendChild(card);

  // Error badge — populated by the render loop.
  const badge = el("div", {
    class: "node-badge",
    "aria-hidden": "true",
  });
  badge.appendChild(
    el("i", { class: "fa-solid fa-circle-exclamation text-[9px]" }),
  );
  root.appendChild(badge);

  return root;
}

/* ---------- Nodes layer reconciler ---------- */

export function createNodesRenderer(nodesLayer, nodeElementsRef) {
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
        if (nodeElementsRef) nodeElementsRef.current = elements;
        nodesLayer.appendChild(nodeEl);
        if (nodeElementsRef) nodeElementsRef.current = elements;
      } else {
        nodeEl.style.left = `${node.position.x}px`;
        nodeEl.style.top = `${node.position.y}px`;
      }

      const card = nodeEl.firstElementChild;
      const isSelected = selected.has(node.id);
      card.classList.toggle("shadow-node-selected", isSelected);
      card.classList.toggle("shadow-node", !isSelected);

      // Error badge visibility (driven by validation state)
      const hasError = (state.validation?.errors || []).some(
        (i) => i.nodeId === node.id,
      );
      const hasWarning = (state.validation?.warnings || []).some(
        (i) => i.nodeId === node.id,
      );
      const badgeEl = nodeEl.querySelector(".node-badge");
      if (badgeEl) {
        badgeEl.classList.toggle("is-visible", hasError || hasWarning);
        badgeEl.classList.toggle("is-error", hasError);
        badgeEl.classList.toggle("is-warning", !hasError && hasWarning);
      }

      // Runtime state (drives border color + pulse animation)
      const runtimeState = state.runtime?.nodeStates?.[node.id];
      const runtimeStatus = runtimeState?.status || null;

      const cardEl = nodeEl.firstElementChild;
      if (cardEl) {
        cardEl.classList.remove(
          "node-state-running",
          "node-state-success",
          "node-state-error",
          "node-state-skipped",
        );
        if (runtimeStatus === "running")
          cardEl.classList.add("node-state-running");
        if (runtimeStatus === "success")
          cardEl.classList.add("node-state-success");
        if (runtimeStatus === "error") cardEl.classList.add("node-state-error");
        if (runtimeStatus === "skipped")
          cardEl.classList.add("node-state-skipped");
      }
    }

    for (const [id, nodeEl] of elements) {
      if (!seen.has(id)) {
        nodeEl.remove();
        elements.delete(id);
      }
    }
  };
}
