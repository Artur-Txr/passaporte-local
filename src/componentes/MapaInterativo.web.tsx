import { createElement, useEffect, useMemo, useRef } from 'react';
import { coordenadasValidas, htmlMapa } from '../lib/mapa';
import type { PropsMapa } from './MapaInterativo';

export default function MapaInterativo({ marcadores, editavel = false, onEscolher, onVisita, onErro }: PropsMapa) {
  const iframe = useRef<HTMLIFrameElement>(null);
  const html = useMemo(() => htmlMapa(marcadores, editavel), [marcadores, editavel]);
  useEffect(() => {
    const receber = (evento: MessageEvent) => {
      if (evento.source !== iframe.current?.contentWindow) return;
      try {
        const mensagem = JSON.parse(evento.data);
        if (mensagem.tipo === 'coordenadas' && editavel && coordenadasValidas(mensagem)) onEscolher?.(mensagem);
        if (mensagem.tipo === 'visita' && marcadores.some(ponto => ponto.id === mensagem.id)) onVisita?.(mensagem.id);
        if (mensagem.tipo === 'erro') onErro?.();
      } catch { onErro?.(); }
    };
    window.addEventListener('message', receber);
    return () => window.removeEventListener('message', receber);
  }, [marcadores, editavel, onEscolher, onVisita, onErro]);
  return createElement('iframe', { ref: iframe, title: editavel ? 'Escolher localização' : 'Mapa das visitas', srcDoc: html, sandbox: 'allow-scripts allow-same-origin allow-popups', style: { border: 0, width: '100%', height: '100%', flex: 1 } });
}
