# Passaporte Local — apresentação

## No computador da faculdade: pacote pronto

Use **Passaporte-Local-Apresentacao-PC.zip**, para Windows de 64 bits.

1. Copie o ZIP para o computador e **extraia tudo** para uma pasta. Não execute dentro do ZIP.
2. Abra **Abrir-App.cmd**. O navegador deve abrir em **http://localhost:8090**. Se não abrir automaticamente, digite esse endereço.
3. Mantenha a janela do terminal aberta durante a apresentação.
4. Entre com sua conta do Passaporte Local. As visitas e fotos vêm do Supabase e precisam de internet.
5. Ao terminar, saia da conta no app e feche o terminal com Ctrl+C, especialmente em computador compartilhado.

O pacote já contém a versão web compilada e Node.js. Não precisa instalar Node, Expo, VS Code, npm ou BlueStacks, nem baixar dependências. Não inclui sua senha. As fotos pessoais continuam no armazenamento privado da conta. A licença do Node acompanha o pacote.

Não abra web/index.html diretamente: use Abrir-App.cmd, que serve corretamente os scripts e as rotas do app.

## No celular Android: versão nativa

Use a pasta do **projeto completo**, com Node.js 24 instalado no computador, e Expo Go compatível com SDK 57 no celular.

1. Conecte o celular ao Wi-Fi do mesmo roteador do PC (o PC pode estar por cabo).
2. Abra **Iniciar-Celular-WiFi.cmd** na pasta do projeto.
3. Se faltarem dependências, o iniciador executa a instalação pelo package-lock.json. Precisa de internet nessa etapa.
4. Aguarde o QR e escaneie no Expo Go. Mantenha o terminal aberto.
5. Se a rede impedir a conexão entre aparelhos, tente **Iniciar-Celular.cmd**, que usa túnel. O túnel depende de um serviço externo e pode falhar.

O endereço 10.0.2.2 é exclusivo do BlueStacks; não use no celular físico.

## Outros modos

- **Iniciar-PC.cmd**, na pasta do projeto: desenvolvimento no navegador, em localhost:8082. Precisa de Node e dependências (instaladas automaticamente se ausentes).
- **Iniciar-BlueStacks.cmd**: Expo Go do emulador, em exp://10.0.2.2:8081.
- **Abrir-App-na-Rede.cmd**, no pacote pronto: consulta pelo navegador do celular no mesmo roteador, usando o endereço mostrado. A rede e o firewall precisam permitir. Câmera nativa deve ser testada pelo Expo Go; câmera no navegador em HTTP pela rede pode ficar indisponível.

## Conferir antes do dia

- Teste Abrir-App.cmd no computador da sala antes da apresentação. Políticas da faculdade podem bloquear executáveis portáteis ou acesso ao Supabase; o pacote não remove essas restrições.
- Leve o pacote pronto e o ZIP do código em um pendrive.
- Abra a conta e confira as três visitas, fotos e carimbos. Você pode usar o pacote pronto no PC e o Expo Go no celular ao mesmo tempo: não precisam do mesmo servidor.
- Tenha internet para os dados. A interface está incluída no pacote, mas o app não é uma demonstração offline dos seus registros.
- Se aparecer porta ocupada, feche o terminal anterior do mesmo modo e tente novamente. Os iniciadores não encerram processos por conta própria nem mudam silenciosamente a porta.
- O pacote web não substitui um APK. Um APK independente do computador é uma próxima opção de distribuição e ainda não está incluído.
