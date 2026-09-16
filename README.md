# Mockup Vue.js — Plataforma de Agendamento e Gestão de Serviços

Mockup funcional **mobile-first**, criado a partir dos documentos de requisitos fornecidos: cabeçalho institucional, pesquisa como acção principal, cartões de serviços, áreas seguras autenticadas e navegação simples para tarefas frequentes.

> O objectivo é validar experiência, fluxos, papéis e organização de informação. Não existe backend real neste pacote e todos os dados são demonstrativos.

## Abrir imediatamente, sem instalar nada

Abra `preview/index.html` no navegador. O pacote é autocontido: `npm run build:preview` gera `preview/app.js` e `preview/style.css` a partir de `src/`, com o Vue incluído, por isso não depende de CDN nem de servidor.

A pré-visualização é gerada da aplicação real. Se alterar `src/`, volte a correr `npm run build:preview` para a manter sincronizada.

## Executar como projecto Vue + Vite

```bash
npm install
npm run dev
```

> Depois de actualizar o projecto para TypeScript é preciso correr `npm install`
> uma vez, para instalar `typescript`, `vue-tsc` e `vitest`.

Depois abra o endereço indicado pelo Vite, normalmente `http://localhost:5173`.

Para gerar uma versão de distribuição:

```bash
npm run build
npm run preview
```

## Papéis implementados

- **Visitante** — pesquisa de salões e serviços sem autenticação.
- **Cliente** — criação de conta/login, marcação, pagamento opcional, confirmação, histórico, cancelamento, reagendamento, notificações e perfil.
- **Profissional** — agenda pessoal, serviços autorizados, disponibilidade, indisponibilidades, confirmação de presença, conclusão do atendimento e histórico.
- **Administrador do Salão** — perfil, serviços, profissionais, associações profissional/serviço, horários/turnos, agenda geral, clientes, pagamentos, relatórios e promoções/cupões.
- **Administrador da Plataforma** — gestão de salões, activação/desactivação, parâmetros globais, monitoria e suporte técnico.
- **Gateway externo** — simulado no fluxo de pagamento online.

No desktop, use o botão **“Perfis”** no canto inferior direito. No mobile, toque no chip do perfil no cabeçalho. Isto permite testar os vários papéis sem credenciais reais.

## Fluxo principal do cliente

1. Pesquisar estabelecimento ou serviço e consultar os detalhes e o catálogo.
2. **Passo 1 — serviço:** escolher o serviço e, quando aplicável, o número de pessoas ou o recurso.
3. **Passo 2 — data e horário:** escolher o dia, o profissional autorizado (ou “sem preferência”) e um horário livre.
4. **Passo 3 — confirmação:** rever a marcação, aplicar um cupão opcional e escolher pagamento no local ou online simulado.
5. Autenticar ou criar conta antes de confirmar; o rascunho da marcação é retomado.
6. Confirmar e receber a referência da marcação, com exportação para o calendário.
7. Consultar, cancelar ou reagendar na área pessoal, segundo as políticas do estabelecimento.

## Estrutura principal

A aplicação está organizada **por papel**: cada perfil tem os seus componentes e
as suas vistas, e o que é transversal vive em `shared`. Para alterar o que o
gestor vê, por exemplo, basta olhar para `components/manager` e `views/manager`.

```text
src/
  main.ts            App.vue        env.d.ts
  types/             domain.ts — o modelo de dados de toda a aplicação
  services/          seed.ts, localStorageService.ts, imageService.ts
  stores/            applicationStore.ts (estado e regras), themeStore.ts
  composables/       lógica reactiva por domínio, com um contexto por área
  utils/             formatters.ts, theme.ts, resourceTypes.ts, navigation/
  layouts/           AuthLayout.vue, MainLayout.vue
  components/
    client/          passos da marcação, pagamento, cartão do estabelecimento
    staff/           diálogos de disponibilidade do profissional
    manager/         agenda, editor de registos, ramo visual da empresa
    platform/        empresas, utilizadores, suporte da plataforma
    shared/          account/, auth/, navigation/, ui/ — usados por vários papéis
  views/
    client/          Explorar, detalhes, marcação, as minhas marcações
    staff/           agenda, serviços, disponibilidade, histórico
    manager/         visão geral, agenda, clientes, equipa, definições, …
    platform/        visão geral, empresas, utilizadores, actividade, suporte
    shared/          entrada na conta, notificações, perfil
    pageRegistry.ts  que vista corresponde a cada ecrã
  assets/            app.css (Tailwind v4: tokens e primitivas), img/logo*.png
```

## TypeScript

Todo o código é TypeScript e os componentes usam `<script setup lang="ts">`. O
modelo de domínio está num único ficheiro, `src/types/domain.ts`: entidades
(`Business`, `Service`, `StaffMember`, `Booking`, `User`, …), vocabulários
fechados (`Role`, `BookingStatus`, `PaymentStatus`, `ViewName`) e a forma da base
de dados de demonstração. É esse ficheiro que fixa o contrato que a futura API
em Laravel terá de cumprir.

```bash
npm run typecheck   # vue-tsc --noEmit, com strict activado
npm test            # testes unitários das regras de negócio (vitest)
```

Os imports entre ficheiros TypeScript incluem a extensão (`@/stores/applicationStore.ts`),
o que mantém o mesmo especificador válido no Vite, no vue-tsc e no vitest.

## Estilos

A interface é escrita inteiramente em **Tailwind CSS v4**. Não há `tailwind.config.js`: os tokens de cor, as variantes e as primitivas (`btn`, `badge`, `field`, `data-table`, `dialog`, …) vivem em `src/assets/app.css`, a única folha de estilo do projecto. A paleta deriva do logótipo MarcaFácil e troca sozinha entre tema claro e escuro; o `useAppearance` reescreve as variáveis da marca em tempo de execução para cada estabelecimento. A identidade — paleta derivada do logótipo com contrastes medidos, Poppins nos títulos, Inter na interface, iconografia lucide — está em [docs/identidade-visual.md](docs/identidade-visual.md).

## Decisões de UX

- **Mobile-first:** cartões, bottom navigation, bottom sheets, alvos de toque amplos e formulários de uma coluna no ecrã pequeno.
- **Progressive disclosure:** a marcação é dividida em três passos — serviço, data e horário, confirmação —, reduzindo carga cognitiva.
- **Pesquisa sem login:** o utilizador só é obrigado a autenticar-se antes da confirmação da marcação.
- **RBAC visível:** cada perfil tem navegação e tarefas próprias, sem misturar responsabilidades.
- **Agenda consistente:** a interface de disponibilidade deixa explícito que os horários dependem de serviço, profissional e agenda.
- **Pagamento opcional:** o salão pode permitir pagamento online ou no local; o gateway é apresentado como integração externa.
- **Escalabilidade visual:** a taxonomia “salão → serviços → profissionais → disponibilidade → marcações” pode ser adaptada a outros prestadores de serviços.



## Conteúdo demonstrativo

Nomes de pessoas, salões adicionais, métricas, preços e horários servem apenas para tornar o protótipo navegável. O salão **“Beleza & Estilo”** e categorias como corte, barba, lavagem, tratamento capilar, coloração e penteado foram usados por estarem alinhados com os exemplos dos documentos de requisitos.

Os meios de pagamento apresentados dentro do gateway são apenas opções de demonstração e devem ser substituídos pela integração escolhida no desenho técnico final.
