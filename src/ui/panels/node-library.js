/* ============================================================
   Node Library — the left sidebar's content.

   Reads from the Node Registry and renders categories and
   clickable node entries. Clicking an entry dispatches an
   AddNodeCommand via the provided callback.
   ============================================================ */

import { el } from "../../utils/dom.js";
import { getAllNodeDefinitions } from "../../nodes/registry.js";

const CATEGORY_LABELS = {
  core: "Core",
  logic: "Logic",
  network: "Network",
  utility: "Utility",
};

const CATEGORY_ORDER = ["core", "logic", "network", "utility"];

function groupByCategory(definitions) {
  const map = new Map();
  for (const def of definitions) {
    const cat = def.category || "utility";
    if (!map.has(cat)) map.set(cat, []);
    map.get(cat).push(def);
  }
  return map;
}

function createLibraryItem(def, onAdd) {
  const accent = def.accentVar ? `var(${def.accentVar})` : "var(--color-brand)";

  return el(
    "button",
    {
      type: "button",
      class:
        "focus-ring group w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md border border-transparent hover:border-border hover:bg-elevated transition-colors text-left",
      onclick: () => onAdd(def),
      title: `Add ${def.label}`,
    },
    [
      el(
        "div",
        {
          class: "shrink-0 w-7 h-7 rounded-md flex items-center justify-center",
          style: {
            backgroundColor:
              "color-mix(in srgb, " + accent + " 14%, transparent)",
            color: accent,
          },
        },
        [el("i", { class: `${def.icon} text-[11px]` })],
      ),
      el("div", { class: "flex-1 min-w-0" }, [
        el(
          "div",
          {
            class:
              "text-[12.5px] font-medium text-primary leading-tight truncate",
          },
          def.label,
        ),
        el(
          "div",
          {
            class: "text-[11px] text-muted leading-tight truncate",
          },
          def.description || "",
        ),
      ]),
      el("i", {
        class:
          "fa-solid fa-plus text-[10px] text-muted opacity-0 group-hover:opacity-100 transition-opacity",
      }),
    ],
  );
}

export function createNodeLibrary({ onAdd }) {
  const container = el("div", { class: "flex flex-col gap-4 py-2 px-2" });

  const defs = getAllNodeDefinitions();
  const grouped = groupByCategory(defs);

  for (const cat of CATEGORY_ORDER) {
    const items = grouped.get(cat);
    if (!items || items.length === 0) continue;

    const section = el("div", { class: "flex flex-col gap-1" }, [
      el(
        "div",
        {
          class:
            "px-2 pt-1 pb-1 text-[10.5px] font-semibold uppercase tracking-wider text-muted",
        },
        CATEGORY_LABELS[cat] || cat,
      ),
      ...items.map((def) => createLibraryItem(def, onAdd)),
    ]);

    container.appendChild(section);
  }

  return container;
}
