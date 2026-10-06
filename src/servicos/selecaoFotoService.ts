import { File } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';
import type { TipoImagem } from './fotosService';

const LIMITE_BYTES = 5 * 1024 * 1024;

export type FotoSelecionada = {
  uri: string;
  conteudo: ArrayBuffer;
  tipo: TipoImagem;
};

function conferirTamanho(tamanho: number) {
  if (tamanho > LIMITE_BYTES) {
    throw new Error('Escolha uma imagem de até 5 MB.');
  }
}

function identificarTipo(conteudo: ArrayBuffer): TipoImagem {
  const bytes = new Uint8Array(conteudo);

  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return 'image/jpeg';
  }

  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return 'image/png';
  }

  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return 'image/webp';
  }

  throw new Error('Escolha uma imagem JPEG, PNG ou WebP.');
}

export async function selecionarFoto():
  Promise<FotoSelecionada | null> {
  const resultado = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: false,
    allowsEditing: false,
    quality: 1,
    exif: false,
  });

  if (resultado.canceled) {
    return null;
  }

  const imagem = resultado.assets[0];

  if (!imagem) {
    throw new Error('Não foi possível obter a imagem escolhida.');
  }

  if (imagem.fileSize !== undefined) {
    conferirTamanho(imagem.fileSize);
  }

  let conteudo: ArrayBuffer;

  if (Platform.OS === 'web') {
    if (!imagem.file) {
      throw new Error('Não foi possível ler a imagem escolhida.');
    }

    conferirTamanho(imagem.file.size);
    conteudo = await imagem.file.arrayBuffer();
  } else {
    const arquivo = new File(imagem.uri);

    if (!arquivo.exists) {
      throw new Error('A imagem escolhida não está disponível.');
    }

    conferirTamanho(arquivo.size);
    conteudo = await arquivo.arrayBuffer();
  }

  if (conteudo.byteLength === 0) {
    throw new Error('A imagem escolhida está vazia.');
  }

  conferirTamanho(conteudo.byteLength);

  return {
    uri: imagem.uri,
    conteudo,
    tipo: identificarTipo(conteudo),
  };
}