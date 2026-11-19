import { router } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Avatar from '../componentes/Avatar';
import { Cabecalho, visual } from '../componentes/Design';
import Text from '../componentes/Texto';
import useListaPaginada from '../componentes/useListaPaginada';
import { useAutenticacao } from '../contextos/AutenticacaoContext';
import { paleta } from '../lib/paleta';
import { listarNotificacoes, marcarLida, marcarTodasLidas, type Notificacao } from '../servicos/socialService';

export default function Notificacoes() {
  const { sessao } = useAutenticacao();
  const usuarioId = sessao?.user.id ?? '';
  const [somenteNaoLidas, filtrar] = useState(false);
  const [marcando, setMarcando] = useState(false);
  const buscar = useCallback((pagina: number) => listarNotificacoes(usuarioId, pagina, somenteNaoLidas), [usuarioId, somenteNaoLidas]);
  const { itens, carregando, erro, mais, carregar } = useListaPaginada(buscar);
  const [falha, setFalha] = useState('');
  const [abrindo, setAbrindo] = useState(false);
  const trava = useRef(false);
  async function abrir(item: Notificacao) {
    if (trava.current) return;
    trava.current = true;
    setAbrindo(true);
    setFalha('');
    try {
      if (!item.lida_em) await marcarLida(item.id, usuarioId);
      router.push({ pathname: './publicacao', params: { id: item.visita_id } });
    } catch { setFalha('Não foi possível abrir a notificação. Tente novamente.'); }
    finally { trava.current = false; setAbrindo(false); }
  }
  async function lerTodas() {
    if (trava.current) return;
    trava.current = true; setMarcando(true); setFalha('');
    try { await marcarTodasLidas(usuarioId); await carregar(true); }
    catch { setFalha('Não foi possível marcar as notificações. Tente novamente.'); }
    finally { trava.current = false; setMarcando(false); }
  }
  return <SafeAreaView style={visual.screen}><FlatList data={itens} keyExtractor={item => item.id} contentContainerStyle={visual.content} refreshing={carregando} onRefresh={() => void carregar(true)}
    ListHeaderComponent={
      <View style={{ marginBottom: 16 }}>
        <Cabecalho titulo="Notificações" voltar />
        <Text style={visual.subtitle}>Curtidas e comentários nas suas visitas.</Text>
        <View style={estilos.abas}>
          {[false, true].map(valor => {
            const selecionada = somenteNaoLidas === valor;
            return (
              <Pressable key={String(valor)} accessibilityRole="tab" accessibilityState={{ selected: selecionada }}
                onPress={() => filtrar(valor)} style={[estilos.aba, selecionada && estilos.abaSelecionada]}>
                <Text style={[estilos.rotulo, selecionada && estilos.rotuloSelecionado]}>{valor ? 'Não lidas' : 'Todas'}</Text>
              </Pressable>
            );
          })}
        </View>
        {(itens.length > 0 || marcando) && (
          <Pressable accessibilityRole="button" disabled={marcando || abrindo || carregando}
            onPress={() => void lerTodas()} style={{ minHeight: 44, justifyContent: 'center' }}>
            <Text style={visual.link}>{marcando ? 'Marcando…' : 'Marcar todas como lidas'}</Text>
          </Pressable>
        )}
        {!!falha && <Text accessibilityLiveRegion="polite" style={visual.subtitle}>{falha}</Text>}
      </View>
    }
    renderItem={({ item }) => <Pressable accessibilityRole="button" disabled={abrindo || marcando} onPress={() => void abrir(item)} style={{ flexDirection: 'row', gap: 12, padding: 14, marginBottom: 10, borderRadius: 14, backgroundColor: item.lida_em ? '#FFF' : paleta.claro }}>
      <Avatar nome={item.ator?.nome ?? 'Viajante'} caminho={item.ator?.avatar_path} />
      <View style={{ flex: 1 }}>
        {!item.lida_em && <Text style={estilos.nova}>Não lida</Text>}
        <Text style={visual.section}>{item.ator?.nome ?? 'Viajante'}</Text>
        <Text style={visual.subtitle}>{item.tipo === 'curtida' ? 'Curtiu sua visita a ' : 'Comentou na sua visita a '}{item.visitas?.lugar ?? 'um lugar'}.</Text>
        <Text style={visual.meta}>{new Date(item.criado_em).toLocaleString('pt-BR')}</Text>
      </View>
    </Pressable>}
    ListEmptyComponent={carregando ? <ActivityIndicator /> : !erro ? <Text style={visual.subtitle}>{somenteNaoLidas ? 'Tudo em dia. Você leu todas as notificações.' : 'Você ainda não recebeu notificações.'}</Text> : null}
    ListFooterComponent={<View>{erro && <Pressable accessibilityRole="button" onPress={() => void carregar(true)} style={{ paddingVertical: 12 }}><Text style={visual.link}>Não foi possível carregar. Tentar novamente.</Text></Pressable>}{mais && !erro && <Pressable accessibilityRole="button" disabled={carregando} onPress={() => void carregar()} style={visual.button}><Text style={visual.buttonText}>Ver mais notificações</Text></Pressable>}</View>} />
  </SafeAreaView>;
}

const estilos = StyleSheet.create({
  abas: { flexDirection: 'row', gap: 4, padding: 4, marginTop: 16, backgroundColor: paleta.claro, borderRadius: 14 },
  aba: {
    flex: 1, minHeight: 44, justifyContent: 'center', alignItems: 'center', padding: 8,
    borderRadius: 10, borderBottomWidth: 3, borderBottomColor: 'transparent',
  },
  abaSelecionada: { backgroundColor: paleta.petroleo, borderBottomColor: paleta.coral },
  rotulo: { color: paleta.petroleo, fontSize: 14, fontWeight: '700', textAlign: 'center' },
  rotuloSelecionado: { color: '#FFF' },
  nova: {
    alignSelf: 'flex-start', backgroundColor: paleta.coralClaro, color: '#A54332', fontSize: 12, fontWeight: '700',
    borderRadius: 8, paddingVertical: 3, paddingHorizontal: 8, marginBottom: 4,
  },
});
