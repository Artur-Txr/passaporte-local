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

Para registrar uma evidência real, anote data, dispositivo, caso, resultado e captura sem dados sensíveis. Atualize o GitHub Projects com base nos resultados. O código foi publicado no GitHub. Vídeo/Drive, quadro de acompanhamento e AVA ainda estão pendentes.

## Evidências no navegador e Android

Em 09/10/2026, no navegador localhost:8082, os seletores de UF e categoria funcionaram. O formulário vazio e a data 31/02/2026 exibiram erros na tela. Nenhum registro foi alterado nessa verificação.

No BlueStacks, após login manual, o início exibiu 3 visitas e 1 cidade. O formulário vazio exibiu alerta nativo e erro na tela. Após importação e seleção manual da paisagem pelo usuário, a prévia foi exibida.

A criação de teste foto android (salvador/BA, Parque, 09/10/2026) foi confirmada: o total passou para 4 visitas; miniatura e foto dos detalhes carregaram após o envio. A avaliação foi editada para 4 estrelas e os detalhes mostraram o novo valor com a foto mantida.

Após sair do Expo Go e reabrir pelo usuário, a sessão permaneceu ativa e a visita manteve foto e avaliação 4/5. Reinício completo do dispositivo, troca de foto, filtros e exclusão ainda não foram comprovados. O registro de teste foi mantido.

Em 13/10/2026, o BlueStacks e o Expo Go foram abertos, mas o aplicativo não carregou: Expo Go informou Failed to download remote update. O servidor iniciado nesta sessão não ficou acessível ao emulador. Para retomar, execute Iniciar-BlueStacks.cmd no Windows, mantenha a janela aberta e conecte a exp://10.0.2.2:8081. Nenhuma alteração de visita foi feita nessa sessão.
