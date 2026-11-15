import Constants, { ExecutionEnvironment } from 'expo-constants';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { codigoRetornoGoogle } from '../lib/loginGoogle';

WebBrowser.maybeCompleteAuthSession();

export function retornoGoogle() {
  return makeRedirectUri({ scheme: 'passaportelocal', path: 'auth/callback', native: 'passaportelocal://auth/callback' });
}

const trocas = new Map<string, Promise<void>>();

export function concluirLoginGoogle(url: string): Promise<void> {
  const codigo = codigoRetornoGoogle(url, retornoGoogle());
  const existente = trocas.get(codigo);
  if (existente) return existente;
  const promessa = (async () => {
    const { data, error } = await supabase.auth.exchangeCodeForSession(codigo);
    if (error || !data.session) throw new Error('Não foi possível concluir o login. Entre com Google novamente.');
  })();
  if (trocas.size >= 5) trocas.delete(trocas.keys().next().value!);
  trocas.set(codigo, promessa);
  return promessa;
}

export async function entrarComGoogle(): Promise<'conectado' | 'cancelado' | 'redirecionando'> {
  if (Platform.OS !== 'web' && Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
    throw new Error('Para entrar com Google, abra a versão instalada do Passaporte Local. No Expo Go, entre com seu e-mail e senha.');
  }
  const redirectTo = retornoGoogle();
  const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: {
    redirectTo, skipBrowserRedirect: true, scopes: 'openid email profile', queryParams: { prompt: 'select_account' },
  } });
  if (error || !data.url) throw new Error('O acesso com Google está indisponível. Tente novamente mais tarde ou use e-mail e senha.');
  if (Platform.OS === 'web') {
    window.location.assign(data.url);
    return 'redirecionando';
  }
  const resposta = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (resposta.type === 'cancel' || resposta.type === 'dismiss') return 'cancelado';
  if (resposta.type !== 'success') throw new Error('Não foi possível abrir o login Google. Tente novamente.');
  await concluirLoginGoogle(resposta.url);
  return 'conectado';
}
