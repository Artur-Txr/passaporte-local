import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { concluirLoginGoogle, retornoGoogle } from '../../servicos/loginGoogleService';
import { visual } from '../../componentes/Design';
import Text from '../../componentes/Texto';

export default function RetornoGoogle() {
  const parametros = useLocalSearchParams<{ code?: string | string[]; error?: string | string[] }>();
  const [erro, setErro] = useState('');
  const codigo = typeof parametros.code === 'string' ? parametros.code : '';
  const falha = typeof parametros.error === 'string' ? parametros.error : '';
  useEffect(() => {
    let ativo = true;
    async function concluir() {
      try {
        const url = new URL(retornoGoogle());
        if (codigo) url.searchParams.set('code', codigo);
        if (falha) url.searchParams.set('error', falha);
        await concluirLoginGoogle(url.toString());
        if (ativo) {
          if (Platform.OS === 'web') window.history.replaceState(null, '', window.location.pathname);
          router.replace('/inicio');
        }
      } catch (falha) { if (ativo) setErro(falha instanceof Error ? falha.message : 'Não foi possível concluir o login. Tente novamente.'); }
    }
    void concluir();
    return () => { ativo = false; };
  }, [codigo, falha]);
  return <SafeAreaView style={visual.screen}><View style={[visual.content, { flex: 1, justifyContent: 'center', gap: 16 }]}>
    {erro ? <><Text accessibilityRole="alert" style={visual.subtitle}>{erro}</Text><Pressable accessibilityRole="button" onPress={() => router.replace('/login')} style={visual.button}><Text style={visual.buttonText}>Voltar ao login</Text></Pressable></> : <><ActivityIndicator /><Text style={visual.subtitle}>Concluindo seu acesso…</Text></>}
  </View></SafeAreaView>;
}
