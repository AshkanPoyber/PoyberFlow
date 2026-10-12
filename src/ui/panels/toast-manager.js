/* ============================================================
   Toast Manager

   A small stack of auto-dismissing toasts anchored to the
   bottom-right of the viewport.

   Usage:
     const toast = createToastManager(rootEl);
     toast.show({ kind: 'success', text: 'Saved' });
   ============================================================ */

import { el } from "../../utils/dom.js";

const KIND_STYLES = {
  success: {
    icon: "fa-solid fa-circle-check",
    accent: "var(--color-success)",
  },
  error: {
    icon: "fa-solid fa-circle-exclamation",
    accent: "var(--color-error)",
  },
  warning: {
    icon: "fa-solid fa-triangle-exclamation",
    accent: "var(--color-warning)",
  },
  info: {
    icon: "fa-solid fa-circle-info",
    accent: "var(--color-info)",
  },
};

const DEFAULT_DURATION = 3200;

export function createToastManager(rootEl) {
  const container = el("div", {
    class: "toast-container",
    "aria-live": "polite",
    "aria-atomic": "true",
  });
  rootEl.appendChild(container);

  function show({ kind = "info", text = "", duration = DEFAULT_DURATION }) {
    const styles = KIND_STYLES[kind] || KIND_STYLES.info;

    const iconEl = el("i", {
      class: `${styles.icon} text-[12px]`,
    });
    iconEl.style.color = styles.accent;

    const toast = el(
      "div",
      {
        class: "toast",
        role: "status",
        style: { "--toast-accent": styles.accent },
      },
      [
        el("div", { class: "toast-icon" }, [iconEl]),
        el("div", { class: "toast-text" }, text),
      ],
    );

    container.appendChild(toast);

    // Allow layout to settle, then add the "enter" class for transition.
    requestAnimationFrame(() => toast.classList.add("is-visible"));

    const dismiss = () => {
      toast.classList.remove("is-visible");
      toast.classList.add("is-leaving");
      setTimeout(() => toast.remove(), 200);
    };

    const timeout = setTimeout(dismiss, duration);
    toast.addEventListener("click", () => {
      clearTimeout(timeout);
      dismiss();
    });
  }

  return { show };
}
