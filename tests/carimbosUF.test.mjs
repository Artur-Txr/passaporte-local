import test from 'node:test';
import assert from 'node:assert/strict';
import { carimbosUF, identidadeCarimbo } from '../src/lib/carimbosUF.ts';
import { estados } from '../src/lib/validacaoVisita.ts';
test('todas as 27 UFs possuem desenho próprio', () => {
 assert.deepEqual(Object.keys(carimbosUF).sort(), [...estados].sort());
 assert.equal(new Set(Object.values(carimbosUF).map(v => JSON.stringify(v.desenho))).size, 27);
 for (const v of Object.values(carimbosUF)) {
   assert.ok(v.nome && v.tema && /^#[0-9a-f]{6}$/i.test(v.cor));
   for (const [x,y,w,h] of v.desenho) assert.ok(x >= 0 && y >= 0 && w > 0 && h > 0 && x + w <= 104 && y + h <= 57);
 }
});
test('normaliza a UF e preserva fallback para dados antigos', () => {
 assert.equal(identidadeCarimbo(' pe '), carimbosUF.PE);
 assert.equal(identidadeCarimbo('XX').nome, 'Brasil');
});
