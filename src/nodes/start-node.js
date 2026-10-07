/* ============================================================
   Start Node — entry point of every workflow.

   Release 0: only `renderBody` is used. The other hooks
   (renderConfig, validate, execute) are placeholders that
   will be filled in during later releases.
   ============================================================ */

import { el } from "../utils/dom.js";
import { NODE_TYPES } from "../core/constants.js";

export const startNodeDefinition = {
  type: NODE_TYPES.START,
  label: "Start",
  icon: "fa-solid fa-play",
  category: "core",
  accentVar: "--node-start-accent",
  description: "Entry point of the workflow",

  inputs: [],
  outputs: [{ id: "out", label: "Out" }],

  defaultData: () => ({}),

  renderBody(node, bodyEl) {
    bodyEl.appendChild(
      el("div", { class: "node-body-text" }, "Workflow begins here"),
    );
  },

  renderConfig(/* node, container, onChange */) {
    // Release 6
  },

  validate(/* node */) {
    return null;
  },

  async execute(/* node, context */) {
    // Release 8
    return { output: "out", data: null };
  },
};
