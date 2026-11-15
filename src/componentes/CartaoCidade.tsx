import { paleta } from "../lib/paleta";
import { router } from 'expo-router';
import { Image, Pressable, Text, View } from 'react-native';
import type { Visita } from '../dados/visitas';
import useFotoPrivada from './useFotoPrivada';
import useLayoutResponsivo from './useLayoutResponsivo';
import Icone from './Icone';
import { cores } from './Design';
import { chaveCidade } from '../lib/cidades';

export default function CartaoCidade({ nome, visita, quantidade, localidades, unico, fotoLocal }: {
  nome: string; visita: Visita; quantidade: number; localidades: string[]; unico: boolean; fotoLocal?: number;
}) {
  const { compacto } = useLayoutResponsivo();
  const { url, erro, carregando, tentarNovamente, falhar } = useFotoPrivada(visita.foto_path ?? null);
  return <Pressable accessibilityRole="button" accessibilityLabel={`Ver visitas em ${nome}`}
    onPress={() => router.push({ pathname: './cidade', params: { chave: chaveCidade(visita.cidade, visita.uf) } })}
    style={({ pressed }) => ({ width: unico || compacto ? '100%' : '48%', borderRadius: 14, borderWidth: 1, borderColor: cores.borda, backgroundColor: '#FFFFFF', padding: 10, gap: 10, opacity: pressed ? 0.8 : 1 })}>
    <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
      {fotoLocal || (url && !erro) ? <Image source={fotoLocal ?? { uri: url ?? undefined }} accessibilityLabel={`Foto de ${visita.lugar}`} resizeMode="cover" onError={fotoLocal ? undefined : falhar} style={{ width: 72, height: 72, borderRadius: 10, backgroundColor: paleta.claro }} /> :
        <Pressable accessibilityRole="button" accessibilityLabel="Tentar carregar foto da cidade" disabled={!erro || carregando} onPress={evento => { evento.stopPropagation(); tentarNovamente(); }} style={{ width: 72, height: 72, borderRadius: 10, backgroundColor: paleta.claro, alignItems: 'center', justifyContent: 'center' }}>
          <Icone nome={erro ? 'atualizar' : 'cidade'} tamanho={26} cor={paleta.petroleo} />
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
