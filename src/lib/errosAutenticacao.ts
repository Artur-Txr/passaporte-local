export function mensagemErroAuth(erro: { code?: string; status?: number; message?: string }): string {
  const mensagens: Record<string, string> = {
    invalid_credentials: 'Confira seu e-mail e sua senha.',
    email_not_confirmed: 'Confirme seu e-mail antes de entrar.',
    user_already_exists: 'Já existe uma conta com este e-mail. Tente entrar ou recuperar sua senha.',
    email_exists: 'Já existe uma conta com este e-mail.',
    signup_disabled: 'O cadastro de novas contas está temporariamente indisponível.',
    weak_password: 'Escolha uma senha mais forte, com pelo menos 8 caracteres.',
    over_email_send_rate_limit: 'O serviço atingiu o limite de envio de e-mails. Se já recebeu um link, use a opção Já tenho um link de recuperação.',
    email_address_not_authorized: 'O envio para este e-mail ainda não está habilitado. Entre em contato com o responsável pelo app.',
    same_password: 'Escolha uma senha diferente da anterior.',
  };
  if (erro.code && mensagens[erro.code]) return mensagens[erro.code];
  if (erro.status === 429) return 'Muitas tentativas. Aguarde um pouco antes de tentar novamente.';
  if (!erro.status || erro.status >= 500) return 'Não foi possível conectar ao serviço. Confira sua internet e tente novamente.';
  return 'Não foi possível concluir. Confira os dados e tente novamente.';
}
