/* ============================================================
   Number input — with optional min/max/step.
   ============================================================ */

import { el } from "../../../utils/dom.js";

export function NumberInput({
  value = 0,
  min,
  max,
  step = 1,
  placeholder = "",
  onInput,
  onCommit,
  disabled = false,
}) {
  const input = el("input", {
    type: "number",
    class: "form-control font-mono text-[12px]",
    value: String(value),
    min: min ?? null,
    max: max ?? null,
    step,
    placeholder,
    disabled,
  });

  let debounceTimer = null;

  input.addEventListener("input", () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    const next = input.value;
    debounceTimer = setTimeout(() => {
      onInput?.(toNumber(next));
    }, 500);
  });

  input.addEventListener("blur", () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    onCommit?.(toNumber(input.value));
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (debounceTimer) {
        clearTimeout(debounceTimer);
        debounceTimer = null;
      }
      onCommit?.(toNumber(input.value));
      input.blur();
    }
  });

  return input;
}

function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
