/* ============================================================
   Workflow Schema — single source of truth for the persisted
   shape, plus validation rules for imports.

   Bump CURRENT_VERSION whenever the shape changes and add a
   migration in migrations.js.
   ============================================================ */

export const CURRENT_VERSION = 1;

export const STORAGE_KEY_PREFIX = "poyberflow:workflow:";
export const ACTIVE_WORKFLOW_KEY = "poyberflow:active-workflow";

/* ---------- Serialize / Deserialize ---------- */

export function serializeWorkflow(state) {
  const { workflow, viewport } = state;
  return {
    version: CURRENT_VERSION,
    metadata: {
      ...workflow.metadata,
      updatedAt: new Date().toISOString(),
    },
    workflow: {
      nodes: workflow.nodes,
      edges: workflow.edges,
    },
    viewport: {
      x: viewport.x,
      y: viewport.y,
      zoom: viewport.zoom,
    },
  };
}

/* ---------- Validation ---------- */

const KNOWN_NODE_TYPES = new Set(["start", "output", "http", "if", "delay"]);

export function validateWorkflowPayload(payload) {
  const errors = [];

  if (!payload || typeof payload !== "object") {
    return { ok: false, errors: ["Workflow payload is not an object"] };
  }

  if (typeof payload.version !== "number") {
    errors.push("Missing or invalid `version`");
  } else if (payload.version > CURRENT_VERSION) {
    errors.push(
      `Version ${payload.version} is newer than supported (${CURRENT_VERSION})`,
    );
  }

  if (!payload.workflow || typeof payload.workflow !== "object") {
    errors.push("Missing `workflow` object");
  } else {
    const { nodes, edges } = payload.workflow;

    if (!Array.isArray(nodes)) errors.push("`workflow.nodes` must be an array");
    if (!Array.isArray(edges)) errors.push("`workflow.edges` must be an array");

    if (Array.isArray(nodes)) {
      const nodeIds = new Set();

      nodes.forEach((node, i) => {
        if (!node || typeof node !== "object") {
          errors.push(`Node #${i} is not an object`);
          return;
        }
        if (typeof node.id !== "string" || !node.id) {
          errors.push(`Node #${i} has no id`);
        } else if (nodeIds.has(node.id)) {
          errors.push(`Duplicate node id: ${node.id}`);
        } else {
          nodeIds.add(node.id);
        }
        if (!KNOWN_NODE_TYPES.has(node.type)) {
          errors.push(`Node #${i} has unknown type: ${node.type}`);
        }
        if (
          !node.position ||
          typeof node.position.x !== "number" ||
          typeof node.position.y !== "number"
        ) {
          errors.push(`Node #${i} has invalid position`);
        }
      });

      if (Array.isArray(edges)) {
        edges.forEach((edge, i) => {
          if (!edge || typeof edge !== "object") {
            errors.push(`Edge #${i} is not an object`);
            return;
          }
          if (typeof edge.id !== "string" || !edge.id) {
            errors.push(`Edge #${i} has no id`);
          }
          if (!nodeIds.has(edge.source)) {
            errors.push(`Edge #${i} references unknown source: ${edge.source}`);
          }
          if (!nodeIds.has(edge.target)) {
            errors.push(`Edge #${i} references unknown target: ${edge.target}`);
          }
        });
      }
    }
  }

  return { ok: errors.length === 0, errors };
}
