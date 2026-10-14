const AVISO_DATA = /Data aproximada usada no cadastro, pois a data exata da visita não foi lembrada\./i;

export function apresentarLembranca(comentario: string) {
  return {
    dataAproximada: AVISO_DATA.test(comentario),
    lembranca: comentario.replace(AVISO_DATA, '').trim(),
  };
}
