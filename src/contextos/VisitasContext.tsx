import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Alert } from 'react-native';
import type { Visita } from '../dados/visitas';
import { excluirFoto } from '../servicos/fotosService';
import {
  atualizarVisita,
  cadastrarVisita,
  listarVisitas,
  removerVisita,
  type DadosVisita,
} from '../servicos/visitasService';
import { useAutenticacao } from './AutenticacaoContext';

type VisitasContextData = {
  visitas: Visita[];
  carregando: boolean;
  erro: string | null;
  recarregarVisitas: () => void;
  adicionarVisita: (dados: DadosVisita) => Promise<void>;
  excluirVisita: (id: string) => Promise<void>;
  editarVisita: (
    id: string,
    dados: DadosVisita,
  ) => Promise<void>;
};

const VisitasContext = createContext<
  VisitasContextData | undefined
>(undefined);

type VisitasProviderProps = {
  children: ReactNode;
};

type DadosVisitasProviderProps = {
  children: ReactNode;
  usuarioId: string | null;
};

export function VisitasProvider({
  children,
}: VisitasProviderProps) {
  const { sessao } = useAutenticacao();
  const usuarioId = sessao?.user.id ?? null;

  return (
    <DadosVisitasProvider
      key={usuarioId ?? 'sem-sessao'}
      usuarioId={usuarioId}
    >
      {children}
    </DadosVisitasProvider>
  );
}

function DadosVisitasProvider({
  children,
  usuarioId,
}: DadosVisitasProviderProps) {
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [carregando, setCarregando] = useState(
    usuarioId !== null,
  );
  const [erro, setErro] = useState<string | null>(null);
  const [tentativa, setTentativa] = useState(0);

  const ativo = useRef(true);

  useEffect(() => {
    ativo.current = true;

    return () => {
      ativo.current = false;
    };
  }, []);

  useEffect(() => {
    let consultaAtiva = true;

    async function carregar() {
      if (!usuarioId) {
        setVisitas([]);
        setCarregando(false);
        setErro(null);
        return;
      }

      setCarregando(true);
      setErro(null);

      try {
        const lista = await listarVisitas(usuarioId);

        if (consultaAtiva) {
          setVisitas(lista);
        }
      } catch {
        if (consultaAtiva) {
          const mensagem =
            'Não foi possível carregar suas visitas.';

          setErro(mensagem);

          Alert.alert(
            'Falha ao carregar',
            `${mensagem} Confira sua conexão.`,
          );
        }
      } finally {
        if (consultaAtiva) {
          setCarregando(false);
        }
      }
    }

    void carregar();

    return () => {
      consultaAtiva = false;
    };
  }, [usuarioId, tentativa]);

  function obterUsuarioId() {
    if (!usuarioId || !ativo.current) {
      throw new Error('Entre na sua conta para continuar.');
    }

    if (carregando || erro) {
      throw new Error(
        'Aguarde o carregamento das visitas ou tente novamente.',
      );
    }

    return usuarioId;
  }

  function conferirSessaoAtiva() {
    if (!ativo.current) {
      throw new Error('A sessão mudou durante a operação.');
    }
  }

  function recarregarVisitas() {
    setTentativa((valor) => valor + 1);
  }

  async function adicionarVisita(dados: DadosVisita) {
    const idUsuario = obterUsuarioId();

    const novaVisita = await cadastrarVisita(
      idUsuario,
      dados,
    );

    conferirSessaoAtiva();

    setVisitas((listaAtual) => [
      novaVisita,
      ...listaAtual,
    ]);
  }

  async function excluirVisita(id: string) {
    const idUsuario = obterUsuarioId();
    const visita = visitas.find((item) => item.id === id);

    if (!visita) {
      throw new Error('A visita não foi encontrada.');
    }

    const caminhoFoto = visita.foto_path ?? null;

    await removerVisita(idUsuario, id);

    conferirSessaoAtiva();

    setVisitas((listaAtual) =>
      listaAtual.filter((item) => item.id !== id),
    );

    if (caminhoFoto) {
      try {
        await excluirFoto(idUsuario, caminhoFoto);
      } catch {
        if (ativo.current) {
          Alert.alert(
            'Visita excluída',
            'A visita foi removida, mas não foi possível apagar o arquivo da foto do armazenamento.',
          );
        }
      }
    }
  }

  async function editarVisita(
    id: string,
    dados: DadosVisita,
  ) {
    const idUsuario = obterUsuarioId();

    const visitaAtualizada = await atualizarVisita(
      idUsuario,
      id,
      dados,
    );

    conferirSessaoAtiva();

    setVisitas((listaAtual) =>
      listaAtual.map((visita) =>
        visita.id === id ? visitaAtualizada : visita,
      ),
    );
  }

  return (
    <VisitasContext.Provider
      value={{
        visitas,
        carregando,
        erro,
        recarregarVisitas,
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