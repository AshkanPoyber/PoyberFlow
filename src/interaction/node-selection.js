/* ============================================================
   Node Selection Interaction

   Rules:
   - Clicking a node selects it (single-select in Release 2).
   - Clicking empty workspace clears selection.
   - Pressing Escape clears selection.
   ============================================================ */

export function attachNodeSelection({ workspaceEl, store }) {
  workspaceEl.addEventListener("pointerdown", (event) => {
    const nodeEl = event.target.closest("[data-node-id]");

    if (nodeEl) {
      const nodeId = nodeEl.dataset.nodeId;
      const { selection } = store.getState();
      if (selection.nodeIds.length === 1 && selection.nodeIds[0] === nodeId) {
        return;
      }
      store.setState({
        selection: { nodeIds: [nodeId], edgeIds: [] },
      });
      return;
    }

    const { selection } = store.getState();
    if (selection.nodeIds.length === 0 && selection.edgeIds.length === 0)
      return;
    store.setState({ selection: { nodeIds: [], edgeIds: [] } });
  });

  window.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    const t = event.target;
    const typing =
      t instanceof HTMLElement &&
      (t.tagName === "INPUT" ||
        t.tagName === "TEXTAREA" ||
        t.isContentEditable);
    if (typing) return;

    const { selection } = store.getState();
    if (selection.nodeIds.length === 0 && selection.edgeIds.length === 0)
      return;
    store.setState({ selection: { nodeIds: [], edgeIds: [] } });
  });
}
