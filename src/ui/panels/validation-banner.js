/* ============================================================
   Validation Banner — collapsible summary at the bottom of the
   workspace. Shows counts and expands to list every issue.

   Clicking an issue selects the related node (and centers it).
   ============================================================ */

import { el, clear } from "../../utils/dom.js";

export function createValidationBanner({ store, onFocusIssue }) {
  const root = el("div", { class: "validation-banner" });

  let expanded = false;

  function render() {
    const { validation } = store.getState();
    const errors = validation?.errors || [];
    const warnings = validation?.warnings || [];
    const total = errors.length + warnings.length;

    clear(root);

    // Nothing to show and no previous state → hide entirely.
    if (total === 0) {
      root.classList.add("is-hidden");
      return;
    }
    root.classList.remove("is-hidden");

    /* ---------- Header ---------- */

    const header = el(
      "div",
      {
        class: "validation-header",
        onclick: toggleExpanded,
      },
      [
        el("i", {
          class: `validation-status-icon ${
            errors.length > 0
              ? "fa-solid fa-circle-exclamation"
              : "fa-solid fa-triangle-exclamation"
          }`,
        }),
        el(
          "div",
          { class: "validation-summary" },
          buildSummary(errors.length, warnings.length),
        ),
        el("div", { class: "flex-1" }),
        el("i", {
          class: `fa-solid fa-chevron-${
            expanded ? "down" : "up"
          } validation-chevron`,
        }),
      ],
    );

    root.appendChild(header);

    /* ---------- List (when expanded) ---------- */

    if (expanded) {
      const list = el("div", { class: "validation-list" });

      for (const issue of [...errors, ...warnings]) {
        list.appendChild(createIssueRow(issue, { onFocusIssue, store }));
      }

      root.appendChild(list);
    }
  }

  function toggleExpanded() {
    expanded = !expanded;
    render();
  }

  render();
  store.subscribe(render);

  return root;
}

function buildSummary(errorCount, warningCount) {
  const parts = [];
  if (errorCount > 0) {
    parts.push(`${errorCount} error${errorCount === 1 ? "" : "s"}`);
  }
  if (warningCount > 0) {
    parts.push(`${warningCount} warning${warningCount === 1 ? "" : "s"}`);
  }
  return parts.join(" · ");
}

function createIssueRow(issue, { onFocusIssue }) {
  const isError = issue.level === "error";

  return el(
    "div",
    {
      class: `validation-row ${isError ? "is-error" : "is-warning"}`,
      onclick: () => onFocusIssue?.(issue),
    },
    [
      el("i", {
        class: isError
          ? "fa-solid fa-circle-exclamation"
          : "fa-solid fa-triangle-exclamation",
      }),
      el("span", { class: "validation-row-text" }, issue.message),
      issue.nodeId
        ? el("i", {
            class: "fa-solid fa-crosshairs validation-row-focus",
          })
        : null,
    ].filter(Boolean),
  );
}
