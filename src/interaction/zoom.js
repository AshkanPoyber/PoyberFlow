/* ============================================================
   Zoom interaction — Ctrl/Cmd + wheel.

   Zooms around the cursor's position so the point under the
   cursor stays stationary. Uses camera.zoomAt() for the math.
   ============================================================ */

export function attachZoom({ workspaceEl, camera }) {
  workspaceEl.addEventListener(
    "wheel",
    (e) => {
      // Ctrl on Windows/Linux, Cmd on macOS, or pinch on trackpad
      const isZoomGesture = e.ctrlKey || e.metaKey;
      if (!isZoomGesture) return;

      e.preventDefault();

      const rect = workspaceEl.getBoundingClientRect();
      const { zoom } = camera.get();

      // Trackpad pinch sends many small deltas. Normalize:
      const intensity = -e.deltaY * 0.01;
      const nextZoom = zoom * Math.exp(intensity);

      camera.zoomAt(e.clientX, e.clientY, rect, nextZoom);
    },
    { passive: false },
  );
}
