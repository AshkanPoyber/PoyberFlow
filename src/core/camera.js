/* ============================================================
   Camera — single source of truth for viewport transforms.

   Contract:
   - The camera reads/writes state.viewport through the store.
   - Every screen↔world conversion in the app goes through here.
   - No other module is allowed to compute transforms manually.
   ============================================================ */

export const ZOOM_MIN = 0.25;
export const ZOOM_MAX = 2.5;
export const ZOOM_STEP = 1.2; // multiplied per zoom tick
export const FIT_MAX_ZOOM = 1; // never zoom past 100% on fit

export function createCamera(store) {
  function get() {
    return store.getState().viewport;
  }

  function set(partial) {
    const current = get();
    const next = {
      x: partial.x ?? current.x,
      y: partial.y ?? current.y,
      zoom: clampZoom(partial.zoom ?? current.zoom),
    };
    store.setState({ viewport: next });
  }

  function panBy(dx, dy) {
    const { x, y } = get();
    set({ x: x + dx, y: y + dy });
  }

  /** Convert a point in screen space to world space. */
  function screenToWorld(screenX, screenY, rect) {
    const { x, y, zoom } = get();
    return {
      x: (screenX - rect.left - x) / zoom,
      y: (screenY - rect.top - y) / zoom,
    };
  }

  /** Convert a point in world space to screen space (relative to rect). */
  function worldToScreen(worldX, worldY, rect) {
    const { x, y, zoom } = get();
    return {
      x: worldX * zoom + x + rect.left,
      y: worldY * zoom + y + rect.top,
    };
  }

  /** Convert a screen-space delta to a world-space delta (for drags). */
  function screenDeltaToWorldDelta(dx, dy) {
    const { zoom } = get();
    return { dx: dx / zoom, dy: dy / zoom };
  }

  /**
   * Zoom around a fixed screen point (anchor).
   * This keeps the world point under the cursor stationary.
   */
  function zoomAt(screenX, screenY, rect, newZoom) {
    const clamped = clampZoom(newZoom);
    const { x, y, zoom } = get();
    if (clamped === zoom) return;

    // World point currently under the anchor:
    const wx = (screenX - rect.left - x) / zoom;
    const wy = (screenY - rect.top - y) / zoom;

    // Solve for new translation so (wx, wy) stays at (screenX, screenY):
    const nextX = screenX - rect.left - wx * clamped;
    const nextY = screenY - rect.top - wy * clamped;

    set({ x: nextX, y: nextY, zoom: clamped });
  }

  function zoomByStep(screenCenterX, screenCenterY, rect, direction) {
    const { zoom } = get();
    const factor = direction > 0 ? ZOOM_STEP : 1 / ZOOM_STEP;
    zoomAt(screenCenterX, screenCenterY, rect, zoom * factor);
  }

  function reset() {
    set({ x: 0, y: 0, zoom: 1 });
  }

  /**
   * Fit all nodes into view with padding.
   * Falls back to reset() when there are no nodes.
   */
  function fitToScreen(rect, nodes, padding = 80) {
    if (!nodes || nodes.length === 0) {
      reset();
      return;
    }

    // Node sizes come from constants; we only need their extents.
    // Imported lazily to avoid circular deps in future refactors.
    const NODE_WIDTH = 220;
    const NODE_HEIGHT = 90; // rough; refined once real DOM heights exist

    let minX = Infinity,
      minY = Infinity;
    let maxX = -Infinity,
      maxY = -Infinity;

    for (const n of nodes) {
      minX = Math.min(minX, n.position.x);
      minY = Math.min(minY, n.position.y);
      maxX = Math.max(maxX, n.position.x + NODE_WIDTH);
      maxY = Math.max(maxY, n.position.y + NODE_HEIGHT);
    }

    const contentW = maxX - minX;
    const contentH = maxY - minY;
    const availW = rect.width - padding * 2;
    const availH = rect.height - padding * 2;

    const rawZoom = Math.min(availW / contentW, availH / contentH);
    const zoom = clampZoom(Math.min(rawZoom, FIT_MAX_ZOOM));

    // Center content
    const worldCenterX = (minX + maxX) / 2;
    const worldCenterY = (minY + maxY) / 2;

    const x = rect.width / 2 - worldCenterX * zoom;
    const y = rect.height / 2 - worldCenterY * zoom;

    set({ x, y, zoom });
  }

  return {
    get,
    set,
    panBy,
    screenToWorld,
    worldToScreen,
    screenDeltaToWorldDelta,
    zoomAt,
    zoomByStep,
    reset,
    fitToScreen,
  };
}

function clampZoom(z) {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z));
}
