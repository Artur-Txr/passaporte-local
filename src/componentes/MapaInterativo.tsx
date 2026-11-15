import { useMemo } from 'react';
import { Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { coordenadasValidas, htmlMapa, type Coordenadas, type MarcadorMapa } from '../lib/mapa';

export type PropsMapa = {
  marcadores: MarcadorMapa[];
  editavel?: boolean;
  onEscolher?: (coordenadas: Coordenadas) => void;
  onVisita?: (id: string) => void;
  onErro?: () => void;
};

export default function MapaInterativo({ marcadores, editavel = false, onEscolher, onVisita, onErro }: PropsMapa) {
  const html = useMemo(() => htmlMapa(marcadores, editavel), [marcadores, editavel]);
  return <WebView source={{ html }} style={{ flex: 1 }} originWhitelist={['*']} applicationNameForUserAgent="PassaporteLocal/0.1" onError={onErro}
    onShouldStartLoadWithRequest={({ url }) => {
      if (url === 'about:blank') return true;
      if (url.startsWith('https://www.openstreetmap.org/')) void Linking.openURL(url);
      return false;
    }}
    onMessage={({ nativeEvent }) => {
      try {
        const mensagem = JSON.parse(nativeEvent.data);
        if (mensagem.tipo === 'coordenadas' && editavel && coordenadasValidas(mensagem)) onEscolher?.(mensagem);
        if (mensagem.tipo === 'visita' && marcadores.some(ponto => ponto.id === mensagem.id)) onVisita?.(mensagem.id);
        if (mensagem.tipo === 'erro') onErro?.();
      } catch { onErro?.(); }
    }} />;
}
