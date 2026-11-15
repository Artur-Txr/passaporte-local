import { supabase } from '../lib/supabase';
import { normalizarTexto } from '../lib/cidades';

export type Publicacao = {
  id: string;
  usuario_id: string;
  lugar: string;
  cidade: string;
  uf: string;
  data_visita: string;
  comentario: string;
  foto_path: string | null;
  fotos_adicionais: string[];
  categoria: string;
  latitude: number | null;
  longitude: number | null;
  perfis: { nome: string; avatar_path: string | null } | null;
};

const tamanhoPagina = 20;

export const camposPublicacao = 'id,usuario_id,lugar,cidade,uf,categoria,data_visita,comentario,foto_path,fotos_adicionais,latitude,longitude,perfis!visitas_usuario_id_fkey(nome,avatar_path)';

export async function listarPublicacoes(pagina: number, filtros: { busca?: string; categoria?: string; usuarioId?: string } = {}): Promise<Publicacao[]> {
  const inicio = pagina * tamanhoPagina;
  let consulta = supabase.from('visitas').select(camposPublicacao);
  const termo = normalizarTexto(filtros.busca ?? '').replace(/[%_\\]/g, '\\$&');
  if (termo) {
    consulta = consulta.ilike('busca_texto', `%${termo}%`);
  }
  if (filtros.categoria) consulta = consulta.eq('categoria', filtros.categoria);
  if (filtros.usuarioId) consulta = consulta.eq('usuario_id', filtros.usuarioId);
  const { data, error } = await consulta
    .order('criado_em', { ascending: false })
    .order('id', { ascending: false })
    .range(inicio, inicio + tamanhoPagina - 1);
  if (error) throw error;
  return (data ?? []) as unknown as Publicacao[];
}

export async function obterPublicacao(id: string): Promise<Publicacao> {
  const { data, error } = await supabase.from('visitas').select(camposPublicacao).eq('id', id).single();
  if (error) throw error;
  return data as unknown as Publicacao;
}

export async function obterPerfilPublico(id: string) {
  const { data, error } = await supabase.from('perfis').select('id,nome,avatar_path').eq('id', id).single();
  if (error) throw error;
  return data as { id: string; nome: string; avatar_path: string | null };
}

export async function obterResumoViajante(id: string) {
  const { data, error } = await supabase.rpc('resumo_viajante', { viajante_id: id });
  if (error) throw error;
  return data as { visitas: number; cidades: { cidade: string; uf: string; quantidade: number }[] };
}

export async function carregarFotoPublicacao(caminho: string): Promise<string> {
  const { data, error } = await supabase.storage.from('fotos-visitas').createSignedUrl(caminho, 3600);
  if (error) throw error;
  return data.signedUrl;
}

export type ComentarioPublicacao = {
  id: string;
  usuario_id: string;
  texto: string;
  criado_em: string;
  perfis: { nome: string; avatar_path: string | null } | null;
};

export async function consultarCurtidas(visitaId: string, usuarioId: string) {
  const [total, propria, comentarios] = await Promise.all([
    supabase.from('curtidas').select('*', { count: 'exact', head: true }).eq('visita_id', visitaId),
    supabase.from('curtidas').select('usuario_id').eq('visita_id', visitaId).eq('usuario_id', usuarioId).maybeSingle(),
    supabase.from('comentarios').select('*', { count: 'exact', head: true }).eq('visita_id', visitaId),
  ]);
  if (total.error) throw total.error;
  if (propria.error) throw propria.error;
  if (comentarios.error) throw comentarios.error;
  return { total: total.count ?? 0, curtida: !!propria.data, comentarios: comentarios.count ?? 0 };
}

export async function definirCurtida(visitaId: string, usuarioId: string, curtir: boolean) {
  const resultado = curtir
    ? await supabase.from('curtidas').upsert({ visita_id: visitaId, usuario_id: usuarioId }, { onConflict: 'visita_id,usuario_id', ignoreDuplicates: true })
    : await supabase.from('curtidas').delete().eq('visita_id', visitaId).eq('usuario_id', usuarioId);
  if (resultado.error) throw resultado.error;
}

const camposComentario = 'id,usuario_id,texto,criado_em,perfis(nome,avatar_path)';

export async function listarComentarios(visitaId: string, pagina: number): Promise<ComentarioPublicacao[]> {
  const inicio = pagina * 20;
  const { data, error } = await supabase.from('comentarios').select(camposComentario)
    .eq('visita_id', visitaId).order('criado_em', { ascending: false }).order('id', { ascending: false })
    .range(inicio, inicio + 19);
  if (error) throw error;
  return (data ?? []) as unknown as ComentarioPublicacao[];
}

export async function enviarComentario(id: string, visitaId: string, usuarioId: string, texto: string): Promise<ComentarioPublicacao> {
  const conteudo = texto.trim();
  if (!conteudo || conteudo.length > 500) throw new Error('Escreva um comentário de até 500 caracteres.');
  const { data, error } = await supabase.from('comentarios')
    .insert({ id, visita_id: visitaId, usuario_id: usuarioId, texto: conteudo }).select(camposComentario).single();
  if (!error) return data as unknown as ComentarioPublicacao;
  // Uma resposta perdida pode deixar o comentário salvo. A mesma tentativa usa o mesmo ID.
  const anterior = await supabase.from('comentarios').select(camposComentario)
    .eq('id', id).eq('visita_id', visitaId).eq('usuario_id', usuarioId).eq('texto', conteudo).maybeSingle();
  if (!anterior.error && anterior.data) return anterior.data as unknown as ComentarioPublicacao;
  throw error;
}

export async function removerComentario(id: string, usuarioId: string) {
  const { error } = await supabase.from('comentarios').delete().eq('id', id).eq('usuario_id', usuarioId);
  if (error) throw error;
}
