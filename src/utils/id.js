/* ============================================================
   ID generation — prefixed, readable, unique enough for local use.
   ============================================================ */

let counter = 0;

function makeId(prefix) {
  counter += 1;
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now().toString(36)}-${counter}-${rand}`;
}

export const createNodeId = () => makeId("node");
export const createEdgeId = () => makeId("edge");
