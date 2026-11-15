import { useMemo, useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { type Coordenadas } from '../lib/mapa';
import { visual } from './Design';
import MapaInterativo from './MapaInterativo';
import Text from './Texto';

export default function SeletorLocalizacao({ valor, onChange, bloqueado }: { valor: Coordenadas | null; onChange: (valor: Coordenadas | null) => void; bloqueado: boolean }) {
  const [aberto, abrir] = useState(false);
  const [escolha, escolher] = useState<Coordenadas | null>(valor);
  const [erro, setErro] = useState('');
  const marcadores = useMemo(() => valor ? [{ ...valor, id: 'local', titulo: 'Local da visita' }] : [], [valor?.latitude, valor?.longitude]);
  return <View style={{ marginVertical: 16 }}>
    <Text style={visual.section}>Localização no mapa (opcional)</Text>
    <Text style={visual.subtitle}>{valor ? `${valor.latitude.toFixed(5)}, ${valor.longitude.toFixed(5)}` : 'Marque o lugar que você visitou.'}</Text>
    <Pressable accessibilityRole="button" disabled={bloqueado} onPress={() => { escolher(valor); setErro(''); abrir(true); }} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={visual.link}>{valor ? 'Alterar localização' : 'Selecionar no mapa'}</Text></Pressable>
    {valor && <Pressable accessibilityRole="button" disabled={bloqueado} onPress={() => onChange(null)} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={visual.link}>Remover localização</Text></Pressable>}
    <Modal visible={aberto} animationType="slide" onRequestClose={() => abrir(false)}>
      <SafeAreaView style={visual.screen}>
        <View style={{ padding: 16 }}><Text style={visual.section}>Toque no mapa para marcar o lugar</Text><Text style={visual.subtitle}>Aproxime o mapa com dois dedos.</Text></View>
        <MapaInterativo marcadores={marcadores} editavel onEscolher={escolher} onErro={() => setErro('Não foi possível carregar o mapa. Confira sua conexão.')} />
        <View style={{ padding: 16 }}>
          {!!erro && <Text style={visual.subtitle}>{erro}</Text>}
          <Pressable accessibilityRole="button" disabled={!escolha} onPress={() => { onChange(escolha); abrir(false); }} style={[visual.button, !escolha && { opacity: 0.5 }]}><Text style={visual.buttonText}>Confirmar localização</Text></Pressable>
          <Pressable accessibilityRole="button" onPress={() => abrir(false)} style={{ minHeight: 44, alignItems: 'center', justifyContent: 'center' }}><Text style={visual.link}>Cancelar</Text></Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  </View>;
}
