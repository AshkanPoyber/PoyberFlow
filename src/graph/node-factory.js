/* ============================================================
   Node factory — creates graph-compatible node objects
   from a registered Node Definition.
   ============================================================ */

import { createNodeId } from "../utils/id.js";

export function createNode(definition, position = { x: 0, y: 0 }) {
  return {
    id: createNodeId(),
    type: definition.type,
    position: { x: position.x, y: position.y },
    data: definition.defaultData ? definition.defaultData() : {},
    inputs: definition.inputs ? definition.inputs.map((i) => ({ ...i })) : [],
    outputs: definition.outputs
      ? definition.outputs.map((o) => ({ ...o }))
      : [],
  };
}
