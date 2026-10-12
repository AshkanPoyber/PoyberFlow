/* ============================================================
   Workflow Migrations

   Runs before validation. Each migration upgrades a payload
   from version N → N+1. The pipeline stops at CURRENT_VERSION.

   For R5 the only supported version is 1, so `migrate()` is
   essentially an identity function — but the plumbing is here
   so later releases can add steps without touching callers.
   ============================================================ */

import { CURRENT_VERSION } from "./schema.js";

const MIGRATIONS = {
  // 1: (payload) => ({ ...payload, version: 2, ...changes }),
};

export function migrate(payload) {
  if (!payload || typeof payload !== "object") return payload;

  let current = payload;
  let safety = 0;

  while (
    typeof current.version === "number" &&
    current.version < CURRENT_VERSION &&
    safety < 32
  ) {
    const step = MIGRATIONS[current.version];
    if (!step) break;
    current = step(current);
    safety += 1;
  }

  return current;
}
