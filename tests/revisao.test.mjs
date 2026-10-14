import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chaveCidade, normalizarTexto } from '../src/lib/cidades.ts';
import { mensagemErroAuth } from '../src/lib/errosAutenticacao.ts';
import { uploadPodeSerRevisado, PRAZO_LIMPEZA_UPLOAD } from '../src/lib/uploadsPendentes.ts';

test('cidade com acento, caixa e espaços extras representa a mesma cidade na mesma UF', () => {
  assert.equal(chaveCidade(' São   Paulo ', ' sp '), chaveCidade('Sao Paulo', 'SP'));
  assert.notEqual(chaveCidade('Santa Luzia', 'BA'), chaveCidade('Santa Luzia', 'MG'));
  assert.equal(normalizarTexto('  AXIA  '), 'axia');
});

test('erros de autenticação não expõem a mensagem técnica recebida do servidor', () => {
  assert.match(mensagemErroAuth({ code: 'invalid_credentials', status: 400 }), /Confira seu e-mail/);
  assert.match(mensagemErroAuth({ code: 'email_not_confirmed', status: 400 }), /Confirme seu e-mail/);
  assert.match(mensagemErroAuth({ code: 'over_email_send_rate_limit', status: 429 }), /Já tenho um link/);
  const segredoTecnico = 'internal database exception';
  assert.ok(!mensagemErroAuth({ status: 500, message: segredoTecnico }).includes(segredoTecnico));
  assert.ok(!mensagemErroAuth({ status: 400, code: 'unknown', message: segredoTecnico }).includes(segredoTecnico));
});

test('revisão de uploads preserva arquivos recentes, de outras contas e caminhos inválidos', () => {
  const agora = Date.now();
  const velho = agora - PRAZO_LIMPEZA_UPLOAD - 1;
  assert.equal(uploadPodeSerRevisado({ caminho: 'conta/foto.jpg', criadoEm: velho }, 'conta', agora), true);
  for (const [caminho, criadoEm] of [['outra/foto.jpg', velho], ['conta/../foto.jpg', velho], ['conta/..', velho], ['conta/foto.jpg', agora], ['conta/foto.jpg', NaN], ['conta/foto.jpg', agora + PRAZO_LIMPEZA_UPLOAD]]) {
    assert.equal(uploadPodeSerRevisado({ caminho, criadoEm }, 'conta', agora), false);
  }
});
