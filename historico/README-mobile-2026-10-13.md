# Passaporte Local

Aplicativo React Native para registrar passeios, consultar lembranças e montar um passaporte de visitas. Projeto de Artur Teixeira para Desenvolvimento Mobile, UniRios, professor Edemilton Alcides.

## Estado em 13/10/2026

Implementados no código: cadastro, login, persistência de sessão, saída, criação/listagem/detalhes/edição/exclusão de visitas, avaliação de 1 a 5, fotos opcionais, passaporte, perfil, busca por lugar/cidade e filtros combinados por categoria e cidade. Sessão válida abre diretamente a coleção.

Verificados em 09/10/2026: instalação das dependências com npm ci, verificação TypeScript, 8 testes locais e exportação Android. No Expo Go do BlueStacks, login manual, criação de visita com foto da galeria, edição da avaliação para 4 estrelas e manutenção da sessão, foto e avaliação após reabrir o aplicativo foram confirmados. O total passou de 3 para 4 visitas. A existência do código não substitui os testes de cada fluxo.

Recuperação de senha implementada via link copiado do e-mail para o aplicativo. Pendentes: envio e troca real de senha, isolamento entre contas, filtros no Android, cancelamento e confirmação da exclusão, câmera, troca de foto e falha de conexão. Em 13/10/2026, a retomada no emulador encontrou falha ao baixar o aplicativo do servidor Expo; esses testes não foram concluídos nessa sessão.

## Tecnologias

React Native 0.86, Expo SDK 57, React 19, TypeScript, Expo Router, AsyncStorage, Expo ImagePicker e Supabase (Auth, PostgreSQL e Storage privado).

## Executar no Windows e BlueStacks

1. Instale Node.js 24 LTS, Git e BlueStacks. Use Expo Go compatível com SDK 57.
2. Na pasta do projeto, execute `npm ci` para instalar as versões do package-lock.json.
3. Copie `.env.example` para `.env.local` e configure a URL e a chave pública do seu projeto Supabase. Nunca use chave secret ou service_role no aplicativo.
4. Execute `Iniciar-BlueStacks.cmd` e mantenha a janela aberta.
5. No Expo Go, em Enter URL, conecte a `exp://10.0.2.2:8081`. Esse endereço corresponde ao computador na rede virtual do BlueStacks.

Para outro dispositivo, execute `npm start` e use a URL de rede exibida pelo Expo.

Verificação do código: `npm run typecheck`. Testes de validação dos links e senhas: `npm test` (Node.js 24).

O .env.local e node_modules são ignorados pelo Git. As dependências reportaram 29 vulnerabilidades na recuperação; revisar antes de uma entrega final. Não aplicar atualizações incompatíveis sem testar o Expo.

## Modelo lógico

`auth.users (1) -> (1) perfis (1) -> (0..N) visitas`

- auth.users: identidade e credenciais gerenciadas pelo Supabase Auth.
- perfis: id (PK/FK de auth.users), nome e criado_em.
- visitas: id, usuario_id (FK de perfis), lugar, cidade, uf, categoria, data_visita, comentario, avaliacao, foto_path, criado_em e atualizado_em.
- Fotos: bucket privado fotos-visitas. A visita guarda o caminho; a exibição usa URLs assinadas.
- Políticas RLS restringem os registros à conta proprietária. Scripts de estrutura e políticas estão em supabase/migrations. No projeto recuperado, o banco já existe; não reaplicar scripts indiscriminadamente.

O planejamento chama a avaliação de nota; a implementação usa o campo avaliacao.

## Checklist de demonstração e testes

- [ ] Criar conta e entrar; validar campos vazios e credenciais inválidas.
- [ ] Criar visita; conferir data inexistente/futura e campos obrigatórios.
- [ ] Consultar detalhes; combinar busca, cidade e categoria; limpar filtros.
- [x] Editar avaliação e retornar aos detalhes com o valor atualizado (BlueStacks, 09/10/2026).
- [ ] Excluir somente após confirmação; conferir atualização da coleção.
- [x] Fechar/reabrir o aplicativo e demonstrar sessão, foto e avaliação persistentes (09/10/2026). Reinício completo do dispositivo pendente.
- [ ] Confirmar que uma segunda conta não acessa visitas/fotos da primeira.
- [ ] Testar foto da galeria, câmera, permissão negada e falha de conexão.
- [x] Implementar recuperação de senha e testar validações locais.
- [ ] Validar envio de e-mail, link expirado e troca real de senha no Supabase.

## Entregas da disciplina

Fase 1: apresentação em 20 ou 22 de outubro, PDF de planejamento e link do GitHub Projects.
Fase 2: apresentação em 24 ou 26 de novembro, aplicativo funcional, repositório e README, vídeo de até 10 minutos no Google Drive. Confirmar a data individual com o professor. Envio no AVA pelo aluno.

[Quadro de acompanhamento](https://github.com/users/Artur-Txr/projects/1)

Manter o quadro e o repositório coerentes com os testes efetivamente realizados. O vídeo, a atualização do quadro e o envio ao AVA ainda estão pendentes.

## Recuperação de senha no BlueStacks

Na tela de login, toque em Esqueci minha senha, informe seu e-mail e solicite a recuperação. No e-mail, copie o endereço do botão de recuperação e cole no aplicativo. O link original é validado pelo Supabase antes de liberar a nova senha. Use pelo menos 8 caracteres e confirme a senha.

Copie o link original da mensagem: depois de abrir o link no navegador ele pode ser consumido. Se expirar ou já tiver sido usado, solicite outro e-mail. O app aceita somente links HTTPS de recuperação do projeto configurado, sem abrir o endereço de redirecionamento. Tokens e senhas não são registrados nos logs.

O envio depende da configuração de e-mail e dos limites do Supabase. O SMTP padrão pode restringir destinatários; para uso geral, configure um SMTP adequado no painel do projeto. Nenhum e-mail real foi enviado durante os testes automatizados.

## Verificação em 09/10/2026

- TypeScript: passou.
- Exportação Android com Hermes: passou.
- Testes locais de recuperação: 8 passaram (datas, links válidos, domínio/protocolo incorretos, tipo de link, token ausente e confirmação de senha).
- Revisão das políticas do Supabase: perfis e visitas restringem acesso pelo auth.uid(); Storage restringe pelo bucket privado e pasta do proprietário. Isso é revisão de configuração, não substitui teste funcional entre duas contas.


Roteiro de demonstração e testes manuais: [ROTEIRO_TESTES.md](../ROTEIRO_TESTES.md). A opção de câmera está implementada, mas precisa de teste no emulador; no BlueStacks, a captura depende da câmera disponível no computador.


## Interface baseada nos protótipos

A interface segue as telas do PDF Passaporte Local: apresentação com colagem, logo e paisagem nos formulários de conta, início com resumo e últimos carimbos, listagem separada com filtros, formulário com foto no topo, detalhes e confirmação de exclusão, perfil com cidades e navegação inferior. Os elementos decorativos foram extraídos das referências fornecidas; as visitas, contagens e fotos são dados reais da conta. Uma visita sem foto usa um marcador visual.

No navegador, a interface fica em uma moldura de até 430 px para facilitar a avaliação como aplicativo mobile. O Android ocupa a tela disponível. A recuperação de senha mantém o fluxo de link por e-mail. A captura por câmera depende do dispositivo/emulador.

## Exemplos para apresentação

Na versão de desenvolvimento, a tela Visitas oferece Adicionar exemplos do Brasil. Importa Lençóis Maranhenses, Praia do Sancho e Cataratas do Iguaçu com fotos reais, títulos DEMONSTRAÇÃO, data fictícia e sem avaliação pessoal. As fotos usam o armazenamento privado da conta. Créditos e licenças: [assets/demonstracao/CREDITOS.md](../assets/demonstracao/CREDITOS.md). O botão ignora exemplos já cadastrados com o mesmo título.


Fotos: limite atual de 20 MB por imagem (JPEG, PNG ou WebP), validado na seleção e no upload. Em 13/10/2026, o bucket privado fotos-visitas foi configurado para file_size_limit=20971520. Em outra instalação, ajuste esse limite nas configurações do bucket; a migração histórica 006 registra o limite original de 5 MB.


Carimbos: o aplicativo mantém o estilo do protótipo, com VISITADO em arco, paisagem central, bordas duplas e a data da visita abreviada. Os selos postais por estado não foram aplicados.
