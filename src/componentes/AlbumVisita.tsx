import { useState } from "react";
import { Image, Pressable, ScrollView, View } from "react-native";
import Text from "./Texto";
import FotoVisita from "./FotoVisita";
import useFotoPrivada from "./useFotoPrivada";
import { visual } from "./Design";
import { paleta } from "../lib/paleta";

export default function AlbumVisita({ fotos }: { fotos: string[] }) {
  const [selecionada, selecionar] = useState<string>();
  const ativa = selecionada && fotos.includes(selecionada) ? selecionada : fotos[0];
  return (
    <>
      <FotoVisita key={ativa} caminho={ativa ?? null} fotos={fotos} />
      {fotos.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 8 }}>
          {fotos.map((foto, indice) => (
            <MiniaturaAlbum key={foto} caminho={foto} numero={indice + 1} ativa={foto === ativa} onPress={() => selecionar(foto)} />
          ))}
        </ScrollView>
      )}
    </>
  );
}

function MiniaturaAlbum({ caminho, numero, ativa, onPress }: {
  caminho: string;
  numero: number;
  ativa: boolean;
  onPress: () => void;
}) {
  const { url } = useFotoPrivada(caminho);
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Ver foto ${numero}`} accessibilityState={{ selected: ativa }}
      onPress={onPress} style={{ padding: 2, borderWidth: 2, borderRadius: 10, borderColor: ativa ? paleta.petroleo : "transparent" }}>
      {url ? <Image source={{ uri: url }} style={{ width: 64, height: 52, borderRadius: 6 }} />
        : <View style={{ width: 64, height: 52, alignItems: "center", justifyContent: "center", backgroundColor: paleta.claro }}><Text style={visual.meta}>{numero}</Text></View>}
    </Pressable>
  );
}
