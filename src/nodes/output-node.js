/* ============================================================
   Output Node — final output of a workflow.
   ============================================================ */

import { NODE_TYPES } from "../core/constants.js";

export const outputNodeDefinition = {
  type: NODE_TYPES.OUTPUT,
  label: "Output",
  icon: "fa-solid fa-flag-checkered",
  category: "core",
  accentVar: "--node-output-accent",
  description: "Final output of the workflow",

  inputs: [{ id: "in", label: "In" }],
  outputs: [],

  defaultData: () => ({
    label: "",
  }),

  getBodyPreview(node) {
    const label = node?.data?.label?.trim();
    return label ? label : "Returns final result";
  },

  renderConfig(/* node, container, onChange */) {
    // Release 6
  },

  validate(/* node */) {
    return null;
  },

  async execute(/* node, context */) {
    // Release 8
    return { output: null, data: null };
  },
};
