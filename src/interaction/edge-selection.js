/* ============================================================
   Edge Selection Interaction

   Clicking an edge selects it. Clicking empty workspace clears.
   Shift-click will be added in R4 for multi-select.
   ============================================================ */

export function attachEdgeSelection({ workspaceEl, store }) {
  workspaceEl.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;

    const group = event.target.closest("[data-edge-id]");
    if (group) {
      const edgeId = group.dataset.edgeId;
      const { selection } = store.getState();
      if (selection.edgeIds.length === 1 && selection.edgeIds[0] === edgeId) {
        return;
      }
      store.setState({
        selection: { nodeIds: [], edgeIds: [edgeId] },
      });
      event.stopPropagation();
      return;
    }
  });
}
