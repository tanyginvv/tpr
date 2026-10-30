import fs from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const source = new URL('src/', root);
let html = await fs.readFile(new URL('index.html', source), 'utf8');
const css = await fs.readFile(new URL('style.css', source), 'utf8');
const styleTag = '<link rel="stylesheet" href="style.css">';
if (!html.includes(styleTag)) throw new Error('Missing stylesheet reference');
html = html.replace(styleTag, () => `<style>${css}</style>`);

for (const name of ['math.js', 'app.js']) {
  const code = await fs.readFile(new URL(name, source), 'utf8');
  if (/<\/script/i.test(code)) throw new Error(`Unsafe inline script in ${name}`);
  const scriptTag = `<script src="${name}" defer></script>`;
  if (!html.includes(scriptTag)) throw new Error(`Missing script reference: ${name}`);
  html = html.replace(scriptTag, () => `<script>document.addEventListener("DOMContentLoaded", () => {\n${code}\n});</script>`);
}

await fs.writeFile(new URL('index.html', root), html, 'utf8');
console.log('Created index.html: standalone website with embedded styles and scripts.');
