import test from 'node:test';
import assert from 'node:assert/strict';
import { conferirTamanhoFoto, LIMITE_FOTO_BYTES } from '../src/lib/limitesFoto.ts';
test('aceita fotos maiores que 5 MB e até o limite de 20 MB', () => {
  assert.doesNotThrow(() => conferirTamanhoFoto(8 * 1024 * 1024));
  assert.doesNotThrow(() => conferirTamanhoFoto(LIMITE_FOTO_BYTES));
});
test('recusa fotos acima do limite e tamanhos inválidos', () => {
  for (const tamanho of [LIMITE_FOTO_BYTES + 1, 0, -1, NaN, Infinity]) {
    assert.throws(() => conferirTamanhoFoto(tamanho));
  }
});
