import { ActivityIndicator, Pressable, Text } from 'react-native';
import Icone from './Icone';
import { cores } from './Design';

export default function BotaoAtualizar({ carregando, onPress }: { carregando: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={carregando ? 'Atualizando visitas' : 'Atualizar visitas'} accessibilityState={{ disabled: carregando, busy: carregando }} disabled={carregando} onPress={onPress}
    style={({ pressed }) => ({ minHeight: 44, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 12, backgroundColor: '#ECEDE2', flexDirection: 'row', alignItems: 'center', gap: 5, opacity: pressed || carregando ? 0.65 : 1 })}>
    {carregando ? <ActivityIndicator size="small" color={cores.verde} /> : <Icone nome="atualizar" tamanho={18} />}
    <Text style={{ color: cores.verde, fontSize: 12, fontWeight: '600' }}>{carregando ? 'Atualizando' : 'Atualizar'}</Text>
  </Pressable>;
}
