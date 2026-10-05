import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  View,
} from 'react-native';
import {
  visitas as visitasIniciais,
  type Visita,
} from '../dados/visitas';

const CHAVE_VISITAS = '@passaporte-local:visitas:v1';

type DadosVisita = Omit<Visita, 'id'>;

type VisitasContextData = {
  visitas: Visita[];
  adicionarVisita: (dados: DadosVisita) => void;
  excluirVisita: (id: string) => void;
  editarVisita: (id: string, dados: DadosVisita) => void;
};

const VisitasContext = createContext<
  VisitasContextData | undefined
>(undefined);

type VisitasProviderProps = {
  children: ReactNode;
};

function registroValido(valor: unknown): valor is Visita {
  if (typeof valor !== 'object' || valor === null) {
    return false;
  }

  const visita = valor as Record<string, unknown>;

  return (
    typeof visita.id === 'string' &&
    typeof visita.lugar === 'string' &&
    typeof visita.cidade === 'string' &&
    typeof visita.uf === 'string' &&
    typeof visita.categoria === 'string' &&
    typeof visita.data === 'string' &&
    typeof visita.comentario === 'string'
  );
}

export function VisitasProvider({
  children,
}: VisitasProviderProps) {
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [carregado, setCarregado] = useState(false);
  const [erroCarregamento, setErroCarregamento] =
    useState(false);
  const [tentativa, setTentativa] = useState(0);

  const sequencia = useRef(0);
  const filaSalvamento = useRef<Promise<void>>(
    Promise.resolve(),
  );

  useEffect(() => {
    let ativo = true;

    async function carregarVisitas() {
      try {
        const texto = await AsyncStorage.getItem(CHAVE_VISITAS);

        let lista: Visita[];

        if (texto === null) {
          lista = visitasIniciais.map((visita) => ({
            ...visita,
          }));
        } else {
          const dados: unknown = JSON.parse(texto);

          if (
            !Array.isArray(dados) ||
            !dados.every(registroValido)
          ) {
            throw new Error('Dados armazenados inválidos.');
          }

          lista = dados;
        }

        if (ativo) {
          setVisitas(lista);
          setCarregado(true);
        }
      } catch {
        if (ativo) {
          setErroCarregamento(true);
        }
      }
    }

    carregarVisitas();

    return () => {
      ativo = false;
    };
  }, [tentativa]);

  useEffect(() => {
    if (!carregado) {
      return;
    }

    const texto = JSON.stringify(visitas);

    filaSalvamento.current = filaSalvamento.current
      .then(() => AsyncStorage.setItem(CHAVE_VISITAS, texto))
      .catch(() => {
        Alert.alert(
          'Não foi possível guardar as visitas',
          'A alteração está na memória, mas pode ser perdida ao fechar o aplicativo. Tente novamente.',
        );
      });
  }, [visitas, carregado]);

  function adicionarVisita(dados: DadosVisita) {
    sequencia.current += 1;

    const novaVisita: Visita = {
      ...dados,
      id: `visita-${Date.now()}-${sequencia.current}`,
    };

    setVisitas((listaAtual) => [
      novaVisita,
      ...listaAtual,
    ]);
  }

  function excluirVisita(id: string) {
    setVisitas((listaAtual) =>
      listaAtual.filter((visita) => visita.id !== id),
    );
  }

  function editarVisita(id: string, dados: DadosVisita) {
    setVisitas((listaAtual) =>
      listaAtual.map((visita) =>
        visita.id === id
          ? { ...dados, id: visita.id }
          : visita,
      ),
    );
  }

  function tentarNovamente() {
    setErroCarregamento(false);
    setTentativa((valor) => valor + 1);
  }

  if (!carregado) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#F7F1E5',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 28,
        }}
      >
        {erroCarregamento ? (
          <>
            <Text
              style={{
                color: '#183F35',
                fontSize: 18,
                textAlign: 'center',
              }}
            >
              Não foi possível carregar suas visitas.
            </Text>

            <Pressable
              onPress={tentarNovamente}
              accessibilityRole="button"
              style={{
                backgroundColor: '#183F35',
                padding: 16,
                borderRadius: 14,
                marginTop: 20,
              }}
            >
              <Text style={{ color: '#FFFFFF' }}>
                Tentar novamente
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            <ActivityIndicator
              size="large"
              color="#183F35"
            />

            <Text
              style={{
                color: '#53645B',
                marginTop: 16,
              }}
            >
              Carregando seu passaporte...
            </Text>
          </>
        )}
      </View>
    );
  }

  return (
    <VisitasContext.Provider
      value={{
        visitas,
        adicionarVisita,
        excluirVisita,
        editarVisita,
      }}
    >
      {children}
    </VisitasContext.Provider>
  );
}

export function useVisitas() {
  const contexto = useContext(VisitasContext);

  if (contexto === undefined) {
    throw new Error(
      'useVisitas precisa estar dentro de VisitasProvider.',
    );
  }

  return contexto;
}