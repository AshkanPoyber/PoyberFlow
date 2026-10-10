/* ============================================================
   Zoom controls in the top bar:
   [ − ]  100%  [ + ]   [ Fit ]  [ Reset ]
   ============================================================ */

import { el } from "../../utils/dom.js";

function iconBtn({ icon, label, onClick }) {
  return el(
    "button",
    {
      type: "button",
      class:
        "focus-ring w-8 h-8 rounded-md flex items-center justify-center border border-border bg-surface hover:bg-elevated text-secondary hover:text-primary transition-colors",
      "aria-label": label,
      onclick: onClick,
    },
    [el("i", { class: `${icon} text-[12px]` })],
  );
}

export function createZoomControls({ store, camera, workspaceEl }) {
  const label = el(
    "span",
    {
      class:
        "w-12 text-center text-[12px] font-mono tabular-nums text-secondary select-none",
    },
    "100%",
  );

  function centerRect() {
    return workspaceEl.getBoundingClientRect();
  }

  function zoomIn() {
    const r = centerRect();
    camera.zoomByStep(r.left + r.width / 2, r.top + r.height / 2, r, +1);
  }

  function zoomOut() {
    const r = centerRect();
    camera.zoomByStep(r.left + r.width / 2, r.top + r.height / 2, r, -1);
  }

  function reset() {
    camera.reset();
  }

  function fit() {
    const r = centerRect();
    const { nodes } = store.getState().workflow;
    camera.fitToScreen(r, nodes);
  }

  const minusBtn = iconBtn({
    icon: "fa-solid fa-minus",
    label: "Zoom out",
    onClick: zoomOut,
  });
  const plusBtn = iconBtn({
    icon: "fa-solid fa-plus",
    label: "Zoom in",
    onClick: zoomIn,
  });

  const fitBtn = el(
    "button",
    {
      type: "button",
      class:
        "focus-ring h-8 px-3 rounded-md flex items-center gap-1.5 border border-border bg-surface hover:bg-elevated text-secondary hover:text-primary transition-colors text-[12px] font-medium",
      "aria-label": "Fit to screen",
      onclick: fit,
    },
    [
      el("i", { class: "fa-solid fa-expand text-[11px]" }),
      el("span", {}, "Fit"),
    ],
  );

  const resetBtn = el(
    "button",
    {
      type: "button",
      class:
        "focus-ring h-8 px-3 rounded-md flex items-center gap-1.5 border border-border bg-surface hover:bg-elevated text-secondary hover:text-primary transition-colors text-[12px] font-medium",
      "aria-label": "Reset view",
      onclick: reset,
    },
    [
      el("i", { class: "fa-solid fa-rotate-left text-[11px]" }),
      el("span", {}, "Reset"),
    ],
  );

  const root = el("div", { class: "flex items-center gap-1.5" }, [
    minusBtn,
    label,
    plusBtn,
    el("div", { class: "w-px h-5 bg-[var(--color-border)] mx-1" }),
    fitBtn,
    resetBtn,
  ]);

  // Subscribe to viewport changes to update the percentage label.
  store.subscribe((state) => {
    const pct = Math.round(state.viewport.zoom * 100);
    if (label.textContent !== `${pct}%`) label.textContent = `${pct}%`;
  });

  return root;
}
