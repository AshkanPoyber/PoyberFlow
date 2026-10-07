/* ============================================================
   History — stack of Commands.

   push(command)  -> applies `do` and pushes to past, clears future
   undo()         -> pops from past, calls `undo`, pushes to future
   redo()         -> pops from future, calls `do`, pushes to past
   ============================================================ */

import { HISTORY_LIMIT } from "../core/constants.js";

export function createHistory(store) {
  let past = [];
  let future = [];

  function push(command) {
    command.do(store);
    past.push(command);
    if (past.length > HISTORY_LIMIT) past.shift();
    future = [];
  }

  function undo() {
    if (past.length === 0) return false;
    const command = past.pop();
    command.undo(store);
    future.push(command);
    return true;
  }

  function redo() {
    if (future.length === 0) return false;
    const command = future.pop();
    command.do(store);
    past.push(command);
    return true;
  }

  function canUndo() {
    return past.length > 0;
  }

  function canRedo() {
    return future.length > 0;
  }

  function size() {
    return { past: past.length, future: future.length };
  }

  return { push, undo, redo, canUndo, canRedo, size };
}
