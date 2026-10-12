/* ============================================================
   Workflow Validator — headless.

   Input:  { nodes, edges }
   Output: { errors: [...], warnings: [...], ok: boolean }

   Every issue has:
     {
       id: string,        // stable identifier for focus
       level: 'error' | 'warning',
       message: string,
       nodeId?: string,   // optional — issue attached to a node
       edgeId?: string,   // optional — issue attached to an edge
     }

   Rules:
     - Node definitions may define `validate(node)` returning
       a string; that string becomes an error.
     - Structural rules (start node, reachability, orphans,
       unconnected outputs, IF branches, cycles) are here.
   ============================================================ */

import { getNodeDefinition } from "../nodes/registry.js";
import { NODE_TYPES } from "../core/constants.js";

export function validateWorkflow(workflow) {
  const issues = [];

  const nodes = workflow.nodes || [];
  const edges = workflow.edges || [];
  const nodeById = new Map(nodes.map((n) => [n.id, n]));

  /* ---------- 1. Start node presence ---------- */

  const startNodes = nodes.filter((n) => n.type === NODE_TYPES.START);
  if (startNodes.length === 0) {
    issues.push({
      id: "no-start",
      level: "error",
      message: "Workflow has no Start node.",
    });
  } else if (startNodes.length > 1) {
    for (const n of startNodes.slice(1)) {
      issues.push({
        id: `multi-start-${n.id}`,
        level: "error",
        message: "Only one Start node is allowed.",
        nodeId: n.id,
      });
    }
  }

  /* ---------- 2. Per-node config validation ---------- */

  for (const node of nodes) {
    const def = getNodeDefinition(node.type);
    if (!def) {
      issues.push({
        id: `unknown-type-${node.id}`,
        level: "error",
        message: `Unknown node type: ${node.type}`,
        nodeId: node.id,
      });
      continue;
    }

    if (typeof def.validate === "function") {
      const msg = def.validate(node);
      if (msg) {
        issues.push({
          id: `config-${node.id}`,
          level: "error",
          message: `${def.label}: ${msg}`,
          nodeId: node.id,
        });
      }
    }
  }

  /* ---------- 3. Edge endpoint integrity ---------- */

  for (const edge of edges) {
    if (!nodeById.has(edge.source)) {
      issues.push({
        id: `edge-src-${edge.id}`,
        level: "error",
        message: `Edge references missing source (${edge.source}).`,
        edgeId: edge.id,
      });
    }
    if (!nodeById.has(edge.target)) {
      issues.push({
        id: `edge-tgt-${edge.id}`,
        level: "error",
        message: `Edge references missing target (${edge.target}).`,
        edgeId: edge.id,
      });
    }
  }

  /* ---------- 4. Orphan nodes (no connections) ---------- */

  // Start node is allowed to have no inputs (by design).
  // Everything else with no edges is a warning.
  const connectionCount = new Map();
  for (const n of nodes) connectionCount.set(n.id, 0);
  for (const e of edges) {
    if (connectionCount.has(e.source)) {
      connectionCount.set(e.source, connectionCount.get(e.source) + 1);
    }
    if (connectionCount.has(e.target)) {
      connectionCount.set(e.target, connectionCount.get(e.target) + 1);
    }
  }

  for (const node of nodes) {
    if (node.type === NODE_TYPES.START) continue;
    if ((connectionCount.get(node.id) || 0) === 0) {
      issues.push({
        id: `orphan-${node.id}`,
        level: "warning",
        message: `${node.type.toUpperCase()} node is not connected to anything.`,
        nodeId: node.id,
      });
    }
  }

  /* ---------- 5. Unconnected outputs ---------- */

  const outgoingByNode = new Map();
  for (const e of edges) {
    if (!outgoingByNode.has(e.source)) outgoingByNode.set(e.source, []);
    outgoingByNode.get(e.source).push(e);
  }

  for (const node of nodes) {
    const def = getNodeDefinition(node.type);
    if (!def || !def.outputs || def.outputs.length === 0) continue;

    const outgoing = outgoingByNode.get(node.id) || [];
    const connectedHandles = new Set(outgoing.map((e) => e.sourceHandle));

    for (const handle of def.outputs) {
      // IF requires explicit branch selection — warn if a branch is dangling.
      const isIfBranch = node.type === NODE_TYPES.IF;
      const shouldWarn = isIfBranch
        ? !connectedHandles.has(handle.id)
        : outgoing.length === 0;

      if (shouldWarn) {
        issues.push({
          id: `output-open-${node.id}-${handle.id}`,
          level: "warning",
          message: isIfBranch
            ? `IF branch "${handle.label}" is not connected.`
            : `${def.label} output is not connected.`,
          nodeId: node.id,
        });
      }
    }
  }

  /* ---------- 6. Reachability from Start ---------- */

  if (startNodes.length >= 1) {
    const reachable = new Set();
    const stack = [startNodes[0].id];

    while (stack.length) {
      const id = stack.pop();
      if (reachable.has(id)) continue;
      reachable.add(id);
      for (const e of edges) {
        if (e.source === id && !reachable.has(e.target)) {
          stack.push(e.target);
        }
      }
    }

    for (const node of nodes) {
      if (node.type === NODE_TYPES.START) continue;
      if (!reachable.has(node.id)) {
        issues.push({
          id: `unreachable-${node.id}`,
          level: "warning",
          message: `${node.type.toUpperCase()} node is not reachable from Start.`,
          nodeId: node.id,
        });
      }
    }

    // Output nodes should be reachable too — treat that as an error.
    const outputNodes = nodes.filter((n) => n.type === NODE_TYPES.OUTPUT);
    if (outputNodes.length === 0) {
      issues.push({
        id: "no-output",
        level: "warning",
        message: "Workflow has no Output node.",
      });
    } else {
      for (const n of outputNodes) {
        if (!reachable.has(n.id)) {
          issues.push({
            id: `output-unreachable-${n.id}`,
            level: "error",
            message: "Output node is not reachable from Start.",
            nodeId: n.id,
          });
        }
      }
    }
  }

  /* ---------- 7. Cycle detection (warning only) ---------- */

  const cycles = findCycles(nodes, edges);
  if (cycles.length > 0) {
    const involved = new Set();
    for (const cycle of cycles) for (const id of cycle) involved.add(id);

    for (const id of involved) {
      issues.push({
        id: `cycle-${id}`,
        level: "warning",
        message: "Node is part of a cycle — execution will stop at the loop.",
        nodeId: id,
      });
    }
  }

  /* ---------- Result ---------- */

  const errors = issues.filter((i) => i.level === "error");
  const warnings = issues.filter((i) => i.level === "warning");

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    issues,
  };
}

/* ============================================================
   Cycle detection (DFS with a recursion stack)

   Returns an array of cycles, each cycle being an array of node
   IDs. Duplicate cycles are collapsed by sorted-ID signature.
   ============================================================ */

function findCycles(nodes, edges) {
  const adjacency = new Map();
  for (const n of nodes) adjacency.set(n.id, []);
  for (const e of edges) {
    if (adjacency.has(e.source) && adjacency.has(e.target)) {
      adjacency.get(e.source).push(e.target);
    }
  }

  const visited = new Set();
  const stack = new Set();
  const path = [];
  const found = new Map(); // signature -> cycle

  function dfs(id) {
    if (stack.has(id)) {
      const startIndex = path.indexOf(id);
      if (startIndex >= 0) {
        const cycle = path.slice(startIndex);
        const signature = [...cycle].sort().join(",");
        if (!found.has(signature)) found.set(signature, cycle);
      }
      return;
    }
    if (visited.has(id)) return;

    visited.add(id);
    stack.add(id);
    path.push(id);

    for (const next of adjacency.get(id) || []) dfs(next);

    stack.delete(id);
    path.pop();
  }

  for (const n of nodes) dfs(n.id);

  return [...found.values()];
}
