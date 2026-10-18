/* ============================================================
   Multi-workflow project storage.

   Keeps a small index of recent workflows in LocalStorage so
   users can switch between them.

   Index shape:
     {
       currentId: string,
       items: [{ id, name, updatedAt }]
     }
   ============================================================ */

import { STORAGE_KEY_PREFIX, ACTIVE_WORKFLOW_KEY } from "./schema.js";

const PROJECTS_KEY = "poyberflow:projects";

/* ---------- Index ---------- */

export function loadIndex() {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    if (!raw) return { currentId: null, items: [] };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object")
      return { currentId: null, items: [] };
    return {
      currentId: parsed.currentId || null,
      items: Array.isArray(parsed.items) ? parsed.items : [],
    };
  } catch {
    return { currentId: null, items: [] };
  }
}

export function saveIndex(index) {
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(index));
  } catch (err) {
    console.error("[projects] save index failed:", err);
  }
}

/* ---------- Project records ---------- */

export function registerProject(metadata) {
  const index = loadIndex();
  const existing = index.items.find((i) => i.id === metadata.id);

  const nextItems = existing
    ? index.items.map((i) =>
        i.id === metadata.id
          ? {
              id: metadata.id,
              name: metadata.name,
              updatedAt: metadata.updatedAt,
            }
          : i,
      )
    : [
        { id: metadata.id, name: metadata.name, updatedAt: metadata.updatedAt },
        ...index.items,
      ].slice(0, 10); // keep last 10

  saveIndex({
    currentId: metadata.id,
    items: nextItems,
  });
}

export function removeProject(id) {
  const index = loadIndex();
  const nextItems = index.items.filter((i) => i.id !== id);
  saveIndex({
    currentId:
      index.currentId === id ? nextItems[0]?.id || null : index.currentId,
    items: nextItems,
  });
}

export function listProjects() {
  return loadIndex().items;
}

export function setCurrentProject(id) {
  const index = loadIndex();
  if (!index.items.find((i) => i.id === id)) return;
  saveIndex({ ...index, currentId: id });
  localStorage.setItem(ACTIVE_WORKFLOW_KEY, id);
}

export function deleteWorkflowStorage(id) {
  try {
    localStorage.removeItem(STORAGE_KEY_PREFIX + id);
  } catch (err) {
    console.error("[projects] delete failed:", err);
  }
}
