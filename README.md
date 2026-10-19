<div align="center">

# PoyberFlow

**Build workflows visually.**

An interactive, graph-based workflow editor built entirely with Vanilla JavaScript — no frameworks, no bundlers, no backend.

[**Open the App**](./app.html) · [**Try a Template**](./app.html) · [**Report a Bug**](https://github.com/AshkanPoyber/PoyberFlow/issues)

[![MIT License](https://img.shields.io/badge/license-MIT-6366F1.svg)](./LICENSE)
[![Vanilla JS](https://img.shields.io/badge/vanilla-JS-F7DF1E.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![No Frameworks](https://img.shields.io/badge/no-frameworks-22C55E.svg)](#)
[![No Bundler](https://img.shields.io/badge/no-bundler-06B6D4.svg)](#)

</div>

---

## What is PoyberFlow?

PoyberFlow is a visual workflow editor that runs entirely in your browser. Place nodes on an infinite canvas, connect them with smooth bezier edges, configure each node in the properties panel, and run the whole graph — watching execution flow through every step.

It's not a demo. It's a real interactive application with:

- **Real execution** — HTTP requests, conditional branching, delays
- **Full undo / redo** — every action is a Command
- **Persistence** — auto-saved to LocalStorage, importable / exportable as JSON
- **Validation** — pre-flight checks before you run
- **Visual feedback** — nodes transition from running → success → error in real time

## Features

| Category        | What it does                                                                        |
| --------------- | ----------------------------------------------------------------------------------- |
| **Editor**      | Infinite canvas · Pan · Zoom · Multi-select · Rectangle select · Snap to grid       |
| **Nodes**       | Start · HTTP Request · IF · Delay · Output — each with a full configuration form    |
| **Connections** | Drag from output to input · Bezier edges · Validation · Delete with undo            |
| **History**     | Undo / redo for every action — including multi-node moves                           |
| **Execution**   | Real HTTP calls · IF branching · Delay with cancel · Max-step protection            |
| **Validation**  | Start node check · Orphan detection · Cycle warnings · Reachability                 |
| **UX**          | Command palette (Ctrl+K) · Context menu · Templates · Recent workflows · Focus mode |
| **Workspace**   | Mini map · Auto layout (BFS) · Fit to screen · Theme (light / dark)                 |

## Tech Stack

- **HTML5** — semantic markup
- **CSS3** — custom properties for theming
- **Tailwind CSS** — via CDN (no build step)
- **Vanilla JavaScript** — ES Modules, no frameworks, no bundler
- **SVG** — for edges
- **LocalStorage** — for workflow persistence

Nothing else. No React, no Vue, no Vite, no TypeScript, no state library.

## Quick Start

Because the project uses native ES Modules, it must be served over HTTP:

```bash
# From the project root
python3 -m http.server 5173
# or
npx serve .
# or use XAMPP / Laragon
```

Then open:

- **`http://localhost:5173/`** → Landing page
- **`http://localhost:5173/app.html`** → Editor

> **Tip:** Add `?mock=1` to the editor URL to enable mock HTTP responses — perfect for demos without CORS issues.

## Project Structure

```
PoyberFlow/
├── index.html                    → Landing page
├── app.html                      → Editor (the main app)
├── src/
│   ├── core/                     → store, camera, error boundary
│   ├── graph/                    → graph data model (nodes, edges)
│   ├── engine/                   → execution engine (headless)
│   ├── nodes/                    → node definitions + registry
│   ├── interaction/              → drag, pan, zoom, selection
│   ├── history/                  → commands + undo/redo stack
│   ├── storage/                  → persistence + migrations
│   ├── state/                    → initial state + runtime + validation
│   ├── ui/
│   │   ├── layout/               → top bar, sidebars, workspace
│   │   ├── panels/               → properties, validation, execution
│   │   ├── renderers/            → nodes, edges, viewport, grid
│   │   └── theme/                → theme manager
│   ├── utils/                    → DOM helpers, geometry, IDs
│   ├── styles/                   → tokens + main CSS
│   ├── landing.js                → landing page entry
│   └── main.js                   → editor entry
├── assets/
├── ARCHITECTURE.md               → deep dive into the architecture
├── CHANGELOG.md                  → release-by-release history
├── BUILD.md                      → optional build setup guide
└── README.md
```

## Architecture at a Glance

PoyberFlow is organized into **seven layers**, each with a single responsibility:

```
UI Layer
  ↓ reads
Renderer Layer
  ↓ reads
State Store  ←──────────────┐
  ↑                          │
  │ setState                 │
  │                          │
Interaction → Command → History
                ↓
          Graph Model
```

Additional layers:

- **Execution Engine** — headless, never touches the DOM
- **Persistence** — LocalStorage / JSON, versioned from day one

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the full breakdown, data model, and design decisions.

## Keyboard Shortcuts

| Shortcut                   | Action                             |
| -------------------------- | ---------------------------------- |
| **Ctrl / Cmd + K**         | Command palette                    |
| **Ctrl / Cmd + Z**         | Undo                               |
| **Ctrl / Cmd + Shift + Z** | Redo                               |
| **Ctrl / Cmd + C / V**     | Copy / paste                       |
| **Ctrl / Cmd + D**         | Duplicate                          |
| **Ctrl / Cmd + A**         | Select all                         |
| **Ctrl / Cmd + S**         | Save workflow                      |
| **Delete / Backspace**     | Delete selection                   |
| **Escape**                 | Clear selection / close overlays   |
| **F**                      | Focus mode (hide sidebars)         |
| **Space + drag**           | Pan                                |
| **Ctrl + wheel**           | Zoom                               |
| **Alt + drag**             | Disable snap to grid (temporarily) |

## Roadmap

- [x] R0 — Foundation
- [x] R1 — Workspace & interaction
- [x] R2 — Node system
- [x] R3 — Connections
- [x] R4 — Editing & history
- [x] R5 — Persistence
- [x] R6 — Node configuration
- [x] R7 — Workflow validation
- [x] R8 — Execution engine
- [x] R9 — Run experience
- [x] R10 — Templates & UX
- [x] R11 — Advanced workspace
- [x] R12 — Landing page
- [x] R13 — Production polish

**Future:**

- [ ] Optional Vite build (see `BUILD.md`)
- [ ] Backend (auth, cloud workflows)
- [ ] Custom user-defined nodes
- [ ] Real-time collaboration

## License

[MIT](./LICENSE) © Mohammad Reza Dalili
