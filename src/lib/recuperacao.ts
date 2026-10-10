/** Extrai somente um token de recuperação emitido pelo projeto configurado. */
export function extrairTokenRecuperacao(link: string, projetoUrl: string): string {
  let url: URL;
  let projeto: URL;
  try {
    url = new URL(link.trim());
    projeto = new URL(projetoUrl);
  } catch {
    throw new Error('Cole o endereço completo do link de recuperação recebido por e-mail.');
  }
  if (url.protocol !== 'https:' || url.origin !== projeto.origin ||
      url.pathname !== '/auth/v1/verify' || url.username || url.password ||
      url.searchParams.get('type') !== 'recovery') {
    throw new Error('Use o link de recuperação de senha do Passaporte Local.');
  }
  const token = url.searchParams.get('token_hash') ?? url.searchParams.get('token');
  if (!token || !/^[a-zA-Z0-9_-]{20,512}$/.test(token)) {
    throw new Error('O link está incompleto. Copie novamente o endereço do botão no e-mail.');
  }
  return token;
}

export function validarNovaSenha(senha: string, confirmacao: string): string | null {
  if (senha.length < 8) return 'Use pelo menos 8 caracteres na nova senha.';
  if (senha !== confirmacao) return 'Digite a mesma senha nos dois campos.';
  return null;
}
