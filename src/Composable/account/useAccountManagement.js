import { computed, reactive, ref, watch } from "vue";
import {
  state,
  go,
  notify,
  money,
  today,
  dateLabel,
  business,
  service,
  staffMember,
  saveRecord,
  removeRecord,
  updateBooking,
  cancelBooking,
  setAccountPassword,
} from "@/Store/applicationStore.js";

// Local state belongs to one mounted feature instance.
export function useAccountManagement() {
  const currentUser = computed(
    () => state.db.users.find((item) => item.id === state.userId) || {},
  );
  const professional = computed(() => staffMember(state.staffId) || {});
  const currentClientIds = computed(() => [
    state.userId,
    ...(state.db.clients || [])
      .filter((item) => item.email === currentUser.value.email)
      .map((item) => item.id),
  ]);
  const myBookings = computed(() =>
    state.db.bookings.filter((item) =>
      currentClientIds.value.includes(item.clientId),
    ),
  );
  const staffBookings = computed(() =>
    state.db.bookings.filter(
      (item) =>
        item.staffId === state.staffId && item.businessId === state.businessId,
    ),
  );
  const isProfessional = computed(() => state.role === "professional");
  const statusNames = {
    confirmed: "Confirmado",
    in_progress: "Em atendimento",
    completed: "Concluído",
    cancelled: "Cancelado",
    no_show: "Não compareceu",
  };
  const statusClass = (status) =>
    ({
      confirmed: "success",
      in_progress: "warning",
      completed: "neutral",
      cancelled: "danger",
      no_show: "danger",
    })[status] || "neutral";
  const paymentNames = {
    paid: "Pago",
    pending: "Por pagar",
    refunded: "Reembolsado",
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
  const activeStatus = (item) =>
    ["confirmed", "in_progress"].includes(item.status);
  const upcoming = computed(() =>
    myBookings.value.filter(
      (item) =>
        activeStatus(item) &&
        new Date(`${item.date}T${item.time}`).getTime() >= Date.now(),
    ),
  );
  const totalCompleted = computed(
    () => myBookings.value.filter((item) => item.status === "completed").length,
  );
  const appointmentTab = ref("upcoming");
  const search = ref("");
  const selectedId = ref("");
  const detailOpen = ref(false);
  const confirmCancel = ref(false);
  const detailError = ref("");
  const selected = computed(() =>
    state.db.bookings.find((item) => item.id === selectedId.value),
  );
  const filteredAppointments = computed(() =>
    myBookings.value
      .filter((item) => {
        const future =
          activeStatus(item) &&
          new Date(`${item.date}T${item.time}`).getTime() >= Date.now();
        const matchesTab =
          appointmentTab.value === "all" ||
          (appointmentTab.value === "upcoming" ? future : !future);
        const terms =
          `${business(item.businessId)?.name} ${service(item.serviceId)?.name} ${statusNames[item.status]}`.toLowerCase();
        return matchesTab && terms.includes(search.value.toLowerCase());
      })
      .sort((a, b) =>
        appointmentTab.value === "upcoming"
          ? `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)
          : `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`),
      ),
  );
  function openBooking(item) {
    selectedId.value = item.id;
    confirmCancel.value = false;
    detailError.value = "";
    detailOpen.value = true;
  }
  function reschedule(item) {
    state.selectedBusinessId = item.businessId;
    state.bookingDraft = { ...item, excludeBookingId: item.id };
    detailOpen.value = false;
    go("booking");
  }
  function handleCancel() {
    const result = cancelBooking(selected.value.id);
    if (!result.ok) {
      detailError.value = result.error;
      return;
    }
    confirmCancel.value = false;
    notify("Agendamento cancelado. A agenda foi actualizada.");
  }
  function changeStatus(item, status) {
    const result = updateBooking(item.id, { status });
    if (!result.ok) {
      detailError.value = result.error;
      notify(result.error, "error");
      return;
    }
    notify(
      status === "in_progress"
        ? "Atendimento iniciado."
        : status === "completed"
          ? "Atendimento concluído."
          : "Falta registada.",
    );
  }
  const notificationTab = ref("all");
  const myNotifications = computed(() =>
    (state.db.notifications || [])
      .filter((item) => !item.userId || item.userId === state.userId)
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))),
  );
  const unreadCount = computed(
    () => myNotifications.value.filter((item) => !item.read).length,
  );
  const visibleNotifications = computed(() =>
    myNotifications.value.filter(
      (item) => notificationTab.value !== "unread" || !item.read,
    ),
  );
  function readNotification(item) {
    saveRecord("notifications", { ...item, read: true });
  }
  function readAllNotifications() {
    myNotifications.value
      .filter((item) => !item.read)
      .forEach(readNotification);
    notify("Todas as notificações foram marcadas como lidas.");
  }
  const profileForm = reactive({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    notificationEmail: true,
    notificationSms: false,
  });
  const profileError = ref("");
  watch(
    [() => state.userId, () => state.view],
    () => {
      if (state.view !== "profile") return;
      Object.assign(profileForm, {
        name: currentUser.value.name || professional.value.name || "",
        email: currentUser.value.email || professional.value.email || "",
        phone: currentUser.value.phone || professional.value.phone || "",
        password: "",
        confirmPassword: "",
        notificationEmail: currentUser.value.notificationEmail !== false,
        notificationSms: Boolean(currentUser.value.notificationSms),
      });
      profileError.value = "";
    },
    { immediate: true },
  );
  async function saveProfile() {
    profileError.value = "";
    if (profileForm.password && profileForm.password.length < 8) {
      profileError.value = "A palavra-passe deve ter pelo menos 8 caracteres.";
      return;
    }
    if (profileForm.password !== profileForm.confirmPassword) {
      profileError.value = "As palavras-passe não coincidem.";
      return;
    }
    if (
      state.db.users.some(
        (item) =>
          item.id !== state.userId &&
          item.email.toLowerCase() === profileForm.email.trim().toLowerCase(),
      )
    ) {
      profileError.value = "Este email já está associado a outra conta.";
      return;
    }
    if (profileForm.password) {
      const result = await setAccountPassword(
        state.userId,
        profileForm.password,
      );
      if (!result.ok) {
        profileError.value = result.error;
        return;
      }
    }
    const linkedClients = (state.db.clients || []).filter((item) =>
      currentClientIds.value.includes(item.id),
    );
    const next = {
      ...currentUser.value,
      name: profileForm.name.trim(),
      email: profileForm.email.trim().toLowerCase(),
      phone: profileForm.phone.trim(),
      notificationEmail: profileForm.notificationEmail,
      notificationSms: profileForm.notificationSms,
    };
    saveRecord("users", next);
    for (const client of linkedClients)
      saveRecord("clients", {
        ...client,
        name: next.name,
        email: next.email,
        phone: next.phone,
      });
    if (isProfessional.value && professional.value.id)
      saveRecord("staff", {
        ...professional.value,
        name: next.name,
        email: next.email,
        phone: next.phone,
      });
    profileForm.password = "";
    profileForm.confirmPassword = "";
    notify("Perfil actualizado.");
  }
  const agendaDate = ref(today());
  const agendaFilter = ref("all");
  const dayBookings = computed(() =>
    staffBookings.value
      .filter(
        (item) =>
          item.date === agendaDate.value &&
          (agendaFilter.value === "all" || item.status === agendaFilter.value),
      )
      .sort((a, b) => a.time.localeCompare(b.time)),
  );
  const agendaStats = computed(() => {
    const items = staffBookings.value.filter(
      (item) => item.date === agendaDate.value,
    );
    return {
      total: items.filter((item) => item.status !== "cancelled").length,
      completed: items.filter((item) => item.status === "completed").length,
      pending: items.filter(activeStatus).length,
      minutes: items
        .filter((item) => item.status !== "cancelled")
        .reduce((sum, item) => sum + Number(item.duration || 0), 0),
    };
  });
  function shiftDate(amount) {
    const value = new Date(`${agendaDate.value}T12:00:00`);
    value.setDate(value.getDate() + amount);
    agendaDate.value = `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
  }
  const assignedServices = computed(() =>
    (state.db.services || []).filter(
      (item) =>
        item.businessId === state.businessId &&
        (professional.value.serviceIds || []).includes(item.id),
    ),
  );
  const schedule = reactive({ start: "08:00", end: "18:00", days: [] });
  const scheduleError = ref("");
  watch(
    [() => state.staffId, () => state.view],
    () => {
      if (state.view !== "professional-schedule") return;
      Object.assign(schedule, {
        start: professional.value.start || "08:00",
        end: professional.value.end || "18:00",
        days: [...(professional.value.days || [1, 2, 3, 4, 5, 6])],
      });
      scheduleError.value = "";
    },
    { immediate: true },
  );
  function saveSchedule() {
    if (schedule.end <= schedule.start) {
      scheduleError.value = "O fim do turno deve ser posterior ao início.";
      return;
    }
    if (!schedule.days.length) {
      scheduleError.value = "Seleccione pelo menos um dia de trabalho.";
      return;
    }
    saveRecord("staff", {
      ...professional.value,
      start: schedule.start,
      end: schedule.end,
      days: [...schedule.days],
    });
    scheduleError.value = "";
    notify("Disponibilidade actualizada para novas marcações.");
  }
  const myBlocks = computed(() =>
    (state.db.blocks || [])
      .filter(
        (item) =>
          item.businessId === state.businessId &&
          (!item.staffId || item.staffId === state.staffId),
      )
      .sort((a, b) =>
        `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`),
      ),
  );
  const blockOpen = ref(false);
  const blockForm = reactive({
    id: "",
    date: today(),
    start: "12:00",
    end: "13:00",
    reason: "",
  });
  const blockError = ref("");
  const deleteBlock = ref(null);
  const deleteBlockOpen = ref(false);
  function openBlock(item = null) {
    Object.assign(
      blockForm,
      item
        ? { ...item }
        : { id: "", date: today(), start: "12:00", end: "13:00", reason: "" },
    );
    blockError.value = "";
    blockOpen.value = true;
  }
  function saveBlock() {
    blockError.value = "";
    if (blockForm.end <= blockForm.start) {
      blockError.value = "A hora de fim deve ser posterior à hora de início.";
      return;
    }
    const overlap = staffBookings.value.find((item) => {
      if (item.date !== blockForm.date || !activeStatus(item)) return false;
      const [hours, minutes] = item.time.split(":").map(Number);
      const end = hours * 60 + minutes + Number(item.duration);
      const [startHours, startMinutes] = blockForm.start.split(":").map(Number);
      const [endHours, endMinutes] = blockForm.end.split(":").map(Number);
      return (
        hours * 60 + minutes < endHours * 60 + endMinutes &&
        end > startHours * 60 + startMinutes
      );
    });
    if (overlap) {
      blockError.value = `Existe um agendamento às ${overlap.time}. Reagende-o antes de bloquear este período.`;
      return;
    }
    saveRecord("blocks", {
      ...blockForm,
      businessId: state.businessId,
      staffId: state.staffId,
      reason: blockForm.reason.trim(),
    });
    blockOpen.value = false;
    notify("Período indisponível registado.");
  }
  function confirmRemoveBlock(item) {
    deleteBlock.value = item;
    deleteBlockOpen.value = true;
  }
  function removeBlock() {
    removeRecord("blocks", deleteBlock.value.id);
    deleteBlockOpen.value = false;
    notify("Período novamente disponível.");
  }
  const historySearch = ref("");
  const historyStatus = ref("all");
  const historyFrom = ref("");
  const historyTo = ref("");
  const history = computed(() =>
    staffBookings.value
      .filter((item) => {
        return (
          ["completed", "cancelled", "no_show"].includes(item.status) &&
          (historyStatus.value === "all" ||
            item.status === historyStatus.value) &&
          (!historyFrom.value || item.date >= historyFrom.value) &&
          (!historyTo.value || item.date <= historyTo.value) &&
          `${item.clientName} ${service(item.serviceId)?.name}`
            .toLowerCase()
            .includes(historySearch.value.toLowerCase())
        );
      })
      .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`)),
  );
  function exportHistory() {
    const escape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const rows = [
      ["Data", "Hora", "Cliente", "Serviço", "Estado", "Valor (MZN)"],
      ...history.value.map((item) => [
        item.date,
        item.time,
        item.clientName,
        service(item.serviceId)?.name,
        statusNames[item.status],
        item.total,
      ]),
    ];
    const url = URL.createObjectURL(
      new Blob(
        ["\uFEFF" + rows.map((row) => row.map(escape).join(";")).join("\r\n")],
        { type: "text/csv;charset=utf-8;" },
      ),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "historico-atendimentos.csv";
    link.click();
    URL.revokeObjectURL(url);
  }
  const headings = {
    appointments: ["Os meus agendamentos", "O seu tempo, bem organizado."],
    notifications: [
      "Notificações",
      "As novidades da sua conta e dos seus agendamentos.",
    ],
    profile: ["O meu perfil", "Dados pessoais e preferências da sua conta."],
    "professional-agenda": [
      "A minha agenda",
      "Os seus atendimentos, num só lugar.",
    ],
    "professional-services": [
      "Os meus serviços",
      "Serviços associados à sua actividade.",
    ],
    "professional-schedule": [
      "Disponibilidade",
      "Organize o seu horário de trabalho e as suas pausas.",
    ],
    "professional-history": [
      "Histórico de atendimentos",
      "Consulte os atendimentos e acompanhe a sua actividade.",
    ],
  };
  return {
    state,
    go,
    notify,
    money,
    today,
    dateLabel,
    business,
    service,
    staffMember,
    saveRecord,
    removeRecord,
    updateBooking,
    cancelBooking,
    setAccountPassword,
    currentUser,
    professional,
    currentClientIds,
    myBookings,
    staffBookings,
    isProfessional,
    statusNames,
    statusClass,
    paymentNames,
    dayOptions,
    activeStatus,
    upcoming,
    totalCompleted,
    appointmentTab,
    search,
    selectedId,
    detailOpen,
    confirmCancel,
    detailError,
    selected,
    filteredAppointments,
    openBooking,
    reschedule,
    handleCancel,
    changeStatus,
    notificationTab,
    myNotifications,
    unreadCount,
    visibleNotifications,
    readNotification,
    readAllNotifications,
    profileForm,
    profileError,
    saveProfile,
    agendaDate,
    agendaFilter,
    dayBookings,
    agendaStats,
    shiftDate,
    assignedServices,
    schedule,
    scheduleError,
    saveSchedule,
    myBlocks,
    blockOpen,
    blockForm,
    blockError,
    deleteBlock,
    deleteBlockOpen,
    openBlock,
    saveBlock,
    confirmRemoveBlock,
    removeBlock,
    historySearch,
    historyStatus,
    historyFrom,
    historyTo,
    history,
    exportHistory,
    headings,
  };
}
