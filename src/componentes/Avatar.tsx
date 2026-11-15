import { useEffect, useState } from 'react';
import { Image, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { paleta } from '../lib/paleta';
import Text from './Texto';

export default function Avatar({ nome, caminho, tamanho = 44 }: { nome: string; caminho?: string | null; tamanho?: number }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let ativo = true;
    setUrl(null);
    if (caminho) void supabase.storage.from('avatares').createSignedUrl(caminho, 3600)
      .then(({ data }) => { if (ativo) setUrl(data?.signedUrl ?? null); });
    return () => { ativo = false; };
  }, [caminho]);
  if (url) return <Image accessibilityLabel={`Foto de ${nome}`} source={{ uri: url }} onError={() => setUrl(null)} style={{ width: tamanho, height: tamanho, borderRadius: tamanho / 2 }} />;
  const iniciais = nome.trim().split(/\s+/).slice(0, 2).map(parte => parte[0]).join('').toUpperCase();
  return <View style={{ width: tamanho, height: tamanho, borderRadius: tamanho / 2, backgroundColor: paleta.coral, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: paleta.petroleo, fontSize: tamanho * 0.35, fontWeight: '800' }}>{iniciais}</Text></View>;
}
