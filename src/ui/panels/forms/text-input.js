/* ============================================================
   Text input — single line.
   ============================================================ */

import { el } from "../../../utils/dom.js";

export function TextInput({
  value = "",
  placeholder = "",
  monospace = false,
  onInput,
  onCommit,
  disabled = false,
}) {
  const input = el("input", {
    type: "text",
    class: `form-control ${monospace ? "font-mono text-[12px]" : ""}`,
    value,
    placeholder,
    disabled,
  });

  let debounceTimer = null;

  input.addEventListener("input", () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    const next = input.value;
    debounceTimer = setTimeout(() => {
      onInput?.(next);
    }, 500);
  });

  input.addEventListener("blur", () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    onCommit?.(input.value);
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (debounceTimer) {
        clearTimeout(debounceTimer);
        debounceTimer = null;
      }
      onCommit?.(input.value);
      input.blur();
    }
  });

  return input;
}
