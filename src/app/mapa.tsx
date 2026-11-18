import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapaInterativo from '../componentes/MapaInterativo';
import CampoTexto from '../componentes/CampoTexto';
import { Cabecalho, visual } from '../componentes/Design';
import Text from '../componentes/Texto';
import { useVisitas } from '../contextos/VisitasContext';
import { coordenadasValidas } from '../lib/mapa';
import { normalizarTexto } from '../lib/cidades';

export default function Mapa() {
  const { visitas, erro, carregando, recarregarVisitas } = useVisitas();
  const [falhaMapa, setFalhaMapa] = useState(false);
  const [tentativa, tentar] = useState(0);
  const [busca, setBusca] = useState('');
  const [semLocal, mostrarSemLocal] = useState(false);
  const filtradas = useMemo(() => visitas.filter(visita => normalizarTexto(`${visita.lugar} ${visita.cidade} ${visita.uf}`).includes(normalizarTexto(busca))), [visitas, busca]);
  const marcadores = useMemo(() => filtradas.flatMap(visita => coordenadasValidas(visita) ? [{ id: visita.id, titulo: visita.lugar, latitude: visita.latitude, longitude: visita.longitude }] : []), [filtradas]);
  const pendentes = filtradas.filter(visita => !coordenadasValidas(visita));
  return <SafeAreaView style={visual.screen}>
    <View style={{ paddingHorizontal: 22 }}>
      <Cabecalho titulo="Mapa das visitas" voltar />
      <CampoTexto icone="busca" accessibilityLabel="Buscar no mapa" placeholder="Buscar lugar ou cidade" value={busca} onChangeText={setBusca} style={{ backgroundColor: '#FFFFFF', borderRadius: 14, marginVertical: 10, paddingRight: 12, color: '#123B4A' }} />
      <Text style={visual.subtitle}>{marcadores.length} {marcadores.length === 1 ? 'lugar marcado' : 'lugares marcados'} · {pendentes.length} sem localização</Text>
      {!filtradas.length && !carregando && <Text style={visual.subtitle}>{busca ? 'Nenhuma visita encontrada.' : 'Cadastre uma visita para começar seu mapa.'}</Text>}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', columnGap: 12, rowGap: 4 }}>
        <Pressable accessibilityRole="button" onPress={() => { setFalhaMapa(false); tentar(valor => valor + 1); }} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={visual.link}>Enquadrar lugares</Text></Pressable>
        {pendentes.length > 0 && <Pressable accessibilityRole="button" accessibilityState={{ expanded: semLocal }} onPress={() => mostrarSemLocal(valor => !valor)} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={visual.link}>{semLocal ? 'Ocultar pendentes' : 'Adicionar localização'}</Text></Pressable>}
      </View>
      {semLocal && <ScrollView style={{ maxHeight: 150 }} contentContainerStyle={{ paddingBottom: 8 }}>
        {pendentes.map(visita => <Pressable key={visita.id} accessibilityRole="button" onPress={() => router.push({ pathname: '/editar-visita', params: { id: visita.id } })} style={{ paddingVertical: 12 }}><Text style={visual.section}>{visita.lugar}</Text><Text style={visual.meta}>{visita.cidade} · {visita.uf} · Marcar no mapa</Text></Pressable>)}
      </ScrollView>}
      {!!erro && <Pressable accessibilityRole="button" disabled={carregando} onPress={recarregarVisitas}><Text style={visual.link}>Tentar atualizar suas visitas</Text></Pressable>}
      {falhaMapa && <Pressable accessibilityRole="button" onPress={() => { setFalhaMapa(false); tentar(valor => valor + 1); }}><Text style={visual.link}>Não foi possível carregar o mapa. Tentar novamente.</Text></Pressable>}
    </View>
    <MapaInterativo key={tentativa} marcadores={marcadores} onErro={() => setFalhaMapa(true)} onVisita={id => router.push({ pathname: '/detalhes', params: { id } })} />
  </SafeAreaView>;
}
