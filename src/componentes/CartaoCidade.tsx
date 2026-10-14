import { router } from 'expo-router';
import { Image, Pressable, Text, View } from 'react-native';
import type { Visita } from '../dados/visitas';
import useFotoPrivada from './useFotoPrivada';
import useLayoutResponsivo from './useLayoutResponsivo';
import Icone from './Icone';
import { cores } from './Design';

export default function CartaoCidade({ nome, visita, quantidade, localidades, unico }: {
  nome: string; visita: Visita; quantidade: number; localidades: string[]; unico: boolean;
}) {
  const { compacto } = useLayoutResponsivo();
  const { url, erro, carregando, tentarNovamente, falhar } = useFotoPrivada(visita.foto_path ?? null);
  return <Pressable accessibilityRole="button" accessibilityLabel={`Abrir visita de ${nome}, ${quantidade} ${quantidade === 1 ? 'visita' : 'visitas'}`}
    onPress={() => router.push({ pathname: '/detalhes', params: { id: visita.id } })}
    style={({ pressed }) => ({ width: unico || compacto ? '100%' : '48%', borderRadius: 14, borderWidth: 1, borderColor: cores.borda, backgroundColor: '#FCFAF3', padding: 10, gap: 10, opacity: pressed ? 0.8 : 1 })}>
    <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
      {url && !erro ? <Image source={{ uri: url }} accessibilityLabel={`Foto de ${visita.lugar}`} resizeMode="cover" onError={falhar} style={{ width: 72, height: 72, borderRadius: 10, backgroundColor: '#E8EBDD' }} /> :
        <Pressable accessibilityRole="button" accessibilityLabel="Tentar carregar foto da cidade" disabled={!erro || carregando} onPress={evento => { evento.stopPropagation(); tentarNovamente(); }} style={{ width: 72, height: 72, borderRadius: 10, backgroundColor: '#E8EBDD', alignItems: 'center', justifyContent: 'center' }}>
          <Icone nome={erro ? 'atualizar' : 'cidade'} tamanho={26} cor="#687958" />
          {!!erro && <Text style={{ fontSize: 10, color: cores.verde }}>Tentar de novo</Text>}
        </Pressable>}
      <View style={{ flex: 1, minWidth: 0, gap: 5 }}>
        <Text style={{ color: cores.verde, fontSize: 15, lineHeight: 21, fontWeight: '700' }}>{nome}</Text>
        <Text style={{ color: cores.suave, fontSize: 12 }}>{quantidade} {quantidade === 1 ? 'visita registrada' : 'visitas registradas'}</Text>
      </View>
      {unico && <Icone nome="proximo" tamanho={20} cor={cores.suave} />}
    </View>
    {!!localidades.length && <Text style={{ color: cores.suave, fontSize: 12, lineHeight: 18 }}>Inclui {localidades.join(', ')}</Text>}
  </Pressable>;
}
