# Identidade visual MarcaFácil

Guia de referência do projecto · Versão 1.1 · 15 de Setembro de 2026

## Objectivo e âmbito

Este documento reúne a identidade visual da MarcaFácil para orientar o desenho de novos ecrãs, a manutenção da interface e a produção de materiais digitais consistentes. Destina-se a designers, programadores e responsáveis pelo produto.

A identidade combina verdes de marca, fundos claros com matiz verde, títulos em Poppins e texto de interface em Inter. Cartões com contornos discretos, cantos arredondados e iconografia linear organizam a descoberta de serviços, os agendamentos e as áreas de gestão.

Os valores identificados como **implementados** foram conferidos no código actual. As **orientações** indicam como aplicar a identidade; as divergências entre essas orientações e a implementação estão reunidas no final. Este guia documenta a interface e não constitui uma certificação de acessibilidade.

## 1 Identidade e linguagem visual

A leitura visual do projecto é sóbria, organizada e acolhedora: o verde dá continuidade à marca, os neutros deixam espaço para os serviços e a hierarquia tipográfica facilita a leitura de informação operacional.

Orientações de composição:

- Dar maior destaque à tarefa principal de cada ecrã, como pesquisar, reservar ou guardar.
- Agrupar informação relacionada em cartões ou painéis, com espaço entre secções.
- Usar cor de forma funcional: acção, selecção, estado ou identificação de séries de dados.
- Manter títulos curtos e instruções directas, em português, com vocabulário consistente: estabelecimento, serviço, profissional e marcação.
- Evitar fundos decorativos intensos em formulários e tabelas.

## 2 Logótipo

Os ficheiros de marca usados na navegação são:

- [Logótipo para tema claro](../src/assets/img/logo.png).
- [Logótipo para tema escuro](../src/assets/img/logo-dark.png).

![Logótipo MarcaFácil para tema claro](../src/assets/img/logo.png)

A barra lateral apresenta o logótipo com largura máxima de **186 px**, altura automática e proporções preservadas. No telefone, a barra lateral abre como gaveta. A variante clara ou escura é seleccionada pelo tema.

**Orientações:** utilizar os ficheiros existentes, preservar a proporção, evitar recortes e garantir contraste com o fundo. Não reconstruir o logótipo escrevendo o nome em Poppins. Reservar espaço livre em redor; a referência anterior do projecto propõe metade da altura do símbolo. A utilização isolada do símbolo abaixo de 120 px é uma orientação de marca, não uma troca automática implementada na navegação.

## 3 Paleta de cores

### Cores principais

| Cor                      | Valor     | Aplicação                                                     |
| ------------------------ | --------- | ------------------------------------------------------------- |
| Verde da marca           | `#019E51` | Identidade e realces de marca; `--brand-500`                  |
| Verde profundo           | `#023627` | Texto principal no tema claro e cor secundária base           |
| Verde de acção           | `#008340` | Fundo da acção primária base                                  |
| Verde de texto destacado | `#006937` | Valor CSS base de `--primary-text` no tema claro              |
| Verde claro              | `#4ABE74` | Realce da marca no tema escuro e acção escura definida no CSS |

O verde de marca e o verde dos botões têm funções distintas. Para botões, utilizar o par `primary` e `on-primary`, que define fundo e texto em conjunto. O código documenta também o gradiente do símbolo `#02BE64 → #018A46`; esse gradiente pertence à identidade do logótipo e não é o fundo padrão dos controlos.

### Escala completa da marca

| Token       | Hexadecimal | Token       | Hexadecimal |
| ----------- | ----------- | ----------- | ----------- |
| `brand-50`  | `#EBFAEF`   | `brand-600` | `#008340`   |
| `brand-100` | `#D6F4DD`   | `brand-700` | `#006937`   |
| `brand-200` | `#B2E9C0`   | `brand-800` | `#00512E`   |
| `brand-300` | `#83D69B`   | `brand-900` | `#003C26`   |
| `brand-400` | `#4ABE74`   | `brand-950` | `#00281A`   |
| `brand-500` | `#019E51`   | `brand-ink` | `#023627`   |

### Superfícies e texto nos dois temas

| Função                           | Tema claro  | Tema escuro |
| -------------------------------- | ----------- | ----------- |
| Fundo da página                  | `#F4FAF7`   | `#06120C`   |
| Superfície de cartões e diálogos | `#FFFFFF`   | `#112018`   |
| Superfície de apoio              | `#EAF3ED`   | `#213229`   |
| Texto principal                  | `#023627`   | `#EAF3ED`   |
| Texto secundário                 | `#5D6D64`   | `#9FADA5`   |
| Divisórias e contornos discretos | `#D9E5DE`   | `#2D3E34`   |
| Contorno forte dos campos        | `#7B8A82`   | `#7B8A82`   |
| Véu sobre o conteúdo             | `#02362799` | `#030C07CC` |
| Cor das sombras                  | `#0236271F` | `#00000066` |

Os valores de oito dígitos incluem transparência. Usar contornos fortes nos campos e contornos discretos para separar conteúdo.

A escala neutra adicional está disponível em `app.css`: `#C4D1C9`, `#44544B`, `#192920` e `#030C07`, além dos valores da tabela. Preferir os nomes funcionais, como `surface` e `muted`, ao escolher cores para componentes.

### Estados

| Estado                   | Texto claro | Fundo claro | Texto escuro | Fundo escuro |
| ------------------------ | ----------- | ----------- | ------------ | ------------ |
| Sucesso                  | `#006937`   | `#EBFAEF`   | `#83D69B`    | `#123324`    |
| Aviso                    | `#8F5D00`   | `#FFF4E1`   | `#F5B75B`    | `#33280F`    |
| Erro ou acção destrutiva | `#9E2D28`   | `#FFEFEC`   | `#F69C91`    | `#3A1D1A`    |
| Informação               | `#00569F`   | `#EBF7FF`   | `#91C3F6`    | `#182A3D`    |

Usar etiquetas com texto explícito, por exemplo «Confirmado», «Pendente» ou «Cancelado». A cor deve reforçar o significado. Nos botões destrutivos, usar `danger` com `on-danger`; o texto da etiqueta de erro não é o texto do botão.

### Gráficos

| Série      | Tema claro | Tema escuro |
| ---------- | ---------- | ----------- |
| 1 Verde    | `#008C46`  | `#6AC988`   |
| 2 Azul     | `#1577C8`  | `#6DB6FF`   |
| 3 Âmbar    | `#A66300`  | `#E1A447`   |
| 4 Coral    | `#BC4A41`  | `#F98F84`   |
| 5 Violeta  | `#9A53AA`  | `#D695E4`   |
| 6 Turquesa | `#008C97`  | `#00C9D1`   |

Orientação: aplicar as séries por ordem e manter a associação de uma categoria à mesma cor entre gráficos. Usar rótulos ou legendas. A primeira série tem um token próprio e não corresponde ao verde `brand-500`.

## 4 Temas e identidade dos estabelecimentos

A preferência de aparência suporta claro, escuro e sistema, e é guardada localmente. O tema altera superfícies, texto, estados, sombras e variante do logótipo.

A personalização permite definir duas cores e um ícone por estabelecimento. É aplicada no detalhe do estabelecimento, na marcação e em contextos de gestão ou de profissional previstos em `useAppearance.js`. Quando não existe uma marca seleccionada, são usadas as cores base `#008340` e `#023627`.

**Comportamento efectivo:** `useAppearance` escreve `--primary` e `--secondary` directamente na raiz, mesmo no tema escuro. Por isso, o verde claro `#4ABE74` definido no CSS para a acção escura não é necessariamente a cor visível do botão. A cor do estabelecimento, ou a cor base, prevalece.

O texto sobre fundos cheios é escolhido por `textOn()`, entre branco e preto, conforme o maior contraste. Já `accessibleAccent()` ajusta os textos de destaque até uma relação de contraste de pelo menos 6:1 contra a superfície de referência. Este ajuste não se aplica automaticamente a todos os fundos ou a todos os elementos do ecrã.

Orientação: preservar a MarcaFácil no logótipo e na estrutura geral, usando as cores do estabelecimento para as acções e destaques do seu contexto. Rever ambos os temas sempre que se introduzir uma nova combinação.

## 5 Tipografia

### Famílias e pesos

**Poppins** é a família dos títulos e números de destaque. Os pesos carregados são SemiBold 600 e Bold 700; os títulos `h1`, `h2` e `h3` usam 600 por omissão.

**Inter** é a família do corpo, formulários, botões, navegação, tabelas e legendas. São carregados os pesos Regular 400, Medium 500 e SemiBold 600.

As fontes são carregadas através do Google Fonts em `index.html`. As alternativas locais incluem Segoe UI, Arial e fontes sem serifa do sistema. Assim, a aparência pode variar quando as fontes externas não carregam.

### Escala tipográfica implementada

| Estilo          | Tamanho          | Entrelinha | Uso                                       |
| --------------- | ---------------- | ---------- | ----------------------------------------- |
| Display         | 30–40 px, fluido | 1,15       | Título de maior destaque                  |
| H1              | 25–30 px, fluido | 1,2        | Título da página                          |
| H2              | 20–22 px, fluido | 1,27       | Títulos de secção                         |
| H3              | 18 px            | 25 px      | Títulos de cartões                        |
| Corpo maior     | 16 px            | 25 px      | Texto com destaque moderado               |
| Corpo           | 15 px            | 23 px      | Base da interface                         |
| Texto pequeno   | 14 px            | 21 px      | Botões e tabelas                          |
| Legenda         | 13 px            | 19 px      | Metadados e ajuda                         |
| Rótulo superior | 12 px            | 16 px      | Rótulos curtos, normalmente em maiúsculas |

Os estilos display, H1 e H2 usam espaçamento de letras de −0,02em, −0,015em e −0,01em, respectivamente. Os rótulos superiores usam +0,08em. Os parágrafos têm uma regra própria de entrelinha 1,65, que pode substituir a entrelinha base do corpo.

Orientações: manter as duas famílias, evitar texto corrente abaixo de 13 px e usar pesos para reforçar a hierarquia. Horas, preços e quantidades devem usar algarismos de largura uniforme; isso já está definido para tabelas, elementos `time` e classe `tabular`.

## 6 Formas e espaçamento

| Elemento                                    | Valor implementado                             |
| ------------------------------------------- | ---------------------------------------------- |
| Raio dos campos `rounded-control`           | 8 px                                           |
| Raio dos cartões `rounded-card`             | 12 px                                          |
| Raio dos painéis e diálogos `rounded-panel` | 16 px                                          |
| Botões base e opções `rounded-md`           | 6 px na escala padrão utilizada                |
| Avatares                                    | Circulares; 46 px ou 34 px na variante pequena |
| Botões base e botões de ícone               | Altura de 44 px; ícones em caixa de 44 × 44 px |
| Botões compactos                            | Altura mínima de 38 px                         |

A orientação de espaçamento é uma base de 4 px: 4, 8, 12, 16, 20, 24, 32, 40 e 48 px. O código também contém medidas pontuais, como 7, 18 e 19 px. Em novos componentes, preferir a escala e usar `gap` para separar elementos do mesmo grupo.

Os cartões assentam sobre fundos uniformes com contorno fino. As sombras disponíveis são `soft` (0 3 12), `card` (0 8 22), `float` (0 8 40) e `dialog` (0 25 80), em px, usando a cor de sombra do tema. Usar maior elevação para elementos sobrepostos.

## 7 Padrões de componentes

| Componente         | Padrão visual e utilização                                                    |
| ------------------ | ----------------------------------------------------------------------------- |
| Botão primário     | Fundo de acção, texto contrastante e peso 600; tarefa principal               |
| Botão secundário   | Superfície neutra, contorno discreto e texto principal; acção de apoio        |
| Botão destrutivo   | Fundo de perigo; eliminar ou outra operação destrutiva                        |
| Acção em texto     | Cor de destaque e sublinhado ao passar o ponteiro                             |
| Campo              | Fundo de superfície, contorno forte, rótulo superior e ajuda abaixo           |
| Etiqueta           | Fundo suave e texto de estado; leitura curta                                  |
| Cartão             | Fundo de superfície, contorno e raio de 12 px                                 |
| Tabela             | Cabeçalho suave, separadores horizontais e realce da linha sob o ponteiro     |
| Separador activo   | Texto de destaque e linha inferior de 2 px                                    |
| Opção seleccionada | Contorno destacado e fundo suave                                              |
| Diálogo            | Painel centrado, véu com desfoque de 3 px e conteúdo com deslocamento interno |
| Estado vazio       | Conteúdo centrado, título e explicação curta                                  |

O cartão de estabelecimento combina fotografia, categoria, avaliação, localização, nome, serviços e preço. O rodapé usa alinhamento ao fundo para aproximar a posição das acções entre cartões de alturas diferentes.

Orientação: reutilizar as primitivas existentes e manter a ordem visual da informação. Não transformar todos os botões de um grupo em acções primárias.

## 8 Iconografia e imagens

A biblioteca é **Lucide**, usada através de `AppIcon.vue`, com espessura de traço **1,75**. O componente esconde o SVG das tecnologias de assistência; os controlos que dependem de ícones precisam de um nome acessível no botão ou ligação.

Orientação: preferir ícones lineares, cor herdada do contexto e tamanhos 16, 18, 20 e 24 px. Existem excepções actuais nos cartões: ícones de 13, 14 e 19 px e preenchimento no coração e na estrela. Esses casos devem ser considerados antes de impor uma regra global de contorno sem preenchimento.

As fotografias dos estabelecimentos ocupam áreas com altura definida e `object-fit: cover`, permitindo recorte. Os logótipos usam proporções preservadas e `contain`.

Orientações para novas fotografias: mostrar espaços ou serviços relevantes, manter o assunto principal dentro da área de recorte e evitar texto incorporado na imagem. Rever a legibilidade das etiquetas sobre fotografias claras e escuras. Usar imagens com direitos de utilização adequados.

Não foi identificado um padrão ornamental repetitivo na camada de estilos activa. A repetição visual vem dos cartões, contornos, superfícies suaves e ícones. O gradiente do logótipo não deve ser automaticamente expandido para toda a interface.

## 9 Organização e adaptação a ecrãs

A estrutura parte do telefone e expande-se para ecrãs maiores. O conteúdo principal tem largura máxima de **1520 px**, centrada; as margens laterais começam em 20 px e aumentam para 28 e 40 px nos pontos definidos pelo layout.

A barra lateral fixa mede **236 px**. Como gaveta, mede 270 px com limite de 86% da largura do ecrã. A variante `desk` activa a coluna fixa a partir de **1025 px com ponteiro fino**, ou **1367 px** independentemente do ponteiro. O token da barra superior é de 72 px.

Os formulários partilhados começam com uma coluna e passam a duas a partir de `sm`. As tabelas usam um contentor com deslocamento próprio. Os diálogos têm largura de `100% − 32 px`, máximo de 620 px e altura máxima de `100dvh − 48 px`.

Orientação: verificar leitura, recorte das imagens, navegação e acções em telefone, tablet e computador. A existência de estilos responsivos não substitui essa verificação em ecrã.

## 10 Interacção e movimento

- Controlos: transições de cor, contorno e sombra de 160 ms.
- Gaveta: deslocamento de 200 ms com desaceleração.
- Aviso flutuante: transição de opacidade de 200 ms.
- Entrada de página: 240 ms, com opacidade e deslocamento vertical de 6 px.
- Mudança de tema: transições de 180 ms na classe correspondente.
- Botões desactivados: opacidade de 45% e cursor de indisponibilidade.

O foco usa um anel de 1 px na cor primária. Botões primários e destrutivos acrescentam um afastamento de 2 px para separar o anel do fundo. Os campos mostram foco por `:focus`; outros controlos usam `:focus-visible`.

As animações de página e as transições da classe de tema respeitam `prefers-reduced-motion`. As transições de botões, gaveta e aviso flutuante não estão todas abrangidas por essa condição. A orientação é estender o respeito pela preferência de movimento reduzido a estes elementos.

## 11 Pontos a harmonizar

A análise identificou diferenças concretas entre a intenção do guia anterior e os componentes actuais:

1. **Tema escuro:** as cores primária e secundária escritas em tempo de execução prevalecem sobre as cores escuras do CSS. Decidir se este comportamento é o pretendido antes de alterar a paleta.
2. **Dimensão de toque:** o padrão base é 44 px, mas os botões compactos têm 38 px e há acções de 30 × 30 px nos cartões. Rever essas excepções em dispositivos tácteis.
3. **Cantos dos botões:** o token de controlo é 8 px, mas os botões base usam `rounded-md`. Uniformizar apenas após uma decisão visual.
4. **Tipografia dos campos:** a regra base prevê 16 px abaixo de 640 px; os filhos de `.field` recebem também `text-body`. Confirmar o estilo final no navegador antes de afirmar que todos os campos móveis têm 16 px.
5. **Movimento reduzido:** completar a cobertura das transições restantes.
6. **Iconografia:** documentar ou normalizar os tamanhos adicionais e os ícones preenchidos dos cartões.
7. **Acessibilidade:** verificar o resultado renderizado, incluindo cores personalizadas, sobreposições sobre fotografias e navegação por teclado. Não inferir conformidade de toda a aplicação a partir dos tokens.

Estas observações são recomendações para evolução. A actualização deste documento não altera o comportamento da aplicação.

## 12 Referências e manutenção

A fonte de verdade dos estilos activos é [app.css](../src/assets/app.css), importado por [main.js](../src/main.js). O ficheiro `theme.css` existe no repositório, mas não é importado por essa entrada; a sua antiga paleta verde e violeta não é a referência deste guia.

| Referência                                                      | Conteúdo                                           |
| --------------------------------------------------------------- | -------------------------------------------------- |
| [app.css](../src/assets/app.css)                                | Cores, tipografia, formas, componentes e movimento |
| [index.html](../index.html)                                     | Carregamento das fontes e idioma                   |
| [useAppearance.js](../src/Composable/useAppearance.js)          | Aplicação das cores por contexto                   |
| [theme.js](../src/Utils/theme.js)                               | Marca base e funções de contraste                  |
| [themeStore.js](../src/Store/themeStore.js)                     | Preferência de tema                                |
| [AppSidebar.vue](../src/Component/navigation/AppSidebar.vue)    | Logótipo e navegação                               |
| [MainLayout.vue](../src/Layout/MainLayout.vue)                  | Larguras e espaçamento de página                   |
| [AppIcon.vue](../src/Component/ui/AppIcon.vue)                  | Biblioteca e traço dos ícones                      |
| [BusinessCard.vue](../src/Component/discovery/BusinessCard.vue) | Fotografia e composição do cartão                  |
| [tailwind.md](tailwind.md)                                      | Convenções de implementação                        |

Ao actualizar a identidade, rever este guia em conjunto com os tokens, os componentes afectados e a personalização dos estabelecimentos. Para novas páginas, usar as cores funcionais e as primitivas partilhadas, preservando a hierarquia e verificando ambos os temas.
