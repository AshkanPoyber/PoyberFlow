/* ============================================================
   Workflow Templates — ready-made graphs users can load.

   Each template is a function returning { nodes, edges } with
   freshly generated IDs so loading it multiple times never
   collides with existing nodes.
   ============================================================ */

import { createNode } from "../graph/node-factory.js";
import { getNodeDefinition } from "../nodes/registry.js";
import { createEdge } from "../graph/edge.js";

function makeNode(type, position, data = {}) {
  const def = getNodeDefinition(type);
  if (!def) throw new Error(`Unknown node type: ${type}`);
  const node = createNode(def, position);
  node.data = { ...node.data, ...data };
  return node;
}

function connect(source, sourceHandle, target, targetHandle) {
  return createEdge({ source, sourceHandle, target, targetHandle });
}

export const TEMPLATES = [
  {
    id: "simple-http",
    name: "Simple HTTP Flow",
    description: "Fetch data from an API and return the result.",
    icon: "fa-solid fa-globe",
    accent: "--node-http-accent",
    build() {
      const start = makeNode("start", { x: 80, y: 160 }, { note: "API demo" });
      const http = makeNode(
        "http",
        { x: 360, y: 160 },
        {
          method: "GET",
          url: "https://api.example.com/users",
        },
      );
      const output = makeNode("output", { x: 640, y: 160 }, { label: "Users" });

      return {
        nodes: [start, http, output],
        edges: [
          connect(start.id, "out", http.id, "in"),
          connect(http.id, "out", output.id, "in"),
        ],
      };
    },
  },
  {
    id: "conditional",
    name: "Conditional Flow",
    description: "Branch based on a condition — true vs. false outputs.",
    icon: "fa-solid fa-code-branch",
    accent: "--node-if-accent",
    build() {
      const start = makeNode("start", { x: 80, y: 240 });
      const http = makeNode(
        "http",
        { x: 320, y: 240 },
        {
          method: "GET",
          url: "https://api.example.com/users/1",
        },
      );
      const cond = makeNode(
        "if",
        { x: 560, y: 240 },
        {
          condition: "last.data.status == 200",
        },
      );
      const outTrue = makeNode(
        "output",
        { x: 820, y: 120 },
        { label: "Success" },
      );
      const outFalse = makeNode(
        "output",
        { x: 820, y: 360 },
        { label: "Failure" },
      );

      return {
        nodes: [start, http, cond, outTrue, outFalse],
        edges: [
          connect(start.id, "out", http.id, "in"),
          connect(http.id, "out", cond.id, "in"),
          connect(cond.id, "true", outTrue.id, "in"),
          connect(cond.id, "false", outFalse.id, "in"),
        ],
      };
    },
  },
  {
    id: "delay-flow",
    name: "Delay Flow",
    description: "Wait 2 seconds and finish.",
    icon: "fa-solid fa-clock",
    accent: "--node-delay-accent",
    build() {
      const start = makeNode("start", { x: 80, y: 200 });
      const delay = makeNode("delay", { x: 340, y: 200 }, { duration: 2000 });
      const output = makeNode("output", { x: 600, y: 200 }, { label: "Done" });

      return {
        nodes: [start, delay, output],
        edges: [
          connect(start.id, "out", delay.id, "in"),
          connect(delay.id, "out", output.id, "in"),
        ],
      };
    },
  },
  {
    id: "api-to-output",
    name: "API Chain",
    description: "Two chained HTTP requests with interpolation.",
    icon: "fa-solid fa-diagram-project",
    accent: "--node-brand",
    build() {
      const start = makeNode("start", { x: 80, y: 200 });
      const http1 = makeNode(
        "http",
        { x: 320, y: 200 },
        {
          method: "GET",
          url: "https://api.example.com/users",
        },
      );
      const http2 = makeNode(
        "http",
        { x: 600, y: 200 },
        {
          method: "POST",
          url: "https://api.example.com/posts",
          body: '{"source":"poyberflow"}',
        },
      );
      const output = makeNode(
        "output",
        { x: 880, y: 200 },
        { label: "Result" },
      );

      return {
        nodes: [start, http1, http2, output],
        edges: [
          connect(start.id, "out", http1.id, "in"),
          connect(http1.id, "out", http2.id, "in"),
          connect(http2.id, "out", output.id, "in"),
        ],
      };
    },
  },
];

export function getTemplateById(id) {
  return TEMPLATES.find((t) => t.id === id) || null;
}
