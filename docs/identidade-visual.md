# Identidade visual MarcaFácil

Versão 1.0 · Setembro de 2026 · guia visual publicado como artefacto no Claude.

Tudo o que está aqui existe como token em `src/assets/app.css`. Alterar a identidade é
alterar esse ficheiro, e mais nenhum. Para as convenções de escrita das classes, ver
[tailwind.md](tailwind.md).

## Origem

Os valores foram medidos no próprio logótipo, não escolhidos por aproximação:

| Elemento do logótipo | Valor |
| --- | --- |
| Palavra «Fácil» e símbolo | `#019E51` |
| Topo do gradiente do símbolo | `#02BE64` |
| Palavra «Marca» | `#023627` |

A escala da marca foi construída em OKLCH a partir do `#019E51`, mantendo a matiz 152,5°
e deslocando-a até 164° nos tons escuros, onde encontra o verde profundo da palavra «Marca».
Os neutros usam a matiz 160° com croma 0,02 — cinzentos com um sopro de verde, para
assentarem ao lado da marca sem competir com ela.

## Cor

### Escala da marca

`--brand-50` `#EBFAEF` · `100` `#D6F4DD` · `200` `#B2E9C0` · `300` `#83D69B` · `400` `#4ABE74` ·
`500` `#019E51` · `600` `#008340` · `700` `#006937` · `800` `#00512E` · `900` `#003C26` ·
`950` `#00281A` · `--brand-ink` `#023627`

### Neutros

`--neutral-0` `#FFFFFF` · `50` `#F4FAF7` · `100` `#EAF3ED` · `200` `#D9E5DE` · `300` `#C4D1C9` ·
`400` `#9FADA5` · `500` `#7B8A82` · `600` `#5D6D64` · `700` `#44544B` · `800` `#2D3E34` ·
`850` `#213229` · `900` `#192920` · `925` `#112018` · `975` `#06120C` · `1000` `#030C07`

### Identidade e acção são cores diferentes

`--brand` (`#019E51`) é a cor da marca: símbolo, realces, primeira série de gráfico.
**Não serve de fundo a texto** — fica em 3,49:1 sobre branco, abaixo do mínimo.

`--primary` (`#008340`) é a cor de acção: botões e qualquer superfície cheia que carregue
texto. Branco sobre ela dá 4,86:1. É a regra mais importante deste guia.

No tema escuro a relação inverte-se: `--primary` passa a `#4ABE74`, um verde mais claro com
texto quase preto (`--on-primary` `#030C07`, 8,41:1) por cima.

### Papéis e contrastes medidos

Tema claro — superfície `#FFFFFF`, fundo `#F4FAF7`:

| Token | Valor | Contraste |
| --- | --- | --- |
| `--ink` | `#023627` | 13,47:1 sobre a superfície |
| `--muted` | `#5D6D64` | 5,47:1 sobre a superfície · 5,18:1 sobre o fundo |
| `--primary` | `#008340` | 4,86:1 com `--on-primary` branco |
| `--primary-text` | `#006937` | 6,83:1 sobre a superfície |
| `--border` | `#D9E5DE` | divisórias decorativas |
| `--border-strong` | `#7B8A82` | 3,62:1 — contornos de campos e caixas |
| `--success` / `--success-soft` | `#006937` / `#EBFAEF` | 6,32:1 |
| `--warning` / `--warning-soft` | `#8F5D00` / `#FFF4E1` | 5,16:1 |
| `--danger` / `--danger-soft` | `#9E2D28` / `#FFEFEC` | 6,58:1 |
| `--info` / `--info-soft` | `#00569F` / `#EBF7FF` | 6,81:1 |

Tema escuro — superfície `#112018`, fundo `#06120C`:

| Token | Valor | Contraste |
| --- | --- | --- |
| `--ink` | `#EAF3ED` | 14,91:1 |
| `--muted` | `#9FADA5` | 7,23:1 |
| `--primary` | `#4ABE74` | 8,41:1 com `--on-primary` `#030C07` |
| `--primary-text` | `#83D69B` | 9,70:1 |
| `--border-strong` | `#7B8A82` | 4,66:1 |
| `--success` / `--success-soft` | `#83D69B` / `#123324` | 7,91:1 |
| `--warning` / `--warning-soft` | `#F5B75B` / `#33280F` | 8,14:1 |
| `--danger` / `--danger-soft` | `#F69C91` / `#3A1D1A` | 7,36:1 |
| `--info` / `--info-soft` | `#91C3F6` / `#182A3D` | 7,89:1 |

O verde de sucesso é o mesmo verde da marca: numa plataforma verde, um sucesso azul seria
ruído. O que distingue uma etiqueta de sucesso de um botão é a forma — a etiqueta é fundo
ténue com texto escuro, o botão é superfície cheia. O azul fica reservado a informação
neutra, nunca a acções.

### Gráficos

`--chart-1` a `--chart-6`: verde, azul, âmbar, coral, violeta, turquesa. Mesma luminosidade
perceptual, por isso nenhuma série parece mais importante do que outra; ≥4:1 sobre a
superfície no tema claro, ≥7:1 no escuro. Usar sempre por ordem; uma série única usa
`--chart-1`.

### Marca de cada estabelecimento

Um estabelecimento escolhe duas cores, que substituem `--primary` e `--secondary` em tempo
de execução nas suas páginas (`Composable/useAppearance.js`). O texto por cima é recalculado
por `accessibleAccent()` para garantir 6:1. A descoberta, a autenticação e a administração da
plataforma mantêm sempre o verde MarcaFácil.

**Nunca escrever uma cor literal no markup** — nem `#fff`, nem `bg-green-500`, nem `dark:`.
Uma cor à mão quebra o tema escuro e a marca do estabelecimento ao mesmo tempo.

## Tipografia

**Poppins** SemiBold 600 e Bold 700 — títulos, números de destaque e o nome do produto. É a
geométrica pública mais próxima do logótipo, com o mesmo «a» de um só andar. Nunca em texto
corrido.

**Inter** Regular 400, Medium 500 e SemiBold 600 — tudo o resto: corpo, rótulos, tabelas,
botões, navegação, legendas. Foi desenhada para ecrã, distingue-se bem aos 12 px e tem
numerais tabulares.

Carregadas do Google Fonts em `index.html` e no `build-preview.mjs`. Para produção sem
dependência externa, instalar `@fontsource/inter` e `@fontsource/poppins` e importá-las em
`main.js`.

A escala é escrita a partir do telefone: os títulos são fluidos e crescem com o ecrã, o
texto corrente tem um tamanho só. **O piso é 13&nbsp;px** — abaixo disso só há os rótulos em
caixa alta, a 12&nbsp;px, que são curtos e espaçados.

| Token | Tamanho / entrelinha | Família |
| --- | --- | --- |
| `text-display` | `clamp(30px, 8vw, 40px)` / 1,15 · −0,02em | Poppins SemiBold |
| `text-h1` | `clamp(25px, 6.4vw, 30px)` / 1,2 · −0,015em | Poppins SemiBold |
| `text-h2` | `clamp(20px, 4.8vw, 22px)` / 1,27 · −0,01em | Poppins SemiBold |
| `text-h3` | 18 / 25 | Poppins SemiBold |
| `text-body-lg` | 16 / 25 | Inter Regular |
| `text-body` | 15 / 23 (base) | Inter Regular |
| `text-small` | 14 / 21 | Inter Regular |
| `text-caption` | 13 / 19 | Inter Regular, `--muted` |
| `text-overline` | 12 / 16 · +0,08em · caixa alta | Inter SemiBold |

Regras: horas, preços e contagens levam `tabular-nums` (já aplicado a `table` e `time`;
noutros sítios usa-se a classe `tabular`). Texto corrido entre 60 e 75 caracteres. Não existe
terceira família — a hierarquia faz-se com tamanho, peso e cor. **No markup usam-se os tokens,
nunca `text-[12px]`** — um valor arbitrário escapa à escala e é assim que a legibilidade se
perde, um componente de cada vez.

Abaixo de `sm`, os campos de formulário passam a 16&nbsp;px: com menos do que isso o Safari do
iPhone amplia a página ao focar o campo e desalinha o ecrã inteiro.

### Onde o logótipo aparece

Uma vez por ecrã, e sempre na barra lateral — que no telefone é a gaveta. A barra superior
nunca o carrega: num telefone fica para o botão de menu, o nome do ecrã e as acções.

Largura de 186 px na barra lateral, com uma margem livre igual a metade da altura do símbolo
de todos os lados. Abaixo de 120 px de largura usa-se só o símbolo.

## Iconografia

Um único conjunto: `lucide-vue-next`, sempre através de `Component/ui/AppIcon.vue`.

- Contorno, nunca preenchido. Grelha de 24. Traço de **1,75 px**, extremidades redondas.
- Cor herdada de `currentColor` — seguem o tema e a marca sem uma linha de CSS.
- Quatro tamanhos: **16** dentro de texto e etiquetas, **18** em botões compactos, **20** por
  omissão, **24** em cabeçalhos e estados vazios. Nada entre estes valores.
- Um botão só com ícone leva sempre `aria-label` e `title`.
- Nunca emojis nem glifos de texto como ícones. Se falta um ícone, acrescenta-se ao `AppIcon`
  a partir de lucide.

## Mobile-first

A plataforma é desenhada a partir do telefone e sobe daí. Na prática:

- A escala tipográfica acima é a do telefone; só os títulos crescem com o ecrã.
- Alvos de toque de 44 × 44 px em todo o lado — é o que as primitivas garantem.
- Campos a 16 px abaixo de `sm`, para o iOS não ampliar.
- Grelhas começam em `grid-cols-1` e só depois sobem; tabelas vivem dentro de
  `table-scroll`; nada provoca deslocamento horizontal a 360 px.
- A navegação é uma gaveta por omissão e só passa a coluna fixa sob a variante `desk`.
- Diálogos centrados no ecrã, com 16 px de folga lateral e altura máxima de
  `100dvh − 48px`, rolando por dentro.
- A página de autenticação mostra, abaixo de `sm`, só a saudação e o formulário: o título,
  a frase e a fotografia ficam escondidos para o formulário caber no primeiro ecrã.

## Forma e espaço

- **Raios**: `--radius-control` 8 px (botões, campos, itens de navegação), `--radius-card`
  12 px (cartões, tabelas), `--radius-panel` 16 px (diálogos, painéis), 999 px só em
  contadores e avatares.
- **Espaço**: base de 4 px — 4, 8, 12, 16, 20, 24, 32, 40, 48. Entre irmãos usa-se `gap`, nunca
  margens soltas.
- **Elevação**: `shadow-soft`, `shadow-card`, `shadow-float`, `shadow-dialog`. A sombra tem a
  cor da marca (`#0236271F`), não preto. Em repouso, um cartão distingue-se por contorno.
- **Layout**: conteúdo até 1520 px centrado; barra lateral 236 px; barra superior 72 px, fixa
  (`sticky top-0 z-40`) em todos os tamanhos.
- **Cortes**: os do Tailwind (`sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1536) mais o
  `desk` próprio — barra lateral fixa acima de 1024 px com ponteiro fino, ou acima de 1366 px.

## Movimento

160 ms `ease` nos estados de um controlo · 200 ms `ease-out` na gaveta e no aviso flutuante ·
240 ms `ease` na entrada de uma página (6 px a subir com opacidade, uma vez). Quem tem
`prefers-reduced-motion` activo não vê nenhuma delas. Nada pisca nem se move em ciclo.

## Acessibilidade

Mínimo AA, medido e não estimado. As combinações mais apertadas são branco sobre a acção
primária (4,86:1) e o texto secundário sobre o fundo da página (5,18:1).

- Texto 4,5:1; 3:1 a partir de 18,66 px a negrito ou 24 px normal.
- Elementos de interface 3:1 — daí `--border-strong` nos contornos de campos.
- Alvos de toque de 44 × 44 px com 8 px de folga.
- Foco sempre visível e igual em toda a plataforma: **anel de 1 px em `--primary`**, sem
  contorno (`outline: none`). Os campos mostram-no com `:focus` — é o que se espera de uma
  caixa de texto; tudo o resto só com `:focus-visible`, para não piscar a cada clique de rato.
  Contraste do anel: 4,86:1 sobre branco e 7,16:1 no tema escuro, acima dos 3:1 exigidos.
  Os botões cheios (`btn-primary`, `btn-danger`) levam o mesmo anel afastado 2 px, porque um
  anel verde encostado a um fundo verde não se veria. Nunca removido.
- Significado nunca só pela cor: um estado traz texto ou ícone.
- Português europeu, `lang="pt"`.
