import { router } from 'expo-router';
import { useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVisitas } from '../contextos/VisitasContext';

const categorias = [
  'Todos',
  'Parque',
  'Museu',
  'Cafeteria',
  'Outro',
];

function normalizar(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export default function Inicio() {
  const { visitas } = useVisitas();

  const [busca, setBusca] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] =
    useState('Todos');

  const totalVisitas = visitas.length;

  const totalCidades = new Set(
    visitas.map(
      (visita) =>
        `${normalizar(visita.cidade)}|${normalizar(visita.uf)}`,
    ),
  ).size;

  const termo = normalizar(busca);

  const visitasFiltradas = visitas.filter((visita) => {
    const correspondeBusca =
      normalizar(visita.lugar).includes(termo) ||
      normalizar(visita.cidade).includes(termo);

    const correspondeCategoria =
      categoriaSelecionada === 'Todos' ||
      visita.categoria === categoriaSelecionada;

    return correspondeBusca && correspondeCategoria;
  });

  function voltar() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        data={visitasFiltradas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.header}>
            <Pressable
              onPress={voltar}
              style={styles.backButton}
            >
              <Text style={styles.backText}>← Voltar</Text>
            </Pressable>

            <Text style={styles.label}>MEU PASSAPORTE</Text>
            <Text style={styles.title}>Suas descobertas</Text>

            <Text style={styles.description}>
              Uma coleção dos lugares que marcaram sua jornada.
            </Text>

            <View style={styles.summary}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryNumber}>
                  {totalVisitas}
                </Text>

                <Text style={styles.summaryLabel}>
                  {totalVisitas === 1 ? 'Visita' : 'Visitas'}
                </Text>
              </View>

              <View style={styles.summaryCard}>
                <Text style={styles.summaryNumber}>
                  {totalCidades}
                </Text>

                <Text style={styles.summaryLabel}>
                  {totalCidades === 1 ? 'Cidade' : 'Cidades'}
                </Text>
              </View>
            </View>

            <Pressable
              onPress={() => router.push('/nova-visita')}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.newVisitButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.newVisitText}>
                + Nova visita
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push('/passaporte')}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.passportButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.passportText}>
                Meu passaporte →
              </Text>
            </Pressable>

            <Text style={styles.searchLabel}>
              Buscar por lugar ou cidade
            </Text>

            <TextInput
              style={styles.searchInput}
              placeholder="Ex.: MASP ou São Paulo"
              placeholderTextColor="#7C827A"
              value={busca}
              onChangeText={setBusca}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.filters}
            >
              {categorias.map((categoria) => {
                const selecionada =
                  categoria === categoriaSelecionada;

                return (
                  <Pressable
                    key={categoria}
                    onPress={() =>
                      setCategoriaSelecionada(categoria)
                    }
                    accessibilityRole="button"
                    accessibilityState={{
                      selected: selecionada,
                    }}
                    style={[
                      styles.filterButton,
                      selecionada &&
                        styles.filterButtonSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        selecionada &&
                          styles.filterTextSelected,
                      ]}
                    >
                      {categoria}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text style={styles.count}>
              {visitasFiltradas.length}{' '}
              {visitasFiltradas.length === 1
                ? 'visita encontrada'
                : 'visitas encontradas'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/detalhes',
                params: { id: item.id },
              })
            }
            accessibilityRole="button"
            accessibilityLabel={`Ver detalhes de ${item.lugar}`}
            style={({ pressed }) => [
              styles.visitCard,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.category}>
              {item.categoria.toUpperCase()}
            </Text>

            <Text style={styles.placeName}>{item.lugar}</Text>

            <Text style={styles.city}>
              {item.cidade} · {item.uf}
            </Text>

            <Text style={styles.visitDate}>
              Visitado em {item.data}
            </Text>

            <Text style={styles.detailsLink}>
              Ver detalhes →
            </Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>
              Nenhuma visita encontrada
            </Text>

            <Text style={styles.emptyDescription}>
              Cadastre uma visita ou ajuste a busca e os filtros.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F7F1E5',
  },
  content: {
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 12,
    paddingRight: 16,
    marginBottom: 12,
  },
  backText: {
    color: '#183F35',
    fontSize: 16,
    fontWeight: '600',
  },
  label: {
    color: '#C76B48',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  title: {
    color: '#183F35',
    fontSize: 32,
    fontWeight: '800',
    marginTop: 16,
  },
  description: {
    color: '#53645B',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 12,
  },
  summary: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#183F35',
    borderRadius: 18,
    padding: 20,
  },
  summaryNumber: {
    color: '#F7F1E5',
    fontSize: 32,
    fontWeight: '800',
  },
  summaryLabel: {
    color: '#DBCEAF',
    fontSize: 14,
    marginTop: 6,
  },
  newVisitButton: {
    backgroundColor: '#C76B48',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  newVisitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  passportButton: {
    borderWidth: 1,
    borderColor: '#183F35',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  passportText: {
    color: '#183F35',
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.75,
  },
  searchLabel: {
    color: '#183F35',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 8,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    color: '#183F35',
    borderWidth: 1,
    borderColor: '#DED9CE',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  filters: {
    gap: 8,
    paddingTop: 16,
    paddingBottom: 4,
  },
  filterButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DED9CE',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  filterButtonSelected: {
    backgroundColor: '#183F35',
    borderColor: '#183F35',
  },
  filterText: {
    color: '#53645B',
    fontSize: 14,
    fontWeight: '600',
  },
  filterTextSelected: {
    color: '#FFFFFF',
  },
  count: {
    color: '#53645B',
    fontSize: 14,
    marginTop: 14,
  },
  visitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    marginBottom: 16,
  },
  category: {
    color: '#C76B48',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
  },
  placeName: {
    color: '#183F35',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 10,
  },
  city: {
    color: '#53645B',
    fontSize: 15,
    marginTop: 6,
  },
  visitDate: {
    color: '#53645B',
    fontSize: 13,
    marginTop: 18,
  },
  detailsLink: {
    color: '#C76B48',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 18,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
  },
  emptyTitle: {
    color: '#183F35',
    fontSize: 18,
    fontWeight: '700',
  },
  emptyDescription: {
    color: '#53645B',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
});