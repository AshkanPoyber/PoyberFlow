/* ============================================================
   Command — base class for all undoable operations.

   A Command receives the current store and produces a new state
   via store.setState. It must never mutate state directly.
   ============================================================ */

export class Command {
  /** Short label for debugging / future UI. */
  label = "Command";

  /** Apply the change. */
  // eslint-disable-next-line no-unused-vars
  do(/* store */) {
    throw new Error("Command.do must be implemented");
  }

  /** Reverse the change. */
  // eslint-disable-next-line no-unused-vars
  undo(/* store */) {
    throw new Error("Command.undo must be implemented");
  }
}
