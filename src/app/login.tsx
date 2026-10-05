import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [entrando, setEntrando] = useState(false);

  const envioEmAndamento = useRef(false);

  async function entrar() {
    if (envioEmAndamento.current) {
      return;
    }

    const emailFormatado = email.trim();

    if (!emailFormatado || !senha) {
      Alert.alert(
        'Preencha os campos',
        'Informe seu e-mail e sua senha.',
      );
      return;
    }

    envioEmAndamento.current = true;
    setEntrando(true);

    try {
      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: emailFormatado,
          password: senha,
        });

      if (error) {
        Alert.alert(
          'Não foi possível entrar',
          error.message === 'Invalid login credentials'
            ? 'Confira seu e-mail e sua senha.'
            : error.message,
        );
        return;
      }

      if (!data.session) {
        Alert.alert(
          'Não foi possível entrar',
          'Nenhuma sessão foi recebida. Tente novamente.',
        );
        return;
      }

      router.replace('/inicio');
    } catch {
      Alert.alert(
        'Falha de conexão',
        'Não foi possível conectar ao Supabase. Confira sua internet e tente novamente.',
      );
    } finally {
      envioEmAndamento.current = false;
      setEntrando(false);
    }
  }

  function voltar() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable
            onPress={voltar}
            disabled={entrando}
            style={styles.backButton}
          >
            <Text style={styles.backText}>← Voltar</Text>
          </Pressable>

          <Text style={styles.label}>PASSAPORTE LOCAL</Text>

          <Text style={styles.title}>
            Sua próxima história começa aqui.
          </Text>

          <Text style={styles.description}>
            Entre na sua conta para continuar sua jornada.
          </Text>

          <Text style={styles.fieldLabel}>E-mail</Text>

          <TextInput
            style={styles.input}
            placeholder="seuemail@exemplo.com"
            placeholderTextColor="#7C827A"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            editable={!entrando}
          />

          <Text style={styles.fieldLabel}>Senha</Text>

          <TextInput
            style={styles.input}
            placeholder="Digite sua senha"
            placeholderTextColor="#7C827A"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="current-password"
            editable={!entrando}
          />

          <Pressable
            onPress={entrar}
            disabled={entrando}
            accessibilityRole="button"
            accessibilityState={{ disabled: entrando }}
            style={({ pressed }) => [
              styles.button,
              (pressed || entrando) && styles.pressed,
            ]}
          >
            <Text style={styles.buttonText}>
              {entrando ? 'Entrando...' : 'Entrar'}
            </Text>
          </Pressable>

          <Text style={styles.signupDescription}>
            Ainda não tem uma conta?
          </Text>

          <Pressable
            onPress={() => router.push('/cadastro')}
            disabled={entrando}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.signupButton,
              (pressed || entrando) && styles.pressed,
            ]}
          >
            <Text style={styles.signupText}>
              Criar conta
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F7F1E5',
  },
  keyboard: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 28,
    paddingBottom: 40,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 12,
    paddingRight: 16,
    marginBottom: 36,
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
    marginTop: 20,
  },
  description: {
    color: '#53645B',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 16,
    marginBottom: 16,
  },
  fieldLabel: {
    color: '#183F35',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    color: '#183F35',
    borderWidth: 1,
    borderColor: '#DED9CE',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#183F35',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginTop: 32,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  signupDescription: {
    color: '#53645B',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 28,
  },
  signupButton: {
    borderWidth: 1,
    borderColor: '#183F35',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginTop: 12,
  },
  signupText: {
    color: '#183F35',
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.75,
  },
});