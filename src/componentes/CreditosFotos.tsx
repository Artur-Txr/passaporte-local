import { useState } from 'react';
import { Linking, Pressable, View } from 'react-native';
import { creditosFotos } from '../dados/creditosFotos';
import { visual } from './Design';
import Text from './Texto';

export default function CreditosFotos({ fotos }: { fotos: string[] }) {
  const [aberto, abrir] = useState(false);
  const creditos = fotos.map(caminho => creditosFotos[caminho.split('/').pop() ?? '']).filter(Boolean);
  if (!creditos.length) return null;
  return <View style={{ marginVertical: 12 }}>
    <Pressable accessibilityRole="button" accessibilityState={{ expanded: aberto }} onPress={() => abrir(valor => !valor)} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={visual.link}>Fotografias da coleção</Text></Pressable>
    {aberto && creditos.map((credito, indice) => <View key={`${credito.source}/${indice}`} style={{ marginBottom: 10 }}>
      <Text style={visual.meta}>Foto {indice + 1} · {credito.author} · {credito.license}</Text>
      <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(credito.source)} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={visual.link}>Fonte da fotografia</Text></Pressable>
      <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(credito.licenseURL)} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={visual.link}>Licença de uso</Text></Pressable>
    </View>)}
  </View>;
}
