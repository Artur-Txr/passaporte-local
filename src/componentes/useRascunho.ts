import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { agendarRascunho as agendar } from '../lib/filaRascunho';

type Campos = Record<string, string | number | null>;

export default function useRascunho<T extends Campos>(chave: string, campos: T, restaurar: (dados: T) => void) {
  const [pronto, setPronto] = useState(false);
  const [restaurado, setRestaurado] = useState(false);
  const [falha, setFalha] = useState(false);
  const atual = useRef(campos);
  const restaurarAtual = useRef(restaurar);
  const inicial = useRef(campos);
  const carregado = useRef(false);
  const leituraFalhou = useRef(false);
  const suspenso = useRef(false);
  const ativo = useRef(false);
  const versao = useRef(0);
  const temporizador = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  atual.current = campos;
  restaurarAtual.current = restaurar;
  const serializado = JSON.stringify(campos);

  function guardar() {
    if (!carregado.current || suspenso.current) return;
    const texto = JSON.stringify(atual.current);
    if (leituraFalhou.current && texto === JSON.stringify(inicial.current)) return;
    void agendar(chave, () => AsyncStorage.setItem(chave, texto))
      .then(() => { leituraFalhou.current = false; if (ativo.current) setFalha(false); })
      .catch(() => { if (ativo.current) setFalha(true); });
  }

  useEffect(() => {
    ativo.current = true;
    const consulta = ++versao.current;
    void agendar(chave, async () => {
      const texto = await AsyncStorage.getItem(chave);
      if (!ativo.current || consulta !== versao.current) return;
      if (texto) {
        const dados: unknown = JSON.parse(texto);
        if (dados && typeof dados === 'object') {
          const registro = dados as Campos;
          const valido = Object.keys(inicial.current).every(campo => {
            const valor = registro[campo];
            return inicial.current[campo] === null || typeof inicial.current[campo] === 'number' ? valor === null || (typeof valor === 'number' && Number.isFinite(valor)) : typeof valor === typeof inicial.current[campo];
          });
          if (valido) {
            restaurarAtual.current(registro as T);
            setRestaurado(JSON.stringify(registro) !== JSON.stringify(inicial.current));
          }
        }
      }
    }).catch(() => { if (ativo.current && consulta === versao.current) { leituraFalhou.current = true; setFalha(true); } }).finally(() => {
      if (ativo.current && consulta === versao.current) { carregado.current = true; setPronto(true); }
    });
    const evento = AppState.addEventListener('change', estado => { if (estado !== 'active') guardar(); });
    return () => {
      ativo.current = false;
      versao.current++;
      clearTimeout(temporizador.current);
      guardar();
      evento.remove();
    };
  }, [chave]);

  useEffect(() => {
    if (!pronto || suspenso.current) return;
    clearTimeout(temporizador.current);
    temporizador.current = setTimeout(guardar, 400);
    return () => clearTimeout(temporizador.current);
  }, [serializado, pronto, chave]);

  async function limpar() {
    suspenso.current = true;
    clearTimeout(temporizador.current);
    try { await agendar(chave, () => AsyncStorage.removeItem(chave)); }
    catch { if (ativo.current) setFalha(true); }
  }

  function reiniciar() { suspenso.current = false; }
  const guardarAgora = (dados: T) => agendar(chave, () => AsyncStorage.setItem(chave, JSON.stringify(dados)));
  return { pronto, restaurado, falha, limpar, reiniciar, guardarAgora };
}
