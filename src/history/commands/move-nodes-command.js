/* ============================================================
   MoveNodesCommand — atomically moves one or more nodes.

   Moves are absolute (from → to per node), not deltas, so
   applying/undoing is idempotent.
   ============================================================ */

import { Command } from "../command.js";
import { moveNode } from "../../graph/graph.js";

export class MoveNodesCommand extends Command {
  label = "Move node(s)";

  constructor(moves) {
    super();
    this.moves = moves.map((m) => ({
      id: m.id,
      from: { ...m.from },
      to: { ...m.to },
    }));
  }

  do(store) {
    applyPositions(
      store,
      this.moves.map((m) => [m.id, m.to]),
    );
  }

  undo(store) {
    applyPositions(
      store,
      this.moves.map((m) => [m.id, m.from]),
    );
  }
}

function applyPositions(store, entries) {
  const { workflow } = store.getState();
  let nodes = workflow.nodes;
  for (const [id, position] of entries) {
    nodes = moveNode(nodes, id, position);
  }
  store.setState({ workflow: { ...workflow, nodes } });
}
