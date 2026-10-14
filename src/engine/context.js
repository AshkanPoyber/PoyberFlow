/* ============================================================
   Execution Context — a per-run object that carries data
   between nodes.

   Shape:
     {
       executionId: string,
       variables: {},     // user-defined, reserved for later
       results: {},       // nodeId -> { output, data }
       lastNodeId: string|null,
       startedAt: number,
       abortSignal: AbortSignal,
     }

   The context is passed to each node's execute(node, context)
   and is the ONLY sanctioned way for nodes to read results of
   previous nodes.
   ============================================================ */

import { createNodeId } from "../utils/id.js";

export function createExecutionContext(abortSignal) {
  return {
    executionId: createNodeId().replace("node-", "exec-"),
    variables: {},
    results: {},
    lastNodeId: null,
    startedAt: Date.now(),
    abortSignal,
  };
}

export function recordResult(context, nodeId, { output, data }) {
  context.results[nodeId] = { output, data };
  context.lastNodeId = nodeId;
}

export function getResult(context, nodeId) {
  return context.results[nodeId] || null;
}

export function getLastResult(context) {
  if (!context.lastNodeId) return null;
  return context.results[context.lastNodeId] || null;
}
