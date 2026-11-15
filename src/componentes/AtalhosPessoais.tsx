import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { paleta } from '../lib/paleta';
import Icone from './Icone';
import Text from './Texto';

const atalhos = [
  { titulo: 'Meu mapa', descricao: 'Lugares visitados', icone: 'mapa', rota: '/mapa', fundo: paleta.claro, cor: paleta.petroleo },
  { titulo: 'Quero conhecer', descricao: 'Lugares salvos', icone: 'salvar', rota: '/favoritos', fundo: paleta.coralClaro, cor: '#B74D39' },
] as const;

export default function AtalhosPessoais() {
  return <View style={styles.grupo}>
    {atalhos.map(atalho => <Pressable key={atalho.rota} accessibilityRole="button" accessibilityLabel={`${atalho.titulo}, ${atalho.descricao.toLocaleLowerCase('pt-BR')}`}
      onPress={() => router.push(atalho.rota)} style={({ pressed }) => [styles.cartao, pressed && { opacity: 0.7, backgroundColor: paleta.papel }]}>
      <View style={styles.topo}>
        <View style={[styles.icone, { backgroundColor: atalho.fundo }]}><Icone nome={atalho.icone} tamanho={23} cor={atalho.cor} /></View>
        <Icone nome="proximo" tamanho={18} cor={paleta.suave} />
      </View>
      <Text style={styles.titulo}>{atalho.titulo}</Text>
      <Text style={styles.descricao}>{atalho.descricao}</Text>
    </Pressable>)}
  </View>;
}

const styles = StyleSheet.create({
  grupo: { flexDirection: 'row', gap: 12, marginTop: 16, marginBottom: 4 },
  cartao: { flex: 1, minWidth: 0, borderRadius: 18, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: paleta.borda, padding: 14 },
  topo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  icone: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  titulo: { color: paleta.petroleo, fontSize: 14, fontWeight: '800', lineHeight: 20 },
  descricao: { color: paleta.suave, fontSize: 12, lineHeight: 18, marginTop: 4 },
});
