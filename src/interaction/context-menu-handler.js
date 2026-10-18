/* ============================================================
   Context Menu Handler — right-click on the workspace.

   Provides:
   - Add Node (opens command palette pre-filtered to nodes)
   - Paste
   - Select All
   - Delete selection
   - Reset view
   ============================================================ */

import { showContextMenu } from "../ui/panels/context-menu.js";

export function attachContextMenu({
  workspaceEl,
  store,
  history,
  camera,
  commandPalette,
}) {
  workspaceEl.addEventListener("contextmenu", (event) => {
    // Ignore right-clicks on interactive form elements
    const tag = event.target.tagName;
    if (
      tag === "INPUT" ||
      tag === "TEXTAREA" ||
      event.target.isContentEditable
    ) {
      return;
    }

    event.preventDefault();

    const { selection } = store.getState();
    const hasSelection =
      selection.nodeIds.length + selection.edgeIds.length > 0;

    showContextMenu(document.body, {
      x: event.clientX,
      y: event.clientY,
      items: [
        {
          label: "Add node…",
          icon: "fa-solid fa-plus",
          shortcut: "Ctrl+K",
          onClick: () => commandPalette.open(),
        },
        { separator: true },
        {
          label: "Select all",
          icon: "fa-solid fa-object-group",
          shortcut: "Ctrl+A",
          onClick: () => {
            const { workflow } = store.getState();
            store.setState({
              selection: {
                nodeIds: workflow.nodes.map((n) => n.id),
                edgeIds: [],
              },
            });
          },
        },
        {
          label: "Reset view",
          icon: "fa-solid fa-rotate-left",
          onClick: () => camera.reset(),
        },
        { separator: true },
        {
          label: "Delete selection",
          icon: "fa-regular fa-trash-can",
          shortcut: "Del",
          danger: true,
          disabled: !hasSelection,
          onClick: () => {
            // Fire a synthetic Delete key event to reuse the existing
            // keyboard shortcut handler — no duplicated logic.
            window.dispatchEvent(
              new KeyboardEvent("keydown", { key: "Delete", bubbles: true }),
            );
          },
        },
      ],
    });
  });
}
