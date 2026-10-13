import { Dialogo } from "./Design";
import Icone from "./Icone";
import { useRef, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  selecionarFoto,
  type FotoSelecionada,
} from "../servicos/selecaoFotoService";
import { cores, visual } from "./Design";
type Props = {
  foto: FotoSelecionada | null;
  onChange: (foto: FotoSelecionada | null) => void;
  desabilitado?: boolean;
  fotoAtual?: boolean;
  onSelecionandoChange?: (valor: boolean) => void;
};
export default function SeletorFoto({
  foto,
  onChange,
  desabilitado = false,
  fotoAtual = false,
  onSelecionandoChange,
}: Props) {
  const [selecionando, setSelecionando] = useState(false);
  const [aberto, setAberto] = useState(false);
  const emAndamento = useRef(false);
  const bloqueado = desabilitado || selecionando;
  async function escolher(origem: "galeria" | "camera") {
    if (bloqueado || emAndamento.current) return;
    setAberto(false);
    emAndamento.current = true;
    setSelecionando(true);
    onSelecionandoChange?.(true);
    try {
      const escolhida = await selecionarFoto(origem);
      if (escolhida) onChange(escolhida);
    } catch (erro) {
      Alert.alert(
        "Não foi possível selecionar a foto",
        erro instanceof Error
          ? erro.message
          : "Escolha uma imagem JPEG, PNG ou WebP de até 20 MB.",
      );
    } finally {
      emAndamento.current = false;
      setSelecionando(false);
      onSelecionandoChange?.(false);
    }
  }
  return (
    <View style={{ marginTop: 12 }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={foto || fotoAtual ? "Alterar foto" : "Adicionar foto"}
        disabled={bloqueado}
        onPress={() => setAberto(true)}
        style={{
          borderWidth: 1,
          borderStyle: "dashed",
          borderColor: cores.borda,
          borderRadius: 10,
          minHeight: fotoAtual && !foto ? 48 : 95,
          flexDirection: fotoAtual && !foto ? "row" : "column",
          gap: fotoAtual && !foto ? 8 : 0,
          backgroundColor: "#F0EDE2",
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {foto ? (
          <Image
            source={{ uri: foto.uri }}
            style={{ width: "100%", height: 145 }}
            resizeMode="cover"
          />
        ) : (
          <>
            {!fotoAtual && <View pointerEvents="none" style={{ position: "absolute", right: -8, bottom: -10, width: 110, height: 85, transform: [{ rotate: "12deg" }], opacity: 0.55, borderWidth: 6, borderColor: "#FCFAF3" }}>
              <Image source={require("../../assets/prototipo/paisagem.png")} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
            </View>}
            <Icone nome="camera" tamanho={30} />
            <Text
              style={{ color: cores.verde, fontWeight: "600", fontSize: 13 }}
            >
              {selecionando ? "Selecionando..." : fotoAtual ? "Alterar foto" : "Adicionar foto"}
            </Text>
            {!fotoAtual && <Text style={{ color: cores.suave, fontSize: 11, marginTop: 3 }}>
              Opcional · até 20 MB
            </Text>}
          </>
        )}
      </Pressable>
      {foto && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingVertical: 10,
          }}
        >
          <Pressable disabled={bloqueado} onPress={() => setAberto(true)}>
            <Text style={visual.link}>Alterar foto</Text>
          </Pressable>
          <Pressable disabled={bloqueado} onPress={() => onChange(null)}>
            <Text style={visual.link}>Remover foto</Text>
          </Pressable>
        </View>
      )}
      <Modal
        visible={aberto}
        transparent
        animationType="fade"
        onRequestClose={() => setAberto(false)}
      >
        <View style={visual.overlay}>
          <Dialogo>
            <Text style={[visual.section, { textAlign: "center" }]}>
              Adicionar uma lembrança
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => escolher("galeria")}
              style={visual.button}
            >
              <Text style={visual.buttonText}>Escolher foto da galeria</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => escolher("camera")}
              style={visual.button}
            >
              <Text style={visual.buttonText}>Tirar foto com a câmera</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => setAberto(false)}
              style={{ padding: 16, alignItems: "center" }}
            >
              <Text style={visual.link}>Cancelar</Text>
            </Pressable>
          </Dialogo>
        </View>
      </Modal>
    </View>
  );
}
