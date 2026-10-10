/* ============================================================
   Viewport Renderer — applies the camera transform.

   Rules:
   - Reads from state. Never mutates.
   - Uses `translate3d` to hint GPU compositing.
   ============================================================ */

export function createViewportRenderer(viewportEl) {
  return function render(state) {
    const { x, y, zoom } = state.viewport;
    viewportEl.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${zoom})`;
  };
}
