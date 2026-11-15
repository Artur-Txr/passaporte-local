import { router } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Avatar from '../componentes/Avatar';
import { Cabecalho, visual } from '../componentes/Design';
import Text from '../componentes/Texto';
import useListaPaginada from '../componentes/useListaPaginada';
import { useAutenticacao } from '../contextos/AutenticacaoContext';
import { paleta } from '../lib/paleta';
import { listarNotificacoes, marcarLida, type Notificacao } from '../servicos/socialService';

export default function Notificacoes() {
  const { sessao } = useAutenticacao();
  const usuarioId = sessao?.user.id ?? '';
  const buscar = useCallback((pagina: number) => listarNotificacoes(usuarioId, pagina), [usuarioId]);
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
  return <SafeAreaView style={visual.screen}><FlatList data={itens} keyExtractor={item => item.id} contentContainerStyle={visual.content} refreshing={carregando} onRefresh={() => void carregar(true)}
    ListHeaderComponent={<View style={{ marginBottom: 16 }}><Cabecalho titulo="Notificações" voltar /><Text accessibilityRole="header" style={visual.title}>Sua comunidade.</Text><Text style={visual.subtitle}>Curtidas e comentários nas suas visitas.</Text>{!!falha && <Text style={visual.subtitle}>{falha}</Text>}</View>}
    renderItem={({ item }) => <Pressable accessibilityRole="button" disabled={abrindo} onPress={() => void abrir(item)} style={{ flexDirection: 'row', gap: 12, padding: 14, marginBottom: 10, borderRadius: 14, backgroundColor: item.lida_em ? '#FFF' : paleta.claro }}>
      <Avatar nome={item.ator?.nome ?? 'Viajante'} caminho={item.ator?.avatar_path} />
      <View style={{ flex: 1 }}><Text style={visual.section}>{item.ator?.nome ?? 'Viajante'}</Text><Text style={visual.subtitle}>{item.tipo === 'curtida' ? 'Curtiu sua visita a ' : 'Comentou na sua visita a '}{item.visitas?.lugar ?? 'um lugar'}.</Text><Text style={visual.meta}>{new Date(item.criado_em).toLocaleString('pt-BR')}</Text></View>
    </Pressable>}
    ListEmptyComponent={carregando ? <ActivityIndicator /> : !erro ? <Text style={visual.subtitle}>Você ainda não recebeu notificações.</Text> : null}
    ListFooterComponent={<View>{erro && <Pressable accessibilityRole="button" onPress={() => void carregar(true)} style={{ paddingVertical: 12 }}><Text style={visual.link}>Não foi possível carregar. Tentar novamente.</Text></Pressable>}{mais && !erro && <Pressable accessibilityRole="button" disabled={carregando} onPress={() => void carregar()} style={visual.button}><Text style={visual.buttonText}>Ver mais notificações</Text></Pressable>}</View>} />
  </SafeAreaView>;
}
