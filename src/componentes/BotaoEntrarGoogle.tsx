import { useEffect, useRef, useState, type RefObject } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { entrarComGoogle } from '../servicos/loginGoogleService';
import { paleta } from '../lib/paleta';
import Text from './Texto';

export default function BotaoEntrarGoogle({ bloqueado, controle, aoOcupar, aoErro }: {
  bloqueado: boolean;
  controle: RefObject<boolean>;
  aoOcupar: (valor: boolean) => void;
  aoErro: (mensagem: string) => void;
}) {
  const [ocupado, setOcupado] = useState(false);
  const ativo = useRef(true);
  useEffect(() => { ativo.current = true; return () => { ativo.current = false; }; }, []);
  async function entrar() {
    if (controle.current) return;
    controle.current = true; aoOcupar(true); setOcupado(true); aoErro('');
    try {
      const resultado = await entrarComGoogle();
      if (ativo.current && resultado === 'conectado') router.replace('/inicio');
    } catch (erro) {
      if (ativo.current) aoErro(erro instanceof Error ? erro.message : 'Não foi possível entrar com Google. Tente novamente.');
    } finally {
      controle.current = false;
      if (ativo.current) { setOcupado(false); aoOcupar(false); }
    }
  }
  return <View style={{ marginTop: 20 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 }}>
      <View style={{ flex: 1, height: 1, backgroundColor: paleta.borda }} /><Text style={{ color: paleta.suave, fontSize: 13 }}>ou</Text><View style={{ flex: 1, height: 1, backgroundColor: paleta.borda }} />
    </View>
    <Pressable accessibilityRole="button" accessibilityState={{ disabled: bloqueado, busy: ocupado }} disabled={bloqueado} onPress={() => void entrar()}
      style={({ pressed }) => ({ minHeight: 52, padding: 14, borderWidth: 1, borderColor: '#747775', borderRadius: 14, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10, opacity: pressed || bloqueado ? 0.6 : 1 })}>
      {ocupado && <ActivityIndicator color={paleta.petroleo} />}<Text style={{ color: '#1F1F1F', fontSize: 14, fontWeight: '600' }}>{ocupado ? 'Conectando…' : 'Entrar com Google'}</Text>
    </Pressable>
  </View>;
}
