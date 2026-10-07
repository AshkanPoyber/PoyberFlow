/* ============================================================
   Workspace — the infinite canvas area.

   Structure:
     workspace (relative, overflow-hidden)
       ├── grid     (background)
       └── viewport (transform: translate + scale)
              └── nodes layer (mounted by viewport-renderer)
   ============================================================ */

import { el } from "../../utils/dom.js";

export function createWorkspace() {
  const root = el("main", {
    class: "flex-1 relative overflow-hidden workspace-grid",
  });

  const viewport = el("div", {
    class: "absolute top-0 left-0 w-full h-full",
    style: {
      transformOrigin: "0 0",
    },
  });

  const nodesLayer = el("div", { class: "nodes-layer" });
  viewport.appendChild(nodesLayer);
  root.appendChild(viewport);

  return { root, viewport, nodesLayer };
}
