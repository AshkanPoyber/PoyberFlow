/* ============================================================
   HTTP Request Node — performs an HTTP request.

   Release 2: only visual preview. Execution arrives in R8.
   ============================================================ */

import { NODE_TYPES } from "../core/constants.js";

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
    headers: {},
    query: {},
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

  renderConfig(/* node, container, onChange */) {
    // Release 6
  },

  validate(node) {
    if (!node?.data?.url?.trim()) return "URL is required";
    return null;
  },

  async execute(/* node, context */) {
    // Release 8
    return { output: "out", data: null };
  },
};
