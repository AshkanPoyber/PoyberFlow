/* ============================================================
   Pan interaction.

   Two ways to pan:
   - Middle mouse button drag (anywhere in the workspace)
   - Space held + left mouse drag

   During pan we update the store directly (not via Command),
   because camera moves are not part of the undo history.
   ============================================================ */

export function attachPan({ workspaceEl, camera, store }) {
  let panning = null;
  let spaceHeld = false;

  /* ----- Space tracking ----- */
  window.addEventListener("keydown", (e) => {
    if (e.code === "Space" && !e.repeat) {
      // Ignore when typing in an input/textarea
      const t = e.target;
      const typing =
        t instanceof HTMLElement &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.isContentEditable);
      if (typing) return;

      spaceHeld = true;
      workspaceEl.style.cursor = "grab";
      e.preventDefault();
    }
  });

  window.addEventListener("keyup", (e) => {
    if (e.code === "Space") {
      spaceHeld = false;
      if (!panning) workspaceEl.style.cursor = "";
    }
  });

  /* ----- Pointer tracking ----- */
  workspaceEl.addEventListener("pointerdown", (e) => {
    const isMiddle = e.button === 1;
    const isSpaceLeft = e.button === 0 && spaceHeld;
    if (!isMiddle && !isSpaceLeft) return;

    // Don't start pan when the user is interacting with a node.
    if (e.target.closest("[data-node-id]")) return;

    panning = {
      pointerId: e.pointerId,
      lastX: e.clientX,
      lastY: e.clientY,
    };
    workspaceEl.setPointerCapture?.(e.pointerId);
    workspaceEl.style.cursor = "grabbing";
    e.preventDefault();
  });

  window.addEventListener("pointermove", (e) => {
    if (!panning || e.pointerId !== panning.pointerId) return;

    const dx = e.clientX - panning.lastX;
    const dy = e.clientY - panning.lastY;

    panning.lastX = e.clientX;
    panning.lastY = e.clientY;

    camera.panBy(dx, dy);
  });

  function endPan(e) {
    if (!panning || e.pointerId !== panning.pointerId) return;
    panning = null;
    workspaceEl.style.cursor = spaceHeld ? "grab" : "";
  }

  window.addEventListener("pointerup", endPan);
  window.addEventListener("pointercancel", endPan);
}
