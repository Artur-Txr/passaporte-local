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

export default function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [cadastrando, setCadastrando] = useState(false);

  const envioEmAndamento = useRef(false);

  function voltar() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/login');
    }
  }

  async function cadastrar() {
    if (envioEmAndamento.current) {
      return;
    }

    const nomeFormatado = nome.trim();
    const emailFormatado = email.trim();

    if (
      !nomeFormatado ||
      !emailFormatado ||
      !senha ||
      !confirmacao
    ) {
      Alert.alert(
        'Preencha os campos',
        'Informe seu nome, e-mail e os dois campos de senha.',
      );
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailFormatado)) {
      Alert.alert(
        'Confira o e-mail',
        'Informe um endereço de e-mail válido.',
      );
      return;
    }

    if (senha.length < 8) {
      Alert.alert(
        'Escolha uma senha maior',
        'Use pelo menos 8 caracteres.',
      );
      return;
    }

    if (senha !== confirmacao) {
      Alert.alert(
        'As senhas são diferentes',
        'Digite a mesma senha nos dois campos.',
      );
      return;
    }

    envioEmAndamento.current = true;
    setCadastrando(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: emailFormatado,
        password: senha,
        options: {
          data: {
            nome: nomeFormatado,
          },
        },
      });

      if (error) {
        Alert.alert(
          'Não foi possível cadastrar',
          error.message,
        );
        return;
      }

      setSenha('');
      setConfirmacao('');

      if (data.session) {
        router.replace('/inicio');
      } else {
        Alert.alert(
          'Confira seu e-mail',
          'Se o cadastro precisar de confirmação, você receberá um e-mail. Confirme sua conta antes de entrar.',
          [
            {
              text: 'Ir para login',
              onPress: () => router.replace('/login'),
            },
          ],
          { cancelable: false },
        );
      }
    } catch {
      Alert.alert(
        'Falha de conexão',
        'Confira sua internet e tente novamente.',
      );
    } finally {
      envioEmAndamento.current = false;
      setCadastrando(false);
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
            disabled={cadastrando}
            style={styles.backButton}
          >
            <Text style={styles.backText}>← Voltar</Text>
          </Pressable>

          <Text style={styles.label}>PASSAPORTE LOCAL</Text>
          <Text style={styles.title}>Comece sua jornada.</Text>

          <Text style={styles.description}>
            Crie sua conta para organizar suas descobertas.
          </Text>

          <Text style={styles.fieldLabel}>Nome</Text>

          <TextInput
            style={styles.input}
            placeholder="Como você se chama?"
            placeholderTextColor="#7C827A"
            value={nome}
            onChangeText={setNome}
            maxLength={80}
            autoCapitalize="words"
            autoComplete="name"
            editable={!cadastrando}
          />

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
            editable={!cadastrando}
          />

          <Text style={styles.fieldLabel}>Senha</Text>

          <TextInput
            style={styles.input}
            placeholder="Pelo menos 8 caracteres"
            placeholderTextColor="#7C827A"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="new-password"
            editable={!cadastrando}
          />

          <Text style={styles.fieldLabel}>
            Confirmar senha
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Digite a senha novamente"
            placeholderTextColor="#7C827A"
            value={confirmacao}
            onChangeText={setConfirmacao}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={!cadastrando}
          />

          <Pressable
            onPress={cadastrar}
            disabled={cadastrando}
            accessibilityRole="button"
            accessibilityState={{ disabled: cadastrando }}
            style={({ pressed }) => [
              styles.button,
              (pressed || cadastrando) && styles.pressed,
            ]}
          >
            <Text style={styles.buttonText}>
              {cadastrando ? 'Criando conta...' : 'Criar conta'}
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
    padding: 28,
    paddingBottom: 40,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 12,
    paddingRight: 16,
    marginBottom: 28,
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
  pressed: {
    opacity: 0.75,
  },
});