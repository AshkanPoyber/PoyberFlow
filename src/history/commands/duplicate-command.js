/* ============================================================
   DuplicateCommand — duplicates a set of nodes (and any edges
   whose both endpoints are among them) with a fixed offset.

   The new nodes become the selection after duplication.
   ============================================================ */

import { Command } from "../command.js";
import { addNode, removeNode } from "../../graph/graph.js";
import { addEdge, removeEdge, createEdge } from "../../graph/edge.js";
import { createNodeId } from "../../utils/id.js";

export class DuplicateCommand extends Command {
  label = "Duplicate";

  constructor(sourceNodes, sourceEdges, offset = { x: 30, y: 30 }) {
    super();

    const idMap = new Map();
    this.newNodes = sourceNodes.map((n) => {
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

    const sourceIds = new Set(sourceNodes.map((n) => n.id));
    const internalEdges = sourceEdges.filter(
      (e) => sourceIds.has(e.source) && sourceIds.has(e.target),
    );

    this.newEdges = internalEdges.map((e) =>
      createEdge({
        source: idMap.get(e.source),
        sourceHandle: e.sourceHandle,
        target: idMap.get(e.target),
        targetHandle: e.targetHandle,
      }),
    );

    this.originalSelection = null;
  }

  do(store) {
    const { workflow, selection } = store.getState();
    if (!this.originalSelection) {
      this.originalSelection = {
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
        edgeIds: this.newEdges.map((e) => e.id),
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
      selection: this.originalSelection || { nodeIds: [], edgeIds: [] },
    });
  }
}
