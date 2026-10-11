/* ============================================================
   Keyboard Shortcuts

   Centralised handler for all global shortcuts. Delegates to
   commands and the store. Does NOT contain undo/redo logic —
   history is the source of truth.
   ============================================================ */

import { DeleteSelectionCommand } from "../history/commands/delete-selection-command.js";
import { DuplicateCommand } from "../history/commands/duplicate-command.js";
import { AddNodeCommand } from "../history/commands/add-node-command.js";
import { createNode } from "../graph/node-factory.js";
import { getNodeDefinition } from "../nodes/registry.js";
import { findNode, addNode, removeNode } from "../graph/graph.js";
import { addEdge, removeEdge, createEdge } from "../graph/edge.js";
import {
  setClipboard,
  getClipboard,
  hasClipboard,
} from "../utils/clipboard.js";
import { createNodeId } from "../utils/id.js";

function isTypingTarget(target) {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.isContentEditable
  );
}

export function attachKeyboardShortcuts({ store, history }) {
  window.addEventListener("keydown", (event) => {
    if (isTypingTarget(event.target)) return;

    const mod = event.ctrlKey || event.metaKey;

    /* ---------- Undo / Redo ---------- */
    if (mod && !event.shiftKey && event.key.toLowerCase() === "z") {
      event.preventDefault();
      history.undo();
      return;
    }
    if (
      (mod && event.shiftKey && event.key.toLowerCase() === "z") ||
      (mod && event.key.toLowerCase() === "y")
    ) {
      event.preventDefault();
      history.redo();
      return;
    }

    /* ---------- Copy ---------- */
    if (mod && event.key.toLowerCase() === "c") {
      const { selection, workflow } = store.getState();
      if (selection.nodeIds.length === 0) return;
      event.preventDefault();

      const nodes = selection.nodeIds
        .map((id) => findNode(workflow.nodes, id))
        .filter(Boolean);

      const selectedSet = new Set(selection.nodeIds);
      const internalEdges = workflow.edges.filter(
        (e) => selectedSet.has(e.source) && selectedSet.has(e.target),
      );

      setClipboard({ nodes, edges: internalEdges });
      return;
    }

    /* ---------- Paste ---------- */
    if (mod && event.key.toLowerCase() === "v") {
      if (!hasClipboard()) return;
      event.preventDefault();

      const payload = getClipboard();
      const offset = { x: 30, y: 30 };
      const cmd = buildPasteCommand(payload, offset);
      if (cmd) history.push(cmd);
      return;
    }

    /* ---------- Duplicate ---------- */
    if (mod && event.key.toLowerCase() === "d") {
      const { selection, workflow } = store.getState();
      if (selection.nodeIds.length === 0) return;
      event.preventDefault();

      const nodes = selection.nodeIds
        .map((id) => findNode(workflow.nodes, id))
        .filter(Boolean);
      if (nodes.length === 0) return;

      history.push(
        new DuplicateCommand(nodes, workflow.edges, { x: 30, y: 30 }),
      );
      return;
    }

    /* ---------- Select All ---------- */
    if (mod && event.key.toLowerCase() === "a") {
      event.preventDefault();
      const { workflow } = store.getState();
      store.setState({
        selection: {
          nodeIds: workflow.nodes.map((n) => n.id),
          edgeIds: [],
        },
      });
      return;
    }

    /* ---------- Delete ---------- */
    if (event.key === "Delete" || event.key === "Backspace") {
      const { selection, workflow } = store.getState();
      if (selection.nodeIds.length === 0 && selection.edgeIds.length === 0) {
        return;
      }
      event.preventDefault();

      const nodes = selection.nodeIds
        .map((id) => findNode(workflow.nodes, id))
        .filter(Boolean);
      const selectedNodeSet = new Set(nodes.map((n) => n.id));

      // Collect edges: explicitly selected + those attached to deleted nodes.
      const edgeIdsToDelete = new Set(selection.edgeIds);
      const edgesToDelete = workflow.edges.filter(
        (e) =>
          edgeIdsToDelete.has(e.id) ||
          selectedNodeSet.has(e.source) ||
          selectedNodeSet.has(e.target),
      );

      history.push(
        new DeleteSelectionCommand({
          nodes,
          edges: edgesToDelete,
          previousSelection: selection,
        }),
      );
      return;
    }
  });
}

/* ---------- Paste helper ---------- */

/**
 * Builds a DuplicateCommand-like command that pastes clipboard
 * content with a fresh set of IDs.
 *
 * Reuses DuplicateCommand by generating throwaway "source"
 * objects? No — that would fight the id remapping. Instead we
 * build a small inline command.
 */
function buildPasteCommand(payload, offset) {
  const idMap = new Map();
  const newNodes = payload.nodes.map((n) => {
    const newId = createNodeId();
    idMap.set(n.id, newId);
    return {
      ...n,
      id: newId,
      position: {
        x: n.position.x + offset.x,
        y: n.position.y + offset.y,
      },
      data: { ...n.data },
    };
  });

  const newEdges = payload.edges
    .filter((e) => idMap.has(e.source) && idMap.has(e.target))
    .map((e) =>
      createEdge({
        source: idMap.get(e.source),
        sourceHandle: e.sourceHandle,
        target: idMap.get(e.target),
        targetHandle: e.targetHandle,
      }),
    );

  // Return a Command instance.
  return new (class PasteCommand {
    label = "Paste";
    constructor() {
      this.newNodes = newNodes;
      this.newEdges = newEdges;
      this.previousSelection = null;
    }
    do(store) {
      const { workflow, selection } = store.getState();
      if (!this.previousSelection) {
        this.previousSelection = {
          nodeIds: [...selection.nodeIds],
          edgeIds: [...selection.edgeIds],
        };
      }
      let nodes = workflow.nodes;
      let edges = workflow.edges;
      for (const n of this.newNodes) nodes = addNode(nodes, n);
      for (const e of this.newEdges) edges = addEdge(edges, e);
      store.setState({
        workflow: { ...workflow, nodes, edges },
        selection: {
          nodeIds: this.newNodes.map((n) => n.id),
          edgeIds: [],
        },
      });
    }
    undo(store) {
      const { workflow } = store.getState();
      let nodes = workflow.nodes;
      let edges = workflow.edges;
      for (const n of this.newNodes) nodes = removeNode(nodes, n.id);
      for (const e of this.newEdges) edges = removeEdge(edges, e.id);
      store.setState({
        workflow: { ...workflow, nodes, edges },
        selection: this.previousSelection || { nodeIds: [], edgeIds: [] },
      });
    }
  })();
}
