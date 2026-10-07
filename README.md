# PoyberFlow

A visual workflow builder for the web — built with Vanilla JavaScript.

> **Status:** Early development — Release 0 complete.

## What is PoyberFlow?

PoyberFlow is an interactive, graph-based workflow editor. Users build
workflows visually by placing nodes on an infinite canvas and connecting
them, without writing workflow logic as code.

## Tech Stack

- HTML5
- CSS3 (custom properties + Tailwind CSS via CDN)
- Vanilla JavaScript (ES Modules)
- Font Awesome
- Inter + JetBrains Mono

No frameworks. No build step. No bundler.

## Run Locally

Because the project uses native ES Modules, you must serve it over HTTP:

```bash
# from the project root
python3 -m http.server 5173
# or
npx serve .
```

Then open http://localhost:5173

## Release 0 — What's Included

- Polished application shell (top bar, left/right sidebars, workspace)
- Light + Dark theme with persistence
- Design system based on CSS custom properties
- Infinite workspace shell (grid + viewport transform, static in R0)
- One real node type: **Start**
- Node selection and drag
- Command-based history foundation
- Store-based reactive state

## Roadmap

See `ARCHITECTURE.md` for the full plan. Highlights:

- R1 — Pan / Zoom / Grid interaction
- R2 — Full node system
- R3 — Connections (SVG + Bezier)
- R4 — Editing & history UI
- R5 — Persistence (LocalStorage + import/export)
- R6 — Properties panel
- R7 — Workflow validation
- R8 — Execution engine
- R9 — Run experience
- R10+ — Templates, minimap, landing page, polish

## License

MIT
