/* ============================================================
   Textarea — multi-line input.
   ============================================================ */

import { el } from "../../../utils/dom.js";

export function TextareaInput({
  value = "",
  placeholder = "",
  rows = 4,
  monospace = false,
  onInput,
  onCommit,
  disabled = false,
}) {
  const ta = el("textarea", {
    class: `form-control resize-y min-h-[60px] ${
      monospace ? "font-mono text-[12px]" : ""
    }`,
    rows,
    placeholder,
    disabled,
  });
  ta.value = value;

  let debounceTimer = null;

  ta.addEventListener("input", () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    const next = ta.value;
    debounceTimer = setTimeout(() => {
      onInput?.(next);
    }, 500);
  });

  ta.addEventListener("blur", () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    onCommit?.(ta.value);
  });

  return ta;
}
