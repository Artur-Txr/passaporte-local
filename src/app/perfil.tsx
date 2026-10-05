import { Redirect, router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAutenticacao } from '../contextos/AutenticacaoContext';

export default function Perfil() {
  const { sessao, carregando, sair } = useAutenticacao();
  const [saindo, setSaindo] = useState(false);

  const saidaEmAndamento = useRef(false);

  async function encerrarSessao() {
    if (saidaEmAndamento.current) {
      return;
    }

    saidaEmAndamento.current = true;
    setSaindo(true);

    try {
      await sair();
    } catch {
      Alert.alert(
        'Não foi possível sair',
        'Confira sua conexão e tente novamente.',
      );
    } finally {
      saidaEmAndamento.current = false;
      setSaindo(false);
    }
  }

  function confirmarSaida() {
    Alert.alert(
      'Sair da conta?',
      'Você precisará entrar novamente para acessar sua conta.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          onPress: encerrarSessao,
        },
      ],
      { cancelable: true },
    );
  }

  function voltar() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/inicio');
    }
  }

  if (carregando) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator size="large" color="#183F35" />
      </SafeAreaView>
    );
  }

  if (!sessao) {
    return <Redirect href="/login" />;
  }

  const nomeCadastrado = sessao.user.user_metadata.nome;

  const nome =
    typeof nomeCadastrado === 'string' &&
    nomeCadastrado.trim()
      ? nomeCadastrado.trim()
      : 'Viajante';

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable
          onPress={voltar}
          disabled={saindo}
          style={styles.backButton}
        >
          <Text style={styles.backText}>← Voltar</Text>
        </Pressable>

        <Text style={styles.label}>SUA CONTA</Text>
        <Text style={styles.title}>Meu perfil</Text>

        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {nome.charAt(0).toUpperCase()}
            </Text>
          </View>

          <Text style={styles.name}>{nome}</Text>

          <Text style={styles.email}>
            {sessao.user.email ?? 'E-mail não informado'}
          </Text>
        </View>

        <Pressable
          onPress={confirmarSaida}
          disabled={saindo}
          accessibilityRole="button"
          accessibilityState={{ disabled: saindo }}
          style={({ pressed }) => [
            styles.exitButton,
            (pressed || saindo) && styles.pressed,
          ]}
        >
          <Text style={styles.exitText}>
            {saindo ? 'Saindo...' : 'Sair da conta'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F7F1E5',
  },
  loading: {
    flex: 1,
    backgroundColor: '#F7F1E5',
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 32,
    fontWeight: '800',
    marginTop: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    marginTop: 28,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#183F35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#F7F1E5',
    fontSize: 34,
    fontWeight: '800',
  },
  name: {
    color: '#183F35',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 20,
    textAlign: 'center',
  },
  email: {
    color: '#53645B',
    fontSize: 15,
    marginTop: 10,
    textAlign: 'center',
  },
  exitButton: {
    borderWidth: 1,
    borderColor: '#A33B32',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginTop: 28,
  },
  exitText: {
    color: '#A33B32',
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.75,
  },
});