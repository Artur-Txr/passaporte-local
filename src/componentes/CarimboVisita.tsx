import { useEffect, useRef } from "react";
import { AccessibilityInfo, Animated, Easing, Platform, StyleSheet, View } from "react-native";
import { rotuloCidade } from "../lib/cidades";
import { formatarDataVisita } from "../lib/formatacaoData";
import { paleta } from "../lib/paleta";
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
        <Text style={estilos.local} numberOfLines={2} maxFontSizeMultiplier={1.2}>{local}</Text>
        <Text style={estilos.marca} maxFontSizeMultiplier={1.2}>VISITADO</Text>
        <View style={estilos.campoData}>
          <Text style={estilos.data} maxFontSizeMultiplier={1.2}>{dataSelo}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const estilos = StyleSheet.create({
  area: { alignSelf: "center", flexShrink: 0 },
  carimbo: {
    width: 144, minHeight: 96, borderRadius: 7, borderWidth: 2, borderColor: paleta.petroleo,
    backgroundColor: "#FFFCF7", paddingHorizontal: 10, paddingVertical: 10,
    justifyContent: "center", alignItems: "center", gap: 4,
  },
  local: {
    color: paleta.petroleo, fontSize: 13, lineHeight: 17, fontWeight: "700", textAlign: "center",
  },
  marca: {
    color: paleta.petroleo, fontSize: 18, lineHeight: 23, fontWeight: "800", letterSpacing: 0.4,
    textAlign: "center",
  },
  campoData: { backgroundColor: paleta.coralClaro, borderRadius: 4, paddingHorizontal: 7, paddingVertical: 2, maxWidth: "100%" },
  data: {
    color: "#963B2B", fontSize: 12, lineHeight: 16, fontWeight: "800", textTransform: "uppercase",
    fontVariant: ["tabular-nums"], letterSpacing: 0.35, textAlign: "center",
  },
});
