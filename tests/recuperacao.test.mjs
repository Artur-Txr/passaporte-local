import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extrairTokenRecuperacao, validarNovaSenha } from '../src/lib/recuperacao.ts';

const projeto = 'https://projeto-teste.supabase.co';
const token = 'a'.repeat(64);
const link = `${projeto}/auth/v1/verify?token=${token}&type=recovery&redirect_to=http%3A%2F%2Flocalhost%3A3000`;

test('aceita o link original sem visitar o destino de redirecionamento', () => {
  assert.equal(extrairTokenRecuperacao(`  ${link}  `, projeto), token);
});
test('aceita token_hash de um link de recuperação', () => {
  assert.equal(extrairTokenRecuperacao(link.replace('?token=', '?token_hash='), projeto), token);
});
test('recusa outros projetos, hosts semelhantes e protocolos inseguros', () => {
  for (const url of [link.replace('projeto-teste.', 'outro.'),
    link.replace('.supabase.co/', '.supabase.co.exemplo.com/'), link.replace('https:', 'http:'),
    link.replace('https://', 'https://usuario:senha@')]) {
    assert.throws(() => extrairTokenRecuperacao(url, projeto));
  }
});
test('recusa link de cadastro, link incompleto e texto sem URL', () => {
  for (const url of [link.replace('type=recovery', 'type=signup'),
    `${projeto}/auth/v1/verify?type=recovery`, link.replace(token, '123'),
    link.replace('/verify?', '/outra-rota?'), 'texto']) {
    assert.throws(() => extrairTokenRecuperacao(url, projeto));
  }
});
test('exige tamanho mínimo e confirmação idêntica', () => {
  assert.ok(validarNovaSenha('curta', 'curta'));
  assert.ok(validarNovaSenha('senha longa', 'senha diferente'));
  assert.equal(validarNovaSenha('nova senha longa', 'nova senha longa'), null);
});
