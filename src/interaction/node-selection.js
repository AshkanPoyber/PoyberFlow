/* ============================================================
   Node Selection Interaction

   Rules:
   - Clicking a node selects it (single-select in Release 0).
   - Clicking empty workspace clears selection.
   - Selection is stored in state, never in DOM classes only.
   ============================================================ */

export function attachNodeSelection({ workspaceEl, store }) {
  workspaceEl.addEventListener("pointerdown", (event) => {
    const nodeEl = event.target.closest("[data-node-id]");

    if (nodeEl) {
      const nodeId = nodeEl.dataset.nodeId;
      const { selection } = store.getState();
      if (selection.nodeIds.length === 1 && selection.nodeIds[0] === nodeId) {
        return; // already selected
      }
      store.setState({
        selection: { nodeIds: [nodeId], edgeIds: [] },
      });
      return;
    }

    // Clicked on empty workspace
    const { selection } = store.getState();
    if (selection.nodeIds.length === 0 && selection.edgeIds.length === 0)
      return;
    store.setState({ selection: { nodeIds: [], edgeIds: [] } });
  });
}
