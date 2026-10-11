/* ============================================================
   In-memory clipboard for nodes + edges.

   Module-scoped so it never leaks to `window`. Cleared on
   reload — no persistence in R4.
   ============================================================ */

let clipboard = null;

export function setClipboard(payload) {
  if (!payload) {
    clipboard = null;
    return;
  }
  clipboard = {
    nodes: payload.nodes.map((n) => ({
      ...n,
      data: { ...n.data },
      position: { ...n.position },
    })),
    edges: payload.edges.map((e) => ({ ...e })),
  };
}

export function getClipboard() {
  if (!clipboard) return null;
  return {
    nodes: clipboard.nodes.map((n) => ({
      ...n,
      data: { ...n.data },
      position: { ...n.position },
    })),
    edges: clipboard.edges.map((e) => ({ ...e })),
  };
}

export function hasClipboard() {
  return clipboard !== null && clipboard.nodes.length > 0;
}
