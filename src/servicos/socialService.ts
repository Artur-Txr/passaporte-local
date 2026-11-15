import { supabase } from '../lib/supabase';
import { camposPublicacao, type Publicacao } from './comunidadeService';

export async function consultarFavorito(visitaId: string, usuarioId: string) {
  const { data, error } = await supabase.from('favoritos').select('visita_id').eq('usuario_id', usuarioId).eq('visita_id', visitaId).maybeSingle();
  if (error) throw error;
  return !!data;
}

export async function definirFavorito(visitaId: string, usuarioId: string, salvar: boolean) {
  const { error } = salvar
    ? await supabase.from('favoritos').upsert({ usuario_id: usuarioId, visita_id: visitaId }, { onConflict: 'usuario_id,visita_id', ignoreDuplicates: true })
    : await supabase.from('favoritos').delete().eq('usuario_id', usuarioId).eq('visita_id', visitaId);
  if (error) throw error;
}

export async function listarFavoritos(usuarioId: string, pagina: number): Promise<Publicacao[]> {
  const { data, error } = await supabase.from('favoritos').select(`visitas(${camposPublicacao})`)
    .eq('usuario_id', usuarioId).order('criado_em', { ascending: false }).order('visita_id', { ascending: false }).range(pagina * 20, pagina * 20 + 19);
  if (error) throw error;
  return (data ?? []).map(linha => linha.visitas).filter(Boolean) as unknown as Publicacao[];
}

export type Notificacao = {
  id: string;
  visita_id: string;
  ator_id: string;
  tipo: 'curtida' | 'comentario';
  lida_em: string | null;
  criado_em: string;
  ator: { nome: string; avatar_path: string | null } | null;
  visitas: { lugar: string } | null;
};

export async function listarNotificacoes(usuarioId: string, pagina: number): Promise<Notificacao[]> {
  const { data, error } = await supabase.from('notificacoes')
    .select('id,visita_id,ator_id,tipo,lida_em,criado_em,ator:perfis!notificacoes_ator_id_fkey(nome,avatar_path),visitas(lugar)')
    .eq('usuario_id', usuarioId).order('criado_em', { ascending: false }).order('id', { ascending: false }).range(pagina * 20, pagina * 20 + 19);
  if (error) throw error;
  return (data ?? []) as unknown as Notificacao[];
}

export async function contarNaoLidas(usuarioId: string) {
  const { count, error } = await supabase.from('notificacoes').select('*', { head: true, count: 'exact' }).eq('usuario_id', usuarioId).is('lida_em', null);
  if (error) throw error;
  return count ?? 0;
}

export async function marcarLida(id: string, usuarioId: string) {
  const { error } = await supabase.from('notificacoes').update({ lida_em: new Date().toISOString() }).eq('id', id).eq('usuario_id', usuarioId);
  if (error) throw error;
}
