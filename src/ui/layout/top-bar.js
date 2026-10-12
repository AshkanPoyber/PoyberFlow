/* ============================================================
   Top Bar — logo, workflow name, menu, history, zoom, theme.
   ============================================================ */

import { el } from "../../utils/dom.js";
import { toggleTheme } from "../theme/theme-manager.js";
import { createZoomControls } from "./zoom-controls.js";
import { createHistoryControls } from "./history-controls.js";
import { createWorkflowMenu } from "./workflow-menu.js";
import { validateWorkflow } from "../../engine/validator.js";

export function createTopBar(
  store,
  { camera, workspaceEl, history, toast, rootEl },
) {
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
      { class: "text-[15px] font-semibold tracking-tight text-primary" },
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
      el(
        "span",
        { class: "text-[13px] text-secondary", id: "workflow-name-label" },
        "Untitled Workflow",
      ),
    ],
  );

  const workflowMenu = createWorkflowMenu({ store, toast, rootEl });

  const runBtn = el(
    "button",
    {
      type: "button",
      class:
        "focus-ring h-8 px-3 rounded-md flex items-center gap-1.5 border border-transparent bg-[var(--color-success)] text-white hover:opacity-90 transition-opacity text-[12px] font-medium",
      title: "Run workflow",
      onclick: () => {
        const result = validateWorkflow(store.getState().workflow);
        if (!result.ok) {
          toast.show({
            kind: "error",
            text: `Cannot run: ${result.errors.length} error${
              result.errors.length === 1 ? "" : "s"
            } in the workflow.`,
          });
          return;
        }
        toast.show({
          kind: "info",
          text: "Execution engine arrives in Release 8.",
        });
      },
    },
    [
      el("i", { class: "fa-solid fa-play text-[11px]" }),
      el("span", { class: "hidden sm:inline" }, "Run"),
    ],
  );

  const historyControls = createHistoryControls({ history });
  const zoomControls = createZoomControls({ store, camera, workspaceEl });

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

  store.subscribe((state) => {
    const isDark = state.ui.theme === "dark";
    const icon = themeBtn.querySelector("i");
    if (icon) {
      icon.className = isDark
        ? "fa-solid fa-sun text-sm"
        : "fa-solid fa-moon text-sm";
    }

    // Keep the workflow name in sync with state.metadata
    const nameEl = document.getElementById("workflow-name-label");
    if (nameEl && state.workflow.metadata.name) {
      if (nameEl.textContent !== state.workflow.metadata.name) {
        nameEl.textContent = state.workflow.metadata.name;
      }
    }
  });

  return el(
    "header",
    {
      class:
        "h-14 shrink-0 flex items-center justify-between px-4 border-b border-border bg-surface",
    },
    [
      el("div", { class: "flex items-center gap-3" }, [
        logo,
        workflowName,
        el("div", { class: "w-px h-5 bg-[var(--color-border)] mx-0.5" }),
        workflowMenu,
        runBtn,
        el("div", { class: "w-px h-5 bg-[var(--color-border)] mx-0.5" }),
        historyControls,
      ]),
      el("div", { class: "flex items-center gap-4" }, [zoomControls, themeBtn]),
    ],
  );
}
