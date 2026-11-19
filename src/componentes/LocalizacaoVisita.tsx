import { useMemo, useRef, useState } from 'react';
import { Linking, Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { coordenadasValidas, urlRota } from '../lib/mapa';
import { paleta } from '../lib/paleta';
import { visual } from './Design';
import Icone from './Icone';
import MapaInterativo from './MapaInterativo';
import Text from './Texto';

type Local = { id: string; lugar: string; cidade: string; uf: string; latitude?: number | null; longitude?: number | null };

export default function LocalizacaoVisita({ visita, rotulo }: { visita: Local; rotulo: string }) {
  const [aberto, abrir] = useState(false);
  const [erroMapa, setErroMapa] = useState(false);
  const [erroRota, setErroRota] = useState(false);
  const [tentativa, tentar] = useState(0);
  const [abrindoRota, setAbrindoRota] = useState(false);
  const trava = useRef(false);
  const marcadores = useMemo(() => coordenadasValidas(visita)
    ? [{ id: visita.id, titulo: visita.lugar, latitude: visita.latitude, longitude: visita.longitude }]
    : [], [visita.id, visita.lugar, visita.latitude, visita.longitude]);

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
    <View style={estilos.local}>
      <View style={estilos.cidade}>
        <Icone nome="lugar" tamanho={17} cor={paleta.suave} />
        <Text style={[visual.subtitle, { flexShrink: 1, marginTop: 0 }]}>{rotulo}</Text>
      </View>
      {marcadores.length > 0 && (
        <Pressable accessibilityRole="button" accessibilityLabel={`Ver localização de ${visita.lugar}`}
          onPress={() => { setErroMapa(false); setErroRota(false); abrir(true); }}
          style={({ pressed }) => [estilos.botao, pressed && { opacity: 0.65 }]}>
          <Icone nome="mapa" tamanho={19} />
          <Text style={estilos.rotulo}>Ver no mapa</Text>
        </Pressable>
      )}
    </View>
    {aberto && <Modal visible animationType="slide" onRequestClose={() => abrir(false)}>
      <SafeAreaView style={visual.screen}>
        <View style={{ paddingHorizontal: 22, paddingTop: 12 }}>
          <Text accessibilityRole="header" style={visual.title}>{visita.lugar}</Text>
          <Text style={visual.subtitle}>{rotulo}</Text>
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

const estilos = StyleSheet.create({
  local: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 12, rowGap: 6, marginTop: 8 },
  cidade: { flexDirection: 'row', alignItems: 'center', gap: 4, maxWidth: '100%' },
  botao: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    minHeight: 44, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12,
    borderWidth: 1, borderColor: paleta.borda, backgroundColor: paleta.claro, maxWidth: '100%',
  },
  rotulo: { color: paleta.petroleo, fontSize: 13, fontWeight: '700', flexShrink: 1 },
});
