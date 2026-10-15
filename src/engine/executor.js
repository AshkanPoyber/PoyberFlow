/* ============================================================
   Execution Engine — headless orchestrator.
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
    onEdgeStatus = () => {},
    onLog = () => {},
    onResults = () => {},
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

  const nodeIdByName = new Map();
  const seenNames = new Set();
  for (const n of workflow.nodes) {
    if (!seenNames.has(n.type)) {
      nodeIdByName.set(n.type, n.id);
      seenNames.add(n.type);
    }
  }

  // Track reachable nodes so we can mark "skipped" after the run.
  const visited = new Set();

  let current = startNode;
  let steps = 0;
  let errorNodeId = null;
  let errorEdgeId = null;

  const startedAt = Date.now();

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

      visited.add(current.id);
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

        errorNodeId = current.id;
        onNodeStatus(current.id, "error", {
          finishedAt: Date.now(),
          error: err.message || String(err),
        });
        onLog({
          level: "error",
          nodeId: current.id,
          message: err.message || String(err),
        });

        // Mark outgoing edge as errored (if any).
        const outgoing = workflow.edges.find((e) => e.source === current.id);
        if (outgoing) {
          errorEdgeId = outgoing.id;
          onEdgeStatus(outgoing.id, "error", { finishedAt: Date.now() });
        }

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

      const nextEdge = resolveNextEdge(workflow, current.id, result.output);

      if (nextEdge) {
        onEdgeStatus(nextEdge.id, "active", { startedAt: Date.now() });
        // Small delay so the UI can render the "active" state before
        // the target node also becomes active.
        await microtask();

        // Only mark success if the target node runs successfully.
        // We'll update it in the next iteration if it fails.
        // Simplest approach: mark success now — if target fails, we
        // overwrite the edge status with error above.
        onEdgeStatus(nextEdge.id, "success", { finishedAt: Date.now() });
        current = nodeById.get(nextEdge.target) || null;
      } else {
        current = null;
      }
    }

    // Mark unvisited nodes as skipped.
    const skipped = [];
    for (const n of workflow.nodes) {
      if (!visited.has(n.id)) {
        onNodeStatus(n.id, "skipped", {});
        skipped.push(n.id);
      }
    }

    const finishedAt = Date.now();

    onLog({
      level: "success",
      message: `Execution finished in ${steps} step(s).`,
    });

    onResults(context.results);

    onFinish({
      ok: true,
      steps,
      startedAt,
      finishedAt,
      durationMs: finishedAt - startedAt,
      skipped,
      visited: [...visited],
    });

    return {
      ok: true,
      steps,
      startedAt,
      finishedAt,
      durationMs: finishedAt - startedAt,
      skipped,
      visited: [...visited],
    };
  } catch (err) {
    const isCancelled = err instanceof CancelledError;
    const finishedAt = Date.now();

    onLog({
      level: isCancelled ? "warning" : "error",
      message: isCancelled ? "Execution cancelled." : err.message,
    });

    onFinish({
      ok: false,
      error: err,
      steps,
      startedAt,
      finishedAt,
      durationMs: finishedAt - startedAt,
      errorNodeId,
      errorEdgeId,
      visited: [...visited],
    });

    return {
      ok: false,
      error: err,
      steps,
      startedAt,
      finishedAt,
      durationMs: finishedAt - startedAt,
    };
  }
}

/* ---------- Helpers ---------- */

function resolveNextEdge(workflow, sourceId, outputHandleId) {
  const outgoing = workflow.edges.filter((e) => e.source === sourceId);
  if (outgoing.length === 0) return null;

  const match = outgoing.find((e) => e.sourceHandle === outputHandleId);
  if (match) return match;

  if (outgoing.length === 1) return outgoing[0];
  return null;
}

function microtask() {
  return Promise.resolve();
}
