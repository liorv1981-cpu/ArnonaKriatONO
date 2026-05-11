const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

for (const file of ['styles.css', 'arnonaLogic.js', 'app.js']) {
  assert.ok(html.includes(`./${file}`), `index.html should reference ${file}`);
  assert.ok(fs.existsSync(path.join(root, file)), `${file} should exist`);
}

assert.ok(html.includes('מחשבון ארנונה משוער'), 'page title should be present');
assert.ok(html.includes('id="calculator"'), 'calculator form should be present');
assert.ok(!html.includes('cdn.tailwindcss.com'), 'app should not depend on Tailwind CDN');

console.log('html smoke test passed');
