/* ============================================================
   Store — a tiny, dependency-free reactive state container.

   Rules:
   - Never mutate state directly. Always go through setState.
   - setState merges shallowly at the top level. Nested updates
     must be produced by replacing the nested object entirely.
   - Subscribers are called synchronously after state is updated.
   ============================================================ */

export function createStore(initialState) {
  let state = Object.freeze({ ...initialState });
  const subscribers = new Set();

  function getState() {
    return state;
  }

  function setState(partial) {
    if (!partial || typeof partial !== "object") return;
    const next = { ...state, ...partial };
    if (shallowEqual(state, next)) return;
    state = Object.freeze(next);
    notify();
  }

  function subscribe(fn) {
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  }

  function notify() {
    for (const fn of subscribers) {
      try {
        fn(state);
      } catch (err) {
        // A broken subscriber must not break the rest.
        console.error("[store] subscriber error:", err);
      }
    }
  }

  return { getState, setState, subscribe };
}

function shallowEqual(a, b) {
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  for (const k of ka) {
    if (a[k] !== b[k]) return false;
  }
  return true;
}
