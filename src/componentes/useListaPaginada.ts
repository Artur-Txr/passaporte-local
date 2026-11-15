import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';

export default function useListaPaginada<T extends { id: string }>(buscar: (pagina: number) => Promise<T[]>) {
  const [itens, setItens] = useState<T[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(false);
  const [mais, setMais] = useState(false);
  const versao = useRef(0);
  const pagina = useRef(0);
  const trava = useRef(false);
  const carregar = useCallback(async (reiniciar = false) => {
    if (trava.current) return;
    trava.current = true;
    const consulta = ++versao.current;
    const proxima = reiniciar ? 0 : pagina.current;
    setCarregando(true);
    setErro(false);
    try {
      const lista = await buscar(proxima);
      if (consulta !== versao.current) return;
      setItens(anteriores => reiniciar ? lista : Array.from(new Map([...anteriores, ...lista].map(item => [item.id, item])).values()));
      setMais(lista.length === 20);
      pagina.current = proxima + 1;
    } catch { if (consulta === versao.current) setErro(true); }
    finally { if (consulta === versao.current) { trava.current = false; setCarregando(false); } }
  }, [buscar]);
  useFocusEffect(useCallback(() => {
    setItens([]);
    setMais(false);
    void carregar(true);
    return () => { versao.current++; trava.current = false; };
  }, [carregar]));
  return { itens, carregando, erro, mais, carregar };
}
