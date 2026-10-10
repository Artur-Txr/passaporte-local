# Roteiro de testes e demonstração — Passaporte Local

Use registros identificados como TESTE DEMONSTRAÇÃO para evitar confusão com visitas pessoais. Execute as operações manualmente e marque somente o que foi comprovado. Não inclua senhas, links de recuperação ou chaves no vídeo.

## Preparação

- Execute Iniciar-BlueStacks.cmd; abra exp://10.0.2.2:8081 no Expo Go.
- Separe uma imagem JPEG/PNG/WebP de menos de 5 MB no emulador.
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
| Cancelar escolha de imagem | Mantém foto atual | Pendente |
| Imagem acima de 5 MB | Rejeita antes do envio | Pendente |
| Tirar foto | Solicita permissão e mostra prévia | Pendente |
| Negar permissão de câmera | Mensagem e galeria disponível | Pendente |
| Queda de internet ao salvar | Mensagem, preserva formulário | Pendente |
| Recuperar senha | E-mail, link validado, nova senha salva | Pendente real |
| Link de recuperação expirado/usado | Mensagem; permite solicitar outro | Pendente real |
| Conta B após saída da conta A | Não exibe registros/fotos da A | Pendente real |
| Cancelar exclusão | Preserva a visita | Pendente |

## Evidências automáticas

Em 09/10/2026: npm run typecheck passou; npm test passou com 8 testes. Os testes locais cobrem links/senhas e datas. A compilação Android verifica o empacotamento, não comprova os fluxos com Supabase ou câmera.

Para registrar uma evidência real, anote data, dispositivo, caso, resultado e captura sem dados sensíveis. Atualize o GitHub Projects com base nos resultados. O envio ao GitHub, vídeo/Drive e AVA ainda não foi realizado.

## Verificação do novo visual (09/10/2026)

No navegador localhost:8082, os seletores de UF e categoria funcionaram. O formulário vazio e a data 31/02/2026 exibiram erros na própria tela após correção. Nenhuma visita foi criada, alterada ou excluída nessa verificação. Criação, edição e exclusão completas com foto ainda precisam de demonstração no Expo Go.

No BlueStacks em 09/10/2026: Expo Go conectado a exp://10.0.2.2:8081, pacote Android carregado e tela de boas-vindas confirmada. Login manual pendente; testes de visitas/fotos ainda pendentes no dispositivo.

Após login manual no BlueStacks: início exibiu 3 visitas e 1 cidade; formulário vazio exibiu alerta nativo e erro na tela. Seletor Android de fotos abriu, mas a galeria está vazia; envio e prévia de foto não foram comprovados.

Foto no Android: após importação manual da paisagem e seleção pelo usuário, prévia confirmada no formulário Nova visita. Envio ao armazenamento ainda não testado; formulário não foi salvo.
