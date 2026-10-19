# Optional Build Setup

PoyberFlow runs without a build step — just serve the project over HTTP.
This document explains how to add **Vite + a local Tailwind build** later,
without changing any application code.

## Why?

The CDN approach is perfect for development and demos. A local build gives:

- Smaller CSS (only the utilities you actually use)
- No external CDN dependency
- Minified JS bundles
- Source maps for debugging
- Easy deployment to static hosts

## Steps

### 1. Initialize npm

```bash
npm init -y
```

### 2. Install Vite + Tailwind

```bash
npm install --save-dev vite tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 3. Configure Tailwind

`tailwind.config.js`:

```js
export default {
  content: ["./index.html", "./app.html", "./src/**/*.{js,html}"],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        app: "var(--color-bg-app)",
        surface: "var(--color-bg-surface)",
        elevated: "var(--color-bg-elevated)",
        border: "var(--color-border)",
        primary: "var(--color-text-primary)",
        secondary: "var(--color-text-secondary)",
        brand: "var(--color-brand)",
      },
    },
  },
};
```

`src/styles/tailwind.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 4. Remove the CDN script

In both `index.html` and `app.html`, delete:

```html
<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind.config = {
    /* ... */
  };
</script>
```

Replace with:

```html
<link rel="stylesheet" href="/src/styles/tailwind.css" />
```

### 5. Add scripts to package.json

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### 6. Vite config

`vite.config.js`:

```js
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        app: "app.html",
      },
    },
  },
});
```

### 7. Run

```bash
npm run dev      # local dev at http://localhost:5173
npm run build    # production build to dist/
npm run preview  # preview production build
```

## What stays the same

All application code is unchanged:

- ES Modules work identically
- LocalStorage keys unchanged
- Import paths unchanged
- No frameworks introduced

## Migration checklist

- [ ] `npm init -y`
- [ ] Install Vite + Tailwind
- [ ] Create `tailwind.config.js`
- [ ] Create `src/styles/tailwind.css`
- [ ] Remove CDN script + inline config from both HTML files
- [ ] Update `package.json` scripts
- [ ] Add `vite.config.js`
- [ ] Test `npm run dev`
- [ ] Test `npm run build`
- [ ] Deploy `dist/` to static host
