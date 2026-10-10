/* ============================================================
   Workspace — the infinite canvas area.

   Structure:
     workspace (relative, overflow-hidden)
       ├── grid     (background)
       └── viewport (transform: translate + scale)
              ├── edges SVG layer     ← NEW
              └── nodes layer
   ============================================================ */

import { el } from "../../utils/dom.js";

const SVG_NS = "http://www.w3.org/2000/svg";

export function createWorkspace() {
  const root = el("main", {
    class: "flex-1 relative overflow-hidden workspace-grid",
  });

  const viewport = el("div", {
    class: "absolute top-0 left-0 w-full h-full",
    id: "workspace-viewport",
    style: { transformOrigin: "0 0" },
  });

  // SVG layer for edges — sits under nodes.
  const edgesLayer = document.createElementNS(SVG_NS, "svg");
  edgesLayer.setAttribute("class", "edges-layer");
  edgesLayer.setAttribute("xmlns", SVG_NS);
  edgesLayer.style.position = "absolute";
  edgesLayer.style.inset = "0";
  edgesLayer.style.width = "100%";
  edgesLayer.style.height = "100%";
  edgesLayer.style.overflow = "visible";
  edgesLayer.style.pointerEvents = "none";

  const nodesLayer = el("div", { class: "nodes-layer" });
  nodesLayer.style.position = "absolute";
  nodesLayer.style.inset = "0";
  nodesLayer.style.pointerEvents = "none";

  viewport.appendChild(edgesLayer);
  viewport.appendChild(nodesLayer);
  root.appendChild(viewport);

  return { root, viewport, edgesLayer, nodesLayer };
}
