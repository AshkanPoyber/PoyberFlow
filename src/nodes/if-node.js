/* ============================================================
   IF Node — conditional branching.

   Two outputs: `true` and `false`.
   Release 2: visual only. Execution arrives in R8.
   ============================================================ */

import { NODE_TYPES } from "../core/constants.js";

export const ifNodeDefinition = {
  type: NODE_TYPES.IF,
  label: "IF",
  icon: "fa-solid fa-code-branch",
  category: "logic",
  accentVar: "--node-if-accent",
  description: "Branch based on a condition",

  inputs: [{ id: "in", label: "In" }],
  outputs: [
    { id: "true", label: "True", variant: "success" },
    { id: "false", label: "False", variant: "error" },
  ],

  defaultData: () => ({
    condition: "",
  }),

  getBodyPreview(node) {
    const cond = node?.data?.condition?.trim();
    return {
      kind: "if",
      condition: cond || "No condition set",
      empty: !cond,
    };
  },

  renderConfig(/* node, container, onChange */) {
    // Release 6
  },

  validate(node) {
    if (!node?.data?.condition?.trim()) return "Condition is required";
    return null;
  },

  async execute(/* node, context */) {
    // Release 8
    return { output: "true", data: null };
  },
};
