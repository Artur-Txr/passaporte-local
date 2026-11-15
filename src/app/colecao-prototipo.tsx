import { Redirect, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function ColecaoAnterior() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [destino, setDestino] = useState<string | null>(null);
  useEffect(() => {
    let ativo = true;
    if (!id) { setDestino(''); return; }
    supabase.from('visitas').select('id').eq('origem_colecao', Number(id)).limit(1).maybeSingle()
      .then(({ data }) => { if (ativo) setDestino(data?.id ?? ''); });
    return () => { ativo = false; };
  }, [id]);
  if (destino === null) return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator /></View>;
  return destino ? <Redirect href={{ pathname: './publicacao', params: { id: destino } }} /> : <Redirect href="/visitas" />;
}
