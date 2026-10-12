/* ============================================================
   Right Sidebar — hosts the Properties Panel.
   ============================================================ */

import { el } from "../../utils/dom.js";
import { createPropertiesPanel } from "../panels/properties-panel.js";

export function createRightSidebar({ store, history }) {
  const header = el(
    "div",
    {
      class:
        "h-11 shrink-0 flex items-center px-4 border-b border-border text-[12px] font-semibold uppercase tracking-wider text-secondary",
    },
    "Properties",
  );

  const panel = createPropertiesPanel({ store, history });

  const body = el("div", { class: "flex-1 flex flex-col overflow-y-auto" }, [
    panel,
  ]);

  return el(
    "aside",
    {
      class: "w-80 shrink-0 flex flex-col border-l border-border bg-surface",
    },
    [header, body],
  );
}
