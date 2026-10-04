# Passaporte Local

Aplicativo mobile para registrar passeios e organizar memórias de lugares visitados. Cada visita vira um carimbo digital no passaporte pessoal do usuário.

**Autor:** Artur Teixeira  
**Instituição:** UniRios  
**Disciplina:** Desenvolvimento Mobile — Sistemas de Informação  
**Professor:** Edemilton Alcides

## Situação
Fase 1: planejamento. O aplicativo ainda não foi implementado. Apresentação prevista para 20/10/2026.

## Problema e solução
Fotos e anotações de passeios podem ficar dispersas. A proposta reúne lugar, cidade, data e impressões em um diário privado com busca e filtros. Essa necessidade será validada com potenciais usuários.

## Funcionalidades previstas
- Cadastro, login, recuperação de senha e saída.
- CRUD de visitas: criar, consultar, editar e excluir.
- Foto opcional, nota e comentário.
- Busca por lugar e filtros por cidade e categoria.
- Coleção de carimbos, totais e perfil.

## Tecnologias previstas
React Native, Expo, TypeScript e Expo Router. Supabase Auth, PostgreSQL e Storage privado. Expo ImagePicker para câmera e galeria.

## Modelo lógico previsto
`auth.users (1) — (1) perfis (1) — (0..N) visitas`

- perfis: id (PK/FK para auth.users), nome, criado_em.
- visitas: id (PK), usuario_id (FK), lugar, cidade, uf, categoria, data_visita, nota opcional, comentario opcional, foto_path opcional, criado_em e atualizado_em.
- As senhas ficam no serviço de autenticação. Fotos usam armazenamento privado. Políticas de acesso restringem os registros ao proprietário.

## Escopo
Registro manual de lugares no Brasil. Primeira versão com internet e foco inicial em Android. Mapas, feed público, recomendações e modo offline ficam para melhorias futuras.

## Acompanhamento
[GitHub Project](https://github.com/users/Artur-Txr/projects/1)

18 tarefas com responsável, prioridade, prazo e critério de aceite. Status: A Fazer, Em Desenvolvimento, Em Teste e Concluído. Atualizar conforme a evolução real.

## Cronograma
- Até 19/out: planejamento, protótipos, DER e quadro.
- 20/out: Fase 1.
- 21/out a 01/nov: estrutura, banco e autenticação.
- 02 a 15/nov: CRUD, fotos e filtros.
- 16 a 23/nov: testes, correções, README, vídeo e ensaio.
- 24 ou 26/nov: Fase 2, conforme definição do professor.

## Execução
As instruções de instalação e configuração serão adicionadas na Fase 2, após a criação do aplicativo.

## Verificações previstas
CRUD completo, persistência após reabertura, campos inválidos, falha de conexão, permissão de câmera negada e isolamento entre duas contas.
