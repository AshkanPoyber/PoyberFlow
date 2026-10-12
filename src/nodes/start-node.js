/* ============================================================
   Start Node
   ============================================================ */

import { NODE_TYPES } from "../core/constants.js";
import { Field, TextareaInput } from "../ui/panels/forms/index.js";
import { el } from "../utils/dom.js";

export const startNodeDefinition = {
  type: NODE_TYPES.START,
  label: "Start",
  icon: "fa-solid fa-play",
  category: "core",
  accentVar: "--node-start-accent",
  description: "Entry point of the workflow",

  inputs: [],
  outputs: [{ id: "out", label: "Out" }],

  defaultData: () => ({
    note: "",
  }),

  getBodyPreview(node) {
    return node?.data?.note?.trim() || "Workflow begins here";
  },

  renderConfig(node, container, onChange) {
    container.appendChild(
      Field({
        label: "Note",
        control: TextareaInput({
          value: node.data.note || "",
          placeholder: "Optional note for this entry point",
          rows: 3,
          onCommit: (value) => onChange({ note: value }),
        }),
        helper: "Shown on the node preview.",
      }),
    );
  },

  validate() {
    return null;
  },

  async execute() {
    return { output: "out", data: null };
  },
};
