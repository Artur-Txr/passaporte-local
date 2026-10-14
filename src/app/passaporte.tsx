import { rotuloCidade, localizacaoVisita } from "../lib/cidades";
import EstadoConsulta from "../componentes/EstadoConsulta";
import { Cabecalho, Decoracao } from "../componentes/Design";
import { router } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CarimboVisita from "../componentes/CarimboVisita";
import { useVisitas } from "../contextos/VisitasContext";

export default function Passaporte() {
  const { visitas, carregando, erro, recarregarVisitas } = useVisitas();

  function voltar() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/inicio");
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <Decoracao />
      <FlatList
        refreshing={carregando}
        onRefresh={recarregarVisitas}
        data={visitas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            <Cabecalho voltar />

            <Text style={styles.label}>SUA COLEÇÃO DE DESCOBERTAS</Text>

            <Text style={styles.title}>Meu passaporte</Text>

            <Text style={styles.description}>
              Cada carimbo representa uma história que você viveu.
            </Text>

            {!!erro && visitas.length > 0 && <Text accessibilityLiveRegion="polite" style={styles.description}>Não foi possível atualizar. Seus carimbos anteriores continuam visíveis. Puxe para baixo para tentar novamente.</Text>}
            <Text style={styles.count}>
              {carregando && !visitas.length ? '—' : visitas.length}{" "}
              {visitas.length === 1
                ? "carimbo na coleção"
                : "carimbos na coleção"}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/detalhes",
                params: { id: item.id },
              })
            }
            accessibilityRole="button"
            accessibilityLabel={`Ver detalhes de ${item.lugar}`}
            style={({ pressed }) => [
              styles.stampCard,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.stampContainer}>
              <CarimboVisita visita={item} />
            </View>

            <Text style={styles.placeName}>{item.lugar}</Text>

            <Text style={styles.location}>
              {rotuloCidade(item.cidade, item.uf)}
            </Text>

            {!!localizacaoVisita(item.cidade, item.uf).localidade && <Text style={styles.location}>{localizacaoVisita(item.cidade, item.uf).localidade}</Text>}
            <Text style={styles.detailsLink}>Ver esta descoberta →</Text>
          </Pressable>
        )}
        ListEmptyComponent={
          carregando || erro ? <EstadoConsulta carregando={carregando} erro={erro} tentarNovamente={recarregarVisitas} /> : <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>
              Sua coleção começa com um passeio
            </Text>

            <Text style={styles.emptyDescription}>
              Cadastre uma visita para ganhar seu primeiro carimbo.
            </Text>

            <Pressable
              onPress={() => router.push("/nova-visita")}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.newVisitButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.newVisitText}>+ Nova visita</Text>
            </Pressable>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8F5EC",
  },
  content: { width: "100%", maxWidth: 600, alignSelf: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 12,
    paddingRight: 16,
    marginBottom: 12,
  },
  backText: {
    color: "#183F35",
    fontSize: 16,
    fontWeight: "600",
  },
  label: {
    color: "#C76B48",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
  },
  title: {
    color: "#183F35",
    fontSize: 32,
    fontWeight: "800",
    marginTop: 16,
  },
  description: {
    color: "#53645B",
    fontSize: 16,
    lineHeight: 24,
    marginTop: 12,
  },
  count: {
    color: "#183F35",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 20,
  },
  stampCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    marginBottom: 20,
    alignItems: "center",
  },
  stampContainer: {
    marginTop: 12,
    marginBottom: 28,
  },
  placeName: {
    color: "#183F35",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  location: {
    color: "#53645B",
    fontSize: 15,
    marginTop: 8,
    textAlign: "center",
  },
  detailsLink: {
    color: "#C76B48",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 18,
  },
  pressed: {
    opacity: 0.75,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
  },
  emptyTitle: {
    color: "#183F35",
    fontSize: 20,
    fontWeight: "700",
  },
  emptyDescription: {
    color: "#53645B",
    fontSize: 16,
    lineHeight: 24,
    marginTop: 12,
  },
  newVisitButton: {
    backgroundColor: "#183F35",
    borderRadius: 14,
    padding: 18,
    alignItems: "center",
    marginTop: 24,
  },
  newVisitText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
