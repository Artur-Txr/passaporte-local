import { registrarUpload } from './uploadsPendentesService';
import { supabase } from '../lib/supabase';
import { conferirTamanhoFoto } from '../lib/limitesFoto';

const BUCKET = 'fotos-visitas';

export type TipoImagem =
  | 'image/jpeg'
  | 'image/png'
  | 'image/webp';

const extensoes: Record<TipoImagem, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

function conferirCaminho(usuarioId: string, caminho: string) {
  const partes = caminho.split('/');

  if (
    !usuarioId ||
    partes.length !== 2 ||
    partes[0] !== usuarioId ||
    !partes[1] ||
    partes[1] === '.' ||
    partes[1] === '..'
  ) {
    throw new Error('O caminho da foto não pertence a esta conta.');
  }
}

export async function enviarFoto(
  usuarioId: string,
  conteudo: ArrayBuffer,
  tipo: TipoImagem,
): Promise<string> {
  if (!usuarioId) {
    throw new Error('Entre na sua conta para enviar uma foto.');
  }

  conferirTamanhoFoto(conteudo.byteLength);

  const extensao = extensoes[tipo];

  if (!extensao) {
    throw new Error('Escolha uma imagem JPEG, PNG ou WebP.');
  }

  const identificador =
    `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;

  const caminho = `${usuarioId}/${identificador}.${extensao}`;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(caminho, conteudo, {
      contentType: tipo,
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw error;
  }

  await registrarUpload(usuarioId, data.path);
  return data.path;
}

export async function obterUrlFoto(
  usuarioId: string,
  caminho: string,
): Promise<string> {
  conferirCaminho(usuarioId, caminho);

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(caminho, 3600);

  if (error) {
    throw error;
  }

  return data.signedUrl;
}

export async function excluirFoto(
  usuarioId: string,
  caminho: string,
): Promise<void> {
  conferirCaminho(usuarioId, caminho);

  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([caminho]);

  if (error) {
    throw error;
  }
}
