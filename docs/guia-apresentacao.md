# Guia de apresentação — MarcaFácil (mockup)

Guião de demonstração do mockup funcional, organizado por perfis, com os passos exactos, os dados a usar e a mensagem a passar em cada momento. Duração prevista: **25 a 30 minutos** com espaço para perguntas.

Todos os fluxos deste guia foram executados na aplicação a 15/09/2026. O resultado de cada um está no [Anexo B](#anexo-b--registo-de-validação-dos-fluxos) e as correcções recomendadas no [Anexo C](#anexo-c--correcções-recomendadas-antes-da-apresentação).

---

## 1. Antes de começar

**Arrancar a aplicação**

```bash
npm install
npm run dev
```

O Vite indica o endereço (por omissão `http://localhost:5173`; se usar `--port 5193`, é o endereço que aparece na consola). Em alternativa, sem instalar nada, abra `preview/index.html` — mas note que a pré-visualização só reflecte `src/` depois de correr `npm run build:preview`.

**Lista de verificação (5 minutos antes)**

| Verificar                                | Porquê                                                                                                                                                                             |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ligação à Internet activa                | As fotografias dos estabelecimentos vêm do Unsplash; sem rede os cartões ficam sem imagem                                                                                          |
| Dados de demonstração repostos           | Limpe o armazenamento local do navegador (chave `marcafacil.agendamento.v3`) ou use uma janela anónima; o mockup guarda tudo no navegador e uma demonstração anterior deixa marcas |
| Tema claro activo                        | Botão do tema no cabeçalho. O tema escuro também funciona e pode ser mostrado no fim, como remate                                                                                  |
| Janela larga (cerca de 1400 px)          | Numa janela estreita a interface passa ao modo móvel: o menu lateral fecha e o cabeçalho ganha o botão de navegação. É útil mostrar os dois, mas comece no desktop                 |
| Som e notificações do sistema desligadas | A aplicação mostra avisos próprios no canto; evite ruído a competir                                                                                                                |

**Duas regras de ouro**

1. **Marque sempre para o dia seguinte.** O Studio Lume exige 2 horas de antecedência para cancelar ou reagendar. Se marcar para daqui a uma hora, a aplicação — correctamente — recusa o cancelamento e o momento perde-se.
2. **Troque de perfil pelo selector de espaço de trabalho** (canto do cabeçalho, junto ao avatar → _Mudar espaço de trabalho_). É a forma de passar de cliente a gestor sem credenciais.

---

## 2. Abertura (2 min) — a ideia em três frases

> «O MarcaFácil é uma plataforma de marcações onde **o utilizador pertence à plataforma e a empresa é um inquilino**. A mesma conta serve para marcar num salão, numa clínica ou num restaurante. Cada empresa gere os seus dados de forma isolada e a plataforma vê a rede inteira.»

Três pontos a fixar antes de tocar no ecrã:

- **Um perfil, várias empresas** — o cliente não cria conta em cada estabelecimento.
- **Um catálogo, vários sectores** — o mesmo modelo serve beleza, bem-estar, saúde e restauração. É o que a versão de demonstração mostra com quatro empresas.
- **Este é um mockup de validação** — não há backend; os dados vivem no navegador. Serve para validar experiência, papéis e regras de negócio antes de escrever o backend em Laravel.

---

## 3. Guião por perfis

### A. Visitante — descobrir sem conta (2 min)

1. Abra a aplicação. Está em **Explorar**, sem sessão iniciada.
2. Escreva `massagem` na pesquisa → sobra **Soma Wellness**. Apague.
3. Toque na categoria **Saúde & cuidados** → sobra **Clínica Vida**. Volte a **Todos os serviços**.
4. Abra **Filtros** → mostre o preço máximo e «Aceita pagamento online» → **Limpar**.
5. Abra **Studio Lume**. Percorra o catálogo, o cupão em destaque (**BEMVINDO10**) e o separador **Informações** (horário, morada, contactos).

**A dizer:** «A pesquisa e a consulta não exigem conta. O utilizador só se autentica quando quer confirmar — é aí que a conversão acontece.»

---

### B. Cliente — a marcação de ponta a ponta (7 min)

Este é o bloco central da apresentação. Faça-o sem cortes.

1. Em **Studio Lume**, carregue em **Marcar** no _Corte & styling_.
2. **Passo 1 — Serviço.** Confirme o serviço e **Continuar**.
3. **Passo 2 — Data e horário.** Escolha **o dia seguinte**. Repare que o botão _Continuar_ está desactivado até escolher a hora. Escolha **Ana Matavele** e depois `10:00`.
   - **A dizer:** «A disponibilidade cruza três coisas: o horário da empresa, o turno do profissional e os serviços que ele está autorizado a realizar. Não é uma agenda livre.»
4. **Passo 3 — Confirmação.** Introduza o cupão `INVALIDO` → _Aplicar_ → a aplicação explica que não é válido. Introduza `BEMVINDO10` → _Aplicar_ → **menos 120 MT**.
5. Escolha **No estabelecimento** e carregue em **Entrar para confirmar**.
6. Separador **Criar conta**. Preencha: `Marta Nhaca`, `marta@example.com`, `841112233`, palavra-passe `Apresenta2026!`. **Criar conta**.
   - **Momento de impacto:** a aplicação regressa ao passo 3 **com a marcação intacta**. «O utilizador não perde o trabalho por ter de se registar a meio.»
7. **Confirmar marcação** → ecrã de confirmação com o código e o total de **1080 MT**.
8. **Adicionar ao calendário** → descarrega um ficheiro `.ics`.
9. **Ver marcações** → **Ver detalhes** → mostre a referência curta, a política de cancelamento e os botões _Cancelar_ / _Reagendar_.
10. **Reagendar** → percorra os três passos → escolha `15:00` → **Confirmar alteração**. Note que os horários já ocupados não aparecem.
11. Volte a **As minhas marcações**, abra a reserva e **Cancelar** → **Confirmar cancelamento**. Se tiver sido paga online, o estado passa a **reembolsado**.
12. **Notificações** → confirmação, reagendamento, cancelamento e lembrete automático das próximas 24 horas. **Marcar todas como lidas**.
13. **O meu perfil** → três blocos separados: _Informações pessoais_, _Segurança_ e _Preferências e comunicação_. Altere o nome, active/desactive as preferências, **Guardar alterações**.
    - No cartão da esquerda, **Carregar foto** (ficheiro) ou **Tirar foto** (câmara, com _Capturar_ → _Repetir_ / _Usar esta fotografia_). Depois, **Substituir** ou **Remover**. Sem fotografia, o avatar são as iniciais.
    - A fotografia é guardada de imediato — não depende do botão _Guardar alterações_ — e passa a aparecer também no cabeçalho e na barra lateral.
    - **A dizer:** «A fotografia fica reduzida a 320 px e recortada em quadrado, para não pesar no armazenamento local do mockup.» Se a câmara não estiver disponível ou a permissão for recusada, a aplicação explica-o e sugere carregar um ficheiro.
14. Em **Explorar**, carregue no coração de um cartão → **Favoritos**.

**Variante de pagamento online (3 min, opcional mas recomendada)**

Repita a marcação, escolha **Online** e **Confirmar marcação**:

- Abre o **Pagamento de teste**: **Carteiras Móveis** (Mkesh, Mpesa, eMola) ou **Cartão de Crédito**.
- Escreva `84` no telefone e carregue em _Pagar_ → a validação impede o envio. Complete para `841234567` → fica formatado `84 123 4567`.
- **Atenção:** trocar de carteira limpa o número. Escolha primeiro a carteira, preencha o número depois.
- **Testar recusa** mostra a mensagem de pagamento recusado sem criar a marcação.
- _Pagar_ → marcação confirmada e **paga**.
- No cartão: `Marta Nhaca`, `4111 1111 1111 1111`, validade `12/2030`, CVV `123`.
- **A dizer:** «O gateway é uma simulação. Nenhum dado de pagamento é guardado — verificámos o armazenamento local e não fica lá nem o número do cartão nem o telefone. Na versão real, isto é uma integração externa.»

---

### C. Profissional — o dia de trabalho (3 min)

_Mudar espaço de trabalho → Profissional_ (entra como **Ana Matavele**).

1. **A minha agenda** — indicadores do dia, filtro por estado, navegação por dia.
2. Numa reserva confirmada: **Confirmar presença** → o estado passa a _Em atendimento_ → **Concluir atendimento**.
3. **Os meus serviços** — apenas os serviços que o gestor lhe autorizou.
4. **Disponibilidade** — dias de trabalho e turno; **Bloquear período** (ex.: `Consulta médica`, dia seguinte, `15:00`–`16:00`), depois editar e remover.
5. **Histórico** — filtros por período e estado, e **Exportar** (CSV).

**A dizer:** «O profissional não vê o negócio todo: vê a sua agenda, os seus serviços e a sua disponibilidade. As permissões são por papel.»

---

### D. Gestor da empresa — a operação (7 min)

_Mudar espaço de trabalho → Gestor da empresa_ (entra como **Beatriz Cossa**, Studio Lume).

1. **Visão geral** — reservas de hoje, recebido, por receber, próximos 7 dias e agenda do dia.
2. **Nova reserva** — escolha `Mariana Costa`, o serviço, um horário livre → **Confirmar reserva**.
3. **Agenda** — filtre por profissional e por estado; abra uma reserva: _Iniciar atendimento_ → _Registar pagamento_ → _Concluir_; mostre também _Não compareceu_ e _Reagendar / editar_.
4. **Clientes** — **momento de impacto**: não existe «novo cliente» nem «editar cliente».
   - **A dizer:** «O gestor não é dono dos dados pessoais do cliente. Pode reservar em nome dele, ver o histórico **nesta empresa**, desactivá-lo ou removê-lo da sua lista — mas não pode alterar o perfil. É o princípio de protecção de dados aplicado ao modelo multi-tenant.»
   - Mostre **Reservar para este cliente** (abre já com o cliente preenchido) e **Ver histórico**.
5. **Serviços** — crie `Penteado de evento`, 90 min, 2200 MT; edite o preço; desactive e reactive.
   - Tente **eliminar** o _Corte & styling_ → a aplicação desactiva-o em vez de apagar: «Os registos associados a reservas serão desactivados para preservar o histórico.» Reactive-o a seguir.
6. **Equipa** — **Adicionar membro** (`Nélia Tembe`, Hair stylist, serviço _Corte & styling_, Seg–Sex, 09:00–18:00). Volte ao perfil de cliente e mostre que ela já aparece como profissional disponível para esse serviço.
7. **Recursos** — salas e mesas, com capacidade. Crie e remova um recurso.
8. **Horários** — funcionamento da empresa, turnos da equipa e **Bloquear período**.
   - **Momento de impacto:** tente bloquear um período que já tem reservas → «Existem 1 reservas neste período. Reagende-as antes de bloquear o horário.»
9. **Pagamentos** — separadores _Por receber_ / _Recebidos_ / _Reembolsos_; carregue em **Receber** numa linha e mostre os totais a mudar.
10. **Relatórios** — período, receita, cancelamentos, serviços mais procurados, desempenho da equipa, **Exportar** (CSV).
11. **Promoções** — crie `APRESENTA15` com 15% até 31/12/2026; desactive, reactive, edite, elimine.
12. **Definições** — **momento de impacto**: mude a **cor primária** e guarde. A interface do estabelecimento muda de identidade.
    - **A dizer:** «Cada empresa tem a sua identidade dentro da mesma plataforma. É o que vai corresponder ao subdomínio próprio na versão final.»
13. **Suporte** — **Novo pedido**, responder na conversa, marcar como resolvido e reabrir.

---

### E. Administrador da plataforma — a rede (4 min)

_Mudar espaço de trabalho → Administrador_.

1. **Visão geral** — estabelecimentos activos, utilizadores, agendamentos, volume de pagamentos, actividade dos últimos 7 dias e distribuição por sector.
2. **Empresas** — **Novo estabelecimento**: preencha os dados e, no fim, **o gestor** (nome, email, palavra-passe inicial).
   - **A dizer:** «O provisionamento de uma empresa cria também o acesso do gestor. É este o ponto de entrada de um novo inquilino.»
   - **Suspender** a empresa → deixa de aparecer no directório público. **Activar** de novo.
3. **Utilizadores** — crie, edite, suspenda, reactive e elimine uma conta; filtre por perfil e por estado.
4. **Actividade** — registo de operações com filtro por empresa, indicadores de integridade e **Exportar registo** (JSON).
5. **Definições** — **momento de impacto**: mude o **intervalo entre horários** de 30 para 60 minutos e guarde. Volte ao fluxo de marcação do cliente: os horários disponíveis passam de meia em meia hora para de hora a hora.
   - **A dizer:** «Há regras globais da plataforma e regras de cada empresa. Esta hierarquia é uma decisão de arquitectura, não um detalhe de interface.»
   - **Reponha os 30 minutos antes de continuar.**
6. **Suporte** — o pedido criado pelo gestor aparece aqui, com o nome da empresa.

---

### F. Auto-registo de uma empresa (2 min)

No perfil de visitante ou cliente: **Registar empresa** (menu lateral).

1. Preencha `Barbearia Horizonte`, categoria _Beleza_, Maputo, morada, contacto e email.
2. Mostre a **identidade visual** (cores e ícone) e a **imagem de capa**.
3. **Criar estabelecimento** → entra imediatamente como gestor, no ecrã de **Serviços**, vazio, com o convite para criar o primeiro serviço.
4. Crie `Corte clássico`, 45 min, 800 MT.

**A dizer:** «Há dois caminhos de entrada: a plataforma cria a empresa, ou a empresa regista-se sozinha. Ambos terminam no mesmo sítio — o gestor a configurar o catálogo.»

---

## 4. Remate (1 min)

Volte a **Explorar** e alterne para o **tema escuro**. Estreite a janela para mostrar a versão móvel: navegação inferior, cartões e formulários de uma coluna.

> «O que viram é a experiência completa dos cinco papéis, com as regras de negócio já validadas: disponibilidade, conflitos, políticas de cancelamento, cupões, pagamentos e isolamento de dados entre empresas. O passo seguinte é o modelo de dados e o backend em Laravel, multi-tenant, com um subdomínio por empresa.»

---

## 5. Perguntas prováveis

| Pergunta                                | Resposta curta                                                                                                                            |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Isto já funciona a sério?               | É um mockup funcional. A lógica de negócio está implementada e testada, mas os dados vivem no navegador e não há servidor.                |
| Os pagamentos são reais?                | Não. O gateway é simulado e nenhum dado de pagamento é guardado. Na versão real será uma integração externa (carteiras móveis e cartões). |
| Os clientes recebem SMS ou email?       | Neste mockup as notificações são internas. Os canais externos entram no backend.                                                          |
| Uma empresa pode ver os dados de outra? | Não. Cada empresa só vê os seus serviços, equipa, clientes e reservas. Só o administrador da plataforma vê a rede.                        |
| Isto serve para outros sectores?        | Sim — a demonstração tem beleza, bem-estar, saúde e restauração, incluindo reserva de mesa com número de pessoas e atribuição automática. |
| Quando fica pronto?                     | O passo seguinte é o modelo de dados e o backend. O mockup existe precisamente para fechar o âmbito antes disso.                          |

---

## 6. O que não mostrar

- **Não** improvise fluxos fora deste guião com dados que não foram repostos.
- **Não** marque para «daqui a uma hora» — a política de antecedência bloqueia o cancelamento.
- **Não** prometa canais externos (SMS, email, push), relatórios agendados nem integração contabilística: não existem no mockup.
- Se o público for técnico, diga que os testes automáticos (`npm test`, `npm run test:ui`, `npm run test:use-cases`, `npm run test:appearance`) precisam do Microsoft Edge instalado, porque os scripts Playwright pedem `channel: 'msedge'`.

---

## Anexo A — Dados de demonstração

**Empresas**

| Empresa       | Sector      | Cidade | Horário     | Pagamento online | Antecedência |
| ------------- | ----------- | ------ | ----------- | ---------------- | ------------ |
| Studio Lume   | Beleza      | Maputo | 08:00–19:00 | Sim              | 2 h          |
| Soma Wellness | Bem-estar   | Maputo | 09:00–19:00 | Sim              | 4 h          |
| Clínica Vida  | Saúde       | Matola | 08:00–18:00 | Sim              | 4 h          |
| Mesa & Mar    | Restauração | Maputo | 12:00–22:00 | Não              | 2 h          |

**Serviços do Studio Lume:** Corte & styling (60 min, 1200 MT) · Manicure completa (45 min, 650 MT) · Coloração personalizada (120 min, 3500 MT) · Tratamento facial (60 min, 1800 MT, exige sala).

**Equipa do Studio Lume:** Ana Matavele (corte e coloração, 08:00–19:00) · Sara Chissano (manicure e facial, 08:00–18:00) · David Machava (corte e coloração, 09:00–19:00).

**Perfis de demonstração** (acesso pelo selector de espaço de trabalho, sem palavra-passe):

| Perfil        | Pessoa           | Email                    |
| ------------- | ---------------- | ------------------------ |
| Cliente       | José Mboane      | jose@example.com         |
| Profissional  | Ana Matavele     | ana@studiolume.co.mz     |
| Gestor        | Beatriz Cossa    | beatriz@studiolume.co.mz |
| Administrador | Admin MarcaFácil | admin@marcafacil.co.mz   |

**Cupões:** `BEMVINDO10` — 10%, Studio Lume, válido até 30/10/2026 · `SOMA15` — 15%, Soma Wellness, válido até 15/10/2026.

**Recursos:** Studio Lume tem _Sala de estética_; Mesa & Mar tem quatro mesas de 2, 4, 6 e 12 lugares (a atribuição escolhe a mais pequena que serve o grupo).

**Contas criadas durante a demonstração** (sugestão, para repetir sempre igual): cliente `marta@example.com` / `Apresenta2026!`; empresa `Barbearia Horizonte`.

---

## Anexo B — Registo de validação dos fluxos

Execução manual na aplicação em `127.0.0.1:5193`, a 15/09/2026, percorrendo a interface como um utilizador. Sem erros de JavaScript em nenhum fluxo.

| #   | Fluxo                                                                                                           | Resultado   |
| --- | --------------------------------------------------------------------------------------------------------------- | ----------- |
| 1   | Explorar: pesquisa, categorias, localização, filtros e ordenação                                                | OK          |
| 2   | Detalhes do estabelecimento: catálogo, cupão em destaque, informações                                           | OK          |
| 3   | Marcação em 3 passos com escolha de profissional e horário                                                      | OK          |
| 4   | Bloqueio do passo 2 até haver horário escolhido                                                                 | OK          |
| 5   | Cupão inválido rejeitado; `BEMVINDO10` aplica −120 MT                                                           | OK          |
| 6   | Criar conta a meio da marcação e retomar o rascunho                                                             | OK          |
| 7   | Confirmação, código da marcação e ficheiro `.ics`                                                               | OK (ver C2) |
| 8   | Pagamento online — carteiras Mkesh/Mpesa/eMola, validação e formatação do número                                | OK          |
| 9   | Pagamento online — cartão, campos obrigatórios, dados não persistidos                                           | OK          |
| 10  | «Testar recusa» não cria marcação                                                                               | OK          |
| 11  | Reagendar respeitando conflitos e disponibilidade                                                               | OK          |
| 12  | Cancelar com reembolso automático de pagamento online                                                           | OK          |
| 13  | Política de antecedência a bloquear cancelamento e reagendamento tardios                                        | OK          |
| 14  | Notificações: confirmação, reagendamento, cancelamento, lembrete, marcar como lidas                             | OK          |
| 15  | Perfil: alterar nome, alterar palavra-passe e iniciar sessão com ela                                            | OK          |
| 15a | Perfil: fotografia — carregar ficheiro, tirar com a câmara, substituir e remover, com iniciais em falta de foto | OK          |
| 16  | Favoritos                                                                                                       | OK          |
| 17  | Reserva de mesa com número de pessoas e atribuição automática do recurso                                        | OK          |
| 18  | Auto-registo de empresa e criação do primeiro serviço                                                           | OK          |
| 19  | Gestor: visão geral e nova reserva                                                                              | OK          |
| 20  | Gestor: agenda, estados do atendimento e registo de pagamento                                                   | OK          |
| 21  | Gestor: clientes — reservar, histórico, desactivar, remover                                                     | OK (ver C1) |
| 22  | Gestor: serviços — criar, editar, activar/desactivar, eliminar com histórico preservado                         | OK          |
| 23  | Gestor: equipa — criar membro e ficar imediatamente disponível para marcação                                    | OK (ver C7) |
| 24  | Gestor: recursos — criar, editar, eliminar                                                                      | OK (ver C4) |
| 25  | Gestor: horários — turnos, bloqueios e recusa de conflito com reservas activas                                  | OK          |
| 26  | Gestor: pagamentos, relatórios e exportações                                                                    | OK (ver C9) |
| 27  | Gestor: promoções — criar, desactivar, activar, editar, eliminar                                                | OK          |
| 28  | Suporte: criar pedido, responder, resolver, reabrir e ver do lado da plataforma                                 | OK          |
| 29  | Profissional: agenda, presença, conclusão, serviços, disponibilidade e histórico                                | OK (ver C8) |
| 30  | Plataforma: criar empresa com gestor, suspender, reactivar, remover                                             | OK (ver C6) |
| 31  | Plataforma: utilizadores — criar, editar, suspender, reactivar, eliminar                                        | OK          |
| 32  | Plataforma: actividade, integridade e exportação do registo                                                     | OK (ver C3) |
| 33  | Plataforma: definição global do intervalo entre horários a alterar a disponibilidade                            | OK          |
| 34  | Tema claro/escuro e navegação em largura móvel                                                                  | OK          |

**Sobre `docs/validacao/fluxos-apresentacao.json`:** a execução automática das 11:02 desse dia regista 7 falhas (F04 a F08, F10, F11). Foram reproduzidas manualmente e **nenhuma é um defeito da aplicação** — resultam de selectores e de temporização no script (`tests/e2e/presentation.test.mjs`): botões identificados por título que mudam de estado, diálogos que ficam abertos por desenho e botões desactivados até o Vue actualizar o DOM. O script precisa de ser corrigido antes de voltar a ser usado como indicador.

---

## Anexo C — Correcções recomendadas antes da apresentação

**Prioridade alta — visíveis no guião**

1. **C1 · Desactivar um cliente é irreversível.** Em _Clientes_, depois de desactivar, o botão fica inactivo e não existe «Reactivar cliente» (`setBusinessClientStatus` só aceita `inactive` e `removed`). Se desactivar durante a demonstração, não consegue voltar atrás sem repor os dados.
2. **C2 · O ecrã de confirmação mostra o identificador interno** (`a_866042fd-361e-…`) como código da marcação, enquanto o diálogo de detalhes mostra a referência curta (`#A56E902`). O ficheiro `.ics` herda o mesmo nome. Uniformizar para a referência curta.
3. **C3 · O registo de actividade mostra o nome da colecção.** Bloqueios de horário aparecem como «Criado: blocks» / «Eliminado: blocks», porque o texto usa `name || code || subject` e os bloqueios têm `reason`. É o primeiro ecrã do administrador da plataforma.
4. **C4 · Tipos de recurso em inglês.** O cartão do serviço mostra `room` e a lista de recursos mostra `room · 1 pessoa`. Além disso, o campo _Tipo_ do recurso é texto livre, pelo que nada garante que corresponda ao tipo exigido pelo serviço. Convém um vocabulário fechado (`Sala`, `Mesa`, …) partilhado pelos dois formulários.
5. **C5 · Concordância de plural.** «1 promoções», «1 recursos», «1 pessoas», «1 profissionais», «1 mensagens», «Existem 1 reservas neste período».

**Prioridade média — decisões que o backend vai herdar**

6. **C6 · Eliminar uma empresa deixa o gestor órfão.** A conta continua activa, com perfil _Gestor_ e `businessId` de uma empresa inexistente, e aparece em _Utilizadores_ com estabelecimento «—». A verificação de integridade em _Actividade_ não detecta o caso: só valida marcações (empresa, serviço e profissional). Fixar a regra de remoção (cascata, reatribuição ou bloqueio) antes do ERD.
7. **C7 · Profissional criado pelo gestor não gera conta de utilizador.** O novo membro da equipa fica disponível para marcações mas não existe em _Utilizadores_ e não consegue entrar. É exactamente a relação `users` ↔ `staff` ↔ `tenant` que o modelo de dados tem de resolver — vale a pena decidi-la agora.
8. **C8 · Rótulos inconsistentes entre os dois diálogos de bloqueio:** o gestor vê _Início_ / _Fim_, o profissional vê _Desde_ / _Até_.
9. **C9 · Nome de ficheiro exportado em inglês:** `reports-2026-09-15.csv`, enquanto os outros são `historico-atendimentos.csv` e `registo-de-actividade.json`.

**Prioridade baixa — polimento**

10. **C10 ·** Os selectores de filtro da agenda (profissional e estado) não têm rótulo acessível.
11. **C11 ·** Datas sem zero à esquerda no dia (`8/09/2026` ao lado de `15/09/2026`).
12. **C12 ·** No passo 2 de uma reserva de mesa continua a aparecer o selector de profissional, que não faz sentido na restauração.
13. **C13 · README desactualizado:** fala em quatro passos de marcação (são três) e remete para `docs/architecture.md` e `docs/tailwind.md`, que não existem.
