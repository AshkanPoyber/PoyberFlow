/* ============================================================
   Node Registry — single source of truth for node definitions.

   Adding a new node type = create its definition file + register it.
   Nothing else in the app should need to change.
   ============================================================ */

const definitions = new Map();

export function registerNode(definition) {
  if (!definition || !definition.type) {
    throw new Error("[registry] node definition must have a `type`");
  }
  if (definitions.has(definition.type)) {
    throw new Error(`[registry] duplicate node type: ${definition.type}`);
  }
  definitions.set(definition.type, definition);
}

export function getNodeDefinition(type) {
  return definitions.get(type) || null;
}

export function getAllNodeDefinitions() {
  return Array.from(definitions.values());
}
