import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function preparar(resposta = { data: [], error: null }) {
  const chamadas = [];
  const consulta = new Proxy({}, { get(_, metodo) {
    if (metodo === 'then') return Promise.resolve(resposta).then.bind(Promise.resolve(resposta));
    return (...args) => { chamadas.push([metodo, ...args]); return consulta; };
  } });
  const codigo = ts.transpileModule(readFileSync(new URL('../src/servicos/socialService.ts', import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(codigo, { exports, require(nome) {
    if (nome.includes('supabase')) return { supabase: { from: tabela => { chamadas.push(['from', tabela]); return consulta; } } };
    if (nome.includes('cidades')) return { normalizarTexto: texto => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim() };
    return { camposPublicacao: 'id,lugar' };
  } });
  return { servico: exports, chamadas };
}

test('busca de favoritos mantém dono, filtro sem acentos e paginação no servidor', async () => {
  const { servico, chamadas } = preparar();
  await servico.listarFavoritos('conta-a', 1, 'São Paulo');
  assert.ok(chamadas.some(c => c[0] === 'eq' && c[1] === 'usuario_id' && c[2] === 'conta-a'));
  assert.ok(chamadas.some(c => c[0] === 'ilike' && c[1] === 'visitas.busca_texto' && c[2] === '%sao paulo%'));
  assert.ok(chamadas.some(c => c[0] === 'select' && c[1].includes('visitas!inner')));
  assert.ok(chamadas.some(c => c[0] === 'range' && c[1] === 20 && c[2] === 39));
});

test('filtro de notificações não lidas é aplicado antes da paginação', async () => {
  const { servico, chamadas } = preparar();
  await servico.listarNotificacoes('conta-a', 0, true);
  const filtro = chamadas.findIndex(c => c[0] === 'is' && c[1] === 'lida_em' && c[2] === null);
  assert.ok(filtro >= 0 && filtro < chamadas.findIndex(c => c[0] === 'range'));
});

test('marcar todas altera somente as não lidas da conta autenticada', async () => {
  const { servico, chamadas } = preparar();
  await servico.marcarTodasLidas('conta-a');
  assert.ok(chamadas.some(c => c[0] === 'eq' && c[1] === 'usuario_id' && c[2] === 'conta-a'));
  assert.ok(chamadas.some(c => c[0] === 'is' && c[1] === 'lida_em' && c[2] === null));
  const atualizacao = chamadas.find(c => c[0] === 'update')[1];
  assert.deepEqual(Object.keys(atualizacao), ['lida_em']);
  await assert.rejects(servico.marcarTodasLidas(''));
});

test('falha ao marcar notificações é propagada para permitir nova tentativa', async () => {
  const { servico } = preparar({ data: null, error: new Error('Sem conexão') });
  await assert.rejects(servico.marcarTodasLidas('conta-a'), /Sem conexão/);
});
