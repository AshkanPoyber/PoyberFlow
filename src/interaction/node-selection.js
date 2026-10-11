/* ============================================================
   Node Selection Interaction

   Rules:
   - Click a node → single-select it
   - Shift + click a node → toggle it in/out of the selection
   - Click empty workspace → clear selection (rect selection may
     overwrite this if the user starts a drag)
   - Escape → clear selection
   ============================================================ */

export function attachNodeSelection({ workspaceEl, store }) {
  workspaceEl.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;

    const nodeEl = event.target.closest("[data-node-id]");
    const edgeGroup = event.target.closest("[data-edge-id]");

    if (edgeGroup && !nodeEl) return;

    if (nodeEl) {
      const nodeId = nodeEl.dataset.nodeId;
      const { selection } = store.getState();

      // Shift+click → toggle in/out of selection
      if (event.shiftKey) {
        const has = selection.nodeIds.includes(nodeId);
        const nodeIds = has
          ? selection.nodeIds.filter((id) => id !== nodeId)
          : [...selection.nodeIds, nodeId];
        store.setState({
          selection: { nodeIds, edgeIds: selection.edgeIds },
        });
        return;
      }

      // If the node is already part of a multi-selection,
      // leave the selection alone so the drag can move all
      // selected nodes together.
      if (selection.nodeIds.length > 1 && selection.nodeIds.includes(nodeId)) {
        return;
      }

      // Otherwise, single-select it.
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
