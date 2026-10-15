/* ============================================================
   Execution Panel — collapsible bottom drawer that shows the
   log stream and a run summary.

   Features:
   - Auto-scrolls to the newest entry unless the user has
     scrolled up.
   - Filter by level (all / success / info / warning / error).
   - Click a row to focus the related node.
   - "Clear logs" button.
   ============================================================ */

import { el, clear } from "../../utils/dom.js";
import { clearLogs } from "../../state/runtime.js";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "success", label: "Success" },
  { id: "info", label: "Info" },
  { id: "warning", label: "Warning" },
  { id: "error", label: "Error" },
];

const LEVEL_ICONS = {
  info: "fa-solid fa-circle-info",
  success: "fa-solid fa-circle-check",
  warning: "fa-solid fa-triangle-exclamation",
  error: "fa-solid fa-circle-exclamation",
};

export function createExecutionPanel({ store, onFocusNode }) {
  let expanded = false;
  let activeFilter = "all";
  let autoScroll = true;

  const root = el("div", { class: "execution-panel" });

  const header = el("div", { class: "execution-header" });
  const body = el("div", { class: "execution-body" });
  const list = el("div", { class: "execution-list" });

  body.appendChild(list);
  root.append(header, body);

  /* ---------- Event handlers ---------- */

  header.addEventListener("click", (e) => {
    if (e.target.closest('[data-action="clear"]')) {
      e.stopPropagation();
      clearLogs(store);
      return;
    }
    expanded = !expanded;
    root.classList.toggle("is-expanded", expanded);
    render();
  });

  list.addEventListener("scroll", () => {
    const atBottom =
      list.scrollTop + list.clientHeight >= list.scrollHeight - 8;
    autoScroll = atBottom;
  });

  /* ---------- Rendering ---------- */

  function render() {
    const state = store.getState();
    const logs = state.runtime?.logs || [];
    const summary = state.runtime?.summary;

    renderHeader(summary, logs.length);
    renderBody(logs);

    if (expanded && autoScroll) {
      requestAnimationFrame(() => {
        list.scrollTop = list.scrollHeight;
      });
    }
  }

  function renderHeader(summary, count) {
    clear(header);

    const statusIcon = summary?.ok
      ? "fa-solid fa-circle-check"
      : summary?.cancelled
        ? "fa-solid fa-circle-stop"
        : summary
          ? "fa-solid fa-circle-exclamation"
          : "fa-solid fa-terminal";

    const statusClass = summary?.ok
      ? "is-success"
      : summary?.cancelled
        ? "is-warning"
        : summary
          ? "is-error"
          : "";

    header.append(
      el("div", { class: `execution-status-icon ${statusClass}` }, [
        el("i", { class: `${statusIcon} text-[11px]` }),
      ]),
      el("div", { class: "execution-title" }, "Execution"),
      summary
        ? el("div", { class: "execution-summary" }, buildSummaryText(summary))
        : el("div", { class: "execution-summary text-muted" }, "No runs yet"),
      el("div", { class: "flex-1" }),
      count > 0
        ? el(
            "button",
            {
              type: "button",
              class: "execution-clear-btn",
              dataset: { action: "clear" },
              title: "Clear logs",
            },
            [el("i", { class: "fa-regular fa-trash-can text-[10px]" })],
          )
        : null,
      el("i", {
        class: `execution-chevron fa-solid fa-chevron-${
          expanded ? "down" : "up"
        }`,
      }),
    );
  }

  function renderBody(logs) {
    if (!expanded) return;

    clear(list);

    // Filter row
    const filterRow = el("div", { class: "execution-filters" });
    for (const f of FILTERS) {
      const btn = el(
        "button",
        {
          type: "button",
          class: `execution-filter ${activeFilter === f.id ? "is-active" : ""}`,
          onclick: (e) => {
            e.stopPropagation();
            activeFilter = f.id;
            render();
          },
        },
        f.label,
      );
      filterRow.appendChild(btn);
    }
    list.appendChild(filterRow);

    // Empty state
    if (logs.length === 0) {
      list.appendChild(
        el(
          "div",
          { class: "execution-empty" },
          "No execution logs yet. Run the workflow to see them here.",
        ),
      );
      return;
    }

    // Log rows
    for (const entry of logs) {
      if (
        activeFilter !== "all" &&
        entry.level !== activeFilter &&
        entry.kind !== "marker"
      ) {
        if (entry.kind !== "marker") continue;
      }
      if (entry.kind === "marker") {
        list.appendChild(createMarkerRow(entry));
      } else {
        list.appendChild(createLogRow(entry, { onFocusNode, store }));
      }
    }
  }

  render();
  store.subscribe(render);

  return root;
}

/* ---------- Row factories ---------- */

function createLogRow(entry, { onFocusNode }) {
  const time = formatTime(entry.timestamp);

  return el(
    "div",
    {
      class: `execution-row level-${entry.level} ${
        entry.nodeId ? "is-clickable" : ""
      }`,
      onclick: entry.nodeId ? () => onFocusNode?.(entry.nodeId) : undefined,
    },
    [
      el("span", { class: "execution-time" }, time),
      el("i", {
        class: `${LEVEL_ICONS[entry.level] || LEVEL_ICONS.info} execution-icon`,
      }),
      el("span", { class: "execution-message" }, entry.message),
      entry.nodeId
        ? el("i", {
            class: "fa-solid fa-crosshairs execution-focus",
          })
        : null,
    ].filter(Boolean),
  );
}

function createMarkerRow(entry) {
  return el("div", { class: "execution-marker" }, [
    el("div", { class: "execution-marker-line" }),
    el("span", { class: "execution-marker-label" }, entry.label),
    el("div", { class: "execution-marker-line" }),
  ]);
}

/* ---------- Utilities ---------- */

function formatTime(ts) {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

function buildSummaryText(summary) {
  const parts = [];
  if (summary.steps != null) parts.push(`${summary.steps} step(s)`);
  if (summary.durationMs != null) parts.push(formatMs(summary.durationMs));
  if (summary.skippedCount) parts.push(`${summary.skippedCount} skipped`);
  if (summary.errorCount) parts.push(`${summary.errorCount} error`);
  if (summary.cancelled) parts.push("cancelled");
  return parts.join(" · ");
}

function formatMs(ms) {
  if (!Number.isFinite(ms)) return "";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}
