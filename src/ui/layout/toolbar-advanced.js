/* ============================================================
   Advanced toolbar buttons for the top bar:
   - Snap to grid toggle
   - Auto layout
   - Focus mode
   ============================================================ */

import { el } from "../../utils/dom.js";

export function createAdvancedToolbar({
  store,
  camera,
  workspaceEl,
  history,
  onAutoLayout,
  onToggleFocus,
}) {
  /* ---------- Snap toggle ---------- */

  const snapBtn = el(
    "button",
    {
      type: "button",
      class:
        "focus-ring w-8 h-8 rounded-md flex items-center justify-center border border-border bg-surface hover:bg-elevated text-secondary hover:text-primary transition-colors",
      title: "Snap to grid (Alt to temporarily disable)",
      onclick: () => {
        const { ui } = store.getState();
        store.setState({ ui: { ...ui, snapToGrid: !ui.snapToGrid } });
      },
    },
    [el("i", { class: "fa-solid fa-magnet text-[11px]" })],
  );

  /* ---------- Auto layout ---------- */

  const layoutBtn = el(
    "button",
    {
      type: "button",
      class:
        "focus-ring w-8 h-8 rounded-md flex items-center justify-center border border-border bg-surface hover:bg-elevated text-secondary hover:text-primary transition-colors",
      title: "Auto layout",
      onclick: () => onAutoLayout?.(),
    },
    [el("i", { class: "fa-solid fa-wand-magic-sparkles text-[11px]" })],
  );

  /* ---------- Focus mode ---------- */

  const focusBtn = el(
    "button",
    {
      type: "button",
      class:
        "focus-ring w-8 h-8 rounded-md flex items-center justify-center border border-border bg-surface hover:bg-elevated text-secondary hover:text-primary transition-colors",
      title: "Focus mode (F)",
      onclick: () => onToggleFocus?.(),
    },
    [el("i", { class: "fa-solid fa-expand text-[11px]" })],
  );

  /* ---------- Reflect snap state ---------- */

  function syncSnapState(state) {
    const on = state.ui.snapToGrid === true;
    snapBtn.classList.toggle("bg-[var(--color-brand-soft)]", on);
    snapBtn.classList.toggle("border-[var(--color-brand)]", on);
    snapBtn.classList.toggle("text-[var(--color-brand)]", on);
    snapBtn.classList.toggle("text-secondary", !on);
  }

  store.subscribe(syncSnapState);
  syncSnapState(store.getState());

  return el("div", { class: "flex items-center gap-1" }, [
    snapBtn,
    layoutBtn,
    focusBtn,
  ]);
}
