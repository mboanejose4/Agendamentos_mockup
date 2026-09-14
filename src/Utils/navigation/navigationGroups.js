export function getNavigationGroups(role) {
  if (role === "manager")
    return [
      {
        label: "PRINCIPAL",
        items: [
          ["overview", "Visão geral", "layout-dashboard"],
          ["agenda", "Agenda", "calendar-days"],
          ["clients", "Clientes", "users"],
        ],
      },
      {
        label: "EMPRESA",
        items: [
          ["services", "Serviços", "scissors"],
          ["team", "Equipa", "users"],
          ["resources", "Recursos", "armchair"],
          ["schedule", "Horários", "clock"],
        ],
      },
      {
        label: "GESTÃO",
        items: [
          ["payments", "Pagamentos", "wallet"],
          ["reports", "Relatórios", "bar-chart-3"],
          ["promotions", "Promoções", "tag"],
          ["settings", "Definições", "settings"],
          ["support", "Suporte", "message-square"],
        ],
      },
    ];
  if (role === "platform")
    return [
      {
        label: "PLATAFORMA",
        items: [
          ["platform-overview", "Visão geral", "layout-dashboard"],
          ["companies", "Empresas", "building-2"],
          ["users", "Utilizadores", "users"],
          ["monitoring", "Actividade", "activity"],
          ["support", "Suporte", "message-square"],
          ["platform-settings", "Definições", "settings"],
        ],
      },
    ];
  if (role === "professional")
    return [
      {
        label: "O SEU TRABALHO",
        items: [
          ["professional-agenda", "A minha agenda", "calendar-days"],
          ["professional-services", "Serviços", "briefcase-business"],
          ["professional-schedule", "Disponibilidade", "clock"],
          ["professional-history", "Histórico", "receipt"],
        ],
      },
      {
        label: "PESSOAL",
        items: [
          ["notifications", "Notificações", "bell"],
          ["profile", "O meu perfil", "user-round"],
        ],
      },
    ];
  return [
    {
      label: "DESCOBRIR",
      items: [
        ["explore", "Explorar", "grid-2x2"],
        ["favorites", "Favoritos", "heart"],
      ],
    },
    {
      label: "O SEU ESPAÇO",
      items: [
        ["appointments", "As minhas marcações", "calendar-days"],
        ["notifications", "Notificações", "bell"],
        ["profile", "O meu perfil", "user-round"],
      ],
    },
  ];
}
