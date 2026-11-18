import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AlbumVisita from '../componentes/AlbumVisita';
import LocalizacaoVisita from '../componentes/LocalizacaoVisita';
import Avatar from '../componentes/Avatar';
import InteracoesPublicacao from '../componentes/InteracoesPublicacao';
import BotaoFavorito from '../componentes/BotaoFavorito';
import { Cabecalho, visual } from '../componentes/Design';
import Text from '../componentes/Texto';
import { useAutenticacao } from '../contextos/AutenticacaoContext';
import { fotosDaVisita } from '../dados/visitas';
import { formatarDataVisita } from '../lib/formatacaoData';
import { obterPublicacao, type Publicacao } from '../servicos/comunidadeService';

export default function DetalhesPublicacao() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { sessao } = useAutenticacao();
  const [visita, setVisita] = useState<Publicacao | null>(null);
  const [erro, setErro] = useState('');
  const [tentativa, tentar] = useState(0);
  useFocusEffect(useCallback(() => {
    let ativo = true;
    setErro('');
    setVisita(null);
    obterPublicacao(id).then(valor => { if (ativo) setVisita(valor); })
      .catch(() => { if (ativo) setErro('Não foi possível abrir esta visita. Ela pode ter sido removida.'); });
    return () => { ativo = false; };
  }, [id, tentativa]));
  return <SafeAreaView style={visual.screen}>
    <ScrollView contentContainerStyle={visual.content}>
      <Cabecalho titulo="Detalhes da visita" voltar />
      {erro ? <Pressable accessibilityRole="button" onPress={() => tentar(valor => valor + 1)}><Text style={visual.subtitle}>{erro} Toque para tentar novamente.</Text></Pressable> : !visita ? <ActivityIndicator /> : <>
        <Pressable accessibilityRole="button" accessibilityLabel={`Abrir perfil de ${visita.perfis?.nome ?? 'Viajante'}`} onPress={() => router.push({ pathname: './perfil-publico', params: { id: visita.usuario_id } })} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }}>
          <Avatar nome={visita.perfis?.nome ?? 'Viajante'} caminho={visita.perfis?.avatar_path} />
          <Text style={[visual.section, { flex: 1, minWidth: 0 }]}>{visita.perfis?.nome ?? 'Viajante'}</Text>
        </Pressable>
        <AlbumVisita fotos={fotosDaVisita({ ...visita, data: visita.data_visita })} />
        <Text style={[visual.title, { marginTop: 14 }]}>{visita.lugar}</Text>
        <Text style={visual.subtitle}>{visita.cidade} · {visita.uf}</Text>
        <LocalizacaoVisita key={visita.id} visita={visita} />
        <Text style={visual.subtitle}>{visita.categoria} · {formatarDataVisita(visita.data_visita.split('-').reverse().join('/'), true)}</Text>
        <View style={{ marginVertical: 20 }}><Text style={visual.section}>Minha lembrança</Text><Text style={visual.subtitle}>{visita.comentario || 'Uma descoberta para guardar.'}</Text></View>
        <InteracoesPublicacao key={visita.id} visitaId={visita.id} />
        <BotaoFavorito visitaId={visita.id} />
        {visita.usuario_id === sessao?.user.id && <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/editar-visita', params: { id: visita.id } })} style={visual.button}><Text style={visual.buttonText}>Editar visita</Text></Pressable>}
      </>}
    </ScrollView>
  </SafeAreaView>;
}
