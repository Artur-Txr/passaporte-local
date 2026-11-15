import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapaInterativo from '../componentes/MapaInterativo';
import { Cabecalho, visual } from '../componentes/Design';
import Text from '../componentes/Texto';
import { useVisitas } from '../contextos/VisitasContext';
import { coordenadasValidas } from '../lib/mapa';

export default function Mapa() {
  const { visitas, erro, carregando, recarregarVisitas } = useVisitas();
  const [falhaMapa, setFalhaMapa] = useState(false);
  const [tentativa, tentar] = useState(0);
  const marcadores = useMemo(() => visitas.flatMap(visita => coordenadasValidas(visita) ? [{ id: visita.id, titulo: visita.lugar, latitude: visita.latitude, longitude: visita.longitude }] : []), [visitas]);
  return <SafeAreaView style={visual.screen}>
    <View style={{ paddingHorizontal: 22 }}><Cabecalho titulo="Mapa das visitas" voltar /><Text style={visual.subtitle}>{marcadores.length} {marcadores.length === 1 ? 'lugar marcado' : 'lugares marcados'} · {visitas.length - marcadores.length} sem localização</Text>
      {!marcadores.length && <Text style={visual.subtitle}>Edite uma visita e toque em Selecionar no mapa para começar.</Text>}
      {!!erro && <Pressable accessibilityRole="button" disabled={carregando} onPress={recarregarVisitas}><Text style={visual.link}>Tentar atualizar suas visitas</Text></Pressable>}
      {falhaMapa && <Pressable accessibilityRole="button" onPress={() => { setFalhaMapa(false); tentar(valor => valor + 1); }}><Text style={visual.link}>Não foi possível carregar o mapa. Tentar novamente.</Text></Pressable>}
    </View>
    <MapaInterativo key={tentativa} marcadores={marcadores} onErro={() => setFalhaMapa(true)} onVisita={id => router.push({ pathname: '/detalhes', params: { id } })} />
  </SafeAreaView>;
}
