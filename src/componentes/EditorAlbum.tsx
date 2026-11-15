import { Image, Pressable, ScrollView, View } from "react-native";
import { visual } from "./Design";
import SeletorFoto from "./SeletorFoto";
import Text from "./Texto";
import useFotoPrivada from "./useFotoPrivada";
import type { FotoSelecionada } from "../servicos/selecaoFotoService";
import { enviarFoto } from "../servicos/fotosService";

export type FotoAlbum = FotoSelecionada | string;
const limiteFotos = 5;

export async function enviarAlbum(usuarioId: string, fotos: FotoAlbum[], enviados: Map<FotoSelecionada, string>) {
  const caminhos: string[] = [];
  for (const foto of fotos) {
    if (typeof foto === "string") {
      caminhos.push(foto);
      continue;
    }
    const caminho = enviados.get(foto) ?? await enviarFoto(usuarioId, foto.conteudo, foto.tipo);
    enviados.set(foto, caminho);
    caminhos.push(caminho);
  }
  return caminhos;
}

function Miniatura({ foto, indice }: { foto: FotoAlbum; indice: number }) {
  const { url } = useFotoPrivada(typeof foto === "string" ? foto : null);
  const uri = typeof foto === "string" ? url : foto.uri;
  return uri ? <Image accessibilityLabel={`Foto ${indice + 1}`} source={{ uri }} style={{ width: 116, height: 90, borderRadius: 10 }} />
    : <View style={{ width: 116, height: 90, justifyContent: "center" }}><Text style={visual.meta}>Foto {indice + 1}</Text></View>;
}

export default function EditorAlbum({ fotos, onChange, bloqueado, onSelecionandoChange }: {
  fotos: FotoAlbum[];
  onChange: (fotos: FotoAlbum[]) => void;
  bloqueado: boolean;
  onSelecionandoChange: (selecionando: boolean) => void;
}) {
  return (
    <View style={{ gap: 8, marginVertical: 12 }}>
      <Text style={visual.section}>Fotos (opcional) · {fotos.length}/{limiteFotos}</Text>
      {!!fotos.length && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
          {fotos.map((foto, indice) => (
            <View key={typeof foto === "string" ? foto : `${foto.uri}-${indice}`} style={{ gap: 6 }}>
              <Miniatura foto={foto} indice={indice} />
              {indice === 0 ? <Text style={visual.meta}>Capa</Text> : (
                <Pressable accessibilityRole="button" disabled={bloqueado} onPress={() => onChange([foto, ...fotos.filter((_, i) => i !== indice)])}>
                  <Text style={visual.link}>Usar como capa</Text>
                </Pressable>
              )}
              <Pressable accessibilityRole="button" accessibilityLabel={`Remover foto ${indice + 1}`} disabled={bloqueado} onPress={() => onChange(fotos.filter((_, i) => i !== indice))} style={{ minHeight: 44, justifyContent: "center" }}>
                <Text style={visual.link}>Remover foto</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}
      {fotos.length < limiteFotos ? (
        <SeletorFoto foto={null} onChange={(foto) => {
          if (foto && fotos.length < limiteFotos) onChange([...fotos, foto]);
        }} desabilitado={bloqueado} onSelecionandoChange={onSelecionandoChange} />
      ) : <Text style={visual.subtitle}>Álbum completo. Remova uma foto para adicionar outra.</Text>}
    </View>
  );
}
