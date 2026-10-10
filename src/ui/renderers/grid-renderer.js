/* ============================================================
   Grid Renderer — moves and scales the workspace grid so it
   stays visually aligned with the world.

   The grid is drawn with two CSS gradients on the workspace
   background. We only update `background-position` and
   `background-size`, which is a cheap compositor-only change.
   ============================================================ */

import { GRID_SIZE } from "../../core/constants.js";

export function createGridRenderer(gridEl) {
  return function render(state) {
    const { x, y, zoom } = state.viewport;
    const size = GRID_SIZE * zoom;

    // At very small zoom levels the grid becomes visual noise.
    // Hide it below 40% to keep the canvas calm.
    if (zoom < 0.4) {
      gridEl.style.backgroundImage = "none";
      return;
    }

    gridEl.style.backgroundImage = `
      linear-gradient(var(--color-grid) 1px, transparent 1px),
      linear-gradient(90deg, var(--color-grid) 1px, transparent 1px)
    `.trim();

    gridEl.style.backgroundSize = `${size}px ${size}px`;
    gridEl.style.backgroundPosition = `${x}px ${y}px`;
  };
}
