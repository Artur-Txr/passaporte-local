import { useState } from 'react';
import { Linking, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Cabecalho, visual } from '../componentes/Design';
import CreditosFotos from '../componentes/CreditosFotos';
import Text from '../componentes/Texto';
import { creditosFotos } from '../dados/creditosFotos';
import { licencasFontes } from '../dados/licencasFontes';

export default function Sobre() {
  const [licencas, mostrarLicencas] = useState(false);
  const [fonteAberta, abrirFonte] = useState('');
  return <SafeAreaView style={visual.screen}>
    <ScrollView contentContainerStyle={visual.content}>
      <Cabecalho titulo="Sobre o aplicativo" voltar />
      <Text accessibilityRole="header" style={visual.title}>Passaporte Local</Text>
      <Text style={visual.subtitle}>Um lugar para guardar passeios, compartilhar descobertas e encontrar novas histórias pelo Brasil.</Text>
      <Text style={[visual.meta, { marginVertical: 16 }]}>Versão 0.1.0</Text>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: licencas }} onPress={() => mostrarLicencas(valor => !valor)} style={{ minHeight: 48, justifyContent: 'center' }}>
        <Text style={visual.link}>Licenças de recursos</Text>
      </Pressable>
      {licencas && <View style={{ gap: 12 }}>
        <CreditosFotos fotos={Object.keys(creditosFotos)} />
        <Text style={visual.subtitle}>As fotografias da coleção foram redimensionadas e podem aparecer recortadas conforme o espaço da tela. A foto de abertura usa uma versão WebP da imagem do Pelourinho, de Paul R. Burley, sob CC BY-SA 4.0.</Text>
        {licencasFontes.map(fonte => <View key={fonte.nome}>
          <Pressable accessibilityRole="button" accessibilityState={{ expanded: fonteAberta === fonte.nome }} onPress={() => abrirFonte(valor => valor === fonte.nome ? '' : fonte.nome)} style={{ minHeight: 48, justifyContent: 'center' }}><Text style={visual.link}>{fonte.nome}</Text></Pressable>
          {fonteAberta === fonte.nome && <Text style={visual.meta}>{fonte.texto}</Text>}
        </View>)}
        <Pressable accessibilityRole="link" onPress={() => void Linking.openURL('https://github.com/Artur-Txr/passaporte-local/blob/main/package.json')} style={{ minHeight: 48, justifyContent: 'center' }}><Text style={visual.link}>Bibliotecas utilizadas</Text></Pressable>
      </View>}
    </ScrollView>
  </SafeAreaView>;
}
