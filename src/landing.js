/* ============================================================
   PoyberFlow — Landing Page entry.

   The landing page is a static marketing page. It does not
   import the app; it only handles the theme toggle and any
   lightweight interactivity (FAQ accordion, scroll animations).
   ============================================================ */

import { el } from "./utils/dom.js";

/* ---------- Theme (self-contained) ---------- */

const THEME_KEY = "poyberflow:theme";

function detectInitialTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark") return stored;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

let currentTheme = detectInitialTheme();
applyTheme(currentTheme);

function toggleTheme() {
  currentTheme = currentTheme === "dark" ? "light" : "dark";
  localStorage.setItem(THEME_KEY, currentTheme);
  applyTheme(currentTheme);
  updateThemeIcon();
}

function updateThemeIcon() {
  const icon = document.querySelector("#theme-toggle i");
  if (!icon) return;
  icon.className =
    currentTheme === "dark"
      ? "fa-solid fa-sun text-sm"
      : "fa-solid fa-moon text-sm";
}

/* ---------- Data ---------- */

const FEATURES = [
  {
    icon: "fa-solid fa-diagram-project",
    title: "Visual workflow builder",
    desc: "Drag nodes onto an infinite canvas. Connect them with smooth bezier edges. See your logic take shape.",
  },
  {
    icon: "fa-solid fa-bolt",
    title: "Real execution",
    desc: "Run workflows with HTTP requests, conditionals, delays, and outputs. Watch each node transition live.",
  },
  {
    icon: "fa-solid fa-code-branch",
    title: "IF branching",
    desc: "Branch on conditions using a small expression language. Support for comparisons, && / ||, and path access.",
  },
  {
    icon: "fa-solid fa-clock-rotate-left",
    title: "Undo / redo",
    desc: "Every action is captured as a command. Undo node moves, connections, edits, and deletions instantly.",
  },
  {
    icon: "fa-solid fa-magnifying-glass",
    title: "Command palette",
    desc: "Press Ctrl+K to add nodes, run, save, or jump to templates — all without leaving the keyboard.",
  },
  {
    icon: "fa-solid fa-shapes",
    title: "Templates",
    desc: "Start from simple HTTP flows, conditional branches, or chained API requests. Modify as you like.",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Add nodes",
    desc: "Click any node from the library or open the command palette to add it to the canvas.",
  },
  {
    num: "02",
    title: "Connect and configure",
    desc: "Drag from an output handle to an input handle. Fill in the properties panel on the right.",
  },
  {
    num: "03",
    title: "Run",
    desc: "Press Run. Watch every node light up as execution flows through the graph.",
  },
];

const FAQ = [
  {
    q: "Is PoyberFlow free?",
    a: "Yes. PoyberFlow is an open-source project released under the MIT license.",
  },
  {
    q: "Does it require a backend?",
    a: "No. Everything runs in your browser. Workflows are persisted to local storage. A backend is planned for future releases.",
  },
  {
    q: "What can I build with it?",
    a: "API testing flows, condition-based pipelines, quick automation prototypes, and interactive documentation of process logic.",
  },
  {
    q: "Which technologies does it use?",
    a: "Vanilla JavaScript (ES Modules), HTML, CSS with custom properties, Tailwind CSS via CDN, and SVG for edges. No frameworks.",
  },
  {
    q: "Can I use my own node types?",
    a: "Yes. The node system is built around a registry — adding a new node means writing a single definition file.",
  },
  {
    q: "Will my workflows be saved?",
    a: "Yes. They're persisted to your browser's local storage. You can also export any workflow as JSON.",
  },
];

/* ---------- Sections ---------- */

function sectionNav() {
  const themeBtn = el(
    "button",
    {
      id: "theme-toggle",
      type: "button",
      class: "landing-theme-btn",
      "aria-label": "Toggle theme",
      onclick: toggleTheme,
    },
    [el("i", { class: "fa-solid fa-sun text-sm" })],
  );

  const nav = el("nav", { class: "landing-nav" }, [
    el("div", { class: "landing-nav-inner" }, [
      el("a", { href: "./index.html", class: "landing-logo" }, [
        el(
          "div",
          {
            class:
              "w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--color-brand)] text-white",
          },
          [el("i", { class: "fa-solid fa-diagram-project text-[13px]" })],
        ),
        el("span", { class: "landing-logo-text" }, "PoyberFlow"),
      ]),
      el("div", { class: "landing-nav-links" }, [
        el("a", { href: "#features" }, "Features"),
        el("a", { href: "#how-it-works" }, "How it works"),
        el("a", { href: "#faq" }, "FAQ"),
        el(
          "a",
          {
            href: "https://github.com/AshkanPoyber/PoyberFlow",
            target: "_blank",
            rel: "noopener",
            class: "landing-nav-icon",
            "aria-label": "GitHub",
          },
          [el("i", { class: "fa-brands fa-github text-sm" })],
        ),
        themeBtn,
        el("a", { href: "./app.html", class: "landing-cta-small" }, [
          el("span", {}, "Open app"),
          el("i", { class: "fa-solid fa-arrow-right text-[10px]" }),
        ]),
      ]),
    ]),
  ]);

  return nav;
}

function sectionHero() {
  return el("section", { class: "landing-hero" }, [
    el("div", { class: "landing-hero-bg" }),
    el("div", { class: "landing-hero-content" }, [
      el("div", { class: "landing-hero-badge" }, [
        el("i", { class: "fa-solid fa-star text-[10px]" }),
        el("span", {}, "Open source · MIT licensed"),
      ]),
      el("h1", { class: "landing-hero-title" }, [
        "Build workflows ",
        el("span", { class: "landing-hero-title-accent" }, "visually."),
      ]),
      el(
        "p",
        { class: "landing-hero-subtitle" },
        "Design, connect, and run workflows in your browser. No frameworks, no backend, no build step — just pure Vanilla JavaScript.",
      ),
      el("div", { class: "landing-hero-ctas" }, [
        el(
          "a",
          { href: "./app.html", class: "landing-btn landing-btn-primary" },
          [
            el("i", { class: "fa-solid fa-play text-[11px]" }),
            "Start building",
          ],
        ),
        el(
          "a",
          {
            href: "https://github.com/AshkanPoyber/PoyberFlow",
            target: "_blank",
            rel: "noopener",
            class: "landing-btn landing-btn-ghost",
          },
          [el("i", { class: "fa-brands fa-github text-sm" }), "View on GitHub"],
        ),
      ]),
      el(
        "div",
        { class: "landing-hero-meta" },
        "Vanilla JavaScript · ES Modules · SVG · LocalStorage",
      ),
    ]),
    el("div", { class: "landing-hero-visual" }, [
      el("div", { class: "landing-hero-mockup" }, [buildMockupGraph()]),
    ]),
  ]);
}

function buildMockupGraph() {
  // A small animated SVG mockup that hints at the workflow builder.
  // Nodes and edges are drawn with CSS animations (see landing.css).
  const SVG_NS = "http://www.w3.org/2000/svg";

  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 600 400");
  svg.setAttribute("class", "mockup-svg");

  // Grid background (drawn with a pattern)
  const defs = document.createElementNS(SVG_NS, "defs");
  const pattern = document.createElementNS(SVG_NS, "pattern");
  pattern.setAttribute("id", "mockup-grid");
  pattern.setAttribute("width", "24");
  pattern.setAttribute("height", "24");
  pattern.setAttribute("patternUnits", "userSpaceOnUse");
  const gridLine1 = document.createElementNS(SVG_NS, "path");
  gridLine1.setAttribute("d", "M 24 0 L 0 0 0 24");
  gridLine1.setAttribute("fill", "none");
  gridLine1.setAttribute("stroke", "var(--color-grid)");
  gridLine1.setAttribute("stroke-width", "1");
  pattern.appendChild(gridLine1);
  defs.appendChild(pattern);
  svg.appendChild(defs);

  const gridRect = document.createElementNS(SVG_NS, "rect");
  gridRect.setAttribute("width", "100%");
  gridRect.setAttribute("height", "100%");
  gridRect.setAttribute("fill", "url(#mockup-grid)");
  svg.appendChild(gridRect);

  // Nodes: [x, y, type, label, icon, accent]
  const nodes = [
    { x: 40, y: 30, accent: "--node-start-accent", label: "Start", icon: "▶" },
    { x: 240, y: 30, accent: "--node-http-accent", label: "HTTP", icon: "◉" },
    { x: 240, y: 170, accent: "--node-if-accent", label: "IF", icon: "⋔" },
    {
      x: 440,
      y: 30,
      accent: "--node-output-accent",
      label: "Output",
      icon: "▲",
    },
    {
      x: 440,
      y: 170,
      accent: "--node-output-accent",
      label: "Output",
      icon: "▲",
    },
  ];

  // Edges: [fromIndex, fromSide, toIndex, toSide]
  const edges = [
    { from: 0, to: 1 },
    { from: 1, to: 2 },
    { from: 2, to: 3 },
    { from: 2, to: 4 },
  ];

  // Draw edges first (under nodes)
  for (const e of edges) {
    const from = nodes[e.from];
    const to = nodes[e.to];
    const x1 = from.x + 140;
    const y1 = from.y + 45;
    const x2 = to.x;
    const y2 = to.y + 45;
    const dx = Math.max(40, Math.abs(x2 - x1) * 0.5);
    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute(
      "d",
      `M ${x1},${y1} C ${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`,
    );
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "var(--color-border-strong)");
    path.setAttribute("stroke-width", "2");
    path.setAttribute("class", "mockup-edge");
    svg.appendChild(path);
  }

  // Draw nodes
  for (const n of nodes) {
    const accent = `var(${n.accent})`;
    const g = document.createElementNS(SVG_NS, "g");
    g.setAttribute("class", "mockup-node");

    const rect = document.createElementNS(SVG_NS, "rect");
    rect.setAttribute("x", n.x);
    rect.setAttribute("y", n.y);
    rect.setAttribute("width", "140");
    rect.setAttribute("height", "64");
    rect.setAttribute("rx", "8");
    rect.setAttribute("fill", "var(--color-bg-surface)");
    rect.setAttribute("stroke", accent);
    rect.setAttribute("stroke-width", "1.5");
    g.appendChild(rect);

    const label = document.createElementNS(SVG_NS, "text");
    label.setAttribute("x", n.x + 52);
    label.setAttribute("y", n.y + 38);
    label.setAttribute("font-size", "11");
    label.setAttribute("font-family", "Inter, sans-serif");
    label.setAttribute("font-weight", "600");
    label.setAttribute("fill", "var(--color-text-primary)");
    label.textContent = n.label;
    g.appendChild(label);

    const icon = document.createElementNS(SVG_NS, "text");
    icon.setAttribute("x", n.x + 20);
    icon.setAttribute("y", n.y + 38);
    icon.setAttribute("font-size", "12");
    icon.setAttribute("fill", accent);
    icon.textContent = n.icon;
    g.appendChild(icon);

    svg.appendChild(g);
  }

  return svg;
}

function sectionFeatures() {
  return el("section", { id: "features", class: "landing-section" }, [
    el("div", { class: "landing-section-inner" }, [
      el("div", { class: "landing-section-eyebrow" }, "Features"),
      el(
        "h2",
        { class: "landing-section-title" },
        "Everything a workflow editor needs.",
      ),
      el(
        "p",
        { class: "landing-section-subtitle" },
        "A real editor experience — connections, undo, execution, validation — built from scratch without any frameworks.",
      ),
      el(
        "div",
        { class: "landing-features-grid" },
        FEATURES.map((f) =>
          el("div", { class: "landing-feature-card" }, [
            el("div", { class: "landing-feature-icon" }, [
              el("i", { class: `${f.icon} text-[13px]` }),
            ]),
            el("div", { class: "landing-feature-title" }, f.title),
            el("div", { class: "landing-feature-desc" }, f.desc),
          ]),
        ),
      ),
    ]),
  ]);
}

function sectionHowItWorks() {
  return el(
    "section",
    { id: "how-it-works", class: "landing-section landing-section-alt" },
    [
      el("div", { class: "landing-section-inner" }, [
        el("div", { class: "landing-section-eyebrow" }, "How it works"),
        el(
          "h2",
          { class: "landing-section-title" },
          "Three steps to a running workflow.",
        ),
        el(
          "div",
          { class: "landing-steps" },
          STEPS.map((s) =>
            el("div", { class: "landing-step" }, [
              el("div", { class: "landing-step-num" }, s.num),
              el("div", { class: "landing-step-title" }, s.title),
              el("div", { class: "landing-step-desc" }, s.desc),
            ]),
          ),
        ),
        el("div", { class: "landing-demo-cta" }, [
          el(
            "a",
            { href: "./app.html", class: "landing-btn landing-btn-primary" },
            [
              "Try it now",
              el("i", { class: "fa-solid fa-arrow-right text-[10px]" }),
            ],
          ),
        ]),
      ]),
    ],
  );
}

function sectionFAQ() {
  return el("section", { id: "faq", class: "landing-section" }, [
    el("div", { class: "landing-section-inner" }, [
      el("div", { class: "landing-section-eyebrow" }, "FAQ"),
      el(
        "h2",
        { class: "landing-section-title" },
        "Frequently asked questions.",
      ),
      el(
        "div",
        { class: "landing-faq" },
        FAQ.map((item) => buildFaqItem(item)),
      ),
    ]),
  ]);
}

function buildFaqItem(item) {
  let open = false;
  const answer = el("div", { class: "landing-faq-answer is-hidden" }, item.a);
  const chevron = el("i", {
    class: "fa-solid fa-chevron-down landing-faq-chevron",
  });

  const question = el(
    "button",
    {
      type: "button",
      class: "landing-faq-question",
      onclick: () => {
        open = !open;
        answer.classList.toggle("is-hidden", !open);
        chevron.classList.toggle("is-open", open);
      },
    },
    [el("span", {}, item.q), chevron],
  );

  return el("div", { class: "landing-faq-item" }, [question, answer]);
}

function sectionCTA() {
  return el("section", { class: "landing-cta-section" }, [
    el("div", { class: "landing-cta-inner" }, [
      el("h2", { class: "landing-cta-title" }, "Ready to build?"),
      el(
        "p",
        { class: "landing-cta-subtitle" },
        "Open the editor and start designing your first workflow in seconds.",
      ),
      el("div", { class: "landing-cta-buttons" }, [
        el(
          "a",
          { href: "./app.html", class: "landing-btn landing-btn-primary" },
          [
            el("i", { class: "fa-solid fa-play text-[11px]" }),
            "Start building",
          ],
        ),
        el(
          "a",
          {
            href: "https://github.com/AshkanPoyber/PoyberFlow",
            target: "_blank",
            rel: "noopener",
            class: "landing-btn landing-btn-ghost",
          },
          [el("i", { class: "fa-brands fa-github text-sm" }), "Star on GitHub"],
        ),
      ]),
    ]),
  ]);
}

function sectionFooter() {
  return el("footer", { class: "landing-footer" }, [
    el("div", { class: "landing-footer-inner" }, [
      el("div", { class: "landing-footer-brand" }, [
        el(
          "div",
          {
            class:
              "w-7 h-7 rounded-md flex items-center justify-center bg-[var(--color-brand)] text-white",
          },
          [el("i", { class: "fa-solid fa-diagram-project text-[11px]" })],
        ),
        el("span", {}, "PoyberFlow"),
      ]),
      el(
        "div",
        { class: "landing-footer-meta" },
        "MIT licensed · Built with Vanilla JavaScript",
      ),
      el("div", { class: "landing-footer-links" }, [
        el(
          "a",
          {
            href: "https://github.com/AshkanPoyber/PoyberFlow",
            target: "_blank",
            rel: "noopener",
            "aria-label": "GitHub",
          },
          [el("i", { class: "fa-brands fa-github" })],
        ),
        el(
          "a",
          {
            href: "https://linkedin.com/in/mohammadreza-dalili",
            target: "_blank",
            rel: "noopener",
            "aria-label": "LinkedIn",
          },
          [el("i", { class: "fa-brands fa-linkedin" })],
        ),
      ]),
    ]),
  ]);
}

/* ---------- Mount ---------- */

const root = document.getElementById("landing");
root.append(
  sectionNav(),
  sectionHero(),
  sectionFeatures(),
  sectionHowItWorks(),
  sectionFAQ(),
  sectionCTA(),
  sectionFooter(),
);

updateThemeIcon();
