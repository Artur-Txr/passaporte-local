import * as Location from 'expo-location';
import { coordenadasValidas, type Coordenadas } from '../lib/mapa';

export async function obterLocalizacaoAtual(): Promise<Coordenadas & { precisao: number | null }> {
  const permissao = await Location.requestForegroundPermissionsAsync();
  if (!permissao.granted) throw new Error('Permita o acesso à localização nas configurações do celular ou escolha o ponto no mapa.');
  if (!await Location.hasServicesEnabledAsync()) throw new Error('Ative a localização do celular e tente novamente.');
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const posicao = await Promise.race([
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
      new Promise<never>((_, rejeitar) => { timer = setTimeout(() => rejeitar(new Error('O celular demorou para encontrar sua posição. Tente novamente ou marque o ponto no mapa.')), 25000); }),
    ]);
    if (!coordenadasValidas(posicao.coords)) throw new Error('Não foi possível determinar sua localização.');
    return { latitude: posicao.coords.latitude, longitude: posicao.coords.longitude, precisao: posicao.coords.accuracy };
  } finally { clearTimeout(timer); }
}
