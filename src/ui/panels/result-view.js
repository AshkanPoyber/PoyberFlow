/* ============================================================
   Result View — shows the execution result of a node.

   Used inside the Properties Panel as a second tab.
   ============================================================ */

import { el } from "../../utils/dom.js";
import { findNode } from "../../graph/graph.js";

export function createResultView({ store, nodeId }) {
  const root = el("div", { class: "result-view" });

  function render() {
    const state = store.getState();
    const nodeState = state.runtime?.nodeStates?.[nodeId];
    const node = findNode(state.workflow.nodes, nodeId);

    root.replaceChildren();

    if (!nodeState) {
      root.appendChild(
        el("div", { class: "result-empty" }, [
          el("i", {
            class: "fa-solid fa-hourglass-half text-[13px] opacity-60",
          }),
          el("div", {}, "No result yet."),
          el(
            "div",
            { class: "text-muted text-[11px] mt-1" },
            "Run the workflow to see the result of this node.",
          ),
        ]),
      );
      return;
    }

    const statusRow = el("div", { class: "result-status" }, [
      el("i", {
        class: statusIconFor(nodeState.status),
      }),
      el(
        "span",
        { class: "result-status-label" },
        nodeState.status.toUpperCase(),
      ),
    ]);
    root.appendChild(statusRow);

    if (nodeState.error) {
      root.appendChild(
        el("div", { class: "result-error" }, [
          el("div", { class: "result-section-label" }, "Error"),
          el("div", { class: "result-error-text" }, nodeState.error),
        ]),
      );
    }

    if (nodeState.output != null) {
      root.appendChild(
        el("div", { class: "result-section" }, [
          el("div", { class: "result-section-label" }, "Output handle"),
          el("div", { class: "result-code" }, String(nodeState.output)),
        ]),
      );
    }

    const result = state.runtime?.lastResults?.[nodeId];
    const data = result?.data ?? null;

    if (data != null) {
      root.appendChild(
        el("div", { class: "result-section" }, [
          el("div", { class: "result-section-label" }, "Data"),
          el(
            "div",
            { class: "result-code" },
            typeof data === "string" ? data : JSON.stringify(data, null, 2),
          ),
        ]),
      );
    }

    if (nodeState.startedAt && nodeState.finishedAt) {
      root.appendChild(
        el("div", { class: "result-section" }, [
          el("div", { class: "result-section-label" }, "Duration"),
          el(
            "div",
            { class: "result-code" },
            formatMs(nodeState.finishedAt - nodeState.startedAt),
          ),
        ]),
      );
    }
  }

  render();
  store.subscribe(render);

  return root;
}

function statusIconFor(status) {
  switch (status) {
    case "success":
      return "fa-solid fa-circle-check text-[var(--color-success)]";
    case "error":
      return "fa-solid fa-circle-exclamation text-[var(--color-error)]";
    case "running":
      return "fa-solid fa-circle-notch fa-spin text-[var(--color-brand)]";
    case "skipped":
      return "fa-solid fa-forward text-[var(--color-text-muted)]";
    default:
      return "fa-solid fa-circle text-[var(--color-text-muted)]";
  }
}

function formatMs(ms) {
  if (!Number.isFinite(ms)) return "";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}
