# Fluxos e RBAC do Mockup

## Matriz de acesso

| Área | Visitante | Cliente | Profissional | Admin Salão | Admin Plataforma |
|---|---:|---:|---:|---:|---:|
| Pesquisar salões e serviços | ✓ | ✓ | — | — | — |
| Ver detalhes/disponibilidade | ✓ | ✓ | — | — | — |
| Criar marcação | até revisão | ✓ | — | gestão | — |
| Histórico do cliente | — | ✓ | — | ✓ | — |
| Cancelar/reagendar | — | ✓ | — | gestão | — |
| Pagamento | — | ✓ | — | acompanhamento | monitoria técnica |
| Agenda pessoal | — | — | ✓ | ✓ | — |
| Disponibilidade do profissional | — | — | ✓ | ✓ | — |
| Confirmar presença/concluir | — | — | ✓ | ✓ | — |
| Gerir serviços | — | — | consulta | ✓ | — |
| Gerir profissionais | — | — | — | ✓ | — |
| Associar profissional/serviço | — | — | consulta | ✓ | — |
| Turnos e horários | — | — | próprio | ✓ | — |
| Clientes | — | próprio | — | ✓ | — |
| Relatórios | — | — | — | ✓ | visão global futura |
| Promoções/cupões | uso | uso | — | ✓ | parâmetro global |
| Salões registados | — | — | — | próprio | ✓ |
| Parâmetros globais | — | — | — | — | ✓ |
| Monitoria | — | — | — | — | ✓ |
| Suporte técnico | — | — | — | solicita | ✓ |

## Estado do mockup

O pacote simula interacções locais em memória. Actualizar a página repõe os dados iniciais.

### Não implementado como backend

- Persistência em base de dados.
- Autenticação real e gestão de tokens.
- Envio real de SMS/e-mail/push.
- Processamento real do gateway de pagamentos.
- Regras legais definitivas para cancelamento/reagendamento.
- Motor de disponibilidade transaccional e bloqueio concorrente de horários.
- Auditoria, logs e controlo de acesso no servidor.

### Pontos para a fase de implementação

1. Converter a store local numa API tipada.
2. Introduzir Vue Router com route guards por role.
3. Introduzir Pinia se o estado crescer ou for partilhado por muitos módulos.
4. Modelar disponibilidade no backend com lock/transaction para impedir dupla marcação.
5. Integrar gateway de pagamento através de intents/transactions idempotentes.
6. Configurar notificações assíncronas e templates.
7. Implementar políticas de privacidade, retenção, consentimento e auditoria.
8. Adicionar testes E2E por role e pelos fluxos críticos.
