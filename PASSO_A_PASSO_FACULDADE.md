# Abrir o projeto e desenvolver

## Apenas apresentar

Abra https://artur-txr.github.io/passaporte-local/ ou baixe o PDF em `docs/apresentacao/`. A apresentação pública não precisa de npm ou Expo. Veja [APRESENTACAO_FACULDADE.md](APRESENTACAO_FACULDADE.md).

## Protótipo estático

Baixe ou clone o repositório e abra `docs/index.html`, mantendo a pasta `docs/assets/` completa. Este protótipo é independente do aplicativo Expo e salva dados somente no navegador.

## Aplicativo React Native / Expo

1. Instale Node.js 24 e abra esta pasta no VS Code.
2. Execute `npm.cmd ci` para usar as versões do lockfile.
3. Copie `.env.example` para `.env.local` e preencha a URL e a chave pública do seu projeto Supabase. O `.env.local` não acompanha o repositório. Não use chave administrativa no cliente.
4. Confira se o banco e o Storage desse ambiente correspondem ao código. As migrações registram o histórico, não uma autorização para reaplicar scripts em um banco existente.
5. Escolha um dos modos abaixo e mantenha o terminal aberto.

```powershell
npm.cmd run abrir:pc
# Ou use um dos iniciadores:
.\Iniciar-Celular-WiFi.cmd
.\Iniciar-Celular.cmd
.\Iniciar-BlueStacks.cmd
```

- PC: navegador local, porta 8082.
- Celular Wi-Fi: PC e celular no mesmo roteador, porta 8084. Escaneie o novo QR no Expo Go compatível com o projeto.
- Celular por túnel: porta 8083. Depende do serviço de túnel e pode falhar conforme a rede.
- BlueStacks: `exp://10.0.2.2:8081`. Esse endereço não serve para celular físico.

Se uma porta estiver ocupada, feche apenas o terminal anterior desse modo. Os iniciadores não encerram processos de terceiros.

## Conferência local

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run verificar:prototipo
```

Câmera e galeria do aplicativo devem ser verificadas em celular físico. O código de uma integração e um teste automatizado não substituem o teste real do dispositivo e do backend.

## Pacote Windows anterior

O empacotador `scripts/empacotar-apresentacao.cjs` exige uma exportação web, Windows x64 e as licenças/verificação da mesma versão do Node. Informe a pasta de licenças como quarto argumento da linha de comando, após os caminhos de origem e destino. Esse pacote não é necessário para abrir o GitHub Pages.
