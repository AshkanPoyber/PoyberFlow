/* ============================================================
   Recent Workflows dropdown for the top bar.

   Lists projects from the local index and switches the active
   workflow on click.
   ============================================================ */

import { el, clear } from "../../utils/dom.js";
import { listProjects, setCurrentProject } from "../../storage/projects.js";

export function createRecentWorkflows({ store, onSwitch }) {
  let open = false;

  const wrap = el("div", { class: "recent-wrap" });

  const trigger = el(
    "button",
    {
      type: "button",
      class: "recent-trigger",
      title: "Recent workflows",
      onclick: (e) => {
        e.stopPropagation();
        toggle();
      },
    },
    [el("i", { class: "fa-solid fa-chevron-down text-[10px]" })],
  );

  const menu = el("div", { class: "recent-menu is-hidden" });

  wrap.append(trigger, menu);

  function toggle() {
    open = !open;
    menu.classList.toggle("is-hidden", !open);
    if (open) renderMenu();
  }

  function close() {
    open = false;
    menu.classList.add("is-hidden");
  }

  function renderMenu() {
    clear(menu);

    const items = listProjects();
    const currentId = store.getState().workflow.metadata.id;

    if (items.length === 0) {
      menu.appendChild(
        el("div", { class: "recent-empty" }, "No recent workflows yet."),
      );
      return;
    }

    for (const item of items) {
      const isCurrent = item.id === currentId;
      const row = el(
        "button",
        {
          type: "button",
          class: `recent-item ${isCurrent ? "is-current" : ""}`,
          onclick: () => {
            close();
            if (isCurrent) return;
            setCurrentProject(item.id);
            onSwitch?.(item.id);
          },
        },
        [
          el("i", {
            class: `recent-item-icon fa-regular ${
              isCurrent ? "fa-circle-check" : "fa-file-lines"
            }`,
          }),
          el("span", { class: "recent-item-name" }, item.name || "Untitled"),
          el(
            "span",
            { class: "recent-item-time" },
            formatRelative(item.updatedAt),
          ),
        ],
      );
      menu.appendChild(row);
    }
  }

  // Close on outside click
  document.addEventListener("pointerdown", (e) => {
    if (!wrap.contains(e.target)) close();
  });

  return { root: wrap };
}

function formatRelative(iso) {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "";
  const diff = Date.now() - t;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  return `${days}d ago`;
}
