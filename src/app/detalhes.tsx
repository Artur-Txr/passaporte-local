import { apresentarLembranca } from "../lib/lembranca";
import { localizacaoVisita } from "../lib/cidades";
import EstadoConsulta from "../componentes/EstadoConsulta";
import { Dialogo } from "../componentes/Design";
import useLayoutResponsivo from "../componentes/useLayoutResponsivo";
import { formatarDataVisita } from "../lib/formatacaoData";
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
  const { compacto, largura } = useLayoutResponsivo();
  const empilhar = compacto || largura < 400;
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const { visitas, excluirVisita, carregando, erro, recarregarVisitas } = useVisitas();
  const visita = visitas.find((v) => v.id === (Array.isArray(id) ? id[0] : id));
  const texto = apresentarLembranca(visita?.comentario ?? "");
  const localizacao = localizacaoVisita(visita?.cidade ?? "", visita?.uf ?? "");
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
              {localizacao.cidade}, {visita.uf}
            </Text>
            {!!localizacao.localidade && <Text style={visual.meta}>Localidade: {localizacao.localidade}</Text>}
            <View
              style={{
                flexDirection: empilhar ? "column" : "row",
                alignItems: empilhar ? "stretch" : "center",
                marginTop: 14,
              }}
            >
              <View style={{ flex: empilhar ? undefined : 1 }}>
                <View
                  style={{
                    alignSelf: "flex-start",
                    backgroundColor: "#E1E5D4",
                    borderRadius: 7,
                    padding: 8,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}><Icone nome={visita.categoria === 'Parque' ? 'natureza' : visita.categoria === 'Museu' ? 'museu' : visita.categoria === 'Cafeteria' ? 'cafe' : 'lugar'} tamanho={16} /><Text style={{ color: cores.verde, fontSize: 12 }}>{visita.categoria}</Text></View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 14 }}><Icone nome="calendario" tamanho={17} /><Text style={[visual.meta, { flexShrink: 1 }]}>{formatarDataVisita(visita.data, true)}</Text></View>
                {texto.dataAproximada && <Text style={[visual.meta, { marginTop: 6, color: cores.laranja }]}>Data aproximada</Text>}
                <Text style={[visual.meta, { marginTop: 22 }]}>
                  Minha avaliação
                </Text>
                <AvaliacaoEstrelas valor={visita.avaliacao ?? null} />
              </View>
              <View
                style={{
                  width: 148,
                  alignSelf: empilhar ? "center" : "auto",
                  height: 160,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <View style={{ transform: [{ scale: 0.8 }] }}>
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
              <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}><Icone nome="editar" tamanho={20} /><Text style={visual.section}>Minha lembrança</Text></View>
              <Text style={[visual.subtitle, { marginTop: 8 }]}>
                {texto.lembranca ||
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
          <EstadoConsulta carregando={carregando} erro={erro} tentarNovamente={recarregarVisitas} />
        )}
      </ScrollView>
      <Modal
        visible={confirmar}
        transparent
        animationType="fade"
        onRequestClose={() => !excluindo && setConfirmar(false)}
      >
        <View style={visual.overlay}>
          <Dialogo>
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
              Excluir esta visita?
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
          </Dialogo>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
