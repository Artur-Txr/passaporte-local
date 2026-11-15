import { supabase } from '../lib/supabase';
import type { FotoSelecionada } from './selecaoFotoService';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AvatarPendente = { caminho: string; criadoEm: number };
const chavePendentes = (usuarioId: string) => `passaporte:avatares-pendentes:${usuarioId}`;
let fila = Promise.resolve();

async function atualizarPendentes(usuarioId: string, alterar: (lista: AvatarPendente[]) => AvatarPendente[]) {
  const operacao = fila.catch(() => {}).then(async () => {
    const texto = await AsyncStorage.getItem(chavePendentes(usuarioId));
    const dados = texto ? JSON.parse(texto) : [];
    const lista: AvatarPendente[] = Array.isArray(dados) ? dados.filter(item => typeof item?.caminho === 'string' && Number.isFinite(item.criadoEm)) : [];
    await AsyncStorage.setItem(chavePendentes(usuarioId), JSON.stringify(alterar(lista)));
  });
  fila = operacao;
  try { await operacao; } catch { /* Uma falha local não desfaz o salvamento do perfil. */ }
}

async function registrarPendente(usuarioId: string, caminho: string) {
  await atualizarPendentes(usuarioId, lista => [...lista.filter(item => item.caminho !== caminho), { caminho, criadoEm: Date.now() }]);
}

async function limparAvatarAntigo(usuarioId: string, caminho: string) {
  if (!caminho.startsWith(`${usuarioId}/`) || caminho.split('/').length !== 2) return;
  const { data: sessao } = await supabase.auth.getSession();
  if (sessao.session?.user.id !== usuarioId) return;
  const { data, error } = await supabase.from('perfis').select('id').eq('avatar_path', caminho).limit(1);
  if (error || !data) return;
  if (!data.length) {
    const removido = await supabase.storage.from('avatares').remove([caminho]);
    if (removido.error) return;
  }
  await atualizarPendentes(usuarioId, lista => lista.filter(item => item.caminho !== caminho));
}

export async function revisarAvataresAntigos(usuarioId: string) {
  try {
    await fila.catch(() => {});
    const texto = await AsyncStorage.getItem(chavePendentes(usuarioId));
    const dados: unknown = texto ? JSON.parse(texto) : [];
    if (!Array.isArray(dados)) return;
    const antigos = dados.filter((item): item is AvatarPendente => typeof item?.caminho === 'string' && Number.isFinite(item.criadoEm) && Date.now() - item.criadoEm > 86400000);
    for (const item of antigos.slice(0, 20)) await limparAvatarAntigo(usuarioId, item.caminho);
  } catch { /* Tentar novamente ao retornar ao perfil. */ }
}

export async function enviarAvatar(usuarioId: string, foto: FotoSelecionada) {
  const extensao = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[foto.tipo];
  const caminho = `${usuarioId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extensao}`;
  const { error } = await supabase.storage.from('avatares').upload(caminho, foto.conteudo, { contentType: foto.tipo, upsert: false });
  if (error) throw error;
  await registrarPendente(usuarioId, caminho);
  return caminho;
}

export async function salvarAvatar(usuarioId: string, caminho: string | null) {
  const anterior = await supabase.from('perfis').select('avatar_path').eq('id', usuarioId).single();
  if (anterior.error) throw anterior.error;
  const { error } = await supabase.from('perfis').update({ avatar_path: caminho }).eq('id', usuarioId).select('id').single();
  if (error) throw error;
  if (caminho) await atualizarPendentes(usuarioId, lista => lista.filter(item => item.caminho !== caminho));
  const antigo = anterior.data.avatar_path as string | null;
  if (antigo && antigo !== caminho) {
    await registrarPendente(usuarioId, antigo);
    try { await limparAvatarAntigo(usuarioId, antigo); } catch { /* A revisão de pendentes fará outra tentativa. */ }
  }
}
