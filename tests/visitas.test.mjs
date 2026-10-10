import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dataValida } from '../src/lib/validacaoVisita.ts';
const hoje = new Date(2026, 9, 9, 15, 30);

test('aceita hoje e datas válidas passadas, incluindo ano bissexto', () => {
  for (const data of ['09/10/2026', '29/02/2024', '01/01/1900']) {
    assert.equal(dataValida(data, hoje), true, data);
  }
});
test('recusa data futura, datas inexistentes e anos fora do limite', () => {
  for (const data of ['10/10/2026', '29/02/2025', '31/04/2026', '00/10/2026',
    '09/13/2026', '31/12/1899', '29/02/1900']) {
    assert.equal(dataValida(data, hoje), false, data);
  }
});
test('exige DD/MM/AAAA completo', () => {
  for (const data of ['', '9/10/2026', '2026-10-09', '09/10/26', '09/10/2026extra']) {
    assert.equal(dataValida(data, hoje), false, data);
  }
});
