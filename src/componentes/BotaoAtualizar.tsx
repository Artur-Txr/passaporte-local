import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import Icone from './Icone';
import { cores } from './Design';

export default function BotaoAtualizar({ carregando, onPress }: { carregando: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={carregando ? 'Atualizando visitas' : 'Atualizar visitas'} accessibilityState={{ disabled: carregando, busy: carregando }} disabled={carregando} onPress={onPress}
    style={({ pressed }) => ({ minHeight: 44, justifyContent: 'center', opacity: pressed || carregando ? 0.65 : 1 })}>
    <View style={{ paddingHorizontal: 9, paddingVertical: 5, borderRadius: 10, backgroundColor: '#ECEDE2', flexDirection: 'row', alignItems: 'center', gap: 5 }}>
    {carregando ? <ActivityIndicator size="small" color={cores.verde} /> : <Icone nome="atualizar" tamanho={18} />}
    <Text style={{ color: cores.verde, fontSize: 12, fontWeight: '600' }}>{carregando ? 'Atualizando' : 'Atualizar'}</Text>
    </View>
  </Pressable>;
}
