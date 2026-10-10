/* ============================================================
   Delay Node — waits before continuing.

   Release 2: visual only. Execution arrives in R8.
   ============================================================ */

import { NODE_TYPES } from "../core/constants.js";

export const delayNodeDefinition = {
  type: NODE_TYPES.DELAY,
  label: "Delay",
  icon: "fa-solid fa-clock",
  category: "utility",
  accentVar: "--node-delay-accent",
  description: "Wait before continuing",

  inputs: [{ id: "in", label: "In" }],
  outputs: [{ id: "out", label: "Out" }],

  defaultData: () => ({
    duration: 1000,
  }),

  getBodyPreview(node) {
    const ms = Number(node?.data?.duration);
    if (!Number.isFinite(ms) || ms <= 0) {
      return { kind: "delay", text: "No duration set", empty: true };
    }
    return { kind: "delay", text: `${ms} ms`, empty: false };
  },

  renderConfig(/* node, container, onChange */) {
    // Release 6
  },

  validate(node) {
    const ms = Number(node?.data?.duration);
    if (!Number.isFinite(ms) || ms <= 0) return "Duration must be > 0";
    return null;
  },

  async execute(/* node, context */) {
    // Release 8
    return { output: "out", data: null };
  },
};
