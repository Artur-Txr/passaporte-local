# Passaporte Local

Aplicativo React Native para registrar passeios, consultar lembranças e montar um passaporte de visitas. Projeto de Artur Teixeira para Desenvolvimento Mobile, UniRios, professor Edemilton Alcides.

## Estado em 09/10/2026

Implementados no código: cadastro, login, persistência de sessão, saída, criação/listagem/detalhes/edição/exclusão de visitas, avaliação de 1 a 5, fotos opcionais, passaporte, perfil, busca por lugar/cidade e filtros combinados por categoria e cidade. Sessão válida abre diretamente a coleção.

Verificados: instalação das dependências com npm ci, verificação TypeScript, resposta do serviço Supabase Auth e abertura do app no Expo Go do BlueStacks. A existência do código não substitui os testes de cada fluxo.

Recuperação de senha implementada via link copiado do e-mail para o aplicativo. Pendente: teste real de envio e troca de senha, teste completo com uma conta, isolamento entre contas, fotos/câmera e evidências de persistência após reabertura. Não considerar essas etapas concluídas antes de validar.

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
- [ ] Editar e retornar aos detalhes com os valores atualizados.
- [ ] Excluir somente após confirmação; conferir atualização da coleção.
- [ ] Fechar/reabrir e demonstrar sessão e visitas persistentes.
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


Roteiro de demonstração e testes manuais: [ROTEIRO_TESTES.md](ROTEIRO_TESTES.md). A opção de câmera está implementada, mas precisa de teste no emulador; no BlueStacks, a captura depende da câmera disponível no computador.


## Interface baseada nos protótipos

A interface segue as telas do PDF Passaporte Local: apresentação com colagem, logo e paisagem nos formulários de conta, início com resumo e últimos carimbos, listagem separada com filtros, formulário com foto no topo, detalhes e confirmação de exclusão, perfil com cidades e navegação inferior. Os elementos decorativos foram extraídos das referências fornecidas; as visitas, contagens e fotos são dados reais da conta. Uma visita sem foto usa um marcador visual.

No navegador, a interface fica em uma moldura de até 430 px para facilitar a avaliação como aplicativo mobile. O Android ocupa a tela disponível. A recuperação de senha mantém o fluxo de link por e-mail. A captura por câmera depende do dispositivo/emulador.
