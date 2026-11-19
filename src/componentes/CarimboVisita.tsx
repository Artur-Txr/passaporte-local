import { useEffect, useRef } from "react";
import { AccessibilityInfo, Animated, Easing, Platform, StyleSheet, View } from "react-native";
import { rotuloCidade } from "../lib/cidades";
import { formatarDataVisita } from "../lib/formatacaoData";
import Text from "./Texto";

export type DadosCarimbo = {
  cidade: string;
  uf: string;
  data: string;
  dataAproximada?: boolean;
};

export default function CarimboVisita({ visita, animar = false }: { visita: DadosCarimbo; animar?: boolean }) {
  const progresso = useRef(new Animated.Value(1)).current;
  const local = rotuloCidade(visita.cidade, visita.uf);
  const data = formatarDataVisita(visita.data);
  const dataSelo = visita.dataAproximada ? `≈ ${data}` : data;

  useEffect(() => {
    if (!animar) return;
    let ativo = true;
    let movimento: Animated.CompositeAnimation | undefined;
    const opcoes = { useNativeDriver: Platform.OS !== "web", isInteraction: false };
    void AccessibilityInfo.isReduceMotionEnabled().then(reduzir => {
      if (!ativo || reduzir) return;
      progresso.setValue(0);
      movimento = Animated.sequence([
        Animated.timing(progresso, { ...opcoes, toValue: 0.7, duration: 520, easing: Easing.in(Easing.quad) }),
        Animated.timing(progresso, { ...opcoes, toValue: 1, duration: 300, easing: Easing.out(Easing.cubic) }),
      ]);
      movimento.start();
    }).catch(() => {});
    return () => {
      ativo = false;
      movimento?.stop();
      progresso.setValue(1);
    };
  }, [animar, progresso]);

  const movimento = animar ? {
    opacity: progresso.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0.42, 1, 1] }),
    transform: [
      { translateY: progresso.interpolate({ inputRange: [0, 0.7, 1], outputRange: [-20, 0, 0] }) },
      { scale: progresso.interpolate({ inputRange: [0, 0.7, 0.84, 1], outputRange: [1.22, 0.94, 1.04, 1] }) },
    ],
  } : undefined;

  return (
    <Animated.View
      accessible
      accessibilityLabel={`Visitado. ${local}, ${visita.dataAproximada ? "data aproximada: " : ""}${formatarDataVisita(visita.data, true)}`}
      style={[estilos.area, movimento]}
    >
      <View style={estilos.carimbo}>
        <View style={estilos.anel} />
        <View style={estilos.cabecalho}>
          <View style={estilos.ponto} />
          <Text style={[estilos.texto, estilos.local]} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.85} maxFontSizeMultiplier={1.15}>{local}</Text>
          <View style={estilos.ponto} />
        </View>
        <View style={estilos.faixa}>
          <Text style={estilos.marca} numberOfLines={1} adjustsFontSizeToFit maxFontSizeMultiplier={1.15}>VISITADO</Text>
        </View>
        <Text style={[estilos.texto, estilos.data]} numberOfLines={1} adjustsFontSizeToFit maxFontSizeMultiplier={1.15}>{dataSelo}</Text>
      </View>
    </Animated.View>
  );
}

const tinta = "#963B2B";
const estilos = StyleSheet.create({
  area: { alignSelf: "center", flexShrink: 0, padding: 3 },
  carimbo: {
    width: 124, height: 124, borderRadius: 62, borderWidth: 2, borderColor: tinta,
    backgroundColor: "#FFF6F2", paddingHorizontal: 9,
    justifyContent: "center", alignItems: "center", gap: 5,
    transform: [{ rotate: "-8deg" }],
  },
  anel: { position: "absolute", top: 5, bottom: 5, left: 5, right: 5, borderRadius: 57, borderWidth: 1, borderStyle: "dashed", borderColor: "#B3614D" },
  cabecalho: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, maxWidth: 96 },
  ponto: { width: 3, height: 3, borderRadius: 2, backgroundColor: tinta, flexShrink: 0 },
  texto: { color: tinta, fontSize: 10, lineHeight: 13, textAlign: "center", fontWeight: "700", letterSpacing: 0.25, textTransform: "uppercase" },
  local: { flexShrink: 1 },
  faixa: { width: 96, alignItems: "center", paddingHorizontal: 3, paddingVertical: 2, borderRadius: 4, backgroundColor: tinta },
  marca: {
    color: "#FFF9F7", fontSize: 15, lineHeight: 20, fontWeight: "800", letterSpacing: 0.9,
    textAlign: "center",
  },
  data: { fontVariant: ["tabular-nums"], letterSpacing: 0.6 },
});
