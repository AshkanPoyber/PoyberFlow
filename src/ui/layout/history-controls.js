/* ============================================================
   Undo / Redo buttons for the top bar.
   ============================================================ */

import { el } from "../../utils/dom.js";

function iconBtn({ icon, label, onClick }) {
  return el(
    "button",
    {
      type: "button",
      class:
        "focus-ring w-8 h-8 rounded-md flex items-center justify-center border border-border bg-surface text-secondary transition-colors",
      "aria-label": label,
      title: label,
      onclick: onClick,
    },
    [el("i", { class: `${icon} text-[12px]` })],
  );
}

export function createHistoryControls({ history }) {
  const undoBtn = iconBtn({
    icon: "fa-solid fa-rotate-left",
    label: "Undo (Ctrl+Z)",
    onClick: () => history.undo(),
  });

  const redoBtn = iconBtn({
    icon: "fa-solid fa-rotate-right",
    label: "Redo (Ctrl+Shift+Z)",
    onClick: () => history.redo(),
  });

  function syncState() {
    const canUndo = history.canUndo();
    const canRedo = history.canRedo();

    toggleBtn(undoBtn, canUndo);
    toggleBtn(redoBtn, canRedo);
  }

  // Poll gently: history state isn't part of the store.
  // A tiny interval is fine; it's only ever a boolean flip.
  setInterval(syncState, 200);

  const root = el("div", { class: "flex items-center gap-1.5" }, [
    undoBtn,
    redoBtn,
  ]);

  return root;
}

function toggleBtn(btn, enabled) {
  if (enabled) {
    btn.classList.remove("opacity-40", "cursor-not-allowed");
    btn.classList.add("hover:bg-elevated", "hover:text-primary");
    btn.disabled = false;
  } else {
    btn.classList.add("opacity-40", "cursor-not-allowed");
    btn.classList.remove("hover:bg-elevated", "hover:text-primary");
    btn.disabled = true;
  }
}
