// Build pipeline for the iim theme: CSS + JS (esbuild), self-hosted fonts, SVG icon sprite, size budgets.
// Usage: node build.mjs [--watch] [--budget-only]
import * as esbuild from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync, statSync, rmSync, existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const theme = join(root, 'theme/iim');
const src = join(theme, 'assets/src');
const dist = join(theme, 'assets/dist');
const watch = process.argv.includes('--watch');
const budgetOnly = process.argv.includes('--budget-only');

// Budgets from the spec (Part 1, section 11), gzipped where the spec says so.
const BUDGET = { cssRawKB: 60, jsGzipKB: 50 };

// One icon set (Lucide, ISC) plus the WhatsApp brand mark (Simple Icons, CC0).
const LUCIDE = [
  'zap', 'droplets', 'paint-roller', 'hammer', 'house', 'siren', 'snowflake', 'wrench',
  'phone', 'menu', 'x', 'chevron-down', 'chevron-right', 'chevron-left', 'arrow-right', 'check',
  'circle-check', 'shield-check', 'clock', 'wallet', 'star', 'map-pin', 'mail', 'calendar',
  'camera', 'message-circle', 'upload', 'file-text', 'badge-check', 'users', 'triangle-alert',
  'info', 'quote', 'building-2', 'clipboard-list', 'sparkles', 'thumbs-up', 'calendar-check',
];

function buildSprite() {
  const symbols = [];
  for (const name of LUCIDE) {
    const file = join(root, 'node_modules/lucide-static/icons', `${name}.svg`);
    if (!existsSync(file)) throw new Error(`Icon not found in lucide-static: ${name}`);
    const inner = readFileSync(file, 'utf8')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/^[\s\S]*?<svg[^>]*>/, '')
      .replace(/<\/svg>\s*$/, '')
      .replace(/\s+/g, ' ')
      .trim();
    symbols.push(`<symbol id="i-${name}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</symbol>`);
  }
  const wa = readFileSync(join(root, 'node_modules/simple-icons/icons/whatsapp.svg'), 'utf8');
  const waPath = wa.match(/<path d="([^"]+)"/)[1];
  symbols.push(`<symbol id="i-whatsapp" viewBox="0 0 24 24"><path fill="currentColor" d="${waPath}"/></symbol>`);
  mkdirSync(join(dist, 'icons'), { recursive: true });
  writeFileSync(join(dist, 'icons/sprite.svg'), `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">${symbols.join('')}</svg>\n`);
}

function copyFonts() {
  const out = join(dist, 'fonts');
  mkdirSync(out, { recursive: true });
  copyFileSync(join(root, 'node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2'), join(out, 'inter-latin-wght.woff2'));
  copyFileSync(join(root, 'node_modules/@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2'), join(out, 'plus-jakarta-sans-latin-wght.woff2'));
}

const cssOptions = {
  entryPoints: { critical: join(src, 'css/critical.css'), main: join(src, 'css/main.css'), admin: join(src, 'css/admin.css') },
  bundle: true,
  minify: true,
  outdir: join(dist, 'css'),
  target: ['chrome100', 'safari15', 'firefox100'],
  logLevel: 'info',
};

const jsOptions = {
  entryPoints: { main: join(src, 'js/main.js') },
  bundle: true,
  splitting: true,
  format: 'esm',
  minify: true,
  outdir: join(dist, 'js'),
  chunkNames: 'chunks/[name]-[hash]',
  target: ['es2020'],
  logLevel: 'info',
};

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

function checkBudgets() {
  const kb = (n) => (n / 1024).toFixed(1);
  const css = walk(join(dist, 'css')).filter((f) => f.endsWith('.css') && !f.endsWith('admin.css'));
  const js = walk(join(dist, 'js')).filter((f) => f.endsWith('.js'));
  const cssRaw = css.reduce((s, f) => s + statSync(f).size, 0);
  const cssGz = css.reduce((s, f) => s + gzipSync(readFileSync(f)).length, 0);
  const jsGz = js.reduce((s, f) => s + gzipSync(readFileSync(f)).length, 0);
  console.log(`\nBudget  CSS ${kb(cssRaw)} KB raw / ${kb(cssGz)} KB gzip (limit ${BUDGET.cssRawKB} KB)`);
  console.log(`Budget  JS  ${kb(jsGz)} KB gzip (limit ${BUDGET.jsGzipKB} KB)`);
  const fail = cssRaw / 1024 > BUDGET.cssRawKB || jsGz / 1024 > BUDGET.jsGzipKB;
  if (fail) {
    console.error('Budget exceeded.');
    process.exitCode = 1;
  }
}

if (budgetOnly) {
  checkBudgets();
} else if (watch) {
  buildSprite();
  copyFonts();
  const [c, j] = await Promise.all([esbuild.context(cssOptions), esbuild.context(jsOptions)]);
  await Promise.all([c.watch(), j.watch()]);
  console.log('Watching theme assets…');
} else {
  rmSync(dist, { recursive: true, force: true });
  buildSprite();
  copyFonts();
  await Promise.all([esbuild.build(cssOptions), esbuild.build(jsOptions)]);
  checkBudgets();
}
