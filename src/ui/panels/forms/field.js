/* ============================================================
   Field — wrapper for a labeled form row.

   Layout:
     ┌───────────────────────┐
     │ Label            [opt]│
     │ ┌───────────────────┐ │
     │ │ input / control   │ │
     │ └───────────────────┘ │
     │ helper or error       │
     └───────────────────────┘
   ============================================================ */

import { el } from "../../../utils/dom.js";

export function Field({ label, control, helper, error, required = false }) {
  const labelRow = el(
    "div",
    { class: "flex items-center justify-between mb-1.5" },
    [
      el(
        "span",
        {
          class:
            "text-[11px] font-medium uppercase tracking-wider text-secondary",
        },
        label,
      ),
      required
        ? el(
            "span",
            {
              class: "text-[10px] text-muted normal-case tracking-normal",
            },
            "required",
          )
        : null,
    ].filter(Boolean),
  );

  const wrap = el("div", { class: "form-field" }, [labelRow, control]);

  if (error) {
    wrap.appendChild(
      el(
        "div",
        {
          class: "form-error",
        },
        [
          el("i", { class: "fa-solid fa-circle-exclamation text-[10px]" }),
          " ",
          error,
        ],
      ),
    );
    wrap.classList.add("has-error");
  } else if (helper) {
    wrap.appendChild(el("div", { class: "form-helper" }, helper));
  }

  return wrap;
}
