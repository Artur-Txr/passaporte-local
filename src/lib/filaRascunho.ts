const filas = new Map<string, Promise<void>>();

export function agendarRascunho(chave: string, operacao: () => Promise<void>) {
  const anterior = filas.get(chave) ?? Promise.resolve();
  const proxima = anterior.catch(() => {}).then(operacao);
  filas.set(chave, proxima);
  void proxima.finally(() => { if (filas.get(chave) === proxima) filas.delete(chave); }).catch(() => {});
  return proxima;
}
