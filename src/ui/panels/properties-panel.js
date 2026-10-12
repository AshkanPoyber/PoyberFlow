/* ============================================================
   Properties Panel

   Renders the configuration UI for the currently selected node.
   Uses the node definition's `renderConfig(node, container, onChange)`
   hook, so the panel itself stays fully generic.

   Behaviour:
   - 1 node selected → render its config form
   - N nodes selected → summary + bulk actions
   - 0 nodes selected → empty state
   ============================================================ */

import { el, clear } from "../../utils/dom.js";
import { findNode } from "../../graph/graph.js";
import { getNodeDefinition } from "../../nodes/registry.js";
import { EditNodeDataCommand } from "../../history/commands/edit-node-data-command.js";
import { DeleteSelectionCommand } from "../../history/commands/delete-selection-command.js";
import { Field } from "./forms/index.js";

/* ---------- Empty states ---------- */

function emptyState() {
  return el("div", { class: "properties-empty" }, [
    el("div", { class: "properties-empty-icon" }, [
      el("i", { class: "fa-solid fa-sliders text-[13px]" }),
    ]),
    el("div", { class: "properties-empty-title" }, "No selection"),
    el(
      "div",
      { class: "properties-empty-desc" },
      "Select a node to view and edit its properties.",
    ),
  ]);
}

function multiSelectionState({ count, onDelete }) {
  return el("div", { class: "properties-multi" }, [
    el("div", { class: "properties-empty-icon" }, [
      el("i", { class: "fa-solid fa-layer-group text-[13px]" }),
    ]),
    el("div", { class: "properties-empty-title" }, `${count} nodes selected`),
    el(
      "div",
      { class: "properties-empty-desc" },
      "Select a single node to edit its properties.",
    ),
    el(
      "button",
      {
        type: "button",
        class: "btn-danger-soft mt-3",
        onclick: onDelete,
      },
      [
        el("i", { class: "fa-regular fa-trash-can text-[11px]" }),
        el("span", {}, "Delete selection"),
      ],
    ),
  ]);
}

/* ---------- Node config form ---------- */

function nodeConfigState({ node, definition, store, history }) {
  const container = el("div", { class: "properties-form" });

  // Header
  const header = el("div", { class: "properties-header" }, [
    el("div", { class: "properties-header-icon" }, [
      el("i", { class: `${definition.icon} text-[12px]` }),
    ]),
    el(
      "div",
      { class: "flex-1 min-w-0" },
      [
        el("div", { class: "properties-header-title" }, definition.label),
        definition.description
          ? el(
              "div",
              { class: "properties-header-desc" },
              definition.description,
            )
          : null,
      ].filter(Boolean),
    ),
  ]);
  container.appendChild(header);

  // Form body — populated by the definition
  const formBody = el("div", { class: "properties-body" });

  function commit(nextData) {
    const current = findNode(store.getState().workflow.nodes, node.id);
    if (!current) return;
    if (shallowEqual(current.data, nextData)) return;
    history.push(new EditNodeDataCommand(node.id, current.data, nextData));
  }

  /**
   * onChange is passed to the node definition.
   * The definition calls it with a *partial* data patch, and we
   * merge it with the node's current data before committing.
   */
  function onChange(patch) {
    const current = findNode(store.getState().workflow.nodes, node.id);
    if (!current) return;
    const nextData = { ...current.data, ...patch };
    commit(nextData);
  }

  definition.renderConfig(node, formBody, onChange);
  container.appendChild(formBody);

  // Inline validation
  const validationError = definition.validate?.(node);
  if (validationError) {
    const errorBar = el("div", { class: "properties-validation" }, [
      el("i", { class: "fa-solid fa-triangle-exclamation text-[10px]" }),
      el("span", {}, validationError),
    ]);
    container.appendChild(errorBar);
  }

  return container;
}

function shallowEqual(a, b) {
  if (a === b) return true;
  if (!a || !b) return false;
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  for (const k of ka) {
    if (a[k] !== b[k]) return false;
  }
  return true;
}

/* ---------- Panel factory ---------- */

export function createPropertiesPanel({ store, history }) {
  const root = el("div", { class: "properties-root" });

  let lastSignature = "";

  function render() {
    const state = store.getState();
    const { nodeIds, edgeIds } = state.selection;

    // Build a signature so we only re-render when needed.
    const sig = [
      nodeIds.join(","),
      edgeIds.join(","),
      nodeIds.length === 1
        ? JSON.stringify(findNode(state.workflow.nodes, nodeIds[0])?.data || {})
        : "",
    ].join("|");

    if (sig === lastSignature) return;
    lastSignature = sig;

    clear(root);

    // Case 1: no selection
    if (nodeIds.length === 0 && edgeIds.length === 0) {
      root.appendChild(emptyState());
      return;
    }

    // Case 2: single node
    if (nodeIds.length === 1) {
      const node = findNode(state.workflow.nodes, nodeIds[0]);
      const def = node && getNodeDefinition(node.type);
      if (!node || !def) {
        root.appendChild(emptyState());
        return;
      }
      root.appendChild(
        nodeConfigState({
          node,
          definition: def,
          store,
          history,
        }),
      );
      return;
    }

    // Case 3: multiple nodes
    if (nodeIds.length > 1) {
      root.appendChild(
        multiSelectionState({
          count: nodeIds.length,
          onDelete: () => {
            const { workflow } = store.getState();
            const nodes = nodeIds
              .map((id) => findNode(workflow.nodes, id))
              .filter(Boolean);
            const selectedSet = new Set(nodes.map((n) => n.id));
            const edges = workflow.edges.filter(
              (e) => selectedSet.has(e.source) || selectedSet.has(e.target),
            );
            history.push(
              new DeleteSelectionCommand({
                nodes,
                edges,
                previousSelection: store.getState().selection,
              }),
            );
          },
        }),
      );
      return;
    }

    // Case 4: only edges selected
    root.appendChild(emptyState());
  }

  render();
  store.subscribe(render);

  return root;
}
