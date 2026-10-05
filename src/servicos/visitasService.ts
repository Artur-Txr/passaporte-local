import type { Visita } from '../dados/visitas';
import { supabase } from '../lib/supabase';

export type DadosVisita = Omit<Visita, 'id'>;

type VisitaBanco = {
  id: string;
  usuario_id: string;
  lugar: string;
  cidade: string;
  uf: string;
  categoria: string;
  data_visita: string;
  comentario: string;
};

const CAMPOS =
  'id, usuario_id, lugar, cidade, uf, categoria, data_visita, comentario';

function dataParaBanco(data: string) {
  const [dia, mes, ano] = data.split('/');
  return `${ano}-${mes}-${dia}`;
}

function dataParaTela(data: string) {
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}

function converterVisita(registro: VisitaBanco): Visita {
  return {
    id: registro.id,
    lugar: registro.lugar,
    cidade: registro.cidade,
    uf: registro.uf,
    categoria: registro.categoria,
    data: dataParaTela(registro.data_visita),
    comentario: registro.comentario,
  };
}

export async function listarVisitas(
  usuarioId: string,
): Promise<Visita[]> {
  const { data, error } = await supabase
    .from('visitas')
    .select(CAMPOS)
    .eq('usuario_id', usuarioId)
    .order('criado_em', { ascending: false })
    .order('id', { ascending: false });

  if (error) {
    throw error;
  }

  return ((data ?? []) as VisitaBanco[]).map(converterVisita);
}

export async function cadastrarVisita(
  usuarioId: string,
  dados: DadosVisita,
): Promise<Visita> {
  const { data, error } = await supabase
    .from('visitas')
    .insert({
      usuario_id: usuarioId,
      lugar: dados.lugar.trim(),
      cidade: dados.cidade.trim(),
      uf: dados.uf,
      categoria: dados.categoria,
      data_visita: dataParaBanco(dados.data),
      comentario: dados.comentario.trim(),
    })
    .select(CAMPOS)
    .single();

  if (error) {
    throw error;
  }

  return converterVisita(data as VisitaBanco);
}

export async function atualizarVisita(
  usuarioId: string,
  visitaId: string,
  dados: DadosVisita,
): Promise<Visita> {
  const { data, error } = await supabase
    .from('visitas')
    .update({
      lugar: dados.lugar.trim(),
      cidade: dados.cidade.trim(),
      uf: dados.uf,
      categoria: dados.categoria,
      data_visita: dataParaBanco(dados.data),
      comentario: dados.comentario.trim(),
    })
    .eq('id', visitaId)
    .eq('usuario_id', usuarioId)
    .select(CAMPOS)
    .single();

  if (error) {
    throw error;
  }

  return converterVisita(data as VisitaBanco);
}

export async function removerVisita(
  usuarioId: string,
  visitaId: string,
): Promise<void> {
  const { data, error } = await supabase
    .from('visitas')
    .delete()
    .eq('id', visitaId)
    .eq('usuario_id', usuarioId)
    .select('id')
    .single();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error('A visita não foi encontrada para exclusão.');
  }
}