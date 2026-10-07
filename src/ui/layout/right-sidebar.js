/* ============================================================
   Right Sidebar — Properties Panel shell.

   Release 0: polished empty state.
   Content arrives in Release 6.
   ============================================================ */

import { el } from "../../utils/dom.js";

function emptyState() {
  return el(
    "div",
    {
      class:
        "flex-1 flex flex-col items-center justify-center px-6 text-center gap-3",
    },
    [
      el(
        "div",
        {
          class:
            "w-11 h-11 rounded-full flex items-center justify-center bg-elevated border border-border",
        },
        [el("i", { class: "fa-solid fa-sliders text-secondary text-sm" })],
      ),
      el(
        "div",
        { class: "text-[13px] font-medium text-primary" },
        "No selection",
      ),
      el(
        "div",
        { class: "text-[12px] text-muted leading-relaxed max-w-[200px]" },
        "Select a node to view and edit its properties.",
      ),
    ],
  );
}

export function createRightSidebar(store) {
  const header = el(
    "div",
    {
      class:
        "h-11 shrink-0 flex items-center px-4 border-b border-border text-[12px] font-semibold uppercase tracking-wider text-secondary",
    },
    "Properties",
  );

  const body = el("div", { class: "flex-1 flex flex-col" }, [emptyState()]);

  // Placeholder: update empty state title based on selection.
  // Actual config UI comes in Release 6.
  store.subscribe((state) => {
    const selectedCount = state.selection.nodeIds.length;
    const titleEl = body.querySelector(".text-\\[13px\\]");
    if (!titleEl) return;
    titleEl.textContent = selectedCount > 0 ? "Configure node" : "No selection";
  });

  return el(
    "aside",
    {
      class: "w-80 shrink-0 flex flex-col border-l border-border bg-surface",
    },
    [header, body],
  );
}
