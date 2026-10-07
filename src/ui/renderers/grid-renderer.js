/* ============================================================
   Grid Renderer — updates grid offset so the grid "moves" with
   the viewport.

   Release 0: viewport is (0, 0, 1) so this is a no-op, but the
   plumbing is here so Release 1's pan feels correct immediately.
   ============================================================ */

export function createGridRenderer(gridEl) {
  return function render(state) {
    const { x, y } = state.viewport;
    gridEl.style.backgroundPosition = `${x}px ${y}px`;
  };
}
