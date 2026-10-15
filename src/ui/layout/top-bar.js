/* ============================================================
   Top Bar — logo, workflow name, menu, history, zoom, theme.
   ============================================================ */

import { el } from "../../utils/dom.js";
import { toggleTheme } from "../theme/theme-manager.js";
import { createZoomControls } from "./zoom-controls.js";
import { createHistoryControls } from "./history-controls.js";
import { createWorkflowMenu } from "./workflow-menu.js";
import { createRunController } from "../../interaction/run-controls.js";

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

  /* ---------- Run / Stop controller ---------- */

  const runController = createRunController({ store, toast });

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

  const executionToggle = el(
    "button",
    {
      type: "button",
      class:
        "focus-ring h-8 w-8 rounded-md flex items-center justify-center border border-border bg-surface hover:bg-elevated text-secondary hover:text-primary transition-colors",
      title: "Toggle execution panel",
      onclick: () => {
        const panel = document.querySelector(".execution-panel");
        if (panel) panel.classList.toggle("is-expanded");
      },
    },
    [el("i", { class: "fa-solid fa-terminal text-[11px]" })],
  );

  function toggleRun() {
    if (runController.isRunning()) runController.stop();
    else runController.run();
  }

  /* ---------- Other controls ---------- */

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

  /* ---------- Reactive updates ---------- */

  store.subscribe((state) => {
    // Theme icon
    const isDark = state.ui.theme === "dark";
    const themeIcon = themeBtn.querySelector("i");
    if (themeIcon) {
      themeIcon.className = isDark
        ? "fa-solid fa-sun text-sm"
        : "fa-solid fa-moon text-sm";
    }

    // Workflow name
    const nameEl = document.getElementById("workflow-name-label");
    if (nameEl && state.workflow.metadata.name) {
      if (nameEl.textContent !== state.workflow.metadata.name) {
        nameEl.textContent = state.workflow.metadata.name;
      }
    }

    // Run / Stop button state
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
        runBtn,
        executionToggle,
        el("div", { class: "w-px h-5 bg-[var(--color-border)] mx-0.5" }),
        historyControls,
      ]),
      el("div", { class: "flex items-center gap-4" }, [zoomControls, themeBtn]),
    ],
  );
}
