/* ============================================================
   Top Bar — logo, workflow name, theme toggle.
   ============================================================ */

import { el } from "../../utils/dom.js";
import { toggleTheme } from "../theme/theme-manager.js";

export function createTopBar(store) {
  const logo = el("div", { class: "flex items-center gap-2.5" }, [
    el(
      "div",
      {
        class:
          "w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--color-brand)] text-white shadow-sm",
      },
      [el("i", { class: "fa-solid fa-diagram-project text-[13px]" })],
    ),
    el(
      "span",
      {
        class: "text-[15px] font-semibold tracking-tight text-primary",
      },
      "PoyberFlow",
    ),
  ]);

  const workflowName = el(
    "div",
    {
      class:
        "hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-elevated",
    },
    [
      el("i", { class: "fa-regular fa-file-lines text-secondary text-xs" }),
      el("span", { class: "text-[13px] text-secondary" }, "Untitled Workflow"),
    ],
  );

  const themeBtn = el(
    "button",
    {
      type: "button",
      class:
        "focus-ring w-9 h-9 rounded-lg flex items-center justify-center border border-border bg-surface hover:bg-elevated text-secondary hover:text-primary transition-colors",
      "aria-label": "Toggle theme",
      onclick: () => toggleTheme(store),
    },
    [el("i", { class: "fa-solid fa-moon text-sm" })],
  );

  // Update icon based on current theme
  store.subscribe((state) => {
    const isDark = state.ui.theme === "dark";
    const icon = themeBtn.querySelector("i");
    if (!icon) return;
    icon.className = isDark
      ? "fa-solid fa-sun text-sm"
      : "fa-solid fa-moon text-sm";
  });

  return el(
    "header",
    {
      class:
        "h-14 shrink-0 flex items-center justify-between px-4 border-b border-border bg-surface",
    },
    [
      el("div", { class: "flex items-center gap-4" }, [logo, workflowName]),
      themeBtn,
    ],
  );
}
