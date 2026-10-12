/* ============================================================
   Auto-save — debounced writes to LocalStorage.

   Subscribes to the store and saves whenever `state.workflow`
   or `state.viewport` changes. Uses a 1s debounce.
   ============================================================ */

import { saveWorkflow } from "./local.js";

const DEBOUNCE_MS = 1000;

export function attachAutosave(store, { onSaved, onError } = {}) {
  let timer = null;
  let lastWorkflow = store.getState().workflow;
  let lastViewport = store.getState().viewport;

  function schedule(state) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      const result = saveWorkflow(state);
      if (result.ok) {
        onSaved?.(result.payload);
      } else {
        onError?.(result.error);
      }
    }, DEBOUNCE_MS);
  }

  store.subscribe((state) => {
    const workflowChanged = state.workflow !== lastWorkflow;
    const viewportChanged = state.viewport !== lastViewport;

    lastWorkflow = state.workflow;
    lastViewport = state.viewport;

    if (workflowChanged || viewportChanged) schedule(state);
  });

  return {
    flush() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
        saveWorkflow(store.getState());
      }
    },
  };
}
