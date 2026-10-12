/* ============================================================
   Import Dialog — modal shown when an import has issues that
   need user attention (e.g. incompatible version or many
   errors that deserve more space than a toast).
   ============================================================ */

import { el } from "../../utils/dom.js";

export function showImportErrorDialog(rootEl, { title, message, errors = [] }) {
  const backdrop = el("div", { class: "modal-backdrop" });
  const dialog = el("div", {
    class: "modal-panel",
    role: "dialog",
    "aria-modal": "true",
  });

  const header = el("div", { class: "modal-header" }, [
    el("div", { class: "modal-icon" }, [
      el("i", { class: "fa-solid fa-triangle-exclamation text-[14px]" }),
    ]),
    el("h3", { class: "modal-title" }, title || "Import failed"),
  ]);

  const body = el("div", { class: "modal-body" }, [
    el("p", { class: "modal-message" }, message || ""),
  ]);

  if (errors.length) {
    const list = el("ul", { class: "modal-errors" });
    for (const err of errors.slice(0, 20)) {
      list.appendChild(el("li", {}, err));
    }
    if (errors.length > 20) {
      list.appendChild(
        el("li", { class: "text-muted" }, `… and ${errors.length - 20} more`),
      );
    }
    body.appendChild(list);
  }

  const footer = el("div", { class: "modal-footer" }, [
    el(
      "button",
      {
        type: "button",
        class: "modal-btn modal-btn-primary",
        onclick: close,
      },
      "Close",
    ),
  ]);

  dialog.append(header, body, footer);
  backdrop.appendChild(dialog);
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

  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) close();
  });
}
