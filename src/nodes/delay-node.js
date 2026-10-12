/* ============================================================
   Delay Node
   ============================================================ */

import { NODE_TYPES } from "../core/constants.js";
import { Field, NumberInput } from "../ui/panels/forms/index.js";

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

  renderConfig(node, container, onChange) {
    container.appendChild(
      Field({
        label: "Duration (ms)",
        required: true,
        control: NumberInput({
          value: node.data.duration ?? 1000,
          min: 1,
          step: 100,
          onCommit: (value) => onChange({ duration: value }),
        }),
        error:
          !Number.isFinite(node.data.duration) || node.data.duration <= 0
            ? "Duration must be greater than 0"
            : null,
      }),
    );
  },

  validate(node) {
    const ms = Number(node?.data?.duration);
    if (!Number.isFinite(ms) || ms <= 0) return "Duration must be > 0";
    return null;
  },

  async execute() {
    return { output: "out", data: null };
  },
};
