import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { interpretarLugares, coordenadasValidas } from '../src/lib/mapa.ts';

function carregar(nome, dependencias, globais = {}) {
  const exports = {};
  const codigo = ts.transpileModule(readFileSync(new URL(`../src/servicos/${nome}.ts`, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(codigo, { exports, setTimeout, clearTimeout, AbortController, ...globais, require: dep => dependencias[dep] });
  return exports;
}
const feature = (nome, coordenadas) => ({ geometry: { type: 'Point', coordinates: coordenadas }, properties: { name: nome, city: 'Salvador', state: 'Bahia' } });

test('busca converte longitude e latitude GeoJSON e apresenta cidade para distinguir homônimos', () => {
  const [local] = interpretarLugares({ features: [feature('Museu', [-38.5, -12.9])] });
  assert.equal(local.latitude, -12.9);
  assert.equal(local.longitude, -38.5);
  assert.equal(local.nome, 'Museu');
  assert.equal(local.endereco, 'Salvador · Bahia');
});

test('busca ignora coordenadas inválidas, limita resultados e remove repetições', () => {
  const locais = interpretarLugares({ features: [null, feature('Inválido', [null, null]), feature('Fora', [181, 91]), feature('A', [0, 0]), feature('A', [0, 0]), ...Array.from({ length: 8 }, (_, i) => feature(`Local ${i}`, [i, i]))] });
  assert.equal(locais.length, 5);
  assert.equal(locais.filter(local => local.nome === 'A').length, 1);
  assert.equal(interpretarLugares(null).length, 0);
  assert.equal(interpretarLugares({ features: {} }).length, 0);
});

test('busca por nome consulta somente ao solicitar e reutiliza o resultado em cache', async () => {
  let chamadas = 0;
  const servico = carregar('buscaLocalService', { '../lib/mapa': { interpretarLugares } }, { fetch: async url => {
    chamadas++;
    assert.equal(new URL(url).searchParams.get('q'), 'Museu do Amanhã, Rio');
    return { ok: true, json: async () => ({ features: [feature('Museu', [-43, -22])] }) };
  } });
  await assert.rejects(servico.buscarLugares('ab'));
  assert.equal(chamadas, 0);
  await servico.buscarLugares('Museu do Amanhã, Rio');
  await servico.buscarLugares('Museu do Amanhã, Rio');
  assert.equal(chamadas, 1);
});

test('permissão negada não tenta ler a posição do celular', async () => {
  let leu = false;
  const servico = carregar('localizacaoAtualService', { 'expo-location': {
    requestForegroundPermissionsAsync: async () => ({ granted: false }),
    getCurrentPositionAsync: async () => { leu = true; },
  }, '../lib/mapa': { coordenadasValidas } });
  await assert.rejects(servico.obterLocalizacaoAtual(), /Permita o acesso/);
  assert.equal(leu, false);
});

test('GPS desligado apresenta orientação e não solicita posição', async () => {
  const servico = carregar('localizacaoAtualService', { 'expo-location': {
    requestForegroundPermissionsAsync: async () => ({ granted: true }),
    hasServicesEnabledAsync: async () => false,
  }, '../lib/mapa': { coordenadasValidas } });
  await assert.rejects(servico.obterLocalizacaoAtual(), /Ative a localização/);
});

test('posição atual preserva coordenadas e precisão para confirmação no mapa', async () => {
  const servico = carregar('localizacaoAtualService', { 'expo-location': {
    requestForegroundPermissionsAsync: async () => ({ granted: true }),
    hasServicesEnabledAsync: async () => true,
    Accuracy: { High: 4 },
    getCurrentPositionAsync: async () => ({ coords: { latitude: -12, longitude: -38, accuracy: 15 } }),
  }, '../lib/mapa': { coordenadasValidas } });
  const ponto = await servico.obterLocalizacaoAtual();
  assert.equal(ponto.latitude, -12);
  assert.equal(ponto.longitude, -38);
  assert.equal(ponto.precisao, 15);
});
