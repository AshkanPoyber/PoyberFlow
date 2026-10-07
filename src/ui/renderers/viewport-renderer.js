/* ============================================================
   Viewport Renderer — applies camera transform.

   Release 0: only applies state. Pan/zoom interaction arrives
   in Release 1, but the transform pipeline is already correct.
   ============================================================ */

export function createViewportRenderer(viewportEl) {
  return function render(state) {
    const { x, y, zoom } = state.viewport;
    viewportEl.style.transform = `translate(${x}px, ${y}px) scale(${zoom})`;
  };
}
