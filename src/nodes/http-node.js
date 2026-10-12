/* ============================================================
   HTTP Request Node
   ============================================================ */

import { NODE_TYPES } from "../core/constants.js";
import {
  Field,
  TextInput,
  TextareaInput,
  NumberInput,
  SelectInput,
} from "../ui/panels/forms/index.js";
import { el } from "../utils/dom.js";

export const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];

export const httpNodeDefinition = {
  type: NODE_TYPES.HTTP,
  label: "HTTP Request",
  icon: "fa-solid fa-globe",
  category: "network",
  accentVar: "--node-http-accent",
  description: "Perform an HTTP request",

  inputs: [{ id: "in", label: "In" }],
  outputs: [{ id: "out", label: "Out" }],

  defaultData: () => ({
    method: "GET",
    url: "",
    headers: "",
    query: "",
    body: "",
    timeout: 10000,
  }),

  getBodyPreview(node) {
    const method = node?.data?.method || "GET";
    const url = node?.data?.url?.trim();
    return {
      kind: "http",
      method,
      url: url || "No URL set",
      empty: !url,
    };
  },

  renderConfig(node, container, onChange) {
    // Method + URL on the same row for compactness.
    const methodField = Field({
      label: "Method",
      control: SelectInput({
        value: node.data.method || "GET",
        options: HTTP_METHODS.map((m) => ({ value: m, label: m })),
        onChange: (value) => onChange({ method: value }),
      }),
    });

    const urlField = Field({
      label: "URL",
      required: true,
      control: TextInput({
        value: node.data.url || "",
        placeholder: "https://api.example.com/users",
        monospace: true,
        onCommit: (value) => onChange({ url: value }),
      }),
      error: !node.data.url?.trim() ? "URL is required" : null,
    });

    container.appendChild(methodField);
    container.appendChild(urlField);

    container.appendChild(
      Field({
        label: "Headers",
        control: TextareaInput({
          value: node.data.headers || "",
          placeholder:
            "Authorization: Bearer ...\nContent-Type: application/json",
          rows: 3,
          monospace: true,
          onCommit: (value) => onChange({ headers: value }),
        }),
        helper: "One header per line: Key: Value",
      }),
    );

    container.appendChild(
      Field({
        label: "Query Parameters",
        control: TextareaInput({
          value: node.data.query || "",
          placeholder: "page: 1\nlimit: 20",
          rows: 3,
          monospace: true,
          onCommit: (value) => onChange({ query: value }),
        }),
        helper: "One parameter per line: key: value",
      }),
    );

    container.appendChild(
      Field({
        label: "Body",
        control: TextareaInput({
          value: node.data.body || "",
          placeholder: '{ "name": "Poyber" }',
          rows: 5,
          monospace: true,
          onCommit: (value) => onChange({ body: value }),
        }),
        helper: "Used for POST / PUT / PATCH.",
      }),
    );

    container.appendChild(
      Field({
        label: "Timeout (ms)",
        control: NumberInput({
          value: node.data.timeout ?? 10000,
          min: 100,
          step: 100,
          onCommit: (value) => onChange({ timeout: value }),
        }),
      }),
    );
  },

  validate(node) {
    if (!node?.data?.url?.trim()) return "URL is required";
    return null;
  },

  async execute() {
    return { output: "out", data: null };
  },
};
