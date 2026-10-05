import type { Session } from '@supabase/supabase-js';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { AppState } from 'react-native';
import { supabase } from '../lib/supabase';

type AutenticacaoContextData = {
  sessao: Session | null;
  carregando: boolean;
  erro: string | null;
  sair: () => Promise<void>;
};

const AutenticacaoContext = createContext<
  AutenticacaoContextData | undefined
>(undefined);

type AutenticacaoProviderProps = {
  children: ReactNode;
};

export function AutenticacaoProvider({
  children,
}: AutenticacaoProviderProps) {
  const [sessao, setSessao] = useState<Session | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    let recebeuEvento = false;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_evento, novaSessao) => {
        recebeuEvento = true;

        if (ativo) {
          setSessao(novaSessao);
          setErro(null);
          setCarregando(false);
        }
      },
    );

    async function recuperarSessao() {
      try {
        const { data, error } =
          await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (ativo && !recebeuEvento) {
          setSessao(data.session);
        }
      } catch {
        if (ativo && !recebeuEvento) {
          setErro('Não foi possível recuperar a sessão.');
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    recuperarSessao();

    function atualizarRenovacao(estado: string) {
      if (estado === 'active') {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    }

    atualizarRenovacao(AppState.currentState);

    const eventoApp = AppState.addEventListener(
      'change',
      atualizarRenovacao,
    );

    return () => {
      ativo = false;
      subscription.unsubscribe();
      eventoApp.remove();
      supabase.auth.stopAutoRefresh();
    };
  }, []);

  async function sair() {
    const { error } = await supabase.auth.signOut({
      scope: 'local',
    });

    if (error) {
      throw error;
    }

    setSessao(null);
  }

  return (
    <AutenticacaoContext.Provider
      value={{
        sessao,
        carregando,
        erro,
        sair,
      }}
    >
      {children}
    </AutenticacaoContext.Provider>
  );
}

export function useAutenticacao() {
  const contexto = useContext(AutenticacaoContext);

  if (contexto === undefined) {
    throw new Error(
      'useAutenticacao precisa estar dentro de AutenticacaoProvider.',
    );
  }

  return contexto;
}