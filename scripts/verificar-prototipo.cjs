/* Checks public demo data and file references without connecting to Supabase. */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const docs = path.join(root, 'docs');
const read = name => fs.readFileSync(path.join(docs, name), 'utf8');
const app = read('app.js');
const screensMatch = app.match(/const screens=(\[.*?\]);/);
assert.ok(screensMatch, 'Lista de telas ausente');
const screens = JSON.parse(screensMatch[1].replaceAll("'", '"'));
assert.equal(screens.length, 17, 'A navegação deve conter 17 telas e estados');
assert.equal(new Set(screens.map(s => s[0])).size, 17, 'Rotas repetidas');
const removed = ['recovery', 'recovery-sent', 'help', 'about', 'backup'];
for (const route of removed) assert.ok(!screens.some(s => s[0] === route), `Tela removida ainda listada: ${route}`);
for (const file of ['app.js', 'index.html']) {
  for (const m of read(file).matchAll(/data-go=["']([^"'$]+)["']/g)) {
    assert.ok(!removed.includes(m[1]), `Botão aponta para tela removida: ${m[1]}`);
  }
}
const dataText = read('data.js');
const visits = JSON.parse(dataText.slice(dataText.indexOf('['), dataText.lastIndexOf(']') + 1));
assert.equal(visits.length, 13, 'Base inicial mudou: revise documentação e apresentação');
assert.equal(new Set(visits.map(v => v.city + '|' + v.uf)).size, 9);
const photos = new Set(visits.flatMap(v => v.photos || [v.photo]));
assert.equal(photos.size, 27);
for (const v of visits) {
  assert.ok(v.photos.length <= 5);
  assert.equal(v.photo, v.photos[0], `Capa inconsistente: ${v.name}`);
}
const exists = file => assert.ok(fs.existsSync(path.join(docs, file)), `Arquivo ausente: ${file}`);
for (const file of photos) {
  exists(file);
  exists(file.replace('assets/', 'assets/mobile/').replace('.jpg', '.webp'));
  exists(file.replace('assets/', 'assets/thumbs/').replace('.jpg', '.webp'));
}
for (const palette of ['petroleo', 'indigo', 'terracota']) for (const variant of ['claro', 'escuro']) exists(`assets/marca/${palette}-${variant}.svg`);
let checked = 0;
for (const source of ['index.html', 'styles.css']) {
  for (const match of read(source).matchAll(/(?:src|href)=["']([^"']+)["']|url\(["']?([^\)"']+)["']?\)/g)) {
    const ref = match[1] || match[2];
    if (/^(?:https?:|data:|#)/.test(ref) || ref.includes('${')) continue;
    exists(ref.split(/[?#]/)[0]); checked++;
  }
}
const joined = ['src', 'scripts'].flatMap(folder => {
  const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(dir,e.name)) : /\.(?:[cm]?js|tsx?)$/.test(e.name) ? [fs.readFileSync(path.join(dir,e.name),'utf8')] : []);
  return walk(path.join(root,folder));
}).join('\n');
for (const ref of joined.matchAll(/require\(["']([^"']*assets\/[^"']+)["']\)/g)) {
  const relative = ref[1].slice(ref[1].indexOf('assets/'));
  assert.ok(fs.existsSync(path.join(root,relative)), `Asset mobile ausente: ${relative}`);
}
console.log(JSON.stringify({ screens: screens.length, visits: visits.length, cities: 9, photos: photos.size, staticReferences: checked, missing: 0 }, null, 2));
