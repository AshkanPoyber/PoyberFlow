/* ============================================================
   Top Bar — logo, workflow name, recent, menu, run, history,
   zoom, theme, command palette.
   ============================================================ */

import { el } from "../../utils/dom.js";
import { toggleTheme } from "../theme/theme-manager.js";
import { createZoomControls } from "./zoom-controls.js";
import { createHistoryControls } from "./history-controls.js";
import { createWorkflowMenu } from "./workflow-menu.js";
import { createRecentWorkflows } from "./recent-workflows.js";

export function createTopBar(
  store,
  {
    camera,
    workspaceEl,
    history,
    toast,
    rootEl,
    commandPalette,
    runController,
    onOpenTemplates,
    onSwitchWorkflow,
  },
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
        "hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-elevated",
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

  const recent = createRecentWorkflows({ store, onSwitch: onSwitchWorkflow });
  workflowName.appendChild(recent.root);

  const workflowMenu = createWorkflowMenu({ store, toast, rootEl });

  const templatesBtn = el(
    "button",
    {
      type: "button",
      class:
        "focus-ring h-8 w-8 rounded-md flex items-center justify-center border border-border bg-surface hover:bg-elevated text-secondary hover:text-primary transition-colors",
      title: "Templates",
      onclick: () => onOpenTemplates?.(),
    },
    [el("i", { class: "fa-solid fa-shapes text-[11px]" })],
  );

  const runBtn = el(
    "button",
    {
      type: "button",
      class:
        "focus-ring h-8 px-3 rounded-md flex items-center gap-1.5 border border-transparent text-white transition-colors text-[12px] font-medium bg-[var(--color-success)] hover:opacity-90",
      title: "Run workflow",
      onclick: () => toggleRun(),
    },
    [
      el("i", { class: "fa-solid fa-play text-[11px]" }),
      el("span", { class: "hidden sm:inline" }, "Run"),
    ],
  );

  function toggleRun() {
    if (!runController) return;
    if (runController.isRunning()) runController.stop();
    else runController.run();
  }

  const paletteBtn = el(
    "button",
    {
      type: "button",
      class:
        "focus-ring h-8 px-2.5 rounded-md flex items-center gap-1.5 border border-border bg-surface hover:bg-elevated text-secondary hover:text-primary transition-colors text-[12px]",
      title: "Search (Ctrl+K)",
      onclick: () => commandPalette?.open(),
    },
    [
      el("i", { class: "fa-solid fa-magnifying-glass text-[11px]" }),
      el(
        "span",
        { class: "hidden lg:inline font-mono text-[10px] opacity-60" },
        "Ctrl K",
      ),
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
    const themeIcon = themeBtn.querySelector("i");
    if (themeIcon) {
      themeIcon.className = isDark
        ? "fa-solid fa-sun text-sm"
        : "fa-solid fa-moon text-sm";
    }

    const nameEl = document.getElementById("workflow-name-label");
    if (nameEl && state.workflow.metadata.name) {
      if (nameEl.firstChild && nameEl.firstChild.nodeType === Node.TEXT_NODE) {
        if (nameEl.firstChild.textContent !== state.workflow.metadata.name) {
          nameEl.firstChild.textContent = state.workflow.metadata.name;
        }
      }
    }

    const running = state.runtime?.executing === true;
    const runIcon = runBtn.querySelector("i");
    const runLabel = runBtn.querySelector("span");

    if (running) {
      runBtn.classList.remove("bg-[var(--color-success)]", "hover:opacity-90");
      runBtn.classList.add("bg-[var(--color-error)]", "hover:opacity-90");
      if (runIcon) runIcon.className = "fa-solid fa-stop text-[11px]";
      if (runLabel) runLabel.textContent = "Stop";
    } else {
      runBtn.classList.add("bg-[var(--color-success)]", "hover:opacity-90");
      runBtn.classList.remove("bg-[var(--color-error)]", "hover:opacity-90");
      if (runIcon) runIcon.className = "fa-solid fa-play text-[11px]";
      if (runLabel) runLabel.textContent = "Run";
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
        templatesBtn,
        runBtn,
        el("div", { class: "w-px h-5 bg-[var(--color-border)] mx-0.5" }),
        historyControls,
        el("div", { class: "w-px h-5 bg-[var(--color-border)] mx-0.5" }),
        paletteBtn,
      ]),
      el("div", { class: "flex items-center gap-4" }, [zoomControls, themeBtn]),
    ],
  );
}
