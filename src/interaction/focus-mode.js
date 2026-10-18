/* ============================================================
   Focus Mode — hide the left and right sidebars for a
   distraction-free workspace.

   Triggered by the toolbar button or the "F" key.
   ============================================================ */

export function attachFocusMode({ app, leftSidebar, rightSidebar }) {
  let enabled = false;

  function toggle() {
    enabled = !enabled;
    app.classList.toggle("is-focus-mode", enabled);
  }

  window.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() !== "f") return;
    const t = e.target;
    if (
      t instanceof HTMLElement &&
      (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)
    ) {
      return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    e.preventDefault();
    toggle();
  });

  return { toggle, isEnabled: () => enabled };
}
