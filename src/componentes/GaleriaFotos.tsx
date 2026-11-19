import { useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Modal, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icone from './Icone';
import Text from './Texto';
import useFotoPrivada from './useFotoPrivada';

export default function GaleriaFotos({ fotos, inicial, fechar }: {
  fotos: string[];
  inicial: string;
  fechar: () => void;
}) {
  const { width } = useWindowDimensions();
  const lista = useRef<FlatList<string>>(null);
  const [indice, selecionar] = useState(Math.max(0, fotos.indexOf(inicial)));

  function irPara(posicao: number) {
    if (posicao < 0 || posicao >= fotos.length) return;
    lista.current?.scrollToIndex({ index: posicao, animated: true });
    selecionar(posicao);
  }

  return (
    <Modal visible animationType="fade" onRequestClose={fechar} supportedOrientations={['portrait', 'landscape']}>
      <SafeAreaView style={styles.tela} edges={['top', 'bottom']}>
        <View style={styles.cabecalho}>
          <Text accessibilityLiveRegion="polite" style={styles.texto}>{indice + 1} de {fotos.length}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Fechar galeria" onPress={fechar} style={styles.botao}>
            <Text style={styles.texto}>Fechar</Text>
          </Pressable>
        </View>
        <FlatList
          ref={lista}
          key={width}
          data={fotos}
          keyExtractor={caminho => caminho}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={indice}
          getItemLayout={(_, posicao) => ({ length: width, offset: width * posicao, index: posicao })}
          onMomentumScrollEnd={evento => selecionar(Math.max(0, Math.min(fotos.length - 1, Math.round(evento.nativeEvent.contentOffset.x / width))))}
          renderItem={({ item, index }) => <PaginaFoto caminho={item} largura={width} numero={index + 1} />}
          style={{ flex: 1 }}
        />
        {fotos.length > 1 && <View style={styles.rodape}>
          <Pressable accessibilityRole="button" accessibilityLabel="Foto anterior" disabled={indice === 0}
            style={[styles.navegar, indice === 0 && styles.desabilitado]} onPress={() => irPara(indice - 1)}>
            <Icone nome="voltar" tamanho={20} cor="#FFF" />
            <Text style={styles.rotulo}>Anterior</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Próxima foto" disabled={indice === fotos.length - 1}
            style={[styles.navegar, indice === fotos.length - 1 && styles.desabilitado]} onPress={() => irPara(indice + 1)}>
            <Text style={styles.rotulo}>Próxima</Text>
            <Icone nome="proximo" tamanho={20} cor="#FFF" />
          </Pressable>
        </View>}
      </SafeAreaView>
    </Modal>
  );
}

function PaginaFoto({ caminho, largura, numero }: { caminho: string; largura: number; numero: number }) {
  const { url, carregando, erro, tentarNovamente, falhar } = useFotoPrivada(caminho);
  return <View style={{ width: largura, flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    {url && !erro && <Image source={{ uri: url }} style={{ width: '100%', height: '100%' }} resizeMode="contain" accessibilityLabel={`Foto ${numero} da visita`} onError={falhar} />}
    {carregando && !erro && <ActivityIndicator color="#FFFFFF" size="large" />}
    {erro && <View style={{ alignItems: 'center', padding: 24 }}>
      <Text style={styles.texto}>Não foi possível carregar esta foto.</Text>
      <Pressable accessibilityRole="button" onPress={tentarNovamente} style={styles.botao}><Text style={styles.texto}>Tentar novamente</Text></Pressable>
    </View>}
  </View>;
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#000000' },
  cabecalho: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  texto: { color: '#FFFFFF', fontSize: 15 },
  botao: { padding: 16, minHeight: 48 },
  rodape: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  navegar: {
    flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 48, maxWidth: '100%',
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#FFFFFF4D', backgroundColor: '#242424',
  },
  rotulo: { color: '#FFF', fontSize: 15, fontWeight: '700', flexShrink: 1 },
  desabilitado: { opacity: 0.4 },
});
