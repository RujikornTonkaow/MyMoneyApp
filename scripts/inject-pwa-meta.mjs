#!/usr/bin/env node
// ============================================================================
// MyMoneyApp - PWA meta-tag injector
// ============================================================================
// Runs after `expo export -p web` to add PWA tags into the generated
// dist/index.html. Expo's web export doesn't inject manifest / Apple
// touch-icon links by itself in `output: "single"` mode, so we patch the
// HTML head here. Idempotent: running it multiple times is safe.
// ============================================================================

import { readFileSync, writeFileSync, existsSync, copyFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir   = join(__dirname, '..', 'dist');
const indexPath = join(distDir, 'index.html');

if (!existsSync(indexPath)) {
  console.error('[pwa] dist/index.html not found. Run `expo export -p web` first.');
  process.exit(1);
}

// Ensure public/ assets that some hosts strip get re-copied (Expo already
// copies the public/ folder, but we double-check the icons exist).
const requiredAssets = ['manifest.webmanifest', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png'];
for (const file of requiredAssets) {
  const src = join(__dirname, '..', 'public', file);
  const dst = join(distDir, file);
  if (existsSync(src) && !existsSync(dst)) copyFileSync(src, dst);
}

const TAG_MARKER = '<!-- pwa-injected -->';
// black-translucent lets the page background extend behind the iOS status
// bar; combined with the cream body background and safe-area-insets in the
// React layer we get an edge-to-edge look in PWA standalone mode.
const tagsToInject = `
    ${TAG_MARKER}
    <link rel="manifest" href="/manifest.webmanifest">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png">
    <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="My Money">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="format-detection" content="telephone=no">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, shrink-to-fit=no">
    <style id="pwa-base">
      /* ── Full-bleed PWA viewport fix ──────────────────────────────
         iOS PWA standalone + viewport-fit=cover creates a visual
         viewport taller than 100vh. Pin body to the real viewport
         via position:fixed + inset:0, then cascade flex:1 down
         through Expo Router's wrapper divs so the chain is unbroken
         from body → actual screen component.

         We intentionally omit !important so React Native Web's
         inline styles (e.g. flex-direction:row on a tab row) still
         take precedence over these defaults.                        */
      html {
        margin: 0; padding: 0;
        height: 100%; height: 100dvh;
        background-color: #F3EAD8;
      }
      body {
        margin: 0; padding: 0;
        background-color: #F3EAD8;
        overflow: hidden;
        position: fixed;
        inset: 0;
        width: 100%;
        height: 100%; height: 100dvh;
      }
      #root {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
        height: 100%;
      }
      #root > div,
      #root > div > div,
      #root > div > div > div,
      #root > div > div > div > div,
      #root > div > div > div > div > div,
      #root > div > div > div > div > div > div {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
      }

      /* iOS Safari auto-zooms focused inputs with font-size < 16px. */
      input, textarea, select { font-size: 16px !important; }
    </style>
`.trim();

let html = readFileSync(indexPath, 'utf8');

if (html.includes(TAG_MARKER)) {
  console.log('[pwa] meta tags already present, skipping.');
  process.exit(0);
}

// Inject just before </head>; bail out loudly if the marker is missing so
// we never silently ship a broken manifest reference.
if (!html.includes('</head>')) {
  console.error('[pwa] could not find </head> in dist/index.html');
  process.exit(1);
}

html = html.replace('</head>', `    ${tagsToInject}\n  </head>`);
writeFileSync(indexPath, html, 'utf8');
console.log('[pwa] injected manifest + Apple touch-icon meta tags into dist/index.html');
