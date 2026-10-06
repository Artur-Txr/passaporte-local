import { router, useLocalSearchParams } from 'expo-router';
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
import FotoVisita from '../componentes/FotoVisita';
import SeletorFoto from '../componentes/SeletorFoto';
import { useAutenticacao } from '../contextos/AutenticacaoContext';
import { useVisitas } from '../contextos/VisitasContext';
import { enviarFoto, excluirFoto } from '../servicos/fotosService';
import type { FotoSelecionada } from '../servicos/selecaoFotoService';

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
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  return (
    data.getFullYear() === ano &&
    data.getMonth() === mes - 1 &&
    data.getDate() === dia &&
    data <= hoje
  );
}

export default function EditarVisita() {
  const { visitas, editarVisita } = useVisitas();
  const { sessao } = useAutenticacao();

  const { id } = useLocalSearchParams<{
    id?: string | string[];
  }>();

  const visitaId = Array.isArray(id) ? id[0] : id;
  const visita = visitas.find((item) => item.id === visitaId);

  const [lugar, setLugar] = useState(visita?.lugar ?? '');
  const [cidade, setCidade] = useState(visita?.cidade ?? '');
  const [uf, setUf] = useState(visita?.uf ?? '');
  const [categoria, setCategoria] = useState(
    visita?.categoria ?? '',
  );
  const [data, setData] = useState(visita?.data ?? '');
  const [comentario, setComentario] = useState(
    visita?.comentario ?? '',
  );
  const [avaliacao, setAvaliacao] = useState<number | null>(
    visita?.avaliacao ?? null,
  );

  const [foto, setFoto] = useState<FotoSelecionada | null>(null);
  const [removerFotoAtual, setRemoverFotoAtual] = useState(false);
  const [selecionandoFoto, setSelecionandoFoto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [enviandoFoto, setEnviandoFoto] = useState(false);

  const envioEmAndamento = useRef(false);
  const selecaoEmAndamento = useRef(false);
  const fotoEnviada = useRef<{
    foto: FotoSelecionada;
    caminho: string;
  } | null>(null);

  const bloqueado = salvando || selecionandoFoto;
  const caminhoAtual = visita?.foto_path ?? null;

  function acompanharSelecao(selecionando: boolean) {
    selecaoEmAndamento.current = selecionando;
    setSelecionandoFoto(selecionando);
  }

  function alterarFoto(escolhida: FotoSelecionada | null) {
    setFoto(escolhida);
    setRemoverFotoAtual(escolhida === null);
  }

  function voltar() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/inicio');
    }
  }

  async function salvarAlteracoes() {
    if (
      envioEmAndamento.current ||
      selecaoEmAndamento.current
    ) {
      return;
    }

    const usuarioId = sessao?.user.id;

    if (!visita || !usuarioId) {
      Alert.alert(
        'Não foi possível continuar',
        'Entre na sua conta e selecione uma visita.',
      );
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

    const caminhoAnterior = caminhoAtual;

    try {
      let novoCaminho = removerFotoAtual ? null : caminhoAnterior;

      if (foto) {
        if (fotoEnviada.current?.foto === foto) {
          novoCaminho = fotoEnviada.current.caminho;
        } else {
          setEnviandoFoto(true);

          try {
            novoCaminho = await enviarFoto(
              usuarioId,
              foto.conteudo,
              foto.tipo,
            );

            fotoEnviada.current = {
              foto,
              caminho: novoCaminho,
            };
          } finally {
            setEnviandoFoto(false);
          }
        }
      }

      await editarVisita(visita.id, {
        lugar: lugar.trim(),
        cidade: cidade.trim(),
        uf,
        categoria,
        data,
        comentario: comentario.trim(),
        avaliacao,
        foto_path: novoCaminho,
      });

      if (
        caminhoAnterior &&
        caminhoAnterior !== novoCaminho
      ) {
        try {
          await excluirFoto(usuarioId, caminhoAnterior);
        } catch {
          Alert.alert(
            'Visita atualizada',
            'A alteração foi salva, mas não foi possível apagar o arquivo da foto antiga do armazenamento.',
          );
        }
      }

      voltar();
    } catch {
      Alert.alert(
        'Não foi possível atualizar',
        'Os campos e a foto selecionada foram mantidos. Confira sua conexão e tente novamente.',
      );
    } finally {
      envioEmAndamento.current = false;
      setEnviandoFoto(false);
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
            disabled={bloqueado}
            style={styles.backButton}
          >
            <Text style={styles.backText}>← Voltar</Text>
          </Pressable>

          {!visita ? (
            <>
              <Text style={styles.title}>
                Visita não encontrada
              </Text>
              <Text style={styles.description}>
                Volte à lista e selecione uma visita.
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.label}>
                ATUALIZE SUA DESCOBERTA
              </Text>
              <Text style={styles.title}>Editar visita</Text>
              <Text style={styles.description}>
                Ajuste os dados e atualize sua lembrança.
              </Text>

              <Text style={styles.fieldLabel}>Nome do lugar *</Text>
              <TextInput
                style={styles.input}
                value={lugar}
                onChangeText={setLugar}
                maxLength={120}
                autoCapitalize="words"
                editable={!bloqueado}
              />

              <Text style={styles.fieldLabel}>Cidade *</Text>
              <TextInput
                style={styles.input}
                value={cidade}
                onChangeText={setCidade}
                maxLength={100}
                autoCapitalize="words"
                editable={!bloqueado}
              />

              <Text style={styles.fieldLabel}>UF *</Text>
              <TextInput
                style={styles.input}
                value={uf}
                onChangeText={(texto) =>
                  setUf(texto.replace(/[^a-z]/gi, '').toUpperCase())
                }
                maxLength={2}
                autoCapitalize="characters"
                autoCorrect={false}
                editable={!bloqueado}
              />

              <Text style={styles.fieldLabel}>Categoria *</Text>
              <View style={styles.categories}>
                {categorias.map((item) => {
                  const selecionada = categoria === item;

                  return (
                    <Pressable
                      key={item}
                      onPress={() => setCategoria(item)}
                      disabled={bloqueado}
                      accessibilityRole="button"
                      accessibilityState={{
                        selected: selecionada,
                        disabled: bloqueado,
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
                editable={!bloqueado}
              />

              <Text style={styles.fieldLabel}>
                Sua avaliação (opcional)
              </Text>
              <AvaliacaoEstrelas
                valor={avaliacao}
                onChange={setAvaliacao}
                desabilitado={bloqueado}
              />

              <Text style={styles.fieldLabel}>
                Foto da visita (opcional)
              </Text>

              {caminhoAtual && !foto && !removerFotoAtual ? (
                <View style={styles.currentPhoto}>
                  <FotoVisita
                    key={caminhoAtual}
                    caminho={caminhoAtual}
                  />

                  <Pressable
                    disabled={bloqueado}
                    onPress={() => setRemoverFotoAtual(true)}
                    accessibilityRole="button"
                    style={({ pressed }) => [
                      styles.removeButton,
                      (pressed || bloqueado) && styles.pressed,
                    ]}
                  >
                    <Text style={styles.removeText}>
                      Remover foto atual
                    </Text>
                  </Pressable>
                </View>
              ) : null}

              {removerFotoAtual && caminhoAtual && !foto && (
                <View style={styles.notice}>
                  <Text style={styles.hint}>
                    A foto atual será removida ao salvar.
                  </Text>
                  <Pressable
                    disabled={bloqueado}
                    onPress={() => setRemoverFotoAtual(false)}
                    accessibilityRole="button"
                    style={styles.undoButton}
                  >
                    <Text style={styles.backText}>
                      Manter foto atual
                    </Text>
                  </Pressable>
                </View>
              )}

              <SeletorFoto
                foto={foto}
                onChange={alterarFoto}
                desabilitado={salvando}
                onSelecionandoChange={acompanharSelecao}
              />

              <Text style={styles.fieldLabel}>Sua lembrança</Text>
              <TextInput
                style={[styles.input, styles.commentInput]}
                value={comentario}
                onChangeText={setComentario}
                multiline
                maxLength={500}
                textAlignVertical="top"
                editable={!bloqueado}
              />

              <Text style={styles.counter}>
                {comentario.length}/500 caracteres
              </Text>
              <Text style={styles.hint}>* Campos obrigatórios</Text>

              <Pressable
                onPress={salvarAlteracoes}
                disabled={bloqueado}
                accessibilityRole="button"
                accessibilityState={{ disabled: bloqueado }}
                style={({ pressed }) => [
                  styles.button,
                  (pressed || bloqueado) && styles.pressed,
                ]}
              >
                <Text style={styles.buttonText}>
                  {enviandoFoto
                    ? 'Enviando foto...'
                    : salvando
                      ? 'Salvando...'
                      : 'Salvar alterações'}
                </Text>
              </Pressable>
            </>
          )}
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
  currentPhoto: {
    marginBottom: 16,
  },
  removeButton: {
    borderWidth: 1,
    borderColor: '#A33B32',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  removeText: {
    color: '#A33B32',
    fontSize: 15,
    fontWeight: '700',
  },
  notice: {
    marginBottom: 16,
  },
  undoButton: {
    paddingVertical: 12,
    alignSelf: 'flex-start',
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
    opacity: 0.65,
  },
});