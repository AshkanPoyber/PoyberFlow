/* ============================================================
   Start Node — entry point of every workflow.
   ============================================================ */

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

  getBodyPreview() {
    return "Workflow begins here";
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
