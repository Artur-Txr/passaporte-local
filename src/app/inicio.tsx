import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
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

const categorias = ['Todos', 'Parque', 'Museu', 'Cafeteria', 'Outro'];

function normalizar(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export default function Inicio() {
  const {
    visitas,
    carregando,
    erro,
    recarregarVisitas,
  } = useVisitas();

  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('Todos');

  const indisponivel = carregando || erro !== null;

  const totalCidades = new Set(
    visitas.map(
      (visita) => `${normalizar(visita.cidade)}|${visita.uf}`,
    ),
  ).size;

  const termo = normalizar(busca);

  const visitasFiltradas = visitas.filter((visita) => {
    const correspondeBusca =
      normalizar(visita.lugar).includes(termo) ||
      normalizar(visita.cidade).includes(termo);

    const correspondeCategoria =
      categoria === 'Todos' || visita.categoria === categoria;

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
        data={indisponivel ? [] : visitasFiltradas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.topBar}>
              <Pressable onPress={voltar} style={styles.smallButton}>
                <Text style={styles.linkText}>← Voltar</Text>
              </Pressable>

              <Pressable
                onPress={() => router.push('/perfil')}
                style={styles.smallButton}
              >
                <Text style={styles.linkText}>Meu perfil</Text>
              </Pressable>
            </View>

            <Text style={styles.label}>MEU PASSAPORTE</Text>
            <Text style={styles.title}>Suas descobertas</Text>
            <Text style={styles.description}>
              Uma coleção dos lugares que marcaram sua jornada.
            </Text>

            <View style={styles.summary}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryNumber}>
                  {indisponivel ? '—' : visitas.length}
                </Text>
                <Text style={styles.summaryText}>Visitas registradas</Text>
              </View>

              <View style={styles.summaryCard}>
                <Text style={styles.summaryNumber}>
                  {indisponivel ? '—' : totalCidades}
                </Text>
                <Text style={styles.summaryText}>Cidades exploradas</Text>
              </View>
            </View>

            <Pressable
              disabled={indisponivel}
              onPress={() => router.push('/nova-visita')}
              style={({ pressed }) => [
                styles.newButton,
                (indisponivel || pressed) && styles.dimmed,
              ]}
            >
              <Text style={styles.buttonText}>+ Nova visita</Text>
            </Pressable>

            <Pressable
              disabled={indisponivel}
              onPress={() => router.push('/passaporte')}
              style={({ pressed }) => [
                styles.passportButton,
                (indisponivel || pressed) && styles.dimmed,
              ]}
            >
              <Text style={styles.linkText}>Ver meu passaporte</Text>
            </Pressable>

            <Text style={styles.searchLabel}>Buscar por lugar ou cidade</Text>
            <TextInput
              value={busca}
              onChangeText={setBusca}
              editable={!indisponivel}
              placeholder="Ex.: MASP ou São Paulo"
              placeholderTextColor="#8A8F89"
              style={styles.input}
            />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categories}
            >
              {categorias.map((item) => (
                <Pressable
                  key={item}
                  disabled={indisponivel}
                  onPress={() => setCategoria(item)}
                  style={[
                    styles.categoryButton,
                    categoria === item && styles.categorySelected,
                    indisponivel && styles.dimmed,
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      categoria === item && styles.categoryTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {!indisponivel && (
              <Text style={styles.count}>
                {visitasFiltradas.length}{' '}
                {visitasFiltradas.length === 1
                  ? 'visita encontrada'
                  : 'visitas encontradas'}
              </Text>
            )}
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
              pressed && styles.dimmed,
            ]}
          >
            <Text style={styles.category}>{item.categoria.toUpperCase()}</Text>
            <Text style={styles.placeName}>{item.lugar}</Text>
            <Text style={styles.city}>
              {item.cidade} · {item.uf}
            </Text>
            <Text style={styles.date}>Visitado em {item.data}</Text>
            <Text style={styles.details}>Ver detalhes →</Text>
          </Pressable>
        )}
        ListEmptyComponent={
          carregando ? (
            <View style={styles.statusCard}>
              <ActivityIndicator size="large" color="#183F35" />
              <Text style={styles.statusText}>
                Carregando suas visitas…
              </Text>
            </View>
          ) : erro ? (
            <View style={styles.statusCard}>
              <Text style={styles.statusTitle}>
                Não foi possível carregar suas visitas
              </Text>
              <Text style={styles.statusText}>{erro}</Text>

              <Pressable
                onPress={recarregarVisitas}
                style={({ pressed }) => [
                  styles.retryButton,
                  pressed && styles.dimmed,
                ]}
              >
                <Text style={styles.buttonText}>Tentar novamente</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.statusCard}>
              <Text style={styles.statusTitle}>
                {visitas.length === 0
                  ? 'Sua jornada começa aqui'
                  : 'Nenhuma visita encontrada'}
              </Text>
              <Text style={styles.statusText}>
                {visitas.length === 0
                  ? 'Toque em “+ Nova visita” para registrar sua primeira descoberta.'
                  : 'Experimente outra busca ou selecione uma categoria diferente.'}
              </Text>
            </View>
          )
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  smallButton: {
    paddingVertical: 10,
  },
  linkText: {
    color: '#183F35',
    fontSize: 15,
    fontWeight: '700',
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
    padding: 18,
  },
  summaryNumber: {
    color: '#F7F1E5',
    fontSize: 32,
    fontWeight: '800',
  },
  summaryText: {
    color: '#F7F1E5',
    fontSize: 13,
    marginTop: 6,
  },
  newButton: {
    backgroundColor: '#C76B48',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  passportButton: {
    borderWidth: 1,
    borderColor: '#183F35',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  searchLabel: {
    color: '#183F35',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3DDD2',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 15,
    color: '#183F35',
    fontSize: 16,
  },
  categories: {
    gap: 8,
    paddingVertical: 16,
  },
  categoryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3DDD2',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  categorySelected: {
    backgroundColor: '#183F35',
    borderColor: '#183F35',
  },
  categoryText: {
    color: '#53645B',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryTextSelected: {
    color: '#FFFFFF',
  },
  count: {
    color: '#53645B',
    fontSize: 14,
    marginTop: 4,
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
  date: {
    color: '#53645B',
    fontSize: 14,
    marginTop: 20,
  },
  details: {
    color: '#C76B48',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 18,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  statusTitle: {
    color: '#183F35',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  statusText: {
    color: '#53645B',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginTop: 14,
  },
  retryButton: {
    backgroundColor: '#183F35',
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginTop: 20,
  },
  dimmed: {
    opacity: 0.6,
  },
});