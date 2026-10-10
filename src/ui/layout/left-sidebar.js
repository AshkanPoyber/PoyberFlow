/* ============================================================
   Left Sidebar — hosts the Node Library.
   ============================================================ */

import { el } from "../../utils/dom.js";
import { createNodeLibrary } from "../panels/node-library.js";

export function createLeftSidebar({ onAddNode }) {
  const header = el(
    "div",
    {
      class:
        "h-11 shrink-0 flex items-center px-4 border-b border-border text-[12px] font-semibold uppercase tracking-wider text-secondary",
    },
    "Nodes",
  );

  const body = el("div", { class: "flex-1 overflow-y-auto" }, [
    createNodeLibrary({ onAdd: onAddNode }),
  ]);

  return el(
    "aside",
    {
      class: "w-64 shrink-0 flex flex-col border-r border-border bg-surface",
    },
    [header, body],
  );
}
