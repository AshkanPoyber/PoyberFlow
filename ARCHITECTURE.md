# PoyberFlow — Architecture

## Layered Model

```
UI Layer
  ↓ (reads)
Renderer Layer
  ↓ (reads)
State Store  ←──────────────┐
  ↑                          │
  │ setState                 │
  │                          │
Interaction → Command → History
                ↓
          Graph Model
```

Additionally:

- **Graph Model** — pure data helpers. No DOM, no store.
- **Execution Engine** — headless (Release 8). Talks to UI via runtime events.
- **Persistence** — LocalStorage / JSON (Release 5). Versioned from day one.

## Core Rules

1. **No DOM access** inside `graph/`, `history/`, `engine/`.
2. **No direct state mutation** from the Interaction layer — always a Command.
3. **Commands** are the only writers of `state.workflow`.
4. **Renderers** are pure functions of state.
5. **Node definitions** are registered, not hardcoded.
6. **Runtime state** is stored separately from `workflow` so history and
   persistence never see execution data.

## State Shape

```js
{
  workflow: { metadata, nodes, edges },  // pure graph
  runtime:  { executing, nodeStates, logs },
  viewport: { x, y, zoom },
  selection:{ nodeIds, edgeIds },
  ui:       { theme }
}
```

## Node Definition Interface

```js
{
  type, label, icon, category, accentVar,
  inputs: [{ id, label }],
  outputs:[{ id, label }],
  defaultData(): object,
  renderBody(node, el): void,
  renderConfig(node, el, onChange): void,   // R6
  validate(node): string | null,            // R7
  execute(node, context): Promise<{output, data}>  // R8
}
```

## Command Interface

```js
class Command {
  label = "Command";
  do(store) {}
  undo(store) {}
}
```

History pushes `do`, keeps the command, and supports `undo` / `redo`
without snapshotting entire state.

## Rendering Pipeline

```
state change
   ↓
store.subscribe callbacks
   ↓
viewport-renderer  → update transform
grid-renderer      → update background-position
nodes-renderer     → reconcile node elements
```

Node reconciliation is diff-based: only new/removed/moved nodes touch the DOM.

## Why Not Canvas?

DOM + SVG is:

- easier to style with the same design tokens,
- accessible by default,
- sufficient for typical workflow sizes.

Canvas remains an option if profiling in R11 shows a real need.

## Where New Features Go

| Feature            | Layer               |
| ------------------ | ------------------- |
| New node type      | `nodes/`            |
| New undoable op    | `history/commands/` |
| New interaction    | `interaction/`      |
| New visual element | `ui/renderers/`     |
| New persistence    | `storage/`          |
| New execution step | `engine/`           |
