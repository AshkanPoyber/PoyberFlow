/* ============================================================
   Select — custom styled select.
   ============================================================ */

import { el } from "../../../utils/dom.js";

export function SelectInput({
  value = "",
  options = [],
  onChange,
  disabled = false,
}) {
  const wrap = el("div", { class: "select-wrap" });

  const select = el(
    "select",
    {
      class: "form-control form-select",
      disabled,
    },
    options.map((opt) =>
      el(
        "option",
        {
          value: opt.value,
          selected: opt.value === value ? "selected" : null,
        },
        opt.label,
      ),
    ),
  );

  select.addEventListener("change", () => {
    onChange?.(select.value);
  });

  const chevron = el("i", {
    class: "fa-solid fa-chevron-down select-chevron",
  });

  wrap.append(select, chevron);
  return wrap;
}
