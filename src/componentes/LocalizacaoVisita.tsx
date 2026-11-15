import { useMemo, useRef, useState } from 'react';
import { Linking, Modal, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { coordenadasValidas, urlRota } from '../lib/mapa';
import { visual } from './Design';
import Icone from './Icone';
import MapaInterativo from './MapaInterativo';
import Text from './Texto';

type Local = { id: string; lugar: string; cidade: string; uf: string; latitude?: number | null; longitude?: number | null };

export default function LocalizacaoVisita({ visita }: { visita: Local }) {
  const [aberto, abrir] = useState(false);
  const [erroMapa, setErroMapa] = useState(false);
  const [erroRota, setErroRota] = useState(false);
  const [tentativa, tentar] = useState(0);
  const [abrindoRota, setAbrindoRota] = useState(false);
  const trava = useRef(false);
  const marcadores = useMemo(() => coordenadasValidas(visita)
    ? [{ id: visita.id, titulo: visita.lugar, latitude: visita.latitude, longitude: visita.longitude }]
    : [], [visita.id, visita.lugar, visita.latitude, visita.longitude]);
  if (!marcadores.length) return null;

  async function abrirRota() {
    const url = urlRota(visita);
    if (!url || trava.current) return;
    trava.current = true;
    setAbrindoRota(true);
    setErroRota(false);
    try { await Linking.openURL(url); }
    catch { setErroRota(true); }
    finally { trava.current = false; setAbrindoRota(false); }
  }

  return <>
    <Pressable accessibilityRole="button" accessibilityLabel={`Ver localização de ${visita.lugar}`} onPress={() => { setErroMapa(false); setErroRota(false); abrir(true); }}
      style={{ minHeight: 48, flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 8 }}>
      <Icone nome="lugar" tamanho={20} /><Text style={visual.link}>Ver localização</Text>
    </Pressable>
    {aberto && <Modal visible animationType="slide" onRequestClose={() => abrir(false)}>
      <SafeAreaView style={visual.screen}>
        <View style={{ paddingHorizontal: 22, paddingTop: 12 }}>
          <Text accessibilityRole="header" style={visual.title}>{visita.lugar}</Text>
          <Text style={visual.subtitle}>{visita.cidade} · {visita.uf}</Text>
          {erroMapa && <Pressable accessibilityRole="button" onPress={() => { setErroMapa(false); tentar(v => v + 1); }} style={{ paddingVertical: 12 }}>
            <Text style={visual.link}>Não foi possível carregar o mapa. Tentar novamente.</Text>
          </Pressable>}
        </View>
        <MapaInterativo key={tentativa} marcadores={marcadores} onErro={() => setErroMapa(true)} onVisita={() => abrir(false)} />
        <View style={{ paddingHorizontal: 22, paddingBottom: 12 }}>
          {erroRota && <Text accessibilityRole="alert" style={visual.subtitle}>Não foi possível abrir a rota. Tente novamente.</Text>}
          <Pressable accessibilityRole="button" disabled={abrindoRota} onPress={() => void abrirRota()} style={visual.button}>
            <Text style={visual.buttonText}>{abrindoRota ? 'Abrindo rota…' : 'Abrir rota no Google Maps'}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => abrir(false)} style={{ minHeight: 48, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={visual.link}>Voltar à visita</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>}
  </>;
}
