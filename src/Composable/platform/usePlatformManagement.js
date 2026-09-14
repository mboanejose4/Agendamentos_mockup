import { computed, reactive, ref, watch } from "vue";
import {
  state,
  go,
  notify,
  uid,
  money,
  today,
  dateLabel,
  business,
  saveRecord,
  removeRecord,
  setAccountPassword,
} from "@/Store/applicationStore.js";

// Local state belongs to one mounted feature instance.
export function usePlatformManagement() {
  const roleNames = {
    client: "Cliente",
    professional: "Profissional",
    manager: "Gestor",
    platform: "Administrador da plataforma",
  };
  const categories = ["Beleza", "Bem-estar", "Saúde", "Restauração", "Outros"];
  const isPlatform = computed(() => state.role === "platform");
  const currentUser = computed(
    () => state.db.users.find((item) => item.id === state.userId) || {},
  );
  const businesses = computed(() => state.db.businesses);
  const activeBusinesses = computed(() =>
    businesses.value.filter((item) => item.active),
  );
  const totalBookings = computed(() =>
    state.db.bookings.filter((item) => item.status !== "cancelled"),
  );
  const paidVolume = computed(() =>
    state.db.bookings
      .filter((item) => item.paymentStatus === "paid")
      .reduce((sum, item) => sum + Number(item.total || 0), 0),
  );
  const activeUsers = computed(() =>
    state.db.users.filter((item) => item.active),
  );
  const dateTime = (value) =>
    value
      ? new Date(value).toLocaleString("pt-PT", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";
  const initials = (name) =>
    String(name || "")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("") || "E";
  const activityDays = computed(() =>
    Array.from({ length: 7 }, (_, index) => {
      const date = new Date(`${today()}T12:00:00`);
      date.setDate(date.getDate() - 6 + index);
      const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      return {
        iso,
        label: date.toLocaleDateString("pt-PT", { weekday: "short" }),
        count: totalBookings.value.filter((item) => item.date === iso).length,
      };
    }),
  );
  const maxDayCount = computed(() =>
    Math.max(1, ...activityDays.value.map((day) => day.count)),
  );
  const categoryDistribution = computed(() =>
    [...new Set(businesses.value.map((item) => item.category))].map(
      (category) => ({
        category,
        count: businesses.value.filter((item) => item.category === category)
          .length,
      }),
    ),
  );
  const recentLogs = computed(() =>
    [...(state.db.logs || [])]
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
      .slice(0, 6),
  );
  const companySearch = ref("");
  const companyCategory = ref("all");
  const companyStatus = ref("all");
  const filteredCompanies = computed(() =>
    businesses.value.filter(
      (item) =>
        `${item.name} ${item.city} ${item.email}`
          .toLowerCase()
          .includes(companySearch.value.toLowerCase()) &&
        (companyCategory.value === "all" ||
          item.category === companyCategory.value) &&
        (companyStatus.value === "all" ||
          Boolean(item.active) === (companyStatus.value === "active")),
    ),
  );
  const companyOpen = ref(false);
  const companyError = ref("");
  const companySaving = ref(false);
  const companyForm = reactive({
    id: "",
    name: "",
    category: "Beleza",
    description: "",
    city: "Maputo",
    address: "",
    phone: "",
    email: "",
    image: "",
    active: true,
    onlinePayment: true,
    opens: "08:00",
    closes: "18:00",
    cancelHours: 2,
    days: [1, 2, 3, 4, 5, 6],
    managerName: "",
    managerEmail: "",
    managerPassword: "",
  });
  function openCompany(item = null) {
    Object.assign(
      companyForm,
      item
        ? {
            ...item,
            days: [...(item.days || [1, 2, 3, 4, 5, 6])],
            managerName: "",
            managerEmail: "",
            managerPassword: "",
          }
        : {
            id: "",
            name: "",
            category: "Beleza",
            description: "",
            city: "Maputo",
            address: "",
            phone: "",
            email: "",
            image: "",
            active: true,
            onlinePayment: true,
            opens: "08:00",
            closes: "18:00",
            cancelHours: 2,
            days: [1, 2, 3, 4, 5, 6],
            managerName: "",
            managerEmail: "",
            managerPassword: "",
          },
    );
    companyError.value = "";
    companyOpen.value = true;
  }
  async function saveCompany() {
    companyError.value = "";
    if (companyForm.closes <= companyForm.opens) {
      companyError.value = "A hora de fecho deve ser posterior à abertura.";
      return;
    }
    if (!companyForm.days.length) {
      companyError.value = "Seleccione pelo menos um dia de funcionamento.";
      return;
    }
    if (
      companyForm.managerEmail &&
      state.db.users.some(
        (item) =>
          item.email.toLowerCase() ===
          companyForm.managerEmail.trim().toLowerCase(),
      )
    ) {
      companyError.value = "O email do gestor já está associado a uma conta.";
      return;
    }
    companySaving.value = true;
    const { managerName, managerEmail, managerPassword, ...fields } =
      companyForm;
    const record = saveRecord("businesses", {
      ...fields,
      name: fields.name.trim(),
      email: fields.email.trim().toLowerCase(),
      rating:
        businesses.value.find((item) => item.id === fields.id)?.rating || 0,
      reviewCount:
        businesses.value.find((item) => item.id === fields.id)?.reviewCount ||
        0,
      days: [...fields.days],
    });
    if (!companyForm.id && managerEmail) {
      const manager = saveRecord("users", {
        id: uid("u"),
        name: managerName.trim(),
        email: managerEmail.trim().toLowerCase(),
        phone: fields.phone,
        role: "manager",
        businessId: record.id,
        active: true,
      });
      const result = await setAccountPassword(manager.id, managerPassword);
      if (!result.ok) {
        removeRecord("users", manager.id);
        removeRecord("businesses", record.id);
        companySaving.value = false;
        companyError.value = result.error;
        return;
      }
    }
    companySaving.value = false;
    companyOpen.value = false;
    notify(
      companyForm.id
        ? "Estabelecimento actualizado."
        : "Estabelecimento criado. A equipa pode iniciar a configuração.",
    );
  }
  const removal = ref(null);
  const removalOpen = ref(false);
  const removalError = ref("");
  function requestRemoval(collection, item) {
    removal.value = { collection, item };
    removalError.value = "";
    removalOpen.value = true;
  }
  function performRemoval() {
    if (
      removal.value.collection === "users" &&
      removal.value.item.id === state.userId
    ) {
      removalError.value = "Não pode eliminar a conta que está a utilizar.";
      return;
    }
    const result = removeRecord(
      removal.value.collection,
      removal.value.item.id,
    );
    if (!result.ok) {
      removalError.value = result.error;
      return;
    }
    removalOpen.value = false;
    notify(
      result.archived
        ? "Estabelecimento desactivado. O histórico foi preservado."
        : "Registo eliminado.",
    );
  }
  function toggleCompany(item) {
    saveRecord("businesses", { ...item, active: !item.active });
    notify(
      item.active
        ? "Estabelecimento suspenso para novas marcações."
        : "Estabelecimento activado.",
    );
  }
  const userSearch = ref("");
  const userRole = ref("all");
  const userStatus = ref("all");
  const filteredUsers = computed(() =>
    state.db.users.filter(
      (item) =>
        `${item.name} ${item.email} ${business(item.businessId)?.name || ""}`
          .toLowerCase()
          .includes(userSearch.value.toLowerCase()) &&
        (userRole.value === "all" || item.role === userRole.value) &&
        (userStatus.value === "all" ||
          Boolean(item.active) === (userStatus.value === "active")),
    ),
  );
  const userOpen = ref(false);
  const userForm = reactive({
    id: "",
    name: "",
    email: "",
    phone: "",
    role: "client",
    businessId: "",
    active: true,
    password: "",
    title: "",
    serviceIds: [],
    staffId: "",
  });
  const userError = ref("");
  const userSaving = ref(false);
  const userServices = computed(() =>
    state.db.services.filter(
      (item) => item.businessId === userForm.businessId && item.active,
    ),
  );
  function openUser(item = null) {
    const person = item?.staffId
      ? state.db.staff.find((entry) => entry.id === item.staffId)
      : null;
    Object.assign(
      userForm,
      item
        ? {
            ...item,
            password: "",
            title: person?.title || "",
            serviceIds: [...(person?.serviceIds || [])],
            staffId: person?.id || "",
          }
        : {
            id: "",
            name: "",
            email: "",
            phone: "",
            role: "client",
            businessId: "",
            active: true,
            password: "",
            title: "",
            serviceIds: [],
            staffId: "",
          },
    );
    userError.value = "";
    userOpen.value = true;
  }
  async function saveUser() {
    userError.value = "";
    if (
      state.db.users.some(
        (item) =>
          item.id !== userForm.id &&
          item.email.toLowerCase() === userForm.email.trim().toLowerCase(),
      )
    ) {
      userError.value = "Este email já está associado a uma conta.";
      return;
    }
    if (
      ["manager", "professional"].includes(userForm.role) &&
      !userForm.businessId
    ) {
      userError.value = "Associe este utilizador a um estabelecimento.";
      return;
    }
    if (userForm.password && userForm.password.length < 8) {
      userError.value = "A palavra-passe deve ter pelo menos 8 caracteres.";
      return;
    }
    if (
      userForm.id === state.userId &&
      (!userForm.active || userForm.role !== "platform")
    ) {
      userError.value =
        "A sua própria conta deve manter o acesso de administrador activo.";
      return;
    }
    userSaving.value = true;
    const existing = state.db.users.find((item) => item.id === userForm.id);
    const { password, title, serviceIds, ...fields } = userForm;
    const record = saveRecord("users", {
      ...fields,
      name: fields.name.trim(),
      email: fields.email.trim().toLowerCase(),
      businessId: ["manager", "professional"].includes(fields.role)
        ? fields.businessId
        : "",
    });
    if (password) {
      const result = await setAccountPassword(record.id, password);
      if (!result.ok) {
        if (!existing) removeRecord("users", record.id);
        userError.value = result.error;
        userSaving.value = false;
        return;
      }
    }
    if (record.role === "professional") {
      const person = state.db.staff.find((item) => item.id === record.staffId);
      const venue = business(record.businessId);
      const professionalRecord = saveRecord("staff", {
        ...person,
        id: person?.id || uid("p"),
        businessId: record.businessId,
        name: record.name,
        email: record.email,
        phone: record.phone,
        title: title.trim() || "Profissional",
        serviceIds: serviceIds.filter((id) =>
          userServices.value.some((item) => item.id === id),
        ),
        active: record.active,
        start: person?.start || venue?.opens || "08:00",
        end: person?.end || venue?.closes || "18:00",
        days: [...(person?.days || venue?.days || [1, 2, 3, 4, 5, 6])],
      });
      saveRecord("users", { ...record, staffId: professionalRecord.id });
    }
    if (record.role === "client") {
      const client = state.db.clients.find((item) => item.id === record.id);
      saveRecord("clients", {
        ...client,
        id: record.id,
        name: record.name,
        email: record.email,
        phone: record.phone,
        businessId: client?.businessId || "",
      });
    }
    userSaving.value = false;
    userOpen.value = false;
    notify(
      existing ? "Utilizador actualizado." : "Conta de utilizador criada.",
    );
  }
  function toggleUser(item) {
    if (item.id === state.userId) {
      notify("Não pode suspender a sua própria conta.");
      return;
    }
    saveRecord("users", { ...item, active: !item.active });
    if (item.staffId) {
      const person = state.db.staff.find((entry) => entry.id === item.staffId);
      if (person) saveRecord("staff", { ...person, active: !item.active });
    }
    notify(item.active ? "Conta suspensa." : "Conta reactivada.");
  }
  const settingsForm = reactive({
    slotMinutes: 30,
    advanceDays: 60,
    onlinePayments: true,
    promotions: true,
    notifications: true,
  });
  const settingsError = ref("");
  watch(
    () => state.view,
    () => {
      if (state.view === "platform-settings") {
        Object.assign(settingsForm, state.db.settings);
        settingsError.value = "";
      }
    },
    { immediate: true },
  );
  function saveSettings() {
    if (
      Number(settingsForm.slotMinutes) < 5 ||
      Number(settingsForm.slotMinutes) > 120 ||
      Number(settingsForm.advanceDays) < 1 ||
      Number(settingsForm.advanceDays) > 365
    ) {
      settingsError.value =
        "O intervalo deve estar entre 5 e 120 minutos; a antecedência entre 1 e 365 dias.";
      return;
    }
    Object.assign(state.db.settings, {
      ...settingsForm,
      slotMinutes: Number(settingsForm.slotMinutes),
      advanceDays: Number(settingsForm.advanceDays),
    });
    saveRecord("logs", {
      action: "Configurações globais actualizadas",
      userId: state.userId,
      businessId: "",
      createdAt: new Date().toISOString(),
    });
    settingsError.value = "";
    notify("Configurações da plataforma guardadas.");
  }
  const logSearch = ref("");
  const logBusiness = ref("all");
  const filteredLogs = computed(() =>
    [...(state.db.logs || [])]
      .filter(
        (item) =>
          `${item.action} ${state.db.users.find((user) => user.id === item.userId)?.name || ""}`
            .toLowerCase()
            .includes(logSearch.value.toLowerCase()) &&
          (logBusiness.value === "all" ||
            item.businessId === logBusiness.value),
      )
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))),
  );
  const localStorageSize = computed(
    () => new TextEncoder().encode(JSON.stringify(state.db)).length,
  );
  const validationIssues = computed(() => {
    const issues = [];
    for (const item of state.db.bookings) {
      if (!state.db.businesses.some((venue) => venue.id === item.businessId))
        issues.push({
          id: `${item.id}-business`,
          text: `A marcação ${item.id} não tem estabelecimento associado.`,
        });
      if (!state.db.services.some((entry) => entry.id === item.serviceId))
        issues.push({
          id: `${item.id}-service`,
          text: `A marcação de ${item.clientName} não tem serviço associado.`,
        });
      if (
        item.staffId &&
        !state.db.staff.some((entry) => entry.id === item.staffId)
      )
        issues.push({
          id: `${item.id}-staff`,
          text: `A marcação de ${item.clientName} não tem profissional associado.`,
        });
    }
    return issues;
  });
  function exportLogs() {
    downloadFile(
      "registo-de-actividade.json",
      JSON.stringify(filteredLogs.value, null, 2),
      "application/json",
    );
  }
  function downloadFile(name, content, type) {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
    URL.revokeObjectURL(url);
  }
  const ticketSearch = ref("");
  const ticketStatus = ref("all");
  const tickets = computed(() =>
    state.db.tickets.filter(
      (item) => isPlatform.value || item.businessId === state.businessId,
    ),
  );
  const filteredTickets = computed(() =>
    tickets.value
      .filter(
        (item) =>
          `${item.subject} ${business(item.businessId)?.name || ""}`
            .toLowerCase()
            .includes(ticketSearch.value.toLowerCase()) &&
          (ticketStatus.value === "all" || item.status === ticketStatus.value),
      )
      .sort((a, b) =>
        String(
          b.updatedAt || b.createdAt || b.messages?.at(-1)?.createdAt,
        ).localeCompare(
          String(a.updatedAt || a.createdAt || a.messages?.at(-1)?.createdAt),
        ),
      ),
  );
  const openTickets = computed(() =>
    tickets.value.filter((item) => item.status !== "closed"),
  );
  const ticketStatusNames = {
    open: "Aberto",
    in_progress: "Em análise",
    closed: "Resolvido",
  };
  const ticketPriorityNames = {
    low: "Baixa",
    normal: "Normal",
    medium: "Normal",
    high: "Alta",
    urgent: "Urgente",
  };
  const ticketOpen = ref(false);
  const ticketForm = reactive({
    subject: "",
    businessId: "",
    priority: "normal",
    body: "",
  });
  const ticketError = ref("");
  const selectedTicketId = ref("");
  const conversationOpen = ref(false);
  const selectedTicket = computed(() =>
    tickets.value.find((item) => item.id === selectedTicketId.value),
  );
  const reply = ref("");
  function openNewTicket() {
    Object.assign(ticketForm, {
      subject: "",
      businessId: isPlatform.value
        ? businesses.value[0]?.id || ""
        : state.businessId,
      priority: "normal",
      body: "",
    });
    ticketError.value = "";
    ticketOpen.value = true;
  }
  function saveTicket() {
    if (!ticketForm.subject.trim() || !ticketForm.body.trim()) {
      ticketError.value = "Preencha o assunto e descreva o pedido.";
      return;
    }
    const createdAt = new Date().toISOString();
    const record = saveRecord("tickets", {
      subject: ticketForm.subject.trim(),
      businessId: isPlatform.value ? ticketForm.businessId : state.businessId,
      priority: ticketForm.priority,
      status: "open",
      createdAt,
      updatedAt: createdAt,
      messages: [
        {
          author:
            currentUser.value.name ||
            (isPlatform.value ? "Administração" : "Gestor"),
          userId: state.userId,
          role: state.role,
          body: ticketForm.body.trim(),
          createdAt,
        },
      ],
    });
    ticketOpen.value = false;
    openConversation(record);
    notify("Pedido de suporte criado.");
  }
  function openConversation(item) {
    selectedTicketId.value = item.id;
    reply.value = "";
    conversationOpen.value = true;
  }
  function sendReply() {
    if (
      !reply.value.trim() ||
      !selectedTicket.value ||
      selectedTicket.value.status === "closed"
    )
      return;
    const createdAt = new Date().toISOString();
    saveRecord("tickets", {
      ...selectedTicket.value,
      status: isPlatform.value ? "in_progress" : selectedTicket.value.status,
      updatedAt: createdAt,
      messages: [
        ...(selectedTicket.value.messages || []),
        {
          author: currentUser.value.name || "Equipa",
          userId: state.userId,
          role: state.role,
          body: reply.value.trim(),
          createdAt,
        },
      ],
    });
    reply.value = "";
    notify("Resposta adicionada ao pedido.");
  }
  function changeTicketStatus(status) {
    saveRecord("tickets", {
      ...selectedTicket.value,
      status,
      updatedAt: new Date().toISOString(),
    });
    notify(
      status === "closed"
        ? "Pedido marcado como resolvido."
        : "Pedido reaberto.",
    );
  }
  const titles = {
    "platform-overview": [
      "Visão geral",
      "Acompanhe a actividade de toda a plataforma.",
    ],
    companies: [
      "Estabelecimentos",
      "Uma rede de serviços, várias oportunidades.",
    ],
    users: ["Utilizadores", "Contas, equipas e acessos à plataforma."],
    "platform-settings": [
      "Configurações da plataforma",
      "Preferências globais para os estabelecimentos e os clientes.",
    ],
    monitoring: [
      "Monitoria e actividade",
      "Integridade dos dados e registo das operações.",
    ],
    support: [
      "Centro de suporte",
      "Acompanhe pedidos e converse com a equipa.",
    ],
  };
  const dayOptions = [
    { id: 1, name: "Seg" },
    { id: 2, name: "Ter" },
    { id: 3, name: "Qua" },
    { id: 4, name: "Qui" },
    { id: 5, name: "Sex" },
    { id: 6, name: "Sáb" },
    { id: 0, name: "Dom" },
  ];
  return {
    state,
    go,
    notify,
    uid,
    money,
    today,
    dateLabel,
    business,
    saveRecord,
    removeRecord,
    setAccountPassword,
    roleNames,
    categories,
    isPlatform,
    currentUser,
    businesses,
    activeBusinesses,
    totalBookings,
    paidVolume,
    activeUsers,
    dateTime,
    initials,
    activityDays,
    maxDayCount,
    categoryDistribution,
    recentLogs,
    companySearch,
    companyCategory,
    companyStatus,
    filteredCompanies,
    companyOpen,
    companyError,
    companySaving,
    companyForm,
    openCompany,
    saveCompany,
    removal,
    removalOpen,
    removalError,
    requestRemoval,
    performRemoval,
    toggleCompany,
    userSearch,
    userRole,
    userStatus,
    filteredUsers,
    userOpen,
    userForm,
    userError,
    userSaving,
    userServices,
    openUser,
    saveUser,
    toggleUser,
    settingsForm,
    settingsError,
    saveSettings,
    logSearch,
    logBusiness,
    filteredLogs,
    localStorageSize,
    validationIssues,
    exportLogs,
    downloadFile,
    ticketSearch,
    ticketStatus,
    tickets,
    filteredTickets,
    openTickets,
    ticketStatusNames,
    ticketPriorityNames,
    ticketOpen,
    ticketForm,
    ticketError,
    selectedTicketId,
    conversationOpen,
    selectedTicket,
    reply,
    openNewTicket,
    saveTicket,
    openConversation,
    sendReply,
    changeTicketStatus,
    titles,
    dayOptions,
  };
}
