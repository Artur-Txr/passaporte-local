import { useLocalSearchParams } from "expo-router";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BilheteVisita, Cabecalho, visual } from "../componentes/Design";
import Text from "../componentes/Texto";
import { useVisitas } from "../contextos/VisitasContext";
import { compararDatasVisitas } from "../lib/formatacaoData";
import { chaveCidade, localizacaoVisita } from "../lib/cidades";

export default function Cidade() {
  const { chave } = useLocalSearchParams<{ chave: string }>();
  const { visitas } = useVisitas();
  const grupo = [...visitas]
    .filter((visita) => chaveCidade(visita.cidade, visita.uf) === chave)
    .sort((a, b) => compararDatasVisitas(b.data, a.data));
  const primeira = grupo[0];


  return (
    <SafeAreaView style={visual.screen}>
      <ScrollView contentContainerStyle={visual.content}>
        <Cabecalho titulo="Cidade no passaporte" voltar />
        {primeira ? (
          <>
            <Text style={visual.meta}>Seu Brasil, cidade por cidade</Text>
            <Text accessibilityRole="header" style={visual.title}>{localizacaoVisita(primeira.cidade, primeira.uf).cidade}</Text>
            <Text style={[visual.subtitle, { marginBottom: 12 }]}>
              {primeira.uf} · {grupo.length} {grupo.length === 1 ? "lembrança guardada" : "lembranças guardadas"}
            </Text>
          </>
        ) : <Text style={visual.subtitle}>Ainda sem visitas nesta cidade.</Text>}
        {grupo.map((visita) => <BilheteVisita key={visita.id} visita={visita} />)}
      </ScrollView>
    </SafeAreaView>
  );
}
