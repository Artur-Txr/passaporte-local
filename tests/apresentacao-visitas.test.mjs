import { test } from 'node:test';
import assert from 'node:assert/strict';
import { agruparCidades, chaveCidade, localizacaoVisita } from '../src/lib/cidades.ts';
import { apresentarLembranca } from '../src/lib/lembranca.ts';

test('Rio do Sal na Bahia conta como localidade de Paulo Afonso sem alterar a visita', () => {
  assert.equal(chaveCidade('Povoado Rio de Sal', 'BA'), chaveCidade('Paulo Afonso', 'BA'));
  assert.equal(chaveCidade('Rio do Sal', 'BA'), chaveCidade('Paulo Afonso', 'BA'));
  assert.notEqual(chaveCidade('Rio do Sal', 'SE'), chaveCidade('Paulo Afonso', 'SE'));
  assert.deepEqual(localizacaoVisita('Povoado Rio de Sal', 'BA'), { cidade: 'Paulo Afonso', localidade: 'Povoado Rio de Sal' });
});

test('cartão agrupa visitas da cidade e escolhe uma fotografia existente sem mutar registros', () => {
  const base = { categoria: 'Outro', uf: 'BA', data: '03/10/2026', comentario: '' };
  const visitas = [
    { ...base, id: '1', lugar: 'Centro', cidade: 'Paulo Afonso', foto_path: null },
    { ...base, id: '2', lugar: 'Mirante', cidade: 'Povoado Rio de Sal', foto_path: 'conta/mirante.jpg' },
  ];
  const original = JSON.stringify(visitas);
  const grupos = agruparCidades(visitas);
  assert.equal(grupos.length, 1);
  assert.equal(grupos[0].quantidade, 2);
  assert.equal(grupos[0].visita.id, '2');
  assert.deepEqual(grupos[0].localidades, ['Povoado Rio de Sal']);
  assert.equal(JSON.stringify(visitas), original);
});

test('observação de data aproximada fica separada da lembrança e preserva o texto pessoal', () => {
  const aviso = 'Data aproximada usada no cadastro, pois a data exata da visita não foi lembrada.';
  assert.deepEqual(apresentarLembranca(aviso), { dataAproximada: true, lembranca: '' });
  assert.deepEqual(apresentarLembranca(`Adorei a paisagem. ${aviso}`), { dataAproximada: true, lembranca: 'Adorei a paisagem.' });
  assert.deepEqual(apresentarLembranca('Voltar numa data aproximada ao verão.'), { dataAproximada: false, lembranca: 'Voltar numa data aproximada ao verão.' });
});
