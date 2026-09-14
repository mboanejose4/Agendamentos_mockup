# Diagrama: funcionalidades executáveis no mockup

As acções abaixo usam dados locais persistidos no navegador. O selector de espaço de trabalho permite experimentar os perfis de demonstração. Contas criadas ou configuradas com palavra-passe podem iniciar sessão no formulário.

## Administrador da plataforma

| Caso do diagrama                     | Onde executar | Acção                                                                                  |
| ------------------------------------ | ------------- | -------------------------------------------------------------------------------------- |
| Gerir empresas registadas            | Empresas      | Novo estabelecimento, editar e remover; exclusões com dependências são impedidas       |
| Activar ou desactivar empresas       | Empresas      | Suspender / Activar na linha da empresa                                                |
| Configurar parâmetros globais        | Definições    | Guardar intervalos, antecedência, pagamentos, promoções e notificações                 |
| Monitorar o funcionamento do sistema | Actividade    | Pesquisar, filtrar e exportar registos; consultar inconsistências e indicadores locais |
| Gerir utilizadores                   | Utilizadores  | Criar, editar, atribuir perfil/empresa, suspender, reactivar e eliminar                |

## Conta e cliente

| Caso do diagrama                              | Onde executar                    | Acção                                                                                        |
| --------------------------------------------- | -------------------------------- | -------------------------------------------------------------------------------------------- |
| Criar conta e autenticar-se                   | Autenticação                     | Criar conta / Iniciar sessão; palavras-passe com hash e salt                                 |
| Pesquisar empresas e serviços                 | Explorar                         | Pesquisa, categoria, localização, preço e filtros                                            |
| Consultar detalhes da empresa                 | Cartão do estabelecimento        | Abrir detalhes, serviços e condições; a equipa não é exposta ao cliente                      |
| Seleccionar o serviço pretendido              | Detalhes / Marcação, passo 1     | Escolher serviço e, quando aplicável, número de pessoas ou recurso                           |
| Consultar disponibilidade de datas e horários | Marcação, passo 2                | Escolher data, profissional entre os disponíveis para o serviço e horário livre              |
| Efectuar marcação                             | Marcação, passo 3                | Confirmar e guardar a marcação                                                               |
| Efectuar pagamento online                     | Marcação / Pagamento de teste    | Aprovar, manter pendente ou testar recusa; sem cobrança real                                 |
| Utilizar cupões                               | Revisão da marcação              | Introduzir código e Aplicar; validar validade, serviço e desconto                            |
| Receber notificações e lembretes              | Notificações                     | Confirmações, alterações, cancelamentos, pagamentos e lembretes locais de próximas marcações |
| Consultar histórico de marcações              | As minhas marcações              | Separadores de próximas, histórico e todas; Ver detalhes                                     |
| Cancelar ou reagendar marcação                | Detalhes de uma marcação activa  | Cancelar com confirmação / Reagendar; respeita antecedência e disponibilidade                |
| Consultar confirmação da marcação             | Final da marcação / Ver detalhes | Consultar dados confirmados e descarregar calendário                                         |

## Gestor da empresa

| Caso do diagrama                                 | Onde executar                  | Acção                                                                           |
| ------------------------------------------------ | ------------------------------ | ------------------------------------------------------------------------------- |
| Configurar perfil da empresa                     | Definições                     | Editar perfil, paleta, ícone, capa e preferências; Guardar alterações           |
| Gerir serviços                                   | Serviços                       | Criar, editar, activar/desactivar e remover                                     |
| Gerir profissionais                              | Equipa                         | Adicionar, editar, activar/desactivar e remover profissionais                   |
| Associar serviços a profissionais                | Equipa, editar profissional    | Seleccionar Serviços que realiza e guardar                                      |
| Definir turnos                                   | Horários / editar profissional | Definir dias e início/fim do turno                                              |
| Definir indisponibilidade                        | Horários                       | Adicionar, editar e eliminar bloqueios; rejeita conflitos com marcações activas |
| Gerir a agenda da empresa                        | Agenda                         | Filtrar profissional/estado/data, criar, editar e consultar marcações           |
| Visualizar histórico de clientes e profissionais | Clientes / Equipa              | Botão Ver histórico, com todas as marcações da pessoa neste estabelecimento     |
| Consultar relatórios e indicadores               | Visão geral / Relatórios       | Indicadores, períodos e exportação                                              |
| Registar e acompanhar pagamentos                 | Pagamentos                     | Filtrar e registar recebimentos; consultar pagos, pendentes e reembolsos        |
| Gerir promoções                                  | Promoções                      | Criar, editar, activar/desactivar e eliminar cupões                             |

## Profissional

| Caso do diagrama                              | Onde executar             | Acção                                                                            |
| --------------------------------------------- | ------------------------- | -------------------------------------------------------------------------------- |
| Consultar a agenda pessoal                    | A minha agenda            | Consultar por data e estado                                                      |
| Consultar serviços autorizados                | Serviços                  | Consultar serviços atribuídos ao profissional seleccionado                       |
| Registar indisponibilidades                   | Disponibilidade           | Criar, editar e remover bloqueios próprios e definir horário                     |
| Confirmar presença e conclusão do atendimento | A minha agenda / Detalhes | Confirmar presença, depois Concluir atendimento; registar falta quando aplicável |
| Consultar histórico de atendimentos           | Histórico                 | Pesquisar e filtrar por período/estado, consultar e exportar                     |

## Imagem de capa

O campo Imagem de capa recebe JPG, PNG ou WebP até 8 MB, optimiza a imagem e apresenta uma miniatura. Ver em ecrã inteiro abre um diálogo que ocupa o viewport e mantém a proporção da imagem. Fechar ou Escape regressa ao formulário. É possível remover a capa ou descartar as alterações. Guardar alterações persiste a capa e actualiza os detalhes públicos. O mesmo componente é utilizado no registo da empresa.

## Limites da simulação e validação

Pagamentos são simulados; não existe gateway real. As notificações aparecem dentro da aplicação; não são enviados emails, SMS ou push. Os lembretes de marcações confirmadas nas próximas 24 horas são gerados ao abrir a aplicação, ao alterar marcações, a cada minuto enquanto aberta e ao regressar à janela. Não há execução em segundo plano com a aplicação fechada.

npm test valida disponibilidade, conflitos, cancelamento, reagendamento, pagamentos, cupões, autenticação e lembretes. npm run test:use-cases executa operações de gestão, upload/preview/persistência, pagamento simulado, reagendamento e confirmação de presença/conclusão. npm run test:ui cobre a navegação dos vários perfis em mobile e desktop; npm run test:appearance cobre temas e identidade visual. APP_URL selecciona o servidor de desenvolvimento.
