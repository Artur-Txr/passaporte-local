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
  const escala = useRef(new Animated.Value(1)).current;
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
      escala.setValue(1.2);
      movimento = Animated.sequence([
        Animated.timing(escala, { ...opcoes, toValue: 0.93, duration: 155, easing: Easing.in(Easing.quad) }),
        Animated.timing(escala, { ...opcoes, toValue: 1, duration: 145, easing: Easing.out(Easing.cubic) }),
      ]);
      movimento.start();
    }).catch(() => {});
    return () => {
      ativo = false;
      movimento?.stop();
      escala.setValue(1);
    };
  }, [animar, escala]);

  return (
    <Animated.View
      accessible
      accessibilityLabel={`Visitado. ${local}, ${visita.dataAproximada ? "data aproximada: " : ""}${formatarDataVisita(visita.data, true)}`}
      style={[estilos.area, { transform: [{ scale: escala }] }]}
    >
      <View style={estilos.carimbo}>
        <View style={estilos.anel} />
        <Text style={[estilos.texto, estilos.local]} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.85} maxFontSizeMultiplier={1.2}>{local}</Text>
        <Text style={estilos.marca} numberOfLines={1} adjustsFontSizeToFit maxFontSizeMultiplier={1.2}>VISITADO</Text>
        <Text style={estilos.texto} numberOfLines={1} adjustsFontSizeToFit maxFontSizeMultiplier={1.2}>{dataSelo}</Text>
      </View>
    </Animated.View>
  );
}

const tinta = "#A54332";
const estilos = StyleSheet.create({
  area: { alignSelf: "center", flexShrink: 0, padding: 3 },
  carimbo: {
    width: 108, height: 108, borderRadius: 54, borderWidth: 2, borderColor: tinta,
    paddingHorizontal: 9, justifyContent: "center", alignItems: "center", gap: 3,
    transform: [{ rotate: "-9deg" }],
  },
  anel: { position: "absolute", top: 4, bottom: 4, left: 4, right: 4, borderRadius: 50, borderWidth: 1, borderColor: tinta, opacity: 0.68 },
  texto: { color: tinta, fontSize: 9, lineHeight: 12, textAlign: "center", fontWeight: "700", letterSpacing: 0.35, textTransform: "uppercase" },
  local: { maxWidth: 77 },
  marca: {
    color: tinta, fontSize: 13, lineHeight: 19, fontWeight: "800", letterSpacing: 0.8,
    textAlign: "center", borderTopWidth: 1, borderBottomWidth: 1, borderColor: "#A5433266", paddingHorizontal: 2,
  },
});
