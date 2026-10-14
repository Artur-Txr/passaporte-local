export type UploadPendente = { caminho: string; criadoEm: number };
export const PRAZO_LIMPEZA_UPLOAD = 24 * 60 * 60 * 1000;

export function uploadPodeSerRevisado(upload: UploadPendente, usuarioId: string, agora: number): boolean {
  const partes = upload.caminho.split('/');
  return partes.length === 2 && partes[0] === usuarioId && !!partes[1] &&
    partes[1] !== '.' && partes[1] !== '..' && Number.isFinite(upload.criadoEm) &&
    upload.criadoEm > 0 && agora - upload.criadoEm >= PRAZO_LIMPEZA_UPLOAD;
}
