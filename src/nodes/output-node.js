/* ============================================================
   Output Node
   ============================================================ */

import { NODE_TYPES } from "../core/constants.js";
import { Field, TextInput } from "../ui/panels/forms/index.js";

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

  renderConfig(node, container, onChange) {
    container.appendChild(
      Field({
        label: "Output label",
        control: TextInput({
          value: node.data.label || "",
          placeholder: "e.g. Success",
          onCommit: (value) => onChange({ label: value }),
        }),
        helper: "A short label describing this output.",
      }),
    );
  },

  validate() {
    return null;
  },

  async execute() {
    return { output: null, data: null };
  },
};
