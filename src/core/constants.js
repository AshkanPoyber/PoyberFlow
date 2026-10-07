/* ============================================================
   Global constants — no magic numbers anywhere else.
   ============================================================ */

export const GRID_SIZE = 24;
export const NODE_WIDTH = 220;

export const NODE_TYPES = Object.freeze({
  START: "start",
  OUTPUT: "output",
  HTTP: "http",
  IF: "if",
  DELAY: "delay",
});

export const THEME = Object.freeze({
  LIGHT: "light",
  DARK: "dark",
  STORAGE_KEY: "poyberflow:theme",
});

export const HISTORY_LIMIT = 200;
