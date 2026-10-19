# PoyberFlow — Architecture

## Layered Model

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

Additionally:

- **Graph Model** — pure data helpers. No DOM, no store.
- **Execution Engine** — headless. Talks to the UI via runtime events.
- **Persistence** — LocalStorage / JSON. Versioned from day one.

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
  workflow: { metadata, nodes, edges },   // pure graph
  runtime:  {
    executing, executionId, startedAt, finishedAt,
    nodeStates, edgeStates, logs, summary, lastResults,
  },
  viewport: { x, y, zoom },
  selection: { nodeIds, edgeIds },
  ui:       { theme, snapToGrid },
  validation: { ok, errors, warnings, issues },
}
```

## Node Definition Interface

```js
{
  type, label, icon, category, accentVar,
  inputs: [{ id, label }],
  outputs:[{ id, label, variant? }],
  defaultData(): object,
  getBodyPreview(node): string | { kind, ... },
  renderConfig(node, container, onChange): void,
  validate(node): string | null,
  execute(node, context, helpers): Promise<{ output, data }>,
}
```

Adding a new node type requires:

1. Create `src/nodes/<name>-node.js`.
2. Register it in `main.js`.
3. Done. The library, forms, execution, and validation all pick it up automatically.

## Command Interface

```js
class Command {
  label = "Command";
  do(store) {}
  undo(store) {}
}
```

Commands currently implemented:

- `AddNodeCommand`
- `DeleteSelectionCommand` (nodes + edges, atomic)
- `MoveNodesCommand` (single or multi-node)
- `EditNodeDataCommand`
- `DuplicateCommand`
- `AddEdgeCommand`
- `DeleteEdgeCommand`

History supports `push`, `undo`, `redo`, `canUndo`, `canRedo`, `size`, `clear`.

## Rendering Pipeline

```
state change
   ↓
store.subscribe callbacks
   ↓
viewport-renderer  → update transform
grid-renderer      → update background-position + size
nodes-renderer     → reconcile node elements
edges-renderer     → reconcile edge paths
```

Node reconciliation is diff-based: only new/removed/moved nodes touch the DOM.

## Execution Engine

`engine/executor.js` is fully headless:

```js
executeWorkflow(workflow, {
  onNodeStatus,
  onEdgeStatus,
  onLog,
  onResults,
  onFinish,
  abortSignal,
});
```

Flow:

1. Pre-flight validation (`engine/validator.js`).
2. Locate Start node.
3. Loop:
   - Mark node `running`.
   - Call `definition.execute(node, context, helpers)`.
   - Record result into context.
   - Mark node `success`.
   - Resolve next edge based on the chosen output handle.
   - Mark edge `active` → `success`.
4. On error: mark node/edge `error`, stop, report.
5. Mark unvisited nodes as `skipped`.

Enforced limits:

- `MAX_STEPS = 1000`
- HTTP timeout cap = 30s
- Cancellation via `AbortController`

## Expression Language

Small recursive-descent parser (no `eval`, no `Function`) supporting:

- Numbers, strings, `true`, `false`, `null`
- Paths: `user.age`, `start.data.name`, `last.data.value`, `vars.foo`
- Comparisons: `==`, `!=`, `<`, `>`, `<=`, `>=`
- Logical: `&&`, `||`, `!`
- Parentheses

Also supports `{{...}}` interpolation inside HTTP URLs, headers, query, and body.

## Persistence

Schema is versioned:

```js
{
  version: 1,
  metadata: { id, name, createdAt, updatedAt },
  workflow: { nodes, edges },
  viewport: { x, y, zoom },
}
```

- Auto-saved (debounced 1s) to `localStorage:poyberflow:workflow:<id>`.
- Active workflow pointer at `localStorage:poyberflow:active-workflow`.
- Multi-workflow index at `localStorage:poyberflow:projects`.
- Import validates structure, node types, and edge endpoints before applying.
- Migration pipeline ready for version bumps (see `storage/migrations.js`).

## Validation

`engine/validator.js` returns `{ ok, errors, warnings, issues }`.

**Errors** block execution:

- Missing / multiple Start nodes
- Unknown node types
- Missing node configuration (via `definition.validate`)
- Output nodes unreachable from Start
- Edges referencing missing nodes

**Warnings** do not block execution:

- Orphan nodes
- Unconnected outputs
- IF branches not connected
- Unreachable nodes
- Cycles

## Why Not Canvas?

DOM + SVG is:

- Easier to style with the same design tokens
- Accessible by default
- Sufficient for typical workflow sizes

Canvas remains a possible future optimization if profiling shows a need.

## Where New Features Go

| Feature            | Layer               |
| ------------------ | ------------------- |
| New node type      | `nodes/`            |
| New undoable op    | `history/commands/` |
| New interaction    | `interaction/`      |
| New visual element | `ui/renderers/`     |
| New persistence    | `storage/`          |
| New execution step | `engine/`           |
| New panel          | `ui/panels/`        |
