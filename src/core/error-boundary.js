/* ============================================================
   Error Boundary — a lightweight global safety net.

   Wraps window.onerror and unhandled promise rejections so
   unexpected failures surface to the user instead of silently
   breaking the app.

   The overlay is dismissible and shows the error message plus
   a "Reload" button. It does NOT swallow errors — the console
   still gets them.
   ============================================================ */

import { el } from "../utils/dom.js";

let overlay = null;

export function installErrorBoundary({ rootEl }) {
  window.addEventListener("error", (event) => {
    showOverlay({
      title: "Something went wrong",
      message: event.message || String(event.error || "Unknown error"),
      stack: event.error?.stack || "",
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    showOverlay({
      title: "Unhandled async error",
      message: reason?.message || String(reason || "Unknown error"),
      stack: reason?.stack || "",
    });
  });

  function showOverlay({ title, message, stack }) {
    if (overlay) return;

    overlay = el("div", { class: "error-overlay" });

    const panel = el("div", { class: "error-panel" }, [
      el("div", { class: "error-panel-header" }, [
        el("div", { class: "error-panel-icon" }, [
          el("i", { class: "fa-solid fa-triangle-exclamation text-[14px]" }),
        ]),
        el("div", { class: "error-panel-title" }, title),
      ]),
      el(
        "div",
        { class: "error-panel-body" },
        [
          el("div", { class: "error-panel-message" }, message),
          stack ? el("pre", { class: "error-panel-stack" }, stack) : null,
        ].filter(Boolean),
      ),
      el("div", { class: "error-panel-footer" }, [
        el(
          "button",
          {
            type: "button",
            class: "error-btn",
            onclick: () => {
              overlay?.remove();
              overlay = null;
            },
          },
          "Dismiss",
        ),
        el(
          "button",
          {
            type: "button",
            class: "error-btn error-btn-primary",
            onclick: () => window.location.reload(),
          },
          "Reload",
        ),
      ]),
    ]);

    overlay.appendChild(panel);
    rootEl.appendChild(overlay);

    requestAnimationFrame(() => overlay.classList.add("is-visible"));
  }
}
