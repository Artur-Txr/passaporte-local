# Passaporte Local

Projeto de [Artur-Txr](https://github.com/Artur-Txr).

Aplicativo mobile para registrar passeios, guardar fotos e compartilhar descobertas pelo Brasil. Cada visita reúne o lugar, a cidade, a data e as lembranças do passeio. A comunidade permite conhecer outros viajantes, curtir publicações e comentar.

[Abrir o protótipo](https://artur-txr.github.io/passaporte-local/)

![Passaporte Local](docs/apresentacao/slides/Slide_01.png)

## Recursos

- Cadastro, login e recuperação de senha.
- Perfil com nome e fotografia.
- Visitas com até cinco fotos e escolha da capa.
- Busca por lugar ou cidade e filtros por categoria.
- Publicações, perfis públicos, curtidas e comentários.
- Lista Quero conhecer para salvar lugares.
- Notificações de interações nas próprias visitas.
- Mapa com localização escolhida no cadastro ou na edição.
- Rascunhos dos textos de visitas e comentários.
- Otimização das novas fotografias antes do envio.

A identidade visual usa azul-petróleo, coral e a fonte Manrope.

## Tecnologias

React Native, Expo SDK 57, TypeScript, Expo Router e Supabase. Os mapas usam Leaflet e OpenStreetMap.

## Executar o aplicativo

Use Node.js 24 e instale as dependências pelo lockfile.

```bash
npm ci
```

Copie `.env.example` para `.env.local` e configure a URL e a chave pública do projeto Supabase.

### Celular Android

Instale o Expo Go compatível com o SDK 57. Conecte o celular e o computador à mesma rede e execute:

```bash
npx expo start --lan
```

Escaneie o QR code pelo Expo Go. Para recarregar o app, pressione `r` no terminal.

### BlueStacks

Abra o Expo Go 57 no emulador e execute no computador:

```bash
npx expo start --localhost
```

No Expo Go, use `exp://10.0.2.2:8081`. Se o terminal informar outra porta, ajuste o endereço.

Os arquivos `Iniciar-BlueStacks.cmd`, `Iniciar-Celular-WiFi.cmd` e `Iniciar-PC.cmd` também estão disponíveis na raiz.

## Supabase

Para configurar um projeto novo, aplique os arquivos de `supabase/migrations/` em ordem. Em seguida, aplique uma vez cada arquivo abaixo:

1. `supabase/comunidade-social.sql`
2. `supabase/perfis-publicos-e-categorias.sql`
3. `supabase/resumo-viajante.sql`
4. `supabase/busca-lugares.sql`
5. `supabase/favoritos-notificacoes-localizacao.sql`

As visitas são visíveis para contas conectadas. A edição fica restrita ao autor. Favoritos são pessoais, e cada conta recebe suas próprias notificações. O acesso às fotos é feito por URLs assinadas.

Os textos dos rascunhos ficam no aparelho. O mapa mostra as visitas que têm uma localização marcada. Login, sincronização, publicações e carregamento do mapa usam internet.

## Testes

```bash
npm test
npm run typecheck
npm run verificar:prototipo
```

A versão de 14 de novembro de 2026 passou nos 27 testes automatizados, na checagem do TypeScript e nas exportações Android e web. As regras de acesso e os fluxos de interação também foram verificados no Supabase. A conferência dos novos fluxos no celular está pendente.

## Organização

- `src/app/` reúne as telas.
- `src/componentes/` contém os componentes compartilhados.
- `src/servicos/` concentra as operações de dados, fotos e comunidade.
- `supabase/` guarda os SQL do banco.
- `tests/` contém os testes automatizados.
- `docs/` contém o protótipo em HTML, CSS e JavaScript publicado no GitHub Pages.
- `historico/` reúne os registros das etapas anteriores.

O protótipo apresenta 17 telas e estados de navegação. Ele tem armazenamento no navegador e um fluxo de acesso próprio. O aplicativo mobile usa a conta e os serviços do Supabase.

## Créditos

As fotografias e fontes têm seus autores e licenças registrados em [créditos do protótipo](docs/CREDITOS.md), [identidade visual](assets/identidade/CREDITOS.md) e [fotografias da coleção](assets/colecao-prototipo/CREDITOS.md). O app também apresenta os créditos das fotografias nos detalhes das visitas.
