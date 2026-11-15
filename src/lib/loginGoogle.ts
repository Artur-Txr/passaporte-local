export function codigoRetornoGoogle(retorno: string, esperado: string): string {
  const url = new URL(retorno);
  const destino = new URL(esperado);
  if (url.protocol !== destino.protocol || url.host !== destino.host || url.pathname !== destino.pathname || url.username || url.password) {
    throw new Error('O retorno do login não pertence ao aplicativo. Tente entrar novamente.');
  }
  if (url.searchParams.has('error')) {
    throw new Error(url.searchParams.get('error') === 'access_denied'
      ? 'O acesso com Google não foi autorizado. Você pode tentar novamente.'
      : 'Não foi possível autorizar a conta Google. Tente novamente.');
  }
  const codigo = url.searchParams.get('code');
  if (!codigo || url.searchParams.getAll('code').length !== 1) throw new Error('O retorno do login está incompleto. Entre com Google novamente.');
  return codigo;
}
