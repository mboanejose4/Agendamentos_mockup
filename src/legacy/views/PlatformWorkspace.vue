<script setup>
import { computed, reactive, ref, watch } from "vue";
import AppIcon from "@/Component/ui/AppIcon.vue";
import AppModal from "@/Component/ui/AppModal.vue";
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
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0",
    )}-${String(date.getDate()).padStart(2, "0")}`;
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
  const { managerName, managerEmail, managerPassword, ...fields } = companyForm;
  const record = saveRecord("businesses", {
    ...fields,
    name: fields.name.trim(),
    email: fields.email.trim().toLowerCase(),
    rating: businesses.value.find((item) => item.id === fields.id)?.rating || 0,
    reviewCount:
      businesses.value.find((item) => item.id === fields.id)?.reviewCount || 0,
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
  const result = removeRecord(removal.value.collection, removal.value.item.id);
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
  notify(existing ? "Utilizador actualizado." : "Conta de utilizador criada.");
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
        `${item.action} ${
          state.db.users.find((user) => user.id === item.userId)?.name || ""
        }`
          .toLowerCase()
          .includes(logSearch.value.toLowerCase()) &&
        (logBusiness.value === "all" || item.businessId === logBusiness.value),
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
    status === "closed" ? "Pedido marcado como resolvido." : "Pedido reaberto.",
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
  support: ["Centro de suporte", "Acompanhe pedidos e converse com a equipa."],
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
</script>

<template>
  <div class="platform-workspace">
    <header class="page-header">
      <div>
        <h1>{{ titles[state.view]?.[0] }}</h1>
        <p>{{ titles[state.view]?.[1] }}</p>
      </div>
      <div class="actions">
        <button
          v-if="
            state.view === 'companies' || state.view === 'platform-overview'
          "
          class="btn primary"
          @click="openCompany()"
        >
          <AppIcon name="plus" /> Novo estabelecimento</button
        ><button
          v-if="state.view === 'users'"
          class="btn primary"
          @click="openUser()"
        >
          <AppIcon name="user-plus" /> Novo utilizador</button
        ><button
          v-if="state.view === 'support'"
          class="btn primary"
          @click="openNewTicket"
        >
          <AppIcon name="plus" /> Novo pedido</button
        ><button
          v-if="state.view === 'monitoring'"
          class="btn secondary"
          :disabled="!filteredLogs.length"
          @click="exportLogs"
        >
          <AppIcon name="download" /> Exportar registo
        </button>
      </div>
    </header>

    <template v-if="state.view === 'platform-overview'">
      <div class="stats-grid platform-stats">
        <div class="stat">
          <span class="stat-label">Estabelecimentos activos</span
          ><strong>{{ activeBusinesses.length }}</strong
          ><span class="muted">{{ businesses.length }} no total</span>
        </div>
        <div class="stat">
          <span class="stat-label">Utilizadores activos</span
          ><strong>{{ activeUsers.length }}</strong
          ><span class="muted">em todos os perfis</span>
        </div>
        <div class="stat">
          <span class="stat-label">Agendamentos</span
          ><strong>{{ totalBookings.length }}</strong
          ><span class="muted">excluindo cancelamentos</span>
        </div>
        <div class="stat">
          <span class="stat-label">Pagamentos registados</span
          ><strong>{{ money(paidVolume) }}</strong
          ><span class="muted">volume acumulado</span>
        </div>
      </div>
      <div class="platform-insights">
        <section class="activity-chart">
          <div class="section-heading">
            <div>
              <h2 class="section-title">Actividade de agendamentos</h2>
              <p class="muted">Últimos 7 dias</p>
            </div>
            <AppIcon name="chart-no-axes-column" />
          </div>
          <div
            class="bar-chart"
            role="img"
            :aria-label="
              activityDays
                .map((day) => `${day.label}: ${day.count} agendamentos`)
                .join(', ')
            "
          >
            <div v-for="day in activityDays" :key="day.iso" class="bar-column">
              <span class="bar-value">{{ day.count }}</span>
              <div class="bar-track">
                <span
                  :style="{
                    height: `${
                      day.count
                        ? Math.max(5, (day.count / maxDayCount) * 100)
                        : 2
                    }%`,
                  }"
                  :class="{
                    current: day.iso === today(),
                    zero: day.count === 0,
                  }"
                ></span>
              </div>
              <span class="bar-label">{{ day.label }}</span>
            </div>
          </div>
        </section>
        <section class="category-distribution">
          <h2 class="section-title">Uma plataforma, vários sectores</h2>
          <div
            v-for="(item, index) in categoryDistribution"
            :key="item.category"
            class="category-row"
          >
            <span :class="['category-dot', `category-${index % 5}`]"></span
            ><span>{{ item.category }}</span
            ><strong>{{ item.count }}</strong>
            <div class="category-bar">
              <span
                :class="`category-${index % 5}`"
                :style="{
                  width: `${(item.count / Math.max(1, businesses.length)) * 100}%`,
                }"
              ></span>
            </div>
          </div>
          <div class="support-summary">
            <span
              ><AppIcon name="messages-square" /> Pedidos de suporte
              abertos</span
            ><strong>{{ openTickets.length }}</strong
            ><button
              class="icon-btn"
              title="Abrir suporte"
              aria-label="Abrir suporte"
              @click="go('support')"
            >
              <AppIcon name="arrow-up-right" />
            </button>
          </div>
        </section>
      </div>
      <section class="platform-business-preview">
        <div class="section-heading">
          <h2 class="section-title">Estabelecimentos da rede</h2>
          <button class="btn secondary" @click="go('companies')">
            Ver todos <AppIcon name="arrow-right" />
          </button>
        </div>
        <div class="table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th>Estabelecimento</th>
                <th>Sector</th>
                <th>Cidade</th>
                <th>Marcações</th>
                <th>Estado</th>
                <th><span class="sr-only">Acções</span></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in businesses.slice(0, 5)" :key="item.id">
                <td>
                  <div class="table-identity">
                    <img v-if="item.image" :src="item.image" alt="" /><span
                      v-else
                      class="avatar"
                      >{{ initials(item.name) }}</span
                    ><strong>{{ item.name }}</strong>
                  </div>
                </td>
                <td>{{ item.category }}</td>
                <td>{{ item.city }}</td>
                <td>
                  {{
                    state.db.bookings.filter(
                      (booking) => booking.businessId === item.id,
                    ).length
                  }}
                </td>
                <td>
                  <span
                    :class="['badge', item.active ? 'success' : 'neutral']"
                    >{{ item.active ? "Activo" : "Suspenso" }}</span
                  >
                </td>
                <td>
                  <button
                    class="icon-btn"
                    title="Editar estabelecimento"
                    aria-label="Editar estabelecimento"
                    @click="openCompany(item)"
                  >
                    <AppIcon name="pencil" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <section class="recent-activity">
        <div class="section-heading">
          <h2 class="section-title">Actividade recente</h2>
          <button class="btn secondary" @click="go('monitoring')">
            Ver registo <AppIcon name="arrow-right" />
          </button>
        </div>
        <div v-if="recentLogs.length">
          <div v-for="item in recentLogs" :key="item.id" class="activity-row">
            <span class="activity-mark"></span>
            <div>
              <strong>{{ item.action }}</strong
              ><small
                >{{
                  state.db.users.find((user) => user.id === item.userId)
                    ?.name || "Sistema"
                }}<template v-if="business(item.businessId)">
                  · {{ business(item.businessId).name }}</template
                ></small
              >
            </div>
            <time>{{ dateTime(item.createdAt) }}</time>
          </div>
        </div>
        <div v-else class="empty-state compact">
          <AppIcon name="activity" />
          <p>As operações efectuadas na plataforma serão registadas aqui.</p>
        </div>
      </section>
    </template>

    <template v-else-if="state.view === 'companies'">
      <div class="toolbar">
        <label class="search-input"
          ><AppIcon name="search" /><input
            v-model="companySearch"
            placeholder="Pesquisar estabelecimento"
            aria-label="Pesquisar estabelecimento" /></label
        ><select v-model="companyCategory" aria-label="Sector">
          <option value="all">Todos os sectores</option>
          <option
            v-for="category in [
              ...new Set([
                ...categories,
                ...businesses.map((item) => item.category),
              ]),
            ]"
            :key="category"
          >
            {{ category }}
          </option></select
        ><select v-model="companyStatus" aria-label="Estado">
          <option value="all">Todos os estados</option>
          <option value="active">Activos</option>
          <option value="inactive">Suspensos</option>
        </select>
      </div>
      <div class="result-count">
        {{ filteredCompanies.length }} estabelecimentos
      </div>
      <div v-if="filteredCompanies.length" class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>Estabelecimento</th>
              <th>Sector</th>
              <th>Contacto</th>
              <th>Equipa</th>
              <th>Estado</th>
              <th><span class="sr-only">Acções</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredCompanies" :key="item.id">
              <td>
                <div class="table-identity">
                  <img v-if="item.image" :src="item.image" alt="" /><span
                    v-else
                    class="avatar"
                    >{{ initials(item.name) }}</span
                  >
                  <div>
                    <strong>{{ item.name }}</strong
                    ><small>{{ item.city }}</small>
                  </div>
                </div>
              </td>
              <td>{{ item.category }}</td>
              <td>
                {{ item.email
                }}<small class="table-subline">{{ item.phone }}</small>
              </td>
              <td>
                {{
                  state.db.staff.filter(
                    (person) => person.businessId === item.id && person.active,
                  ).length
                }}
                profissionais
              </td>
              <td>
                <span :class="['badge', item.active ? 'success' : 'neutral']">{{
                  item.active ? "Activo" : "Suspenso"
                }}</span>
              </td>
              <td>
                <div class="row-actions">
                  <button
                    class="icon-btn"
                    title="Editar estabelecimento"
                    aria-label="Editar estabelecimento"
                    @click="openCompany(item)"
                  >
                    <AppIcon name="pencil" /></button
                  ><button
                    class="icon-btn"
                    :title="
                      item.active
                        ? 'Suspender estabelecimento'
                        : 'Activar estabelecimento'
                    "
                    :aria-label="
                      item.active
                        ? 'Suspender estabelecimento'
                        : 'Activar estabelecimento'
                    "
                    @click="toggleCompany(item)"
                  >
                    <AppIcon :name="item.active ? 'pause' : 'play'" /></button
                  ><button
                    class="icon-btn"
                    title="Remover estabelecimento"
                    aria-label="Remover estabelecimento"
                    @click="requestRemoval('businesses', item)"
                  >
                    <AppIcon name="trash-2" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="empty-state">
        <AppIcon name="building-2" />
        <h2>Nenhum estabelecimento encontrado</h2>
        <p>Altere os filtros ou adicione um estabelecimento à rede.</p>
        <button class="btn primary" @click="openCompany()">
          Novo estabelecimento
        </button>
      </div>
    </template>

    <template v-else-if="state.view === 'users'">
      <div class="toolbar">
        <label class="search-input"
          ><AppIcon name="search" /><input
            v-model="userSearch"
            placeholder="Pesquisar nome ou email"
            aria-label="Pesquisar utilizadores" /></label
        ><select v-model="userRole" aria-label="Perfil">
          <option value="all">Todos os perfis</option>
          <option v-for="(name, role) in roleNames" :key="role" :value="role">
            {{ name }}
          </option></select
        ><select v-model="userStatus" aria-label="Estado da conta">
          <option value="all">Todos os estados</option>
          <option value="active">Activos</option>
          <option value="inactive">Suspensos</option>
        </select>
      </div>
      <div class="result-count">{{ filteredUsers.length }} utilizadores</div>
      <div v-if="filteredUsers.length" class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>Utilizador</th>
              <th>Perfil</th>
              <th>Estabelecimento</th>
              <th>Estado</th>
              <th><span class="sr-only">Acções</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredUsers" :key="item.id">
              <td>
                <div class="table-identity">
                  <span class="avatar">{{ initials(item.name) }}</span>
                  <div>
                    <strong
                      >{{ item.name }}
                      <span v-if="item.id === state.userId" class="you-label"
                        >Eu</span
                      ></strong
                    ><small>{{ item.email }}</small>
                  </div>
                </div>
              </td>
              <td>{{ roleNames[item.role] }}</td>
              <td>{{ business(item.businessId)?.name || "—" }}</td>
              <td>
                <span :class="['badge', item.active ? 'success' : 'neutral']">{{
                  item.active ? "Activo" : "Suspenso"
                }}</span>
              </td>
              <td>
                <div class="row-actions">
                  <button
                    class="icon-btn"
                    title="Editar utilizador"
                    aria-label="Editar utilizador"
                    @click="openUser(item)"
                  >
                    <AppIcon name="pencil" /></button
                  ><button
                    class="icon-btn"
                    :disabled="item.id === state.userId"
                    :title="
                      item.active
                        ? 'Suspender utilizador'
                        : 'Reactivar utilizador'
                    "
                    :aria-label="
                      item.active
                        ? 'Suspender utilizador'
                        : 'Reactivar utilizador'
                    "
                    @click="toggleUser(item)"
                  >
                    <AppIcon
                      :name="item.active ? 'user-round-x' : 'user-round-check'"
                    /></button
                  ><button
                    class="icon-btn"
                    :disabled="item.id === state.userId"
                    title="Eliminar utilizador"
                    aria-label="Eliminar utilizador"
                    @click="requestRemoval('users', item)"
                  >
                    <AppIcon name="trash-2" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="empty-state">
        <AppIcon name="users-round" />
        <h2>Nenhum utilizador encontrado</h2>
        <p>Experimente outro nome, email ou perfil.</p>
      </div>
    </template>

    <template v-else-if="state.view === 'platform-settings'">
      <form class="platform-settings-form" @submit.prevent="saveSettings">
        <section class="settings-section">
          <div class="settings-section-label">
            <AppIcon name="calendar-clock" />
            <h2>Agendamentos</h2>
            <p>
              Regras aplicadas à disponibilidade de todos os estabelecimentos.
            </p>
          </div>
          <div class="settings-fields">
            <label class="field"
              >Intervalo entre horários<select
                v-model.number="settingsForm.slotMinutes"
              >
                <option :value="5">5 minutos</option>
                <option :value="10">10 minutos</option>
                <option :value="15">15 minutos</option>
                <option :value="30">30 minutos</option>
                <option :value="60">60 minutos</option>
                <option :value="120">120 minutos</option>
              </select></label
            ><label class="field"
              >Antecedência máxima de marcação
              <div class="number-with-unit">
                <input
                  v-model.number="settingsForm.advanceDays"
                  type="number"
                  min="1"
                  max="365"
                  required
                /><span>dias</span>
              </div></label
            >
          </div>
        </section>
        <section class="settings-section">
          <div class="settings-section-label">
            <AppIcon name="sliders-horizontal" />
            <h2>Serviços da plataforma</h2>
            <p>
              Disponibilidade global de pagamentos, promoções e notificações.
            </p>
          </div>
          <div class="settings-fields">
            <label class="preference-row"
              ><span
                ><strong>Pagamentos online</strong
                ><small
                  >Disponibilizar a opção nos estabelecimentos aderentes.</small
                ></span
              ><input
                v-model="settingsForm.onlinePayments"
                type="checkbox"
                role="switch" /></label
            ><label class="preference-row"
              ><span
                ><strong>Promoções e cupões</strong
                ><small
                  >Permitir descontos no processo de marcação.</small
                ></span
              ><input
                v-model="settingsForm.promotions"
                type="checkbox"
                role="switch" /></label
            ><label class="preference-row"
              ><span
                ><strong>Notificações na aplicação</strong
                ><small
                  >Registar confirmações, cancelamentos e pagamentos.</small
                ></span
              ><input
                v-model="settingsForm.notifications"
                type="checkbox"
                role="switch"
            /></label>
          </div>
        </section>
        <p v-if="settingsError" class="form-error" role="alert">
          {{ settingsError }}
        </p>
        <div class="form-actions">
          <button type="submit" class="btn primary">
            <AppIcon name="check" /> Guardar configurações
          </button>
        </div>
      </form>
    </template>

    <template v-else-if="state.view === 'monitoring'">
      <div class="monitoring-context">
        <AppIcon name="database" />
        <div>
          <strong>Dados deste navegador</strong>
          <p>
            As métricas e os registos reflectem a actividade guardada neste
            dispositivo.
          </p>
        </div>
        <span
          :class="['badge', validationIssues.length ? 'warning' : 'success']"
          >{{
            validationIssues.length ? "Requer atenção" : "Dados consistentes"
          }}</span
        >
      </div>
      <div class="stats-grid platform-stats">
        <div class="stat">
          <span class="stat-label">Registos de actividade</span
          ><strong>{{ state.db.logs.length }}</strong
          ><span class="muted">operações guardadas</span>
        </div>
        <div class="stat">
          <span class="stat-label">Dados armazenados</span
          ><strong
            >{{ (localStorageSize / 1024).toFixed(1) }}
            <small>KB</small></strong
          ><span class="muted">base de dados local</span>
        </div>
        <div class="stat">
          <span class="stat-label">Agendamentos</span
          ><strong>{{ state.db.bookings.length }}</strong
          ><span class="muted">incluindo o histórico</span>
        </div>
        <div class="stat">
          <span class="stat-label">Inconsistências</span
          ><strong>{{ validationIssues.length }}</strong
          ><span class="muted">referências em falta</span>
        </div>
      </div>
      <div v-if="validationIssues.length" class="integrity-issues">
        <h2 class="section-title">Registos a verificar</h2>
        <p v-for="item in validationIssues" :key="item.id">
          <AppIcon name="triangle-alert" /> {{ item.text }}
        </p>
      </div>
      <div class="section-heading">
        <h2 class="section-title">Registo de actividade</h2>
      </div>
      <div class="toolbar">
        <label class="search-input"
          ><AppIcon name="search" /><input
            v-model="logSearch"
            placeholder="Pesquisar operação ou utilizador"
            aria-label="Pesquisar registos" /></label
        ><select v-model="logBusiness" aria-label="Estabelecimento">
          <option value="all">Todos os estabelecimentos</option>
          <option v-for="item in businesses" :key="item.id" :value="item.id">
            {{ item.name }}
          </option>
        </select>
      </div>
      <div v-if="filteredLogs.length" class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>Operação</th>
              <th>Utilizador</th>
              <th>Estabelecimento</th>
              <th>Data e hora</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredLogs" :key="item.id">
              <td>{{ item.action }}</td>
              <td>
                {{
                  state.db.users.find((user) => user.id === item.userId)
                    ?.name || "Sistema"
                }}
              </td>
              <td>{{ business(item.businessId)?.name || "Plataforma" }}</td>
              <td>{{ dateTime(item.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="empty-state">
        <AppIcon name="activity" />
        <h2>Nenhuma operação encontrada</h2>
        <p>As alterações ficam registadas automaticamente.</p>
      </div>
    </template>

    <template v-else-if="state.view === 'support'">
      <div class="stats-grid support-stats">
        <div class="stat">
          <span class="stat-label">Pedidos abertos</span
          ><strong>{{
            tickets.filter((item) => item.status === "open").length
          }}</strong
          ><span class="muted">a aguardar análise</span>
        </div>
        <div class="stat">
          <span class="stat-label">Em análise</span
          ><strong>{{
            tickets.filter((item) => item.status === "in_progress").length
          }}</strong
          ><span class="muted">com acompanhamento</span>
        </div>
        <div class="stat">
          <span class="stat-label">Resolvidos</span
          ><strong>{{
            tickets.filter((item) => item.status === "closed").length
          }}</strong
          ><span class="muted">pedidos concluídos</span>
        </div>
      </div>
      <div class="toolbar">
        <label class="search-input"
          ><AppIcon name="search" /><input
            v-model="ticketSearch"
            placeholder="Pesquisar pedidos de suporte"
            aria-label="Pesquisar pedidos" /></label
        ><select v-model="ticketStatus" aria-label="Estado do pedido">
          <option value="all">Todos os pedidos</option>
          <option value="open">Abertos</option>
          <option value="in_progress">Em análise</option>
          <option value="closed">Resolvidos</option>
        </select>
      </div>
      <div v-if="filteredTickets.length" class="ticket-list">
        <button
          v-for="item in filteredTickets"
          :key="item.id"
          class="ticket-row"
          @click="openConversation(item)"
        >
          <span class="ticket-icon"
            ><AppIcon
              :name="
                item.status === 'closed' ? 'circle-check' : 'messages-square'
              "
          /></span>
          <div class="ticket-copy">
            <div class="ticket-top">
              <h2>{{ item.subject }}</h2>
              <span
                :class="[
                  'badge',
                  item.status === 'closed'
                    ? 'success'
                    : item.status === 'in_progress'
                      ? 'warning'
                      : 'neutral',
                ]"
                >{{ ticketStatusNames[item.status] || item.status }}</span
              >
            </div>
            <p v-if="isPlatform">
              {{ business(item.businessId)?.name || "Plataforma" }}
            </p>
            <p class="ticket-excerpt">{{ item.messages?.at(-1)?.body }}</p>
            <div class="ticket-meta">
              <span
                :class="{
                  'priority-high': ['high', 'urgent'].includes(item.priority),
                }"
                ><AppIcon name="flag" /> Prioridade
                {{ ticketPriorityNames[item.priority] || item.priority }}</span
              ><span>{{ item.messages?.length || 0 }} mensagens</span
              ><time>{{
                dateTime(
                  item.updatedAt ||
                    item.createdAt ||
                    item.messages?.at(-1)?.createdAt,
                )
              }}</time>
            </div>
          </div>
          <AppIcon name="chevron-right" class="ticket-arrow" />
        </button>
      </div>
      <div v-else class="empty-state">
        <AppIcon name="headset" />
        <h2>
          {{
            ticketSearch ? "Nenhum pedido encontrado" : "Como podemos ajudar?"
          }}
        </h2>
        <p>
          Crie um pedido para acompanhar uma dúvida ou situação do seu
          estabelecimento.
        </p>
        <button v-if="!ticketSearch" class="btn primary" @click="openNewTicket">
          Novo pedido
        </button>
      </div>
    </template>

    <AppModal
      v-model="companyOpen"
      :title="
        companyForm.id ? 'Editar estabelecimento' : 'Novo estabelecimento'
      "
      :width="700"
      ><form @submit.prevent="saveCompany">
        <div class="form-grid">
          <label class="field full-width"
            >Nome do estabelecimento<input
              v-model="companyForm.name"
              required
              maxlength="100" /></label
          ><label class="field"
            >Sector<select v-model="companyForm.category">
              <option v-for="category in categories" :key="category">
                {{ category }}
              </option>
            </select></label
          ><label class="field"
            >Cidade<input v-model="companyForm.city" required /></label
          ><label class="field full-width"
            >Descrição<textarea
              v-model="companyForm.description"
              rows="2"
              maxlength="600"
              required
            ></textarea></label
          ><label class="field full-width"
            >Endereço<input v-model="companyForm.address" required /></label
          ><label class="field"
            >Email<input
              v-model="companyForm.email"
              type="email"
              required /></label
          ><label class="field"
            >Telefone<input
              v-model="companyForm.phone"
              type="tel"
              required /></label
          ><label class="field full-width"
            >Fotografia (URL)<input
              v-model="companyForm.image"
              type="url"
              placeholder="https://..." /></label
          ><label class="field"
            >Abertura<input
              v-model="companyForm.opens"
              type="time"
              required /></label
          ><label class="field"
            >Fecho<input
              v-model="companyForm.closes"
              type="time"
              required /></label
          ><label class="field"
            >Antecedência para cancelar (horas)<input
              v-model.number="companyForm.cancelHours"
              type="number"
              min="0"
              max="168"
              required
          /></label>
          <div class="field">
            <span>Dias de funcionamento</span>
            <div class="company-days">
              <label v-for="day in dayOptions" :key="day.id"
                ><input
                  v-model="companyForm.days"
                  :value="day.id"
                  type="checkbox"
                />{{ day.name }}</label
              >
            </div>
          </div>
          <label class="checkbox-label"
            ><input v-model="companyForm.active" type="checkbox" />
            Estabelecimento activo</label
          ><label class="checkbox-label"
            ><input v-model="companyForm.onlinePayment" type="checkbox" />
            Aceitar pagamento online</label
          >
        </div>
        <section v-if="!companyForm.id" class="company-manager-fields">
          <h3>Conta do gestor</h3>
          <div class="form-grid">
            <label class="field"
              >Nome do gestor<input
                v-model="companyForm.managerName"
                :required="Boolean(companyForm.managerEmail)" /></label
            ><label class="field"
              >Email do gestor<input
                v-model="companyForm.managerEmail"
                type="email"
                :required="
                  Boolean(
                    companyForm.managerName || companyForm.managerPassword,
                  )
                " /></label
            ><label class="field full-width"
              >Palavra-passe inicial<input
                v-model="companyForm.managerPassword"
                type="password"
                autocomplete="new-password"
                minlength="8"
                :required="Boolean(companyForm.managerEmail)"
                placeholder="Pelo menos 8 caracteres"
            /></label>
          </div>
        </section>
        <p v-if="companyError" class="form-error" role="alert">
          {{ companyError }}
        </p>
        <div class="form-actions">
          <button
            type="button"
            class="btn secondary"
            @click="companyOpen = false"
          >
            Cancelar</button
          ><button type="submit" class="btn primary" :disabled="companySaving">
            {{ companySaving ? "A guardar…" : "Guardar estabelecimento" }}
          </button>
        </div>
      </form></AppModal
    >
    <AppModal
      v-model="userOpen"
      :title="userForm.id ? 'Editar utilizador' : 'Novo utilizador'"
      :width="600"
      ><form @submit.prevent="saveUser">
        <div class="form-grid">
          <label class="field full-width"
            >Nome completo<input
              v-model="userForm.name"
              required
              maxlength="100" /></label
          ><label class="field"
            >Email<input
              v-model="userForm.email"
              type="email"
              required /></label
          ><label class="field"
            >Telemóvel<input
              v-model="userForm.phone"
              type="tel"
              required /></label
          ><label class="field"
            >Perfil<select
              v-model="userForm.role"
              :disabled="userForm.id === state.userId"
            >
              <option
                v-for="(name, role) in roleNames"
                :key="role"
                :value="role"
              >
                {{ name }}
              </option>
            </select></label
          ><label
            v-if="['manager', 'professional'].includes(userForm.role)"
            class="field"
            >Estabelecimento<select v-model="userForm.businessId" required>
              <option value="" disabled>Seleccionar estabelecimento</option>
              <option
                v-for="item in businesses"
                :key="item.id"
                :value="item.id"
              >
                {{ item.name }}
              </option>
            </select></label
          ><label class="field full-width"
            >{{
              userForm.id
                ? "Nova palavra-passe (opcional)"
                : "Palavra-passe inicial"
            }}<input
              v-model="userForm.password"
              type="password"
              autocomplete="new-password"
              minlength="8"
              :required="!userForm.id"
              placeholder="Pelo menos 8 caracteres" /></label
          ><template v-if="userForm.role === 'professional'"
            ><label class="field full-width"
              >Especialidade<input
                v-model="userForm.title"
                placeholder="Ex.: Terapeuta, médico, especialista"
                required
            /></label>
            <fieldset class="assigned-service-field full-width">
              <legend>Serviços atribuídos</legend>
              <label
                v-for="item in userServices"
                :key="item.id"
                class="checkbox-label"
                ><input
                  v-model="userForm.serviceIds"
                  type="checkbox"
                  :value="item.id"
                />{{ item.name }}</label
              >
              <p v-if="!userServices.length" class="muted">
                O estabelecimento ainda não tem serviços activos.
              </p>
            </fieldset></template
          ><label class="checkbox-label full-width"
            ><input
              v-model="userForm.active"
              type="checkbox"
              :disabled="userForm.id === state.userId"
            />
            Conta activa</label
          >
        </div>
        <p v-if="userError" class="form-error" role="alert">{{ userError }}</p>
        <div class="form-actions">
          <button type="button" class="btn secondary" @click="userOpen = false">
            Cancelar</button
          ><button type="submit" class="btn primary" :disabled="userSaving">
            {{ userSaving ? "A guardar…" : "Guardar utilizador" }}
          </button>
        </div>
      </form></AppModal
    >
    <AppModal
      v-model="removalOpen"
      :title="
        removal?.collection === 'users'
          ? 'Eliminar utilizador'
          : 'Remover estabelecimento'
      "
      ><p>
        Confirme a remoção de <strong>{{ removal?.item.name }}</strong
        >.
      </p>
      <p v-if="removal?.collection === 'businesses'" class="muted">
        Estabelecimentos com marcações serão desactivados para preservar o
        histórico.
      </p>
      <p v-if="removalError" class="form-error" role="alert">
        {{ removalError }}
      </p>
      <div class="form-actions">
        <button class="btn secondary" @click="removalOpen = false">
          Cancelar</button
        ><button class="btn danger" @click="performRemoval">
          Confirmar remoção
        </button>
      </div></AppModal
    >
    <AppModal v-model="ticketOpen" title="Novo pedido de suporte"
      ><form @submit.prevent="saveTicket">
        <div class="form-grid">
          <label class="field full-width"
            >Assunto<input
              v-model="ticketForm.subject"
              placeholder="Qual é a situação?"
              required
              maxlength="160" /></label
          ><label v-if="isPlatform" class="field"
            >Estabelecimento<select v-model="ticketForm.businessId" required>
              <option value="" disabled>Seleccionar</option>
              <option
                v-for="item in businesses"
                :key="item.id"
                :value="item.id"
              >
                {{ item.name }}
              </option>
            </select></label
          ><label class="field"
            >Prioridade<select v-model="ticketForm.priority">
              <option value="low">Baixa</option>
              <option value="normal">Normal</option>
              <option value="high">Alta</option>
              <option value="urgent">Urgente</option>
            </select></label
          ><label class="field full-width"
            >Descrição<textarea
              v-model="ticketForm.body"
              rows="5"
              required
              maxlength="5000"
              placeholder="Descreva a situação e o resultado esperado."
            ></textarea>
          </label>
        </div>
        <p v-if="ticketError" class="form-error" role="alert">
          {{ ticketError }}
        </p>
        <div class="form-actions">
          <button
            class="btn secondary"
            type="button"
            @click="ticketOpen = false"
          >
            Cancelar</button
          ><button class="btn primary" type="submit">Criar pedido</button>
        </div>
      </form></AppModal
    >
    <AppModal v-model="conversationOpen" title="Pedido de suporte" :width="700"
      ><template v-if="selectedTicket"
        ><div class="conversation-heading">
          <h2>{{ selectedTicket.subject }}</h2>
          <span
            :class="[
              'badge',
              selectedTicket.status === 'closed' ? 'success' : 'warning',
            ]"
            >{{
              ticketStatusNames[selectedTicket.status] || selectedTicket.status
            }}</span
          >
        </div>
        <p class="muted conversation-business">
          {{ business(selectedTicket.businessId)?.name }} · Prioridade
          {{
            ticketPriorityNames[selectedTicket.priority] ||
            selectedTicket.priority
          }}
        </p>
        <div class="conversation-messages">
          <article
            v-for="(message, index) in selectedTicket.messages || []"
            :key="index"
            class="conversation-message"
            :class="{
              own:
                message.userId === state.userId ||
                message.author === currentUser.name,
            }"
          >
            <div class="message-header">
              <strong>{{ message.author }}</strong
              ><time>{{ dateTime(message.createdAt) }}</time>
            </div>
            <p>{{ message.body }}</p>
          </article>
        </div>
        <form
          v-if="selectedTicket.status !== 'closed'"
          class="reply-form"
          @submit.prevent="sendReply"
        >
          <label class="field"
            >A sua resposta<textarea
              v-model="reply"
              rows="3"
              maxlength="5000"
              required
              placeholder="Escreva a sua mensagem…"
            ></textarea>
          </label>
          <div class="form-actions">
            <button
              type="button"
              class="btn secondary"
              @click="changeTicketStatus('closed')"
            >
              <AppIcon name="circle-check" /> Marcar como resolvido</button
            ><button
              type="submit"
              class="btn primary"
              :disabled="!reply.trim()"
            >
              <AppIcon name="send" /> Responder
            </button>
          </div>
        </form>
        <div v-else class="resolved-ticket">
          <AppIcon name="circle-check" />
          <p>Este pedido está resolvido.</p>
          <button class="btn secondary" @click="changeTicketStatus('open')">
            Reabrir pedido
          </button>
        </div></template
      ></AppModal
    >
  </div>
</template>

<style scoped>
.platform-workspace {
  min-width: 0;
}
.platform-stats,
.support-stats {
  margin-bottom: 30px;
}
.platform-stats .stat strong {
  font-size: 27px;
}
.platform-stats .stat small {
  font-size: 14px;
  font-weight: 500;
}
.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}
.section-heading .section-title {
  margin: 0;
}
.section-heading p {
  font-size: 12px;
  margin: 7px 0 0;
}
.section-heading > svg {
  color: #788b81;
}
.platform-insights {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
  gap: 34px;
  margin: 16px 0 36px;
}
.activity-chart,
.category-distribution {
  border-top: 1px solid #e1e7e3;
  padding-top: 24px;
}
.bar-chart {
  display: flex;
  gap: 20px;
  height: 208px;
  padding-top: 10px;
}
.bar-column {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.bar-value {
  font-size: 12px;
  font-weight: 600;
}
.bar-track {
  flex: 1;
  width: min(100%, 45px);
  display: flex;
  align-items: flex-end;
}
.bar-track > span {
  background: #b7d5c6;
  width: 100%;
  border-radius: 4px 4px 0 0;
  min-height: 2px;
}
.bar-track > span.current {
  background: #347a61;
}
.bar-track > span.zero {
  background: #dce4df;
}
.bar-label {
  font-size: 11px;
  color: #718078;
  text-transform: capitalize;
}
.category-distribution > h2 {
  margin-bottom: 24px;
}
.category-row {
  display: grid;
  grid-template-columns: 8px minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px 10px;
  margin-bottom: 16px;
  font-size: 13px;
}
.category-dot {
  height: 8px;
  width: 8px;
  border-radius: 50%;
}
.category-bar {
  grid-column: 2 / -1;
  height: 4px;
  background: #edf0ed;
  border-radius: 3px;
  overflow: hidden;
}
.category-bar > span {
  height: 100%;
  display: block;
  border-radius: 3px;
}
.category-0 {
  background: #6b9e88;
}
.category-1 {
  background: #b6a5c4;
}
.category-2 {
  background: #79a6b3;
}
.category-3 {
  background: #d8b084;
}
.category-4 {
  background: #9ea9a0;
}
.support-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e1e7e3;
  font-size: 12px;
}
.support-summary > span {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}
.support-summary svg {
  width: 17px;
}
.support-summary > strong {
  font-size: 18px;
}
.platform-business-preview {
  margin-bottom: 34px;
}
.table-identity {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 170px;
}
.table-identity > img,
.table-identity > .avatar {
  width: 38px;
  height: 38px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
  font-size: 12px;
}
.table-identity strong {
  font-size: 13px;
  font-weight: 600;
}
.table-identity small,
.table-subline {
  display: block;
  font-size: 12px;
  color: #7a8880;
  margin-top: 5px;
}
.row-actions {
  display: flex;
  gap: 2px;
}
.activity-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 17px 0;
  border-bottom: 1px solid #e8ece9;
}
.activity-mark {
  width: 8px;
  height: 8px;
  background: #93b8a5;
  border-radius: 50%;
  flex: 0 0 8px;
}
.activity-row > div {
  flex: 1;
  min-width: 0;
}
.activity-row strong {
  font-size: 13px;
  font-weight: 500;
}
.activity-row small {
  display: block;
  font-size: 12px;
  color: #7a8880;
  margin-top: 5px;
}
.activity-row time {
  color: #7a8880;
  font-size: 11px;
  text-align: right;
}
.result-count {
  font-size: 12px;
  color: #7a8880;
  margin: 0 0 15px;
}
.you-label {
  display: inline-block;
  background: #edf3ef;
  color: #54816a;
  font-size: 10px;
  padding: 3px 5px;
  border-radius: 3px;
  margin-left: 5px;
}
.platform-settings-form {
  max-width: 1000px;
}
.settings-section {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.5fr);
  gap: 40px;
  padding: 28px 0;
  border-top: 1px solid #e1e7e3;
}
.settings-section-label > svg {
  width: 21px;
  height: 21px;
  color: #527e68;
}
.settings-section-label h2 {
  font-size: 17px;
  margin: 13px 0 8px;
}
.settings-section-label p {
  font-size: 13px;
  color: #7a8880;
  line-height: 1.65;
  margin: 0;
  max-width: 290px;
}
.settings-fields {
  display: flex;
  flex-direction: column;
  gap: 22px;
}
.number-with-unit {
  display: flex;
  align-items: center;
  gap: 12px;
}
.number-with-unit input {
  max-width: 150px;
}
.number-with-unit span {
  color: #7a8880;
  font-size: 13px;
}
.preference-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding: 8px 0;
}
.preference-row strong {
  font-size: 14px;
}
.preference-row small {
  display: block;
  color: #7a8880;
  margin-top: 5px;
  line-height: 1.5;
}
.preference-row input {
  accent-color: #347a61;
  width: 19px;
  height: 19px;
  flex: 0 0 19px;
}
.monitoring-context {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 0;
  border-top: 1px solid #e1e7e3;
  border-bottom: 1px solid #e1e7e3;
  margin-bottom: 24px;
}
.monitoring-context > svg {
  color: #5f8973;
  flex-shrink: 0;
}
.monitoring-context > div {
  flex: 1;
}
.monitoring-context strong {
  font-size: 14px;
}
.monitoring-context p {
  font-size: 12px;
  color: #7a8880;
  margin: 6px 0 0;
  line-height: 1.5;
}
.integrity-issues {
  background: #fff6eb;
  padding: 20px;
  border: 1px solid #f1dfc8;
  border-radius: 6px;
  margin-bottom: 30px;
}
.integrity-issues p {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13px;
  color: #89653f;
}
.integrity-issues svg {
  flex: 0 0 16px;
  width: 16px;
}
.ticket-list {
  border-top: 1px solid #e1e7e3;
}
.ticket-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 24px 8px;
  border: 0;
  border-bottom: 1px solid #e1e7e3;
  background: transparent;
  width: 100%;
  text-align: left;
  color: inherit;
  cursor: pointer;
  border-radius: 0;
  font: inherit;
}
.ticket-row:hover {
  background: #f0f5f1;
}
.ticket-icon {
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  background: #eaf0ec;
  border-radius: 8px;
  display: grid;
  place-items: center;
  color: #52866b;
}
.ticket-copy {
  min-width: 0;
  flex: 1;
}
.ticket-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}
.ticket-top h2 {
  font-size: 15px;
  margin: 0;
}
.ticket-copy p {
  font-size: 12px;
  color: #7a8880;
  margin: 7px 0;
}
.ticket-excerpt {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  max-width: 100%;
}
.ticket-meta {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  color: #7a8880;
  font-size: 11px;
  margin-top: 12px;
}
.ticket-meta > span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.ticket-meta svg {
  width: 12px;
  height: 12px;
}
.ticket-meta .priority-high {
  color: #ac7250;
}
.ticket-arrow {
  align-self: center;
  width: 18px;
  color: #7a8880;
  flex-shrink: 0;
}
.full-width {
  grid-column: 1 / -1;
}
.company-days {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
}
.company-days label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 400;
}
.company-days input,
.checkbox-label input {
  accent-color: #347a61;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 13px;
  line-height: 1.5;
}
.company-manager-fields {
  border-top: 1px solid #e1e7e3;
  margin-top: 25px;
  padding-top: 20px;
}
.company-manager-fields h3 {
  margin: 0 0 18px;
  font-size: 16px;
}
.assigned-service-field {
  border: 0;
  padding: 0;
  margin: 0;
}
.assigned-service-field legend {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 12px;
}
.assigned-service-field .checkbox-label {
  padding: 6px 0;
}
.assigned-service-field p {
  font-size: 12px;
}
.form-error {
  background: #fff0ed;
  color: #a53929;
  padding: 11px 13px;
  border-radius: 5px;
  font-size: 13px;
  line-height: 1.5;
  margin-top: 16px;
}
.conversation-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 15px;
}
.conversation-heading h2 {
  margin: 2px 0 0;
  font-size: 21px;
  line-height: 1.4;
}
.conversation-heading .badge {
  flex-shrink: 0;
}
.conversation-business {
  font-size: 12px;
  line-height: 1.6;
  margin: 8px 0 24px;
}
.conversation-messages {
  border-top: 1px solid #e1e7e3;
  padding: 22px 0 8px;
  max-height: 420px;
  overflow-y: auto;
}
.conversation-message {
  margin: 0 24px 16px 0;
  padding: 16px;
  border-radius: 8px;
  background: #f2f4f3;
}
.conversation-message.own {
  margin: 0 0 16px 24px;
  background: #edf5ef;
}
.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
.message-header strong {
  font-size: 12px;
}
.message-header time {
  font-size: 10px;
  color: #7a8880;
}
.conversation-message > p {
  margin: 10px 0 0;
  font-size: 13px;
  line-height: 1.65;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.reply-form {
  margin-top: 18px;
}
.resolved-ticket {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
  padding-top: 18px;
  border-top: 1px solid #e1e7e3;
  color: #47795b;
  font-size: 13px;
}
.resolved-ticket p {
  flex: 1;
}
.resolved-ticket > svg {
  width: 18px;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}
@media (max-width: 1000px) {
  .platform-insights {
    grid-template-columns: 1fr;
    gap: 28px;
  }
  .category-distribution {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 24px;
  }
  .category-distribution > h2,
  .support-summary {
    grid-column: 1 / -1;
  }
  .support-summary {
    margin-top: 8px;
  }
  .settings-section {
    gap: 24px;
  }
}
@media (max-width: 700px) {
  .settings-section {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  .settings-section-label p {
    max-width: none;
  }
  .platform-stats .stat strong {
    font-size: 24px;
  }
  .ticket-row {
    gap: 12px;
    padding: 20px 0;
  }
  .ticket-icon {
    width: 36px;
    height: 36px;
    flex-basis: 36px;
  }
  .ticket-top h2 {
    font-size: 14px;
  }
  .ticket-arrow {
    display: none;
  }
  .ticket-meta {
    gap: 8px 12px;
  }
  .monitoring-context {
    flex-wrap: wrap;
  }
  .monitoring-context .badge {
    margin-left: 40px;
  }
  .bar-chart {
    gap: 16px;
  }
  .activity-row {
    gap: 10px;
  }
  .activity-row time {
    max-width: 76px;
    line-height: 1.6;
  }
  .conversation-heading {
    flex-wrap: wrap;
  }
  .message-header {
    flex-wrap: wrap;
    gap: 5px;
  }
}
@media (max-width: 420px) {
  .category-distribution {
    grid-template-columns: 1fr;
  }
  .bar-chart {
    gap: 12px;
  }
  .ticket-icon {
    display: none;
  }
  .conversation-message {
    margin-right: 12px;
    padding: 13px;
  }
  .conversation-message.own {
    margin-left: 12px;
  }
  .reply-form .form-actions {
    flex-direction: column-reverse;
  }
  .reply-form .form-actions .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
