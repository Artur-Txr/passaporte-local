import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { cores, visual } from './Design';

export default function EstadoConsulta({ carregando, erro, tentarNovamente, vazio = 'Visita não encontrada. Volte à lista e selecione uma visita.' }: {
  carregando: boolean; erro: string | null; tentarNovamente: () => void; vazio?: string;
}) {
  return <View style={{ paddingVertical: 24, gap: 12 }}>
    {carregando ? <><ActivityIndicator color={cores.verde} /><Text accessibilityLiveRegion="polite" style={visual.subtitle}>Carregando suas visitas…</Text></> :
      erro ? <><Text accessibilityLiveRegion="polite" style={visual.subtitle}>{erro}</Text><Pressable accessibilityRole="button" onPress={tentarNovamente} style={visual.button}><Text style={visual.buttonText}>Tentar novamente</Text></Pressable></> :
        <Text style={visual.subtitle}>{vazio}</Text>}
  </View>;
}
