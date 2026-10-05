import { router } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAutenticacao } from '../contextos/AutenticacaoContext';

export default function Welcome() {
  const { sessao, carregando, erro } = useAutenticacao();

  function comecar() {
    if (sessao) {
      router.push('/inicio');
    } else {
      router.push('/login');
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.label}>
        SEU DIÁRIO DE DESCOBERTAS
      </Text>

      <View style={styles.content}>
        <View style={styles.stamp}>
          <Text style={styles.monogram}>PL</Text>
        </View>

        <Text style={styles.title}>
          Passaporte{'\n'}Local
        </Text>

        <Text style={styles.description}>
          Explore sua cidade.{'\n'}
          Guarde suas melhores histórias.
        </Text>

        <Pressable
          onPress={comecar}
          disabled={carregando}
          accessibilityRole="button"
          accessibilityState={{ disabled: carregando }}
          style={({ pressed }) => [
            styles.button,
            (pressed || carregando) && styles.pressed,
          ]}
        >
          {carregando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>
              Começar minha jornada
            </Text>
          )}
        </Pressable>

        {erro ? (
          <Text style={styles.errorText}>
            {erro} Você pode tentar entrar novamente.
          </Text>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Cada passeio merece uma lembrança.
          </Text>

          <Text style={styles.cardBody}>
            Registre suas visitas, organize suas descobertas
            e monte sua coleção de carimbos.
          </Text>
        </View>
      </View>

      <Text style={styles.footer}>
        ARTUR TEIXEIRA · UNIRIOS
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#183F35',
    paddingHorizontal: 28,
  },
  label: {
    color: '#DBCEAF',
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 28,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  stamp: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: '#DBCEAF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  monogram: {
    color: '#DBCEAF',
    fontSize: 26,
    fontWeight: '700',
  },
  title: {
    color: '#F7F1E5',
    fontSize: 52,
    fontWeight: '800',
    letterSpacing: -2,
    lineHeight: 57,
  },
  description: {
    color: '#DBCEAF',
    fontSize: 22,
    lineHeight: 30,
    marginTop: 20,
  },
  button: {
    backgroundColor: '#C76B48',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    marginTop: 24,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.75,
  },
  errorText: {
    color: '#F7D4C6',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 12,
  },
  card: {
    backgroundColor: '#F7F1E5',
    borderRadius: 20,
    padding: 22,
    marginTop: 28,
  },
  cardTitle: {
    color: '#183F35',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  cardBody: {
    color: '#53645B',
    fontSize: 14,
    lineHeight: 22,
  },
  footer: {
    color: '#DBCEAF',
    fontSize: 10,
    letterSpacing: 1.5,
    paddingBottom: 24,
  },
});