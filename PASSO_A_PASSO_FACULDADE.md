# Passaporte Local — abrir na faculdade

Para **apresentar no PC sem instalar ferramentas**, use o pacote separado **Passaporte-Local-Apresentacao-PC.zip**, extraia tudo e execute **Abrir-App.cmd**. Ele já contém a versão web e Node.js para Windows x64. Veja APRESENTACAO_FACULDADE.md. Ainda precisa de internet para login, visitas e fotos.

Os passos abaixo são para abrir e desenvolver o **código-fonte**, inclusive no Expo Go do celular. Os iniciadores Iniciar-PC.cmd e Iniciar-Celular-WiFi.cmd verificam as dependências e instalam pelo lockfile quando faltarem. Não é necessário instalar Expo globalmente.

O ZIP inclui código, imagens, suas três fotografias e configuração pública do cliente Supabase. Não inclui senha da conta, chave administrativa, node_modules ou histórico Git.

## Preparar o computador

1. Instale Node.js 24, versão usada neste projeto: https://nodejs.org/
2. Instale VS Code: https://code.visualstudio.com/
3. Extraia o ZIP. Não execute diretamente dentro do arquivo compactado.
4. No VS Code, use Arquivo > Abrir pasta e selecione a pasta passaporte-local extraída, onde está package.json.
5. Abra Terminal > Novo terminal. Os comandos abaixo são para PowerShell no Windows.

## Instalar dependências — primeira vez

```powershell
node --version
npm.cmd --version
npm.cmd ci
```

A instalação precisa de internet. Git não é necessário para usar o ZIP. O arquivo .env.local acompanha a configuração pública necessária para conectar ao mesmo Supabase.

## Abrir no celular Android

Instale Expo Go compatível com Expo SDK 57 no celular. Com computador e celular conectados à internet, execute:

```powershell
$env:REACT_NATIVE_PACKAGER_HOSTNAME = ""
$env:EXPO_PACKAGER_PROXY_URL = ""
npm.cmd start -- --go --tunnel --port 8083
```

Espere o novo QR aparecer e escaneie no Expo Go. Mantenha o terminal e o computador ligados. O túnel permite que o celular use outra rede, mas depende de acesso ao serviço de túnel pela internet. Se o Expo pedir login, use a mesma conta Expo no computador e no Expo Go. A conta Expo é separada da conta do Passaporte Local.

## Abrir no navegador do computador

Em outro terminal ou após parar o anterior com Ctrl+C:

```powershell
npm.cmd start -- --web --port 8082
```

Abra http://localhost:8082 no navegador do computador. Entre com sua conta do Passaporte Local para consultar suas visitas. A senha não acompanha o ZIP.

## Abrir no BlueStacks

Instale BlueStacks e Expo Go se desejar usar emulador. Na pasta extraída, execute Iniciar-BlueStacks.cmd e abra exp://10.0.2.2:8081 no Expo Go do BlueStacks. Esse endereço é específico do emulador; não o use no celular físico.

## Alternativa na mesma rede

Se o túnel estiver bloqueado, execute `Iniciar-Celular-WiFi.cmd`. O iniciador detecta o IP local do computador, evitando usar o endereço do BlueStacks no celular. Alternativamente:

```powershell
$env:REACT_NATIVE_PACKAGER_HOSTNAME = ""
$env:EXPO_PACKAGER_PROXY_URL = ""
npm.cmd start -- --go --lan --port 8081
```

Computador e celular devem estar na mesma rede local. Escaneie o QR novo. Redes da faculdade podem bloquear comunicação entre aparelhos ou o serviço de túnel. Nesse caso, use uma rede que permita conexão ou abra no navegador do próprio computador.

## Fotos e visitas pessoais

As fotos de Axia, Touro e a Sucuri e Mirante do Santinho estão em assets/visitas-pessoais, sem edição. As três visitas já estão salvas na conta de Artur no Supabase: entre com a mesma conta para vê-las em qualquer dispositivo. Não é preciso importar novamente. Os exemplos antigos não estão mais nessa conta.

Axia foi cadastrada com data aproximada de 10/10/2026 e Touro e a Sucuri com 05/10/2026. O Mirante existente foi preservado com 03/10/2026 e a localidade Povoado Rio de Sal/BA.

As fotos estão incluídas no ZIP para transporte pessoal e não foram publicadas no GitHub. Mantenha o ZIP para seu uso. O aplicativo carrega as fotos do armazenamento privado da conta.

## Atualizar e verificar

Pressione r no terminal do Expo para recarregar. Ctrl+C encerra o servidor.

```powershell
npm.cmd run typecheck
npm.cmd test
```

Login, consultas e envio de visitas/fotos dependem de internet. O ZIP não é um backup do banco de dados.
