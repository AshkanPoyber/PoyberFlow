/* ============================================================
   Execution Engine — headless orchestrator.

   Contract:
   - Never touches the DOM.
   - Reports progress via the provided callbacks.
   - Uses AbortController for cancellation.
   - Enforces MAX_STEPS to prevent runaway loops.

   Flow:
     validate → find start → loop:
       mark running → execute → record result
       → find outgoing edge for chosen output
       → mark success → next node
     on error: mark error, stop, report
     on end:   mark success/finish
   ============================================================ */

import { NODE_TYPES } from "../core/constants.js";
import { getNodeDefinition } from "../nodes/registry.js";
import { createExecutionContext, recordResult } from "./context.js";
import { validateWorkflow } from "./validator.js";
import { ExecutionError, StepLimitError, CancelledError } from "./errors.js";

const MAX_STEPS = 1000;

export async function executeWorkflow(workflow, options = {}) {
  const {
    onNodeStatus = () => {},
    onLog = () => {},
    onFinish = () => {},
    abortSignal,
  } = options;

  const validation = validateWorkflow(workflow);
  if (!validation.ok) {
    const err = new ExecutionError(
      `Workflow has ${validation.errors.length} error(s); cannot execute.`,
    );
    onFinish({ ok: false, error: err, validation });
    return { ok: false, error: err };
  }

  const startNode = workflow.nodes.find((n) => n.type === NODE_TYPES.START);
  if (!startNode) {
    const err = new ExecutionError("No Start node found.");
    onFinish({ ok: false, error: err });
    return { ok: false, error: err };
  }

  const context = createExecutionContext(abortSignal);
  const nodeById = new Map(workflow.nodes.map((n) => [n.id, n]));

  // Build the "path" map: nodeId → resolved id (for {{start...}} lookups)
  const nodeIdByName = new Map();
  const seenNames = new Set();
  for (const n of workflow.nodes) {
    const def = getNodeDefinition(n.type);
    if (!def) continue;
    const name = n.type;
    if (!seenNames.has(name)) {
      nodeIdByName.set(name, n.id);
      seenNames.add(name);
    }
  }

  let current = startNode;
  let steps = 0;

  onLog({
    level: "info",
    message: `Execution started (${context.executionId})`,
  });

  try {
    while (current) {
      if (abortSignal?.aborted) {
        throw new CancelledError("Execution cancelled");
      }

      steps += 1;
      if (steps > MAX_STEPS) {
        throw new StepLimitError(
          `Execution exceeded ${MAX_STEPS} steps. Possible infinite loop.`,
        );
      }

      const def = getNodeDefinition(current.type);
      if (!def) {
        throw new ExecutionError(`Unknown node type: ${current.type}`, {
          nodeId: current.id,
        });
      }

      onNodeStatus(current.id, "running", { startedAt: Date.now() });
      onLog({
        level: "info",
        nodeId: current.id,
        message: `Running ${def.label}`,
      });

      let result;
      try {
        result = await def.execute(current, context, {
          nodeIdByName,
          workflow,
        });
      } catch (err) {
        if (err instanceof CancelledError) throw err;

        onNodeStatus(current.id, "error", {
          finishedAt: Date.now(),
          error: err.message || String(err),
        });
        onLog({
          level: "error",
          nodeId: current.id,
          message: err.message || String(err),
        });

        throw new ExecutionError(err.message || String(err), {
          nodeId: current.id,
          cause: err,
        });
      }

      recordResult(context, current.id, result);

      onNodeStatus(current.id, "success", {
        finishedAt: Date.now(),
        output: result.output,
      });
      onLog({
        level: "success",
        nodeId: current.id,
        message: `${def.label} succeeded`,
        data: result.data,
      });

      const nextId = resolveNextNodeId(workflow, current.id, result.output);
      current = nextId ? nodeById.get(nextId) : null;
    }

    onLog({
      level: "success",
      message: `Execution finished in ${steps} step(s).`,
    });
    onFinish({ ok: true, steps });
    return { ok: true, steps };
  } catch (err) {
    const isCancelled = err instanceof CancelledError;

    onLog({
      level: isCancelled ? "warning" : "error",
      message: isCancelled ? "Execution cancelled." : err.message,
    });
    onFinish({ ok: false, error: err });
    return { ok: false, error: err };
  }
}

/* ---------- Helpers ---------- */

function resolveNextNodeId(workflow, sourceId, outputHandleId) {
  const outgoing = workflow.edges.filter((e) => e.source === sourceId);
  if (outgoing.length === 0) return null;

  // Prefer the edge whose sourceHandle matches the chosen output.
  const match = outgoing.find((e) => e.sourceHandle === outputHandleId);
  if (match) return match.target;

  // Fallback: if there's only one outgoing edge, use it.
  if (outgoing.length === 1) return outgoing[0].target;

  // Nothing matched — dead end.
  return null;
}
