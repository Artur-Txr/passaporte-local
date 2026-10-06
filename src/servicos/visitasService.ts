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
  avaliacao: number | null;
};

const CAMPOS =
  'id, usuario_id, lugar, cidade, uf, categoria, data_visita, comentario, avaliacao';

function dataParaBanco(data: string) {
  const [dia, mes, ano] = data.split('/');
  return `${ano}-${mes}-${dia}`;
}

function dataParaTela(data: string) {
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}

function conferirAvaliacao(avaliacao?: number | null) {
  if (avaliacao === undefined || avaliacao === null) {
    return;
  }

  if (
    !Number.isInteger(avaliacao) ||
    avaliacao < 1 ||
    avaliacao > 5
  ) {
    throw new Error('A avaliação deve ser um número inteiro de 1 a 5.');
  }
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
    avaliacao: registro.avaliacao,
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
  conferirAvaliacao(dados.avaliacao);

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
      avaliacao: dados.avaliacao ?? null,
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
  conferirAvaliacao(dados.avaliacao);

  const { data, error } = await supabase
    .from('visitas')
    .update({
      lugar: dados.lugar.trim(),
      cidade: dados.cidade.trim(),
      uf: dados.uf,
      categoria: dados.categoria,
      data_visita: dataParaBanco(dados.data),
      comentario: dados.comentario.trim(),
      ...(dados.avaliacao !== undefined
        ? { avaliacao: dados.avaliacao }
        : {}),
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