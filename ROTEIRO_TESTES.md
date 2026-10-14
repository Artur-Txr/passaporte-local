# Roteiro de testes e demonstração — Passaporte Local

Use registros identificados como TESTE DEMONSTRAÇÃO para evitar confusão com visitas pessoais. Execute as operações manualmente e marque somente o que foi comprovado. Não inclua senhas, links de recuperação ou chaves no vídeo.

## Preparação

- Execute Iniciar-BlueStacks.cmd; abra exp://10.0.2.2:8081 no Expo Go.
- Separe uma imagem JPEG/PNG/WebP de até 20 MB no emulador.
- Tenha acesso ao e-mail da conta usada na demonstração.

## Fluxo completo (vídeo de até 10 minutos)

1. Explique problema, público-alvo e proposta (até 1 minuto).
2. Entre com uma conta. Observe a coleção e os totais.
3. Cadastre TESTE DEMONSTRAÇÃO, na sua cidade/UF, categoria Parque e data de hoje. Inclua comentário e avaliação.
4. Confira a visita na lista e nos detalhes. Combine busca, cidade e categoria; use Limpar busca e filtros.
5. Edite comentário, avaliação e foto. Confirme os valores nos detalhes.
6. Feche/reabra o aplicativo e mostre que a visita permanece e a sessão abre a coleção diretamente.
7. Exclua a visita de teste após confirmar; confira a coleção e os totais.
8. Apresente brevemente React Native, Expo e Supabase, o modelo de dados e as políticas por proprietário.

## Casos adicionais

| Caso | Resultado esperado | Resultado observado |
|---|---|---|
| Campos obrigatórios vazios | Mensagem; sem criação | Confirmado no navegador e no BlueStacks em 09/10/2026 |
| Data futura ou 31/02 | Mensagem; sem criação | 31/02/2026 rejeitada no navegador em 09/10/2026; futuro coberto por teste local; pendente no emulador |
| Cancelar escolha de imagem | Mantém foto atual | Confirmado no BlueStacks em 13/10/2026, na edição de Cataratas do Iguaçu |
| Imagem acima de 20 MB | Rejeita antes do envio | Pendente |
| Tirar foto | Solicita permissão e mostra prévia | Pendente |
| Negar permissão de câmera | Mensagem e galeria disponível | Pendente |
| Queda de internet ao salvar | Mensagem, preserva formulário | Pendente |
| Recuperar senha | E-mail, link validado, nova senha salva | Pendente real |
| Link de recuperação expirado/usado | Mensagem; permite solicitar outro | Pendente real |
| Conta B após saída da conta A | Não exibe registros/fotos da A | Pendente real |
| Cancelar exclusão | Preserva a visita | Pendente |

## Evidências automáticas

Em 09/10/2026: npm run typecheck passou; npm test passou com 8 testes. Os testes locais cobrem links/senhas e datas. A compilação Android verifica o empacotamento, não comprova os fluxos com Supabase ou câmera.

Para registrar uma evidência real, anote data, dispositivo, caso, resultado e captura sem dados sensíveis. Atualize o GitHub Projects com base nos resultados. O código foi publicado no GitHub. Vídeo/Drive, quadro de acompanhamento e AVA ainda estão pendentes.

## Evidências no navegador e Android

Em 09/10/2026, no navegador localhost:8082, os seletores de UF e categoria funcionaram. O formulário vazio e a data 31/02/2026 exibiram erros na tela. Nenhum registro foi alterado nessa verificação.

No BlueStacks, após login manual, o início exibiu 3 visitas e 1 cidade. O formulário vazio exibiu alerta nativo e erro na tela. Após importação e seleção manual da paisagem pelo usuário, a prévia foi exibida.

A criação de teste foto android (salvador/BA, Parque, 09/10/2026) foi confirmada: o total passou para 4 visitas; miniatura e foto dos detalhes carregaram após o envio. A avaliação foi editada para 4 estrelas e os detalhes mostraram o novo valor com a foto mantida.

Após sair do Expo Go e reabrir pelo usuário, a sessão permaneceu ativa e a visita manteve foto e avaliação 4/5. Reinício completo do dispositivo, troca de foto, filtros e exclusão ainda não foram comprovados. O registro de teste foi mantido.

Em 13/10/2026, o BlueStacks e o Expo Go foram abertos, mas o aplicativo não carregou: Expo Go informou Failed to download remote update. O servidor iniciado nesta sessão não ficou acessível ao emulador. Para retomar, execute Iniciar-BlueStacks.cmd no Windows, mantenha a janela aberta e conecte a exp://10.0.2.2:8081. Nenhuma alteração de visita foi feita nessa sessão.

Em 13/10/2026, após iniciar o Expo pelo launcher no Windows e login manual: busca por teste foto android retornou somente essa visita; cidade Salvador/BA combinada com categoria Museu exibiu lista vazia; Limpar busca e filtros restaurou as quatro visitas. Detalhes mantiveram foto e avaliação 4/5. A confirmação de exclusão foi aberta e cancelada, preservando a visita. Exclusão definitiva não executada. A sessão anterior não abriu autenticada nesta retomada; login foi necessário, portanto persistência após reinício completo ainda precisa de investigação.

Em 13/10/2026, três exemplos autorizados para apresentação foram importados pelo app autenticado. Miniaturas dos três destinos carregaram no BlueStacks; detalhes de Praia do Sancho mostraram fotografia, indicação de exemplo, data fictícia e créditos. Consulta ao banco confirmou os três registros com foto_path preenchido. Nenhuma visita foi excluída pelo importador.

Em 13/10/2026: limite aumentado para 20 MB no app e no bucket privado. TypeScript e 10 testes passaram, incluindo aceitação de 8 MB/20 MB e rejeição acima do limite. Carimbo redesenhado com VISITADO em arco, paisagem, bordas duplas e data abreviada, conferido visualmente no BlueStacks. Envio real de foto acima de 5 MB ainda pendente.


Em 13/10/2026: perfil revisado no BlueStacks com logo reconstruído em elementos nativos e texto completo, ícones de localização/cidade/nome/e-mail padronizados e cartões de cidades com ilustrações em estilo postal. Os nomes Foz do Iguaçu, Fernando de Noronha e Barreirinhas ficaram legíveis. Lista de visitas conferida com busca, localização, calendário e categoria em ícones consistentes. TypeScript passou. Ilustrações de cidades são decorativas geradas, não fotografias das visitas.


## Revisão de 13/10/2026 — versão atual

- O usuário confirmou que o projeto abriu no celular Android pelo túnel e voltou a abrir no BlueStacks pela rede local.
- Início, perfil, lista e detalhes dos exemplos foram conferidos no BlueStacks. A fotografia ampliada abriu inteira e o botão Fechar foto retornou aos detalhes.
- Formulários de nova visita e edição foram conferidos sem salvar alterações. O teclado virtual não apareceu porque o emulador usa teclado físico; esse cenário permanece pendente no celular.
- Logo original recuperado do PDF; a reconstrução anterior foi substituída. O último recorte limpo ainda requer confirmação após recarregar o app.
- Layouts adaptados para largura pequena, fonte ampliada e telas grandes; confirmação visual em múltiplos tamanhos ainda pendente.
- Data com barras automáticas verificada com entrada numérica, data já formatada, entrada parcial, vazia e caracteres extras.
- TypeScript e 12 testes passaram; exportação web compilou. Esses resultados não comprovam câmera, recuperação de senha ou funcionamento em todos os dispositivos.
- No formulário de edição, a ação de substituir uma foto existente passou a se chamar Alterar foto e ocupa menos espaço.

Para celular, execute Iniciar-Celular.cmd e escaneie o novo QR do túnel. Para BlueStacks, execute Iniciar-BlueStacks.cmd e conecte a exp://10.0.2.2:8081. Mantenha o terminal correspondente aberto.

Em 13/10/2026: no BlueStacks, a galeria Android abriu a partir de Nova visita. Cancelar pelo X retornou ao formulário vazio, sem foto e sem salvar registros. Isso comprova cancelamento em uma nova visita; manter a foto existente ao cancelar uma substituição ainda está pendente. A tela ainda mostrava a instrução antiga de digitar barras, indicando que as últimas alterações não estavam carregadas nessa verificação. Recuperação de senha revisada no código, sem enviar e-mail ou alterar senha; teste real permanece pendente.

Em 13/10/2026, após recarregar: logo limpo e controle compacto Alterar foto conferidos no BlueStacks. Na edição de Cataratas do Iguaçu, a galeria abriu; fechar pelo X manteve a fotografia original e os campos da visita. Nenhuma alteração foi salva. Substituição efetiva com envio de nova foto, câmera e recuperação de senha permanecem pendentes.

## Revisão de permissões — 13/10/2026

Consulta somente de leitura ao Supabase confirmou RLS ativo em public.visitas, public.perfis e storage.objects. As políticas de visitas exigem auth.uid() = usuario_id, incluindo USING e WITH CHECK na edição. Perfis são restritos ao próprio id. Fotos exigem bucket fotos-visitas e primeira pasta igual ao usuário autenticado. Bucket privado com limite de 20 MB e MIME JPEG/PNG/WebP. O app recria o estado de visitas quando muda o usuário, consulta e altera registros filtrando usuario_id e valida a propriedade do caminho de foto.

O verificador de segurança retornou alertas de EXECUTE para anon/authenticated na função public.rls_auto_enable(), que retorna event_trigger e ativa RLS em novas tabelas. Não foi demonstrada execução dessa função por RPC nem exploração; avaliar as permissões antes de modificar. Também apontou proteção contra senhas vazadas desativada; a documentação informa disponibilidade no plano Pro ou superior. Nenhuma configuração do banco, senha ou plano foi alterada nesta revisão. O teste real com duas contas ainda permanece pendente. Câmera e galeria foram adiadas pelo usuário para validação no celular.

Em 13/10/2026, o acesso EXECUTE de PUBLIC, anon e authenticated à função interna public.rls_auto_enable() foi revogado. Verificação confirmou anon=false, authenticated=false, postgres=true e event trigger ensure_rls ainda habilitado. Os dois alertas dessa função desapareceram no verificador Supabase. Permaneceu apenas o alerta de proteção contra senhas vazadas desativada. O SQL aplicado está em supabase/security/restringir_funcao_rls.sql. Visitas, fotos, senhas e plano não foram alterados.

Em 14/10/2026: os exemplos antigos já não estavam na conta de Artur; existia Mirante do Santinho, com foto e data 03/10/2026, preservado sem edição. Axia (10/10/2026) e Touro e a Sucuri (05/10/2026) foram adicionados pela sessão autenticada do app com as fotografias fornecidas. Datas dos dois novos registros são aproximadas e isso consta nos comentários. Banco e miniaturas no BlueStacks confirmaram exatamente as três visitas com foto. O importador temporário foi retirado da tela para não recriar registros. Fotos pessoais permanecem fora do Git e estão no armazenamento privado; ZIP pessoal atualizado inclui cópia das imagens.

Em 14/10/2026: adicionada atualização manual nas telas Início e Visitas, pelo gesto de puxar para baixo ou pelo botão Atualizar. Registros existentes continuam visíveis durante a consulta e em caso de falha; filtros são preservados. TypeScript e git diff --check passaram. Validação do gesto no BlueStacks e da atualização entre dois dispositivos ainda pendente.

Em 14/10/2026: o usuário confirmou que câmera e galeria funcionaram no celular Android. Validação informada pelo usuário; não houve observação direta desta execução. Essa confirmação não comprova, por si só, envio acima de 5 MB, persistência após salvar ou todos os cenários de permissões.

Em 14/10/2026: o usuário confirmou o teste de cadastrar uma visita com foto, salvar, fechar e reabrir o aplicativo no Android. A visita e a imagem continuaram aparecendo. Resultado informado pelo usuário.

Em 14/10/2026: o usuário confirmou o teste de editar uma visita de teste, salvar e reabrir seus detalhes. A alteração permaneceu salva. Resultado informado pelo usuário; não especificado se o campo alterado foi nome ou comentário.

Em 14/10/2026: o usuário confirmou o roteiro de exclusão na visita de teste: cancelar manteve a visita; confirmar removeu o registro; após reabrir o app, a exclusão permaneceu e os totais refletiram a mudança. Resultado informado pelo usuário.

Em 14/10/2026: o usuário confirmou o teste de busca por Axia, filtro por cidade, filtro por categoria e limpeza dos filtros, restaurando a lista de visitas. Resultado informado pelo usuário no celular Android.

Em 14/10/2026: o usuário confirmou sair da conta, entrar novamente com a mesma conta, visualizar suas visitas e fotos e fechar/reabrir o aplicativo mantendo a sessão no Android. Resultado informado pelo usuário. Esse teste não verifica isolamento entre duas contas nem recuperação de senha.

Em 14/10/2026: executados 12 testes automatizados (todos passaram), incluindo cinco casos de recuperação: extração de token, rejeição de links indevidos e validação da nova senha. TypeScript passou. Teste real de resetPasswordForEmail para a conta de Artur retornou HTTP 429, código over_email_send_rate_limit (email rate limit exceeded). A solicitação foi recusada pelo limite de envio do serviço; entrega do e-mail, consumo do link e alteração real da senha não foram validados. Nenhuma senha foi alterada.

Em 14/10/2026: adicionada a ação Já tenho um link de recuperação na etapa inicial, permitindo colar e validar um link recebido sem solicitar novo envio. Isso evita bloquear o acesso à etapa do link quando resetPasswordForEmail retorna 429; o limite do serviço permanece. TypeScript e git diff --check passaram. Validação visual no Android pendente.


Em 14/10/2026: implementadas as melhorias da revisão: formulário de edição montado após carregar dados; proteção de descarte e saída durante operação; estados de carregamento/erro em detalhes e passaporte; recuperação/renovação de fotos e miniaturas; diário de uploads com conferência após 24 horas; normalização de cidades; feedback web e erros traduzidos; identidade de instalação e IP local automático. Quinze testes passaram, TypeScript passou e exportação web compilou. Testes de tela das novas confirmações e falhas de rede no Android ainda pendentes; navegador integrado não alcançou os servidores locais. Ver REVISAO_APP.md para limitações da limpeza de uploads e demais validações físicas. SMTP permanece adiado.

Em 14/10/2026: exportação Android/Hermes compilou 1364 módulos, usando pasta temporária dentro do workspace. Não foi gerado/instalado APK nesta etapa.

Em 14/10/2026: corrigida a inicialização para chamar o arquivo real do Expo pelo Node, sem depender do atalho expo.cmd. Novos iniciadores verificam Node, dependências, configuração e porta; instalam dependências ausentes e não mudam silenciosamente a porta. Verificações de PC e Wi-Fi passaram, inclusive pelo helper CMD. Dezenove testes passaram e TypeScript passou. Pacote web portátil preparado com Node Windows x64; hash comparado com SHASUMS256 oficial e licença incluída. Smoke test com o Node incluído confirmou /inicio e bundle JavaScript real sem node_modules. Rede real da faculdade, login no navegador do pacote e nova abertura do Expo Go no celular ainda precisam de conferência no destino. Pacote precisa de internet para Supabase.


Em 14/10/2026: refinamento visual baseado nas sete capturas do celular: cabeçalhos alinhados, logo original preservada, espaço vertical de login/cadastro equilibrado, cartão de cidade com foto e quantidade, cartões de visitas sem paisagem repetida, botão Atualizar com ícone, dica para ampliar foto e carimbo com nome maior. A observação exata de data aproximada foi separada da lembrança na apresentação, mantendo o comentário no banco. Rio do Sal/BA agrupa com Paulo Afonso nos totais/filtros e mantém a localidade visível. 22 testes e TypeScript passaram; testes novos confirmam agrupamento sem mutar visitas e preservação de texto pessoal. Conferência visual final no Android pendente após recarregar.

A versão final do refinamento compilou para web (924 módulos) e Android/Hermes (1361 módulos). Pacote portátil regenerado com a nova interface; comparação visual em dispositivo real continua pendente.
