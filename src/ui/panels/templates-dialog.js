/* ============================================================
   Templates Dialog — pick a starter workflow.
   ============================================================ */

import { el } from "../../utils/dom.js";
import { TEMPLATES } from "../../storage/templates.js";

export function showTemplatesDialog({ rootEl, onSelect }) {
  const backdrop = el("div", { class: "modal-backdrop" });
  const panel = el("div", { class: "modal-panel templates-modal" });

  const header = el("div", { class: "modal-header" }, [
    el("div", { class: "modal-icon modal-icon-brand" }, [
      el("i", { class: "fa-solid fa-shapes text-[13px]" }),
    ]),
    el("h3", { class: "modal-title" }, "Start from a template"),
  ]);

  const body = el("div", { class: "modal-body templates-body" });

  const grid = el("div", { class: "templates-grid" });

  for (const tpl of TEMPLATES) {
    const accent = tpl.accent ? `var(${tpl.accent})` : "var(--color-brand)";
    const card = el(
      "button",
      {
        type: "button",
        class: "template-card",
        onclick: () => {
          close();
          onSelect(tpl);
        },
      },
      [
        el(
          "div",
          {
            class: "template-icon",
            style: {
              backgroundColor:
                "color-mix(in srgb, " + accent + " 14%, transparent)",
              color: accent,
            },
          },
          [el("i", { class: `${tpl.icon} text-[14px]` })],
        ),
        el("div", { class: "template-name" }, tpl.name),
        el("div", { class: "template-desc" }, tpl.description),
      ],
    );
    grid.appendChild(card);
  }

  body.appendChild(grid);

  const footer = el("div", { class: "modal-footer" }, [
    el(
      "button",
      {
        type: "button",
        class: "modal-btn",
        onclick: close,
      },
      "Cancel",
    ),
  ]);

  panel.append(header, body, footer);
  backdrop.appendChild(panel);
  rootEl.appendChild(backdrop);

  requestAnimationFrame(() => backdrop.classList.add("is-visible"));

  function close() {
    backdrop.classList.remove("is-visible");
    setTimeout(() => backdrop.remove(), 180);
    document.removeEventListener("keydown", onKey);
  }

  function onKey(e) {
    if (e.key === "Escape") close();
  }
  document.addEventListener("keydown", onKey);
}
