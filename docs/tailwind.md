# Tailwind CSS

A identidade (cor, tipografia, iconografia) está em
[identidade-visual.md](identidade-visual.md); esta página trata de como escrever as classes.

A aplicação usa **Tailwind CSS v4**. Não existe `tailwind.config.js`: toda a
configuração vive em `src/assets/app.css`, que é a única folha de estilo
importada (`src/main.js`). `styles.css` e `theme.css` foram eliminados.

O plugin `@tailwindcss/vite` está ligado em `vite.config.js` e em
`scripts/build-preview.mjs`, por isso o `npm run dev`, o `npm run build` e o
`npm run build:preview` produzem o mesmo CSS. Não há `@source` declarado: a
detecção automática do Tailwind percorre o projecto a partir da raiz.

## Tokens

As cores são variáveis CSS definidas em `:root` e redefinidas em
`:root[data-theme="dark"]`. O `@theme inline` liga-as às utilidades do
Tailwind, de forma que `bg-primary` compila para `background-color: var(--primary)`
— é isso que permite ao `useAppearance` reescrever a marca de cada empresa em
tempo de execução sem recompilar nada.

| Utilidade | Token | Uso |
| --- | --- | --- |
| `bg-background` | `--background` | fundo da página |
| `bg-surface` | `--surface` | cartões, barras, diálogos |
| `bg-surface-muted` | `--surface-muted` | zonas de apoio, cabeçalhos de tabela |
| `text-ink` | `--ink` | texto principal |
| `text-muted` | `--muted` | texto secundário |
| `border-line` | `--border` | todos os contornos |
| `bg-primary` / `text-on-primary` | `--primary` / `--on-primary` | acção principal |
| `text-primary-text` | `--primary-text` | verde já ajustado para contraste de texto |
| `bg-soft` | `--soft` | fundo suave da cor da marca (itens activos) |
| `bg-secondary` / `text-secondary-text` | `--secondary` | acção secundária |
| `text-success` / `bg-success-soft` | `--success` | estados positivos |
| `text-warning` / `bg-warning-soft` | `--warning` | avisos |
| `text-danger` / `bg-danger-soft` / `text-on-danger` | `--danger` | erros e destruição |
| `bg-scrim` | `--scrim` | véu por trás de gavetas e diálogos |

Espaçamentos e sombras próprios: `ml-sidebar` / `w-sidebar` (`--sidebar-width`),
`pt-topbar` / `h-topbar` (`--topbar-height`), `shadow-soft`, `shadow-card`,
`shadow-float`, `shadow-dialog`.

**Nunca escrever cores literais no markup.** Um `#fff` ou um `bg-green-500`
quebra o tema escuro e a marca por empresa.

## Tema escuro

Os tokens trocam sozinhos quando a raiz recebe `data-theme="dark"`, por isso
`bg-surface text-ink` já funciona nos dois temas — **não usar `dark:`**. A
variante `dark:` existe em `app.css` só para os raros casos em que a utilidade
precisa mesmo de saber o tema (uma sombra, uma imagem, um gradiente).

## Primitivas

`app.css` define, em `@layer components`, as peças que se repetem por toda a
aplicação. Usar sempre estas em vez de as recompor com utilidades:

- **Botões** — `btn` mais `btn-primary` | `btn-secondary` | `btn-danger`;
  `btn-compact` reduz altura e tipo. `icon-btn` (+ `icon-btn-danger`) para
  botões quadrados de ícone. `text-button` para acções em texto.
- **Identidade** — `eyebrow`, `avatar` (+ `avatar-sm`).
- **Estado** — `badge` mais `badge-success` | `badge-warning` | `badge-danger` |
  `badge-neutral`.
- **Superfícies** — `card` (contorno + fundo) e `panel` (o mesmo, com `p-6`).
- **Formulários** — `field`, `check-field`, `form-grid` (+ `form-grid-full`),
  `form-actions`, `error-message`, `success-message`.
- **Tabelas** — `table-scroll` a envolver `data-table`.
- **Separadores** — `tabs` com `button.active`.
- **Diálogos** — `dialog` > `dialog-inner` > `dialog-header`.
- **Vazio** — `empty-state`.
- **Opções seleccionáveis** — `choice` (+ `choice-selected`).
- **Acessibilidade** — `sr-only`, `skip-link`.

Os elementos de formulário (`input`, `select`, `textarea`), a tipografia
(`h1`–`h3`, `p`, `small`) e o foco visível já estão tratados na `@layer base`.
Não repetir esses estilos no markup.

Tudo o resto — grelhas, cabeçalhos de página, cartões de estabelecimento,
barra lateral, barra superior, passos da marcação — escreve-se com utilidades
directamente no `<template>`. Não voltar a criar classes semânticas nem blocos
`<style scoped>`.

## Responsividade

Escrita a partir do ecrã pequeno, subindo com `sm:` (640px), `md:` (768px),
`lg:` (1024px), `xl:` (1280px) e `2xl:` (1536px).

- A barra lateral é gaveta por omissão e só passa a coluna fixa sob a variante
  `desk:` (mais de 1024px com ponteiro fino, ou mais de 1366px). O conteúdo
  recebe `desk:ml-sidebar`.
- A barra superior é fixa (`sticky top-0 z-40`) em todos os tamanhos.
- Alvos de toque com pelo menos 44px: as primitivas já o garantem.
- Grelhas passam por `grid-cols-1` → `sm:grid-cols-2` → `lg:grid-cols-3` em vez
  de saltarem directamente para várias colunas.
- Tabelas vão sempre dentro de `table-scroll`.
- Tamanhos de letra saem sempre da escala — `text-body`, `text-small`, `text-caption`,
  `text-overline`, `text-h1`–`text-h3`, `text-display`. Não se escreve `text-[12px]`:
  o piso da escala é 13px (12px só em rótulos de caixa alta) e um valor arbitrário fura-o.

## Quando a interface aparece sem estilo

Sintoma: a aplicação monta (vêem-se os ícones e os dois logótipos, um por cima
do outro), mas nada tem cor, espaçamento ou layout. Isso significa que
`app.css` não chegou ao browser — nem sequer as regras que estão fora das
`@layer`. Não é um problema do markup.

Por ordem:

1. Pare o servidor e recomece com a cache limpa:
   `npm run dev -- --force`. No browser, recarregue com Ctrl+Shift+R.
2. Confirme que o CSS compila fora do Vite:
   `npx @tailwindcss/cli -i src/assets/app.css -o .tmp.css`
   Deve produzir cerca de 60 KB. Se falhar, o erro indica a linha exacta.
3. Gere o build de produção, que não depende do estado do servidor de
   desenvolvimento: `npm run build` seguido de `npm run preview`.

Nota sobre `@source`: não é preciso declará-lo. A detecção automática do
Tailwind já percorre o projecto a partir da raiz e respeita o `.gitignore`.
Declarar caminhos relativos com `..` é frágil no Windows e pode fazer o plugin
do Vite procurar fora do projecto.
