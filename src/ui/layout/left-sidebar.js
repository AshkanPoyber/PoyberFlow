/* ============================================================
   Left Sidebar — Node library shell.

   Release 0: visually complete placeholder.
   Node list is added in Release 2.
   ============================================================ */

import { el } from "../../utils/dom.js";

function placeholderGroup(title) {
  return el("div", { class: "px-3 py-2" }, [
    el(
      "div",
      {
        class:
          "text-[11px] font-medium uppercase tracking-wider text-muted mb-2 px-1",
      },
      title,
    ),
    el(
      "div",
      {
        class:
          "flex items-center gap-2 px-3 py-2 rounded-md border border-dashed border-border text-[12px] text-muted",
      },
      [
        el("i", { class: "fa-regular fa-circle text-[10px]" }),
        el("span", {}, "Coming soon"),
      ],
    ),
  ]);
}

export function createLeftSidebar() {
  const header = el(
    "div",
    {
      class:
        "h-11 shrink-0 flex items-center px-4 border-b border-border text-[12px] font-semibold uppercase tracking-wider text-secondary",
    },
    "Nodes",
  );

  const body = el("div", { class: "flex-1 overflow-y-auto py-2" }, [
    placeholderGroup("Core"),
    placeholderGroup("Logic"),
    placeholderGroup("Network"),
    placeholderGroup("Utility"),
  ]);

  return el(
    "aside",
    {
      class: "w-64 shrink-0 flex flex-col border-r border-border bg-surface",
    },
    [header, body],
  );
}
