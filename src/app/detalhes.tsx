import Icone from "../componentes/Icone";
import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useVisitas } from "../contextos/VisitasContext";
import FotoVisita from "../componentes/FotoVisita";
import AvaliacaoEstrelas from "../componentes/AvaliacaoEstrelas";
import CarimboVisita from "../componentes/CarimboVisita";
import { Cabecalho, Decoracao, cores, visual } from "../componentes/Design";
export default function Detalhes() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const { visitas, excluirVisita } = useVisitas();
  const visita = visitas.find((v) => v.id === (Array.isArray(id) ? id[0] : id));
  const [confirmar, setConfirmar] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const emAndamento = useRef(false);
  async function excluir() {
    if (!visita || emAndamento.current) return;
    emAndamento.current = true;
    setExcluindo(true);
    try {
      await excluirVisita(visita.id);
      setConfirmar(false);
      router.replace("/visitas");
    } catch {
      Alert.alert(
        "Não foi possível excluir",
        "Confira a conexão e tente novamente.",
      );
    } finally {
      emAndamento.current = false;
      setExcluindo(false);
    }
  }
  return (
    <SafeAreaView style={visual.screen}>
      <Decoracao />
      <ScrollView contentContainerStyle={visual.content}>
        <Cabecalho titulo="Detalhes da visita" voltar />
        {visita ? (
          <>
            <FotoVisita caminho={visita.foto_path ?? null} />
            <Text style={[visual.title, { fontSize: 27, marginTop: 14 }]}>
              {visita.lugar}
            </Text>
            <Text style={visual.subtitle}>
              {visita.cidade}, {visita.uf}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 14,
              }}
            >
              <View style={{ flex: 1 }}>
                <View
                  style={{
                    alignSelf: "flex-start",
                    backgroundColor: "#E1E5D4",
                    borderRadius: 7,
                    padding: 8,
                  }}
                >
                  <Text style={{ color: cores.verde, fontSize: 12 }}>
                    ♧ {visita.categoria}
                  </Text>
                </View>
                <Text style={[visual.meta, { marginTop: 14 }]}>
                  ▢ {visita.data}
                </Text>
                <Text style={[visual.meta, { marginTop: 22 }]}>
                  Minha avaliação
                </Text>
                <AvaliacaoEstrelas valor={visita.avaliacao ?? null} />
              </View>
              <View
                style={{
                  width: 130,
                  height: 138,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <View style={{ transform: [{ scale: 0.66 }] }}>
                  <CarimboVisita visita={visita} />
                </View>
              </View>
            </View>
            <View
              style={{
                borderTopWidth: 1,
                borderColor: cores.borda,
                paddingTop: 16,
                marginTop: 18,
              }}
            >
              <Text style={visual.section}>♧ Minha lembrança</Text>
              <Text style={[visual.subtitle, { marginTop: 8 }]}>
                {visita.comentario.trim() ||
                  "Nenhuma lembrança escrita para esta visita."}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              disabled={excluindo}
              onPress={() =>
                router.push({
                  pathname: "/editar-visita",
                  params: { id: visita.id },
                })
              }
              style={visual.button}
            >
              <Text style={visual.buttonText}>Editar visita</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={excluindo}
              onPress={() => setConfirmar(true)}
              style={{ alignItems: "center", padding: 16 }}
            >
              <Text
                style={{
                  color: cores.laranja,
                  fontWeight: "600",
                  fontSize: 13,
                }}
              >
                Excluir visita
              </Text>
            </Pressable>
          </>
        ) : (
          <Text style={visual.subtitle}>
            Visita não encontrada. Volte à coleção.
          </Text>
        )}
      </ScrollView>
      <Modal
        visible={confirmar}
        transparent
        animationType="fade"
        onRequestClose={() => !excluindo && setConfirmar(false)}
      >
        <View style={visual.overlay}>
          <View style={visual.dialog}>
            <View
              style={{
                alignSelf: "center",
                padding: 12,
                backgroundColor: "#F5E4D7",
                borderRadius: 30,
                marginBottom: 12,
              }}
            >
              <Icone nome="excluir" tamanho={25} cor={cores.laranja} />
            </View>
            <Text
              style={[visual.section, { textAlign: "center", fontSize: 20 }]}
            >
              Excluir visita?
            </Text>
            <Text style={[visual.subtitle, { textAlign: "center" }]}>
              A visita e a foto serão removidas do seu passaporte.
            </Text>
            <Pressable
              accessibilityRole="button"
              disabled={excluindo}
              onPress={() => setConfirmar(false)}
              style={[
                visual.button,
                {
                  backgroundColor: "transparent",
                  borderWidth: 1,
                  borderColor: cores.verde,
                },
              ]}
            >
              <Text style={{ color: cores.verde, fontWeight: "600" }}>
                Cancelar
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={excluindo}
              onPress={excluir}
              style={[
                visual.button,
                { backgroundColor: cores.laranja, marginTop: 8 },
              ]}
            >
              <Text style={visual.buttonText}>
                {excluindo ? "Excluindo..." : "Excluir visita"}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
