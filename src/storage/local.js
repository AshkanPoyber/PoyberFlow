/* ============================================================
   LocalStorage persistence

   All reads/writes go through here. Callers never touch
   localStorage directly.
   ============================================================ */

import {
  STORAGE_KEY_PREFIX,
  ACTIVE_WORKFLOW_KEY,
  serializeWorkflow,
  validateWorkflowPayload,
} from "./schema.js";
import { migrate } from "./migrations.js";

export function saveWorkflow(state) {
  try {
    const payload = serializeWorkflow(state);
    const key = STORAGE_KEY_PREFIX + payload.metadata.id;
    localStorage.setItem(key, JSON.stringify(payload));
    localStorage.setItem(ACTIVE_WORKFLOW_KEY, payload.metadata.id);
    return { ok: true, payload };
  } catch (err) {
    console.error("[storage] save failed:", err);
    return { ok: false, error: err.message };
  }
}

export function loadWorkflow(id) {
  try {
    const key = STORAGE_KEY_PREFIX + id;
    const raw = localStorage.getItem(key);
    if (!raw) return { ok: false, error: "Not found" };

    const parsed = JSON.parse(raw);
    const migrated = migrate(parsed);
    const validation = validateWorkflowPayload(migrated);

    if (!validation.ok) {
      return { ok: false, error: validation.errors.join("\n") };
    }

    return { ok: true, payload: migrated };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export function loadActiveWorkflow() {
  const id = localStorage.getItem(ACTIVE_WORKFLOW_KEY);
  if (!id) return { ok: false, error: "No active workflow" };
  return loadWorkflow(id);
}

export function clearActiveWorkflow() {
  localStorage.removeItem(ACTIVE_WORKFLOW_KEY);
}
