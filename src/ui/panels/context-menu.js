/* ============================================================
   Generic context menu builder.

   Usage:
     showContextMenu(rootEl, {
       x, y,
       items: [
         { label: 'Add node', icon: 'fa-plus', onClick },
         { separator: true },
         { label: 'Delete', icon: 'fa-trash', onClick, danger: true },
       ],
     });
   ============================================================ */

import { el } from "../../utils/dom.js";

let currentMenu = null;

export function showContextMenu(rootEl, { x, y, items }) {
  closeContextMenu();

  const menu = el("div", { class: "context-menu" });

  for (const item of items) {
    if (item.separator) {
      menu.appendChild(el("div", { class: "context-separator" }));
      continue;
    }

    const row = el(
      "button",
      {
        type: "button",
        class: `context-item ${item.danger ? "is-danger" : ""} ${
          item.disabled ? "is-disabled" : ""
        }`,
        disabled: item.disabled || false,
        onclick: () => {
          closeContextMenu();
          item.onClick?.();
        },
      },
      [
        item.icon
          ? el("i", { class: `${item.icon} context-icon` })
          : el("span", { class: "context-icon" }),
        el("span", { class: "context-label" }, item.label),
        item.shortcut
          ? el("span", { class: "context-shortcut" }, item.shortcut)
          : null,
      ].filter(Boolean),
    );
    menu.appendChild(row);
  }

  rootEl.appendChild(menu);

  // Measure and clamp inside the viewport.
  const rect = menu.getBoundingClientRect();
  const margin = 6;
  let left = x;
  let top = y;
  if (left + rect.width + margin > window.innerWidth)
    left = window.innerWidth - rect.width - margin;
  if (top + rect.height + margin > window.innerHeight)
    top = window.innerHeight - rect.height - margin;

  menu.style.left = `${left}px`;
  menu.style.top = `${top}px`;

  currentMenu = menu;

  // Close on next click, Escape, or scroll
  setTimeout(() => {
    window.addEventListener("pointerdown", onOutsideClick, { once: true });
    window.addEventListener("keydown", onEsc, { once: true });
    window.addEventListener("scroll", closeContextMenu, {
      once: true,
      capture: true,
    });
  }, 0);

  function onOutsideClick(e) {
    if (!menu.contains(e.target)) closeContextMenu();
  }

  function onEsc(e) {
    if (e.key === "Escape") closeContextMenu();
  }
}

export function closeContextMenu() {
  if (currentMenu) {
    currentMenu.remove();
    currentMenu = null;
  }
}
