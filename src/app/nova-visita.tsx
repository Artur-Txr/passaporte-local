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
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AvaliacaoEstrelas from '../componentes/AvaliacaoEstrelas';
import { useVisitas } from '../contextos/VisitasContext';

const categorias = ['Parque', 'Museu', 'Cafeteria', 'Outro'];

const estados = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF',
  'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
  'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS',
  'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

function dataValida(texto: string) {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(texto)) {
    return false;
  }

  const [dia, mes, ano] = texto.split('/').map(Number);

  if (ano < 1900) {
    return false;
  }

  const data = new Date(ano, mes - 1, dia);

  const existe =
    data.getFullYear() === ano &&
    data.getMonth() === mes - 1 &&
    data.getDate() === dia;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  return existe && data <= hoje;
}

export default function NovaVisita() {
  const { adicionarVisita } = useVisitas();

  const [lugar, setLugar] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');
  const [categoria, setCategoria] = useState('');
  const [data, setData] = useState('');
  const [comentario, setComentario] = useState('');
  const [avaliacao, setAvaliacao] = useState<number | null>(null);
  const [salvando, setSalvando] = useState(false);

  const envioEmAndamento = useRef(false);

  function voltar() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/inicio');
    }
  }

  async function salvarVisita() {
    if (envioEmAndamento.current) {
      return;
    }

    if (!lugar.trim() || !cidade.trim()) {
      Alert.alert(
        'Preencha os campos',
        'Informe o nome do lugar e a cidade.',
      );
      return;
    }

    if (!estados.includes(uf)) {
      Alert.alert(
        'Confira a UF',
        'Informe uma sigla válida, como BA ou SP.',
      );
      return;
    }

    if (!categorias.includes(categoria)) {
      Alert.alert(
        'Escolha uma categoria',
        'Selecione o tipo de lugar visitado.',
      );
      return;
    }

    if (!dataValida(data)) {
      Alert.alert(
        'Confira a data',
        'Use DD/MM/AAAA, com uma data válida entre 1900 e hoje.',
      );
      return;
    }

    envioEmAndamento.current = true;
    setSalvando(true);

    try {
      await adicionarVisita({
        lugar: lugar.trim(),
        cidade: cidade.trim(),
        uf,
        categoria,
        data,
        comentario: comentario.trim(),
        avaliacao,
      });

      voltar();
    } catch {
      Alert.alert(
        'Não foi possível salvar',
        'Os campos foram mantidos. Confira sua conexão e tente novamente.',
      );
    } finally {
      envioEmAndamento.current = false;
      setSalvando(false);
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
            disabled={salvando}
            style={styles.backButton}
          >
            <Text style={styles.backText}>← Voltar</Text>
          </Pressable>

          <Text style={styles.label}>UMA NOVA DESCOBERTA</Text>
          <Text style={styles.title}>Registrar visita</Text>

          <Text style={styles.description}>
            Conte onde você esteve e guarde sua lembrança.
          </Text>

          <Text style={styles.fieldLabel}>Nome do lugar *</Text>

          <TextInput
            style={styles.input}
            placeholder="Ex.: Pelourinho"
            placeholderTextColor="#7C827A"
            value={lugar}
            onChangeText={setLugar}
            maxLength={120}
            autoCapitalize="words"
            editable={!salvando}
          />

          <Text style={styles.fieldLabel}>Cidade *</Text>

          <TextInput
            style={styles.input}
            placeholder="Ex.: Salvador"
            placeholderTextColor="#7C827A"
            value={cidade}
            onChangeText={setCidade}
            maxLength={100}
            autoCapitalize="words"
            editable={!salvando}
          />

          <Text style={styles.fieldLabel}>UF *</Text>

          <TextInput
            style={styles.input}
            placeholder="Ex.: BA"
            placeholderTextColor="#7C827A"
            value={uf}
            onChangeText={(texto) =>
              setUf(texto.replace(/[^a-z]/gi, '').toUpperCase())
            }
            maxLength={2}
            autoCapitalize="characters"
            autoCorrect={false}
            editable={!salvando}
          />

          <Text style={styles.fieldLabel}>Categoria *</Text>

          <View style={styles.categories}>
            {categorias.map((item) => {
              const selecionada = categoria === item;

              return (
                <Pressable
                  key={item}
                  onPress={() => setCategoria(item)}
                  disabled={salvando}
                  accessibilityRole="button"
                  accessibilityState={{
                    selected: selecionada,
                    disabled: salvando,
                  }}
                  style={[
                    styles.categoryButton,
                    selecionada && styles.categorySelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selecionada && styles.categoryTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.fieldLabel}>Data da visita *</Text>

          <TextInput
            style={styles.input}
            placeholder="DD/MM/AAAA"
            placeholderTextColor="#7C827A"
            value={data}
            onChangeText={setData}
            maxLength={10}
            autoCorrect={false}
            keyboardType="numbers-and-punctuation"
            editable={!salvando}
          />

          <Text style={styles.hint}>
            Digite também as barras. Ex.: 04/10/2026.
          </Text>

          <Text style={styles.fieldLabel}>Sua avaliação (opcional)</Text>

          <AvaliacaoEstrelas
            valor={avaliacao}
            onChange={setAvaliacao}
            desabilitado={salvando}
          />

          <Text style={styles.fieldLabel}>Sua lembrança</Text>

          <TextInput
            style={[styles.input, styles.commentInput]}
            placeholder="O que marcou esse passeio?"
            placeholderTextColor="#7C827A"
            value={comentario}
            onChangeText={setComentario}
            multiline
            maxLength={500}
            textAlignVertical="top"
            editable={!salvando}
          />

          <Text style={styles.counter}>
            {comentario.length}/500 caracteres
          </Text>

          <Text style={styles.hint}>* Campos obrigatórios</Text>

          <Pressable
            onPress={salvarVisita}
            disabled={salvando}
            accessibilityRole="button"
            accessibilityState={{ disabled: salvando }}
            style={({ pressed }) => [
              styles.button,
              (pressed || salvando) && styles.pressed,
            ]}
          >
            <Text style={styles.buttonText}>
              {salvando ? 'Salvando...' : 'Salvar visita'}
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
  description: {
    color: '#53645B',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 12,
    marginBottom: 8,
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
    paddingVertical: 14,
    fontSize: 16,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DED9CE',
    borderRadius: 24,
    paddingHorizontal: 16,
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
  commentInput: {
    minHeight: 130,
  },
  counter: {
    color: '#53645B',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 8,
  },
  hint: {
    color: '#53645B',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 12,
  },
  button: {
    backgroundColor: '#183F35',
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
  pressed: {
    opacity: 0.75,
  },
});