export const LIMITE_FOTO_MB = 20;
export const LIMITE_FOTO_BYTES = LIMITE_FOTO_MB * 1024 * 1024;
export const MENSAGEM_LIMITE_FOTO = `Escolha uma imagem de até ${LIMITE_FOTO_MB} MB.`;

export function conferirTamanhoFoto(tamanho: number) {
  if (!Number.isFinite(tamanho) || tamanho <= 0) {
    throw new Error('A imagem está vazia ou tem tamanho inválido.');
  }
  if (tamanho > LIMITE_FOTO_BYTES) throw new Error(MENSAGEM_LIMITE_FOTO);
}
