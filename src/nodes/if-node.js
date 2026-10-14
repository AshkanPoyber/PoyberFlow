/* ============================================================
   IF Node
   ============================================================ */

import { NODE_TYPES } from "../core/constants.js";
import { Field, TextInput } from "../ui/panels/forms/index.js";
import { evaluateExpression } from "../engine/expression.js";
import { ExpressionError } from "../engine/errors.js";

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

  renderConfig(node, container, onChange) {
    container.appendChild(
      Field({
        label: "Condition",
        required: true,
        control: TextInput({
          value: node.data.condition || "",
          placeholder: "user.age >= 18",
          monospace: true,
          onCommit: (value) => onChange({ condition: value }),
        }),
        error: !node.data.condition?.trim() ? "Condition is required" : null,
        helper: "Supports comparisons and && / ||. Use {{nodeId.data.field}}.",
      }),
    );
  },

  validate(node) {
    if (!node?.data?.condition?.trim()) return "Condition is required";
    return null;
  },

  async execute(node, context, { nodeIdByName }) {
    const source = node.data.condition?.trim();
    if (!source) {
      throw new ExpressionError("Condition is empty", { nodeId: node.id });
    }

    let result = false;
    try {
      result = evaluateExpression(source, context, nodeIdByName);
    } catch (err) {
      throw new ExpressionError(`Invalid condition: ${err.message}`, {
        nodeId: node.id,
      });
    }

    return {
      output: result ? "true" : "false",
      data: { result },
    };
  },
};
