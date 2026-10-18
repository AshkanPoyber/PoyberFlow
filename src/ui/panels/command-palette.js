/* ============================================================
   Command Palette — Ctrl/Cmd + K

   Provides quick access to:
   - Adding nodes by type
   - Loading templates
   - Running / stopping the workflow
   - Common actions (undo, redo, save, export, import)

   Keyboard-driven: type to filter, arrows to navigate,
   Enter to activate, Escape to close.
   ============================================================ */

import { el } from "../../utils/dom.js";

export function createCommandPalette({ rootEl, commands }) {
  let overlay = null;
  let input = null;
  let listEl = null;
  let filtered = [];
  let activeIndex = 0;

  function open() {
    if (overlay) return;

    overlay = el("div", { class: "command-backdrop" });
    const panel = el("div", { class: "command-panel" });

    input = el("input", {
      type: "text",
      class: "command-input",
      placeholder: "Search commands, nodes, templates…",
    });

    listEl = el("div", { class: "command-list" });

    panel.append(input, listEl);
    overlay.appendChild(panel);
    rootEl.appendChild(overlay);

    requestAnimationFrame(() => input.focus());

    input.addEventListener("input", () => {
      activeIndex = 0;
      renderList();
    });

    input.addEventListener("keydown", handleKey);

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });

    renderList();
  }

  function close() {
    if (!overlay) return;
    overlay.remove();
    overlay = null;
    input = null;
    listEl = null;
    filtered = [];
  }

  function handleKey(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, filtered.length - 1);
      renderList();
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      renderList();
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const item = filtered[activeIndex];
      if (item) {
        close();
        item.run();
      }
    }
  }

  function renderList() {
    if (!listEl) return;

    const query = (input.value || "").trim().toLowerCase();
    filtered = query
      ? commands.filter((c) =>
          (c.label + " " + (c.hint || "")).toLowerCase().includes(query),
        )
      : commands.slice(0, 30);

    if (activeIndex >= filtered.length)
      activeIndex = Math.max(0, filtered.length - 1);

    listEl.replaceChildren();

    if (filtered.length === 0) {
      listEl.appendChild(el("div", { class: "command-empty" }, "No results."));
      return;
    }

    filtered.forEach((cmd, i) => {
      const row = el(
        "div",
        {
          class: `command-row ${i === activeIndex ? "is-active" : ""}`,
          onmouseenter: () => {
            activeIndex = i;
            renderList();
          },
          onclick: () => {
            close();
            cmd.run();
          },
        },
        [
          el("div", { class: "command-icon" }, [
            el("i", { class: `${cmd.icon || "fa-solid fa-bolt"} text-[11px]` }),
          ]),
          el(
            "div",
            { class: "command-text" },
            [
              el("div", { class: "command-label" }, cmd.label),
              cmd.hint ? el("div", { class: "command-hint" }, cmd.hint) : null,
            ].filter(Boolean),
          ),
          cmd.shortcut
            ? el("div", { class: "command-shortcut" }, cmd.shortcut)
            : null,
        ].filter(Boolean),
      );
      listEl.appendChild(row);
    });

    // Keep active row in view
    requestAnimationFrame(() => {
      const active = listEl.querySelector(".command-row.is-active");
      if (active) active.scrollIntoView({ block: "nearest" });
    });
  }

  return { open, close, isOpen: () => Boolean(overlay) };
}
