import { test } from 'node:test';
import assert from 'node:assert/strict';
import { coordenadasValidas, htmlMapa, urlRota } from '../src/lib/mapa.ts';
import { agendarRascunho } from '../src/lib/filaRascunho.ts';

test('rota aponta para as coordenadas da visita sem fixar a origem do visitante', () => {
  const url = new URL(urlRota({ latitude: -12.97, longitude: -38.5 }));
  assert.equal(url.origin, 'https://www.google.com');
  assert.equal(url.pathname, '/maps/dir/');
  assert.equal(url.searchParams.get('api'), '1');
  assert.equal(url.searchParams.get('destination'), '-12.97,-38.5');
  assert.equal(url.searchParams.has('origin'), false);
  assert.equal(new URL(urlRota({ latitude: 0, longitude: 0 })).searchParams.get('destination'), '0,0');
});

test('visitas sem localização válida não geram uma rota para um local incorreto', () => {
  for (const valor of [null, {}, { latitude: null, longitude: null }, { latitude: -12, longitude: null }, { latitude: 91, longitude: 0 }, { latitude: 0, longitude: NaN }]) {
    assert.equal(urlRota(valor), null);
  }
});

test('mapa aceita coordenadas reais e rejeita pares incompletos e valores não finitos', () => {
  assert.equal(coordenadasValidas({ latitude: -12.97, longitude: -38.5 }), true);
  assert.equal(coordenadasValidas({ latitude: 0, longitude: 0 }), true);
  for (const ponto of [null, {}, { latitude: null, longitude: null }, { latitude: 91, longitude: 0 }, { latitude: 0, longitude: 181 }, { latitude: NaN, longitude: 0 }]) {
    assert.equal(coordenadasValidas(ponto), false);
  }
});

test('nomes de lugares não conseguem encerrar o script do mapa', () => {
  const titulo = '</script><script>alert(1)</script>';
  const html = htmlMapa([{ id: 'local', titulo, latitude: -12, longitude: -38 }], false);
  assert.equal(html.includes(titulo), false);
  assert.equal(html.includes('\\u003c/script>'), true);
});

test('a remoção do rascunho aguarda gravações pendentes para não recuperar texto já salvo', async () => {
  let liberar;
  const espera = new Promise(resolve => { liberar = resolve; });
  const ordem = [];
  const gravar = agendarRascunho('fila-limpar', async () => { await espera; ordem.push('gravar'); });
  const limpar = agendarRascunho('fila-limpar', async () => { ordem.push('limpar'); });
  liberar();
  await Promise.all([gravar, limpar]);
  assert.deepEqual(ordem, ['gravar', 'limpar']);
});

test('uma falha de armazenamento não bloqueia a próxima tentativa de guardar rascunho', async () => {
  const falha = agendarRascunho('fila-retry', async () => { throw new Error('sem armazenamento'); });
  await assert.rejects(falha);
  let recuperado = false;
  await agendarRascunho('fila-retry', async () => { recuperado = true; });
  assert.equal(recuperado, true);
});
