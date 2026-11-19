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
  const partesData = /^(\d{2}) ([a-z]{3}) (\d{4})$/i.exec(data);

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
        <View style={estilos.canhoto}>
          {partesData ? (
            <>
              <View style={estilos.linhaDia}>
                {visita.dataAproximada && <Text style={estilos.data} maxFontSizeMultiplier={1.2}>≈</Text>}
                <Text style={[estilos.data, estilos.dia]} maxFontSizeMultiplier={1.2}>{partesData[1]}</Text>
              </View>
              <Text style={estilos.data} maxFontSizeMultiplier={1.2}>{partesData[2]}</Text>
              <Text style={estilos.data} maxFontSizeMultiplier={1.2}>{partesData[3]}</Text>
            </>
          ) : <Text style={estilos.data} maxFontSizeMultiplier={1.2}>{visita.dataAproximada ? `≈ ${data}` : data}</Text>}
          <View style={estilos.picote}>
            {picotes.map(indice => <View key={indice} style={estilos.ponto} />)}
          </View>
        </View>
        <View style={estilos.corpo}>
          <Text style={estilos.local} numberOfLines={2} maxFontSizeMultiplier={1.2}>{local}</Text>
          <Text style={estilos.marca} maxFontSizeMultiplier={1.2}>VISITADO</Text>
        </View>
        <View style={[estilos.recorte, estilos.recorteSuperior]} />
        <View style={[estilos.recorte, estilos.recorteInferior]} />
      </View>
    </Animated.View>
  );
}

const larguraCanhoto = 44;
const larguraRecorte = 12;
const picotes = Array.from({ length: 7 }, (_, indice) => indice);

const estilos = StyleSheet.create({
  area: { alignSelf: "center", flexShrink: 0 },
  carimbo: {
    width: 146, minHeight: 82, borderRadius: 7, borderWidth: 1, borderColor: paleta.petroleo,
    backgroundColor: "#FFFCF7", flexDirection: "row",
  },
  canhoto: {
    width: larguraCanhoto, justifyContent: "center", alignItems: "center", paddingVertical: 9, paddingHorizontal: 3,
    backgroundColor: paleta.petroleo, borderTopLeftRadius: 6, borderBottomLeftRadius: 6,
  },
  linhaDia: { flexDirection: "row", alignItems: "center", gap: 1 },
  data: {
    color: "#FFFAF6", fontSize: 11, lineHeight: 14, fontWeight: "700", textTransform: "uppercase",
    fontVariant: ["tabular-nums"], textAlign: "center",
  },
  dia: { fontSize: 22, lineHeight: 25, fontWeight: "800" },
  picote: { position: "absolute", top: 9, bottom: 9, right: 0, justifyContent: "space-between" },
  ponto: { width: 1, height: 3, backgroundColor: "#B9D6DB" },
  corpo: { flex: 1, minWidth: 0, justifyContent: "center", gap: 5, paddingHorizontal: 9, paddingVertical: 9 },
  local: { color: paleta.petroleo, fontSize: 12, lineHeight: 16, fontWeight: "700" },
  marca: { color: "#963B2B", fontSize: 13, lineHeight: 17, fontWeight: "800" },
  recorte: {
    position: "absolute", left: larguraCanhoto - larguraRecorte / 2,
    width: larguraRecorte, height: 7, backgroundColor: paleta.papel, borderColor: paleta.petroleo,
    borderLeftWidth: 1, borderRightWidth: 1,
  },
  recorteSuperior: {
    top: -1, borderBottomWidth: 1, borderBottomLeftRadius: 6, borderBottomRightRadius: 6,
  },
  recorteInferior: {
    bottom: -1, borderTopWidth: 1, borderTopLeftRadius: 6, borderTopRightRadius: 6,
  },
});
