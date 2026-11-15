# Login com Google

## Integração do aplicativo

As telas de login e cadastro incluem Entrar com Google. A autorização acontece no navegador do sistema, e o Supabase troca o código de autorização por uma sessão com PKCE. O perfil usa o nome da conta Google quando não há um nome definido no aplicativo.

O acesso com e-mail e senha continua disponível. O login Google exige a configuração do provedor e uma versão instalada do aplicativo. O Expo Go não oferece suporte ao retorno OAuth com o esquema próprio deste projeto.

## Configurar o Google Cloud

1. No [Google Cloud](https://console.cloud.google.com/), crie ou selecione um projeto dedicado ao Passaporte Local.
2. Em Google Auth Platform, configure Branding e Público-alvo. Em modo de teste, cadastre os e-mails das pessoas que testarão o login.
3. Configure apenas os escopos `openid`, `email` e `profile`.
4. Crie um cliente OAuth do tipo Aplicativo da Web. Esta integração usa o navegador e o callback do Supabase, inclusive no Android e iOS.
5. Adicione este URI de redirecionamento autorizado.

```text
https://cvmtipgmxgjosgkywukb.supabase.co/auth/v1/callback
```

6. Copie o Client ID e o Client Secret diretamente para a configuração do Google no Supabase. O segredo fica somente no provedor, nunca no aplicativo, no GitHub ou em variáveis `EXPO_PUBLIC_*`.

## Configurar o Supabase

1. Abra [Authentication → Sign In / Providers → Google](https://supabase.com/dashboard/project/cvmtipgmxgjosgkywukb/auth/providers?provider=Google).
2. Preencha Client IDs e Client Secret com as credenciais do cliente Web e ative o provedor. Mantenha as verificações de nonce e de e-mail.
3. Em [URL Configuration](https://supabase.com/dashboard/project/cvmtipgmxgjosgkywukb/auth/url-configuration), acrescente o retorno do aplicativo à lista de URLs permitidas.

```text
passaportelocal://auth/callback
```

Para testar também no navegador local, acrescente `http://localhost:8081/auth/callback`, ajustando a porta ao servidor Expo. A versão web precisa servir as rotas do Expo Router.

O ajuste de nomes de perfil de `supabase/login-google.sql` já foi aplicado ao projeto atual. Em um projeto novo, execute-o após os demais scripts de configuração.

## Gerar a versão Android

O identificador do aplicativo é `com.arturtxr.passaportelocal`, com esquema `passaportelocal`. O perfil `preview` de `eas.json` gera um APK instalável no Android e no BlueStacks.

1. Entre na sua conta Expo com o EAS CLI e vincule o projeto.
2. Configure no ambiente `preview` do EAS as variáveis `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_KEY`, com os mesmos valores de `.env.local`. Use apenas a chave pública do Supabase.
3. Gere o APK.

```bash
npx eas-cli@latest build --platform android --profile preview
```

4. Instale o APK no celular ou no BlueStacks e abra o Passaporte Local diretamente.

A geração depende da conta e da disponibilidade de builds do Expo. Este procedimento não publica o aplicativo na loja.

## Verificar a integração

- Entre com uma conta Google autorizada e confira se o app retorna à tela inicial.
- Saia e entre novamente, inclusive com uma conta que já use o mesmo e-mail no aplicativo.
- Cancele a autorização e confira se é possível tentar novamente.
- Feche e abra o aplicativo para verificar a persistência da sessão.
- Confirme o nome do perfil e o acesso às visitas da conta correta.

## Referências

- [Supabase e Google](https://supabase.com/docs/guides/auth/social-sign-in/auth-google)
- [Retorno OAuth em aplicativos](https://supabase.com/docs/guides/auth/native-mobile-deep-linking)
- [Autenticação OAuth no Expo](https://docs.expo.dev/guides/authentication/)
