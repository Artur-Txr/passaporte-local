import { router, useLocalSearchParams } from 'expo-router';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CarimboVisita from '../componentes/CarimboVisita';
import { useVisitas } from '../contextos/VisitasContext';

export default function Detalhes() {
  const { visitas, excluirVisita } = useVisitas();

  const { id } = useLocalSearchParams<{
    id?: string | string[];
  }>();

  const visitaId = Array.isArray(id) ? id[0] : id;
  const visita = visitas.find((item) => item.id === visitaId);

  function voltar() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/inicio');
    }
  }

  function abrirEdicao() {
    if (!visita) {
      return;
    }

    router.push({
      pathname: '/editar-visita',
      params: { id: visita.id },
    });
  }

  function confirmarExclusao() {
    if (!visita) {
      return;
    }

    const idParaExcluir = visita.id;

    Alert.alert(
      'Excluir visita?',
      `Deseja remover a visita a ${visita.lugar}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            excluirVisita(idParaExcluir);
            voltar();
          },
        },
      ],
      { cancelable: true },
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable
          onPress={voltar}
          style={styles.backButton}
        >
          <Text style={styles.backText}>← Voltar</Text>
        </Pressable>

        {visita ? (
          <>
            <Text style={styles.label}>MINHA DESCOBERTA</Text>

            <Text style={styles.title}>{visita.lugar}</Text>

            <Text style={styles.location}>
              {visita.cidade} · {visita.uf}
            </Text>

            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {visita.categoria}
              </Text>
            </View>

            <View style={styles.stampCard}>
              <Text style={styles.sectionTitle}>
                Carimbo da visita
              </Text>

              <View style={styles.stampContainer}>
                <CarimboVisita visita={visita} />
              </View>

              <Text style={styles.stampDescription}>
                Cada descoberta deixa uma marca no seu passaporte.
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>
                Data da visita
              </Text>

              <Text style={styles.cardText}>
                {visita.data}
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>
                Minha lembrança
              </Text>

              <Text style={styles.cardText}>
                {visita.comentario.trim() ||
                  'Nenhuma lembrança escrita para esta visita.'}
              </Text>
            </View>

            <Pressable
              onPress={abrirEdicao}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.editButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.editText}>
                Editar visita
              </Text>
            </Pressable>

            <Pressable
              onPress={confirmarExclusao}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.deleteButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.deleteText}>
                Excluir visita
              </Text>
            </Pressable>
          </>
        ) : (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              Visita não encontrada
            </Text>

            <Text style={styles.cardText}>
              Volte à lista e selecione uma visita.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F7F1E5',
  },
  content: {
    padding: 28,
    paddingBottom: 40,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 12,
    paddingRight: 16,
    marginBottom: 24,
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
    fontSize: 34,
    fontWeight: '800',
    marginTop: 16,
  },
  location: {
    color: '#53645B',
    fontSize: 17,
    marginTop: 10,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8DDCC',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 20,
    marginBottom: 8,
  },
  badgeText: {
    color: '#183F35',
    fontSize: 13,
    fontWeight: '700',
  },
  stampCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    marginTop: 16,
    alignItems: 'center',
  },
  stampContainer: {
    marginTop: 28,
    marginBottom: 24,
  },
  stampDescription: {
    color: '#53645B',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    marginTop: 16,
  },
  sectionTitle: {
    color: '#183F35',
    fontSize: 18,
    fontWeight: '700',
  },
  cardText: {
    color: '#53645B',
    fontSize: 16,
    lineHeight: 26,
    marginTop: 12,
  },
  editButton: {
    backgroundColor: '#183F35',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginTop: 28,
  },
  editText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: '#A33B32',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginTop: 12,
  },
  deleteText: {
    color: '#A33B32',
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.75,
  },
});