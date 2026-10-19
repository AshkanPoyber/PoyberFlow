# Changelog

All notable changes to PoyberFlow are documented here.

## [v0.0.13] — Release 12 — Landing Page

### Added

- Landing page at `index.html` (editor moved to `app.html`)
- Hero with animated SVG workflow mockup
- Features, How it works, FAQ, CTA, Footer sections
- SEO meta tags, Open Graph, Twitter card
- Sticky navigation with theme toggle
- Scroll fade-in animations

## [v0.0.12] — Release 11 — Advanced Workspace

### Added

- Mini map with live viewport rectangle
- Snap to grid toggle (Alt to override)
- Auto layout (BFS layered)
- Focus mode (F key hides sidebars)

## [v0.0.11] — Release 10 — Templates & UX

### Added

- Workflow templates: Simple HTTP, Conditional, Delay, API Chain
- Templates dialog
- Command palette (Ctrl+K)
- Context menu (right-click on workspace)
- Recent workflows dropdown
- Multi-workflow storage

## [v0.0.10] — Release 9 — Run Experience

### Added

- Execution Panel with log stream, level filters, and summary
- Edge runtime states (active / success / error)
- Node skipped state
- Properties / Result tabs
- Execution focus (click a log to center the node)
- Log markers between runs

## [v0.0.9] — Release 8 — Execution Engine

### Added

- Headless workflow executor
- Execution context with result propagation
- Expression evaluator + interpolator
- HTTP fetcher with timeout and cancel
- Mock fetcher (`?mock=1`)
- Run/Stop button
- Node runtime states

## [v0.0.8] — Release 7 — Workflow Validation

### Added

- Headless validator
- Real-time validation (500ms debounce)
- Validation banner
- Node error/warning badges
- Run button with pre-flight validation

## [v0.0.7] — Release 6 — Node Configuration

### Added

- Properties Panel with node-specific forms
- Reusable form primitives
- EditNodeDataCommand
- Multi-selection summary with group delete

## [v0.0.6] — Release 5 — Persistence

### Added

- LocalStorage persistence with debounced auto-save
- Versioned workflow schema
- Import / export JSON
- Toast system
- Import error modal

## [v0.0.5] — Release 4 — Editing & History

### Added

- Multi-select (Shift + click, rectangle)
- Multi-node drag
- Copy / paste / duplicate
- Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y
- Delete selection with connected edges
- Undo / redo buttons in the top bar

## [v0.0.4] — Release 3 — Connections

### Added

- Interactive connections with live bezier
- SVG edges layer
- Edge selection and delete
- Validation: no self-loops, no duplicates

## [v0.0.3] — Release 2 — Node System

### Added

- Node Library with category grouping
- Start, Output, HTTP, IF, Delay node definitions
- Click-to-add nodes
- Delete node with undo
- Handles on nodes
- Body preview API

## [v0.0.2] — Release 1 — Workspace & Interaction

### Added

- Camera module (screen ↔ world)
- Pan (middle-mouse, Space + drag)
- Zoom (Ctrl/Cmd + wheel)
- Grid follows viewport
- Zoom controls

## [v0.0.1] — Release 0 — Foundation

### Added

- Application shell (top bar, sidebars, workspace)
- Design system with CSS custom properties
- Light / dark theme with persistence
- Store-based reactive state
- Command pattern + History foundation
- Start node with drag and selection
- README and ARCHITECTURE docs
