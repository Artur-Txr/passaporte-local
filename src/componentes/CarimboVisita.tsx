import { useEffect, useRef } from "react";
import { AccessibilityInfo, Animated, Easing, Platform, StyleSheet, View } from "react-native";
import { rotuloCidade } from "../lib/cidades";
import { formatarDataVisita } from "../lib/formatacaoData";
import { paleta } from "../lib/paleta";
import Icone from "./Icone";
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
        <View style={estilos.molduraInterna} />
        <View style={estilos.cabecalho}>
          <Icone nome="lugar" tamanho={12} />
          <Text style={estilos.local} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.85} maxFontSizeMultiplier={1.15}>{local}</Text>
        </View>
        <View style={estilos.faixa}>
          <View style={estilos.traco} />
          <Text style={estilos.marca} numberOfLines={1} adjustsFontSizeToFit maxFontSizeMultiplier={1.15}>VISITADO</Text>
          <View style={estilos.traco} />
        </View>
        <View style={estilos.campoData}>
          <Text style={estilos.data} numberOfLines={1} adjustsFontSizeToFit maxFontSizeMultiplier={1.15}>{dataSelo}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const estilos = StyleSheet.create({
  area: { alignSelf: "center", flexShrink: 0, padding: 5 },
  carimbo: {
    width: 136, minHeight: 96, borderRadius: 9, borderWidth: 2, borderColor: paleta.petroleo,
    backgroundColor: "#FFFCF7", paddingHorizontal: 12, paddingVertical: 9,
    justifyContent: "center", alignItems: "center", gap: 3,
    transform: [{ rotate: "-6deg" }],
  },
  molduraInterna: {
    position: "absolute", top: 3, bottom: 3, left: 3, right: 3,
    borderRadius: 5, borderWidth: 1, borderColor: "#123B4A66",
  },
  cabecalho: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 2, maxWidth: "100%" },
  local: {
    color: paleta.petroleo, fontSize: 10, lineHeight: 13, fontWeight: "700", letterSpacing: 0.25,
    textTransform: "uppercase", flexShrink: 1,
  },
  faixa: { flexDirection: "row", alignItems: "center", alignSelf: "stretch", gap: 4 },
  traco: { flex: 1, height: 1, backgroundColor: "#123B4A66" },
  marca: {
    color: paleta.petroleo, fontSize: 16, lineHeight: 21, fontWeight: "800", letterSpacing: 1.15,
    textAlign: "center", flexShrink: 1,
  },
  campoData: { backgroundColor: paleta.coralClaro, borderRadius: 3, paddingHorizontal: 6, paddingVertical: 1, maxWidth: "100%" },
  data: {
    color: "#963B2B", fontSize: 11, lineHeight: 16, fontWeight: "800", textTransform: "uppercase",
    fontVariant: ["tabular-nums"], letterSpacing: 0.8, textAlign: "center",
  },
});
