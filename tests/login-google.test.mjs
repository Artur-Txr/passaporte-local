import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { codigoRetornoGoogle } from '../src/lib/loginGoogle.ts';
const retorno = 'passaportelocal://auth/callback';

test('retorno Google aceita apenas código do endereço registrado', () => {
  assert.equal(codigoRetornoGoogle(retorno+'?code=abc', retorno), 'abc');
  for (const url of ['https://outro.site/auth/callback?code=abc', 'passaportelocal://outro/callback?code=abc', retorno+'/outro?code=abc', retorno+'?code=a&code=b', retorno+'#access_token=abc', retorno]) {
    assert.throws(() => codigoRetornoGoogle(url, retorno));
  }
});
test('retorno Google trata acesso negado sem exibir mensagem externa arbitrária', () => {
  assert.throws(() => codigoRetornoGoogle(retorno+'?error=access_denied&error_description=textoexterno',retorno), /não foi autorizado/);
});
test('callback web confere protocolo, host, porta e caminho', () => {
  const web='http://localhost:8081/auth/callback';
  assert.equal(codigoRetornoGoogle(web+'?code=abc',web),'abc');
  assert.throws(() => codigoRetornoGoogle('http://localhost:8082/auth/callback?code=abc',web));
});
function preparar({ expoGo=false, browser='success', falhaTroca=false }={}) {
  const chamadas=[];
  const auth={
    signInWithOAuth: async opcoes => { chamadas.push(['oauth',opcoes]); return {data:{url:'https://projeto.supabase.co/auth/v1/authorize'},error:null}; },
    exchangeCodeForSession: async codigo => { chamadas.push(['troca',codigo]); return {data:{session:falhaTroca?null:{user:{id:'conta'}}},error:falhaTroca?{message:'expired'}:null}; },
  };
  const deps={
    'expo-constants':{__esModule:true,default:{executionEnvironment:expoGo?'storeClient':'standalone'},ExecutionEnvironment:{StoreClient:'storeClient'}},
    'expo-auth-session':{makeRedirectUri:()=>retorno},
    'expo-web-browser':{maybeCompleteAuthSession:()=>{},openAuthSessionAsync:async()=>({type:browser,url:retorno+'?code=abc'})},
    'react-native':{Platform:{OS:'android'}},
    '../lib/supabase':{supabase:{auth}},
    '../lib/loginGoogle':{codigoRetornoGoogle},
  };
  const exports={};
  const codigo=ts.transpileModule(readFileSync(new URL('../src/servicos/loginGoogleService.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  vm.runInNewContext(codigo,{exports,URL,require:nome=>deps[nome]});
  return {servico:exports,chamadas};
}
test('login Google usa PKCE e troca o mesmo callback uma única vez', async()=>{
  const {servico,chamadas}=preparar();
  await Promise.all([servico.concluirLoginGoogle(retorno+'?code=abc'),servico.concluirLoginGoogle(retorno+'?code=abc')]);
  assert.equal(chamadas.filter(c=>c[0]==='troca').length,1);
});
test('cancelar navegador não cria sessão', async()=>{
  const {servico,chamadas}=preparar({browser:'cancel'});
  assert.equal(await servico.entrarComGoogle(),'cancelado');
  assert.equal(chamadas.filter(c=>c[0]==='troca').length,0);
  const opcoes=chamadas[0][1];
  assert.equal(opcoes.provider,'google');
  assert.equal(opcoes.options.redirectTo,retorno);
  assert.equal(opcoes.options.skipBrowserRedirect,true);
});
test('Expo Go recebe orientação antes de iniciar um login incompatível', async()=>{
  const {servico,chamadas}=preparar({expoGo:true});
  await assert.rejects(servico.entrarComGoogle(),/versão instalada/);
  assert.equal(chamadas.length,0);
});
test('código expirado não é apresentado como login bem-sucedido', async()=>{
  const {servico}=preparar({falhaTroca:true});
  await assert.rejects(servico.entrarComGoogle(),/Não foi possível concluir/);
});
