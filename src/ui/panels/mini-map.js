/* ============================================================
   Mini Map — a small overview of the entire workflow.

   Renders:
   - Every node as a small rectangle, tinted by its accent.
   - The current viewport as a rectangle overlay.
   - Clicking/dragging inside recenters the camera.

   The map auto-fits the graph into its own bounds.
   ============================================================ */

import { el, clear } from "../../utils/dom.js";
import { getNodeDefinition } from "../../nodes/registry.js";

const WIDTH = 220;
const HEIGHT = 160;
const PADDING = 12;

export function createMiniMap({ store, camera, workspaceEl }) {
  let collapsed = false;

  const root = el("div", { class: "mini-map" });
  const header = el("div", { class: "mini-map-header" });
  const canvas = el("div", { class: "mini-map-canvas" });

  const inner = el("div", { class: "mini-map-inner" });
  canvas.appendChild(inner);
  root.append(header, canvas);

  let worldRect = { minX: 0, minY: 0, maxX: 1000, maxY: 700 };
  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;

  /* ---------- Header ---------- */

  function renderHeader() {
    clear(header);
    header.append(
      el("span", { class: "mini-map-title" }, "Overview"),
      el("div", { class: "flex-1" }),
      el(
        "button",
        {
          type: "button",
          class: "mini-map-toggle",
          title: collapsed ? "Expand mini map" : "Collapse mini map",
          onclick: (e) => {
            e.stopPropagation();
            collapsed = !collapsed;
            root.classList.toggle("is-collapsed", collapsed);
            renderHeader();
          },
        },
        [
          el("i", {
            class: `fa-solid fa-chevron-${collapsed ? "up" : "down"} text-[9px]`,
          }),
        ],
      ),
    );
  }

  /* ---------- Graph bounds ---------- */

  function computeWorldBounds(nodes) {
    if (nodes.length === 0) {
      return { minX: 0, minY: 0, maxX: 1000, maxY: 700 };
    }
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const n of nodes) {
      minX = Math.min(minX, n.position.x);
      minY = Math.min(minY, n.position.y);
      maxX = Math.max(maxX, n.position.x + 220);
      maxY = Math.max(maxY, n.position.y + 80);
    }
    return { minX, minY, maxX, maxY };
  }

  function fitToCanvas() {
    const w = WIDTH - PADDING * 2;
    const h = HEIGHT - PADDING * 2;
    const worldW = Math.max(1, worldRect.maxX - worldRect.minX);
    const worldH = Math.max(1, worldRect.maxY - worldRect.minY);
    scale = Math.min(w / worldW, h / worldH);
    offsetX = PADDING + (w - worldW * scale) / 2 - worldRect.minX * scale;
    offsetY = PADDING + (h - worldH * scale) / 2 - worldRect.minY * scale;
  }

  function worldToMap(x, y) {
    return { x: x * scale + offsetX, y: y * scale + offsetY };
  }

  /* ---------- Rendering ---------- */

  function renderNodes(nodes) {
    // Remove old node rectangles (keep viewport overlay)
    for (const el of [...inner.querySelectorAll(".mini-map-node")]) {
      el.remove();
    }

    for (const n of nodes) {
      const def = getNodeDefinition(n.type);
      const accent = def?.accentVar
        ? `var(${def.accentVar})`
        : "var(--color-brand)";

      const p = worldToMap(n.position.x, n.position.y);
      const w = 220 * scale;
      const h = 80 * scale;

      const rect = el("div", {
        class: "mini-map-node",
        style: {
          left: `${p.x}px`,
          top: `${p.y}px`,
          width: `${Math.max(4, w)}px`,
          height: `${Math.max(3, h)}px`,
          background: accent,
        },
      });
      inner.appendChild(rect);
    }
  }

  function renderViewportOverlay() {
    let overlay = inner.querySelector(".mini-map-viewport");
    if (!overlay) {
      overlay = el("div", { class: "mini-map-viewport" });
      inner.appendChild(overlay);
    }

    const rect = workspaceEl.getBoundingClientRect();
    const { x, y, zoom } = camera.get();

    // Viewport's top-left in world space
    const worldLeft = -x / zoom;
    const worldTop = -y / zoom;
    const worldRight = worldLeft + rect.width / zoom;
    const worldBottom = worldTop + rect.height / zoom;

    const p1 = worldToMap(worldLeft, worldTop);
    const p2 = worldToMap(worldRight, worldBottom);

    overlay.style.left = `${p1.x}px`;
    overlay.style.top = `${p1.y}px`;
    overlay.style.width = `${Math.max(8, p2.x - p1.x)}px`;
    overlay.style.height = `${Math.max(6, p2.y - p1.y)}px`;
  }

  function render() {
    const state = store.getState();
    const nodes = state.workflow.nodes;

    worldRect = computeWorldBounds(nodes);
    fitToCanvas();

    renderNodes(nodes);
    renderViewportOverlay();
  }

  /* ---------- Camera control on click ---------- */

  canvas.addEventListener("pointerdown", (event) => {
    if (collapsed) return;
    event.preventDefault();

    const bounds = canvas.getBoundingClientRect();
    const localX = event.clientX - bounds.left;
    const localY = event.clientY - bounds.top;

    // Convert map-space to world-space
    const worldX = (localX - offsetX) / scale;
    const worldY = (localY - offsetY) / scale;

    const rect = workspaceEl.getBoundingClientRect();
    const { zoom } = camera.get();

    camera.set({
      x: rect.width / 2 - worldX * zoom,
      y: rect.height / 2 - worldY * zoom,
      zoom,
    });
  });

  renderHeader();
  render();
  store.subscribe(render);

  return root;
}
