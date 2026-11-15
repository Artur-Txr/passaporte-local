import { File } from 'expo-file-system';
import { conferirTamanhoFoto } from '../lib/limitesFoto';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { Platform } from 'react-native';
import type { TipoImagem } from './fotosService';


export type FotoSelecionada = {
  uri: string;
  conteudo: ArrayBuffer;
  tipo: TipoImagem;
};

function conferirTamanho(tamanho: number) {
  conferirTamanhoFoto(tamanho);
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

export async function selecionarFoto(origem: 'galeria' | 'camera' = 'galeria'):
  Promise<FotoSelecionada | null> {
  if (origem === 'camera' && Platform.OS !== 'web') {
    const permissao = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissao.granted) {
      throw new Error(permissao.canAskAgain
        ? 'Permita o acesso à câmera para tirar uma foto. Você também pode escolher uma imagem da galeria.'
        : 'O acesso à câmera está desativado. Você pode habilitá-lo nas configurações do Expo Go ou escolher uma imagem da galeria.');
    }
  }
  const abrir = origem === 'camera'
    ? ImagePicker.launchCameraAsync : ImagePicker.launchImageLibraryAsync;
  const resultado = await abrir({
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

  const tipoOriginal = identificarTipo(conteudo);
  if (imagem.width * imagem.height > 60000000) throw new Error('Escolha uma imagem com até 60 megapixels.');
  const manipulador = ImageManipulator.manipulate(imagem.uri);
  if (Math.max(imagem.width, imagem.height) > 1600) {
    manipulador.resize(imagem.width >= imagem.height ? { width: 1600 } : { height: 1600 });
  }
  const renderizada = await manipulador.renderAsync();
  let uri = imagem.uri;
  try {
    const formato = tipoOriginal === 'image/png' ? SaveFormat.PNG : tipoOriginal === 'image/webp' ? SaveFormat.WEBP : SaveFormat.JPEG;
    const otimizada = await renderizada.saveAsync({ compress: 0.8, format: formato });
    const bytes = Platform.OS === 'web' ? await (await fetch(otimizada.uri)).arrayBuffer() : await new File(otimizada.uri).arrayBuffer();
    if (bytes.byteLength > 0 && bytes.byteLength < conteudo.byteLength) {
      conteudo = bytes;
      uri = otimizada.uri;
    }
  } finally {
    renderizada.release();
    manipulador.release();
  }

  return {
    uri,
    conteudo,
    tipo: identificarTipo(conteudo),
  };
}
