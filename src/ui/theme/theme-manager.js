/* ============================================================
   Theme Manager — dark/light switching with persistence.

   - Reads stored preference on init
   - Falls back to `prefers-color-scheme`
   - Applies `data-theme` attribute on <html>
   - Subscribes to store.ui.theme
   ============================================================ */

import { THEME } from "../../core/constants.js";

function detectInitialTheme() {
  const stored = localStorage.getItem(THEME.STORAGE_KEY);
  if (stored === THEME.LIGHT || stored === THEME.DARK) return stored;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? THEME.DARK : THEME.LIGHT;
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

export function initTheme(store) {
  const initial = detectInitialTheme();
  applyTheme(initial);
  store.setState({ ui: { ...store.getState().ui, theme: initial } });

  store.subscribe((state) => {
    const current = document.documentElement.getAttribute("data-theme");
    if (state.ui.theme !== current) {
      applyTheme(state.ui.theme);
    }
  });
}

export function toggleTheme(store) {
  const { ui } = store.getState();
  const next = ui.theme === THEME.DARK ? THEME.LIGHT : THEME.DARK;
  localStorage.setItem(THEME.STORAGE_KEY, next);
  store.setState({ ui: { ...ui, theme: next } });
}
