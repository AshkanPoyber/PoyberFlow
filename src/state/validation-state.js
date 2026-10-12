/* ============================================================
   Validation State — subscribes to workflow changes and stores
   the latest validation result under state.validation.

   Runs a debounced validation (500ms) so a burst of edits
   produces a single validation pass.
   ============================================================ */

import { validateWorkflow } from "../engine/validator.js";

const DEBOUNCE_MS = 500;

export function attachValidation(store) {
  let timer = null;
  let lastWorkflow = store.getState().workflow;

  // Initial run
  const initial = validateWorkflow(lastWorkflow);
  store.setState({ validation: initial });

  store.subscribe((state) => {
    if (state.workflow === lastWorkflow) return;
    lastWorkflow = state.workflow;

    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      const result = validateWorkflow(store.getState().workflow);
      store.setState({ validation: result });
    }, DEBOUNCE_MS);
  });

  return {
    runNow() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      const result = validateWorkflow(store.getState().workflow);
      store.setState({ validation: result });
      return result;
    },
  };
}
