# Passaporte Local

Comunidade de passeios, lugares e memórias pelo Brasil, desenvolvida com React Native, Expo, TypeScript e Supabase.

## Explorar o protótipo

**[Abrir protótipo navegável com HTTPS](https://artur-txr.github.io/passaporte-local/)**


![Capa editorial do Passaporte Local](docs/apresentacao/slides/Slide_01.png)

## Duas versões no mesmo repositório

| | Protótipo público | Base do aplicativo mobile |
|---|---|---|
| Local | `docs/` | `src/`, `assets/`, `supabase/` |
| Tecnologia | HTML, CSS e JavaScript | React Native, Expo, TypeScript, Expo Router |
| Acesso | Simulado, com dados fictícios | Autenticação real com Supabase Auth |
| Persistência | IndexedDB do navegador | Visitas, perfis, álbuns e interações no Supabase |
| Fotos por visita | Até cinco, com capa | Até cinco fotos, com capa e galeria |
| Identidade | Nova logo, três paletas | Azul-petróleo e coral, Manrope e nova logo |

O site demonstra 17 telas e estados de interface, com 13 visitas, nove cidades e 27 fotografias reais. Datas, avaliações e comentários dos exemplos são fictícios. As fotografias não representam viagens pessoais do autor.

Login no protótipo não cria uma conta real. Dados inseridos ficam neste navegador e não sincronizam com outros aparelhos. Acesso inicial ao site e downloads exigem internet. Recuperação de senha, ajuda e backup não integram a versão pública de 17 telas.

O aplicativo mobile possui login, recuperação de senha, edição de perfil e foto, visitas públicas para contas conectadas, álbuns de até cinco fotos, curtidas, comentários, favoritos e notificações dentro do app. Rascunhos de texto são guardados no aparelho e as novas fotos são otimizadas antes do envio.

O mapa permite marcar o local de uma visita pelo cadastro ou pela edição. Somente visitas com localização marcada aparecem nele. As telas mobile seguem a paleta petróleo e coral. Avaliações e carimbos foram retirados dos fluxos do app.

## Desenvolver a base mobile

Use Node.js 24 e o lockfile versionado:

```powershell
npm.cmd ci
Copy-Item .env.example .env.local
# Configure a URL e a chave pública do seu próprio projeto Supabase.
npm.cmd run abrir:pc
```

Outros modos: `Iniciar-Celular-WiFi.cmd`, `Iniciar-Celular.cmd` e `Iniciar-BlueStacks.cmd`.

`10.0.2.2` serve para o BlueStacks. No celular físico, use a URL que o iniciador mostrar. Nenhum `.env.local`, senha, chave administrativa ou dependência instalada faz parte deste repositório.

## Verificações

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run verificar:prototipo
```

O verificador do protótipo usa apenas Node.js e confere as 17 telas, os dados demonstrativos, os arquivos de fotos, as variantes da marca e referências locais. A revisão atual está em [REVISAO_APP.md](REVISAO_APP.md).

## Rodar no celular ou no BlueStacks

Instale o Expo Go compatível com o SDK 57 em Android. Depois de instalar as dependências e configurar o Supabase, execute:

```bash
npx expo start --lan
```

No celular, conecte à mesma rede do computador e escaneie o QR code. Para o BlueStacks, execute `npx expo start --localhost` e digite `exp://10.0.2.2:8081` no Expo Go. Use a porta informada pelo terminal.

## Banco de dados

Para preparar um projeto Supabase novo, aplique primeiro os arquivos de `supabase/migrations/` em ordem. Depois aplique estes arquivos uma vez, nesta sequência:

1. `supabase/comunidade-social.sql`
2. `supabase/perfis-publicos-e-categorias.sql`
3. `supabase/resumo-viajante.sql`
4. `supabase/busca-lugares.sql`
5. `supabase/favoritos-notificacoes-localizacao.sql`

As políticas restringem a edição das visitas ao autor, os favoritos ao dono da conta e a leitura das notificações ao destinatário. O bucket de fotos usa URLs assinadas para contas conectadas. Os SQL acima correspondem às alterações já aplicadas no projeto utilizado durante o desenvolvimento.

## Validação

TypeScript e 27 testes automatizados passaram em 14 de novembro de 2026. Foram exportados bundles Android e web e verificados no banco os fluxos de leitura entre contas, curtidas, comentários, favoritos, notificações e coordenadas. Os novos fluxos ainda precisam de conferência final em celular físico.

[Quadro informado do projeto](https://github.com/users/Artur-Txr/projects/1). Este quadro não foi alterado na revisão. Vídeo e envio ao AVA continuam sendo etapas separadas.

## Organização e fontes

- `docs/`: versão publicada pelo GitHub Pages, usando `main` e `/docs`.
- `docs/apresentacao/`: material acadêmico atual, com um único exemplar de cada entrega.
- `historico/`: documentação anterior preservada para consulta, sem substituir as instruções atuais.
- `supabase/migrations/`: histórico do banco mobile. Não reaplique nem apague migrações sem conferir o ambiente.
- [Créditos do protótipo](docs/CREDITOS.md) e [exemplos do mobile](assets/demonstracao/CREDITOS.md).
