import { computed, reactive, ref, watch } from "vue";
import { plural, bookingCode } from "@/utils/formatters.ts";
import { openShareBooking } from "@/stores/shareBookingStore.ts";
import {
  state,
  go,
  notify,
  money,
  today,
  dateLabel,
  saveRecord,
  businessClientStatus,
  setBusinessClientStatus,
  removeRecord,
  availableSlots,
  bookingTotal,
  createBooking,
  updateBooking,
  cancelBooking,
  markPaid,
} from "@/stores/applicationStore.ts";

// Local state belongs to one mounted feature instance.
import type {
  Block,
  Booking,
  BookingInput,
  BookingStatus,
  PaymentStatus,
  Business,
  Client,
  ClientState,
  CollectionName,
  IsoDate,
  Promotion,
  Resource,
  Service,
  StaffMember,
  TimeOfDay,
  ViewName,
  Weekday,
} from "@/types/domain.ts";

/** Campos possíveis no editor de registos da empresa. */
export type RecordForm = Partial<
  Service & StaffMember & Resource & Promotion & Block & Client
>;

/** Colecções que o editor de registos da empresa sabe criar e alterar. */
export type EditorCollection =
  "services" | "staff" | "resources" | "clients" | "promotions" | "blocks";

export function useBusinessManagement() {
  const company = computed(
    () =>
      state.db.businesses.find((item) => item.id === state.businessId) ||
      state.db.businesses[0],
  );
  const companyId = computed(() => company.value?.id);
  /* Cada lista da empresa actual, já filtrada pelo tenant. */
  const localRecords = <T extends { businessId: string }>(
    collection: CollectionName,
  ) =>
    computed<T[]>(() =>
      ((state.db[collection] || []) as unknown as T[]).filter(
        (item) => item.businessId === companyId.value,
      ),
    );
  const services = localRecords<Service>("services");
  const team = localRecords<StaffMember>("staff");
  const resources = localRecords<Resource>("resources");
  const bookings = localRecords<Booking>("bookings");
  const clients = computed(() =>
    state.db.clients.filter(
      (item) =>
        item.businessId === companyId.value ||
        bookings.value.some((booking) => booking.clientId === item.id),
    ),
  );
  const clientStatus = (id: string): ClientState =>
    businessClientStatus(id, companyId.value);
  const reservableClients = computed(() =>
    clients.value.filter((item) => clientStatus(item.id) === "active"),
  );
  const promotions = localRecords<Promotion>("promotions");
  const blocks = localRecords<Block>("blocks");
  const query = ref("");
  const selectedDate = ref(today());
  const staffFilter = ref(
    state.view === "agenda" ? state.businessAgendaStaffId || "" : "",
  );
  if (state.view === "agenda") state.businessAgendaStaffId = null;
  const statusFilter = ref("");
  const paymentFilter = ref("pending");
  const reportFrom = ref(today().slice(0, 7) + "-01");
  const reportTo = ref(today());
  const editorOpen = ref(false);
  const editorType = ref<EditorCollection | "">("");
  /* O editor serve várias colecções: o formulário é a união dos seus campos. */
  const form = reactive<RecordForm>({});
  const formError = ref("");
  const bookingOpen = ref(false);
  const bookingError = ref("");
  const bookingForm = reactive<Partial<Booking>>({});
  const detailOpen = ref(false);
  const detailId = ref("");
  const removeOpen = ref(false);
  /* O registo em remoção pode vir de várias colecções: o rótulo que se mostra
     é o nome, o código do cupão ou o motivo do bloqueio. */
  const removal = ref<{
    collection: CollectionName;
    record: { id: string; name?: string; code?: string; reason?: string };
  } | null>(null);
  const settings = reactive<Partial<Business>>({});
  const weekdays: { id: Weekday; label: string }[] = [
    { id: 1, label: "Seg" },
    { id: 2, label: "Ter" },
    { id: 3, label: "Qua" },
    { id: 4, label: "Qui" },
    { id: 5, label: "Sex" },
    { id: 6, label: "Sáb" },
    { id: 0, label: "Dom" },
  ];
  const statusNames: Record<BookingStatus, string> = {
    confirmed: "Confirmado",
    in_progress: "Em atendimento",
    completed: "Concluído",
    cancelled: "Cancelado",
    no_show: "Não compareceu",
  };
  const paymentNames: Record<PaymentStatus, string> = {
    pending: "Por receber",
    paid: "Pago",
    refunded: "Reembolsado",
  };
  const activeBooking = (booking: Booking): boolean =>
    !["cancelled", "no_show"].includes(booking.status);
  const serviceName = (id: string): string =>
    services.value.find((item) => item.id === id)?.name || "Serviço removido";
  const staffName = (id: string): string =>
    team.value.find((item) => item.id === id)?.name || "Sem profissional";
  const clientName = (booking: Booking): string =>
    booking.clientName ||
    state.db.clients.find((item) => item.id === booking.clientId)?.name ||
    "Cliente";
  const resourceName = (id: string): string =>
    resources.value.find((item) => item.id === id)?.name || "Sem recurso";
  const initials = (name: string): string =>
    (name || "")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("");
  const searchable = (...values: (string | number | undefined)[]): boolean =>
    values
      .join(" ")
      .toLocaleLowerCase("pt")
      .includes(query.value.toLocaleLowerCase("pt").trim());
  const statusClass = (status: string): string =>
    ["completed", "paid", "confirmed"].includes(status)
      ? "success"
      : ["cancelled", "no_show"].includes(status)
        ? "danger"
        : status === "in_progress"
          ? "neutral"
          : "warning";
  const formatDate = (value: IsoDate | undefined): string =>
    value ? dateLabel(value) : "—";
  const titles: Partial<Record<ViewName, [string, string]>> = {
    overview: ["Visão geral", "O seu negócio, num relance."],
    agenda: ["Agenda", "Organize cada reserva e acompanhe os atendimentos."],
    services: ["Serviços", "O que o seu estabelecimento oferece."],
    team: ["Equipa", "Pessoas, especialidades e disponibilidade."],
    resources: [
      "Espaços e recursos",
      "Salas, mesas e equipamentos para os seus serviços.",
    ],
    schedule: ["Horários", "Funcionamento, turnos e períodos indisponíveis."],
    clients: ["Clientes", "Uma relação mais próxima em cada atendimento."],
    payments: ["Pagamentos", "Acompanhe os valores recebidos e por receber."],
    reports: ["Relatórios", "Dados que ajudam a tomar melhores decisões."],
    promotions: [
      "Promoções",
      "Ofertas para quem já conhece e quem vai descobrir.",
    ],
    settings: ["Definições", "O perfil e as preferências do estabelecimento."],
  };
  const page = computed<[string, string]>(
    () => titles[state.view] || titles.overview || ["", ""],
  );
  const todayBookings = computed(() =>
    bookings.value
      .filter((item) => item.date === today() && activeBooking(item))
      .sort((a, b) => a.time.localeCompare(b.time)),
  );
  const todayRevenue = computed(() =>
    bookings.value
      .filter((item) => item.date === today() && item.paymentStatus === "paid")
      .reduce((sum, item) => sum + Number(item.total), 0),
  );
  const outstanding = computed(() =>
    bookings.value.filter(
      (item) => activeBooking(item) && item.paymentStatus === "pending",
    ),
  );
  const agendaBookings = computed(() =>
    bookings.value
      .filter(
        (item) =>
          item.date === selectedDate.value &&
          (!staffFilter.value || item.staffId === staffFilter.value) &&
          (!statusFilter.value || item.status === statusFilter.value) &&
          searchable(clientName(item), serviceName(item.serviceId), item.time),
      )
      .sort((a, b) => a.time.localeCompare(b.time)),
  );
  const filteredServices = computed(() =>
    services.value.filter((item) => searchable(item.name, item.description)),
  );
  const filteredTeam = computed(() =>
    team.value.filter((item) => searchable(item.name, item.title, item.email)),
  );
  const filteredResources = computed(() =>
    resources.value.filter((item) => searchable(item.name, item.type)),
  );
  const filteredClients = computed(() =>
    clients.value.filter(
      (item) =>
        clientStatus(item.id) !== "removed" &&
        searchable(item.name, item.email, item.phone),
    ),
  );
  const filteredPromotions = computed(() =>
    promotions.value.filter((item) =>
      searchable(item.code, serviceName(item.serviceId)),
    ),
  );
  const paymentBookings = computed(() =>
    bookings.value
      .filter(
        (item) =>
          (!paymentFilter.value ||
            item.paymentStatus === paymentFilter.value) &&
          (paymentFilter.value === "refunded" || activeBooking(item)) &&
          searchable(clientName(item), serviceName(item.serviceId), item.id),
      )
      .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`)),
  );
  const reportBookings = computed(() =>
    bookings.value.filter(
      (item) => item.date >= reportFrom.value && item.date <= reportTo.value,
    ),
  );
  const reportRevenue = computed(() =>
    reportBookings.value
      .filter((item) => item.paymentStatus === "paid")
      .reduce((sum, item) => sum + Number(item.total), 0),
  );
  const reportCompleted = computed(
    () =>
      reportBookings.value.filter((item) => item.status === "completed").length,
  );
  const reportCancelled = computed(
    () =>
      reportBookings.value.filter((item) => item.status === "cancelled").length,
  );
  const reportByService = computed(() =>
    services.value
      .map((item) => {
        const rows = reportBookings.value.filter(
          (booking) => booking.serviceId === item.id && activeBooking(booking),
        );
        return {
          ...item,
          count: rows.length,
          revenue: rows
            .filter((booking) => booking.paymentStatus === "paid")
            .reduce((sum, booking) => sum + Number(booking.total), 0),
        };
      })
      .filter((item) => item.count)
      .sort((a, b) => b.count - a.count),
  );
  const reportByStaff = computed(() =>
    team.value
      .map((item) => {
        const rows = reportBookings.value.filter(
          (booking) => booking.staffId === item.id && activeBooking(booking),
        );
        return {
          ...item,
          count: rows.length,
          completed: rows.filter((booking) => booking.status === "completed")
            .length,
          revenue: rows
            .filter((booking) => booking.paymentStatus === "paid")
            .reduce((sum, booking) => sum + Number(booking.total), 0),
        };
      })
      .sort((a, b) => b.count - a.count),
  );
  const maxServiceCount = computed(() =>
    Math.max(1, ...reportByService.value.map((item) => item.count)),
  );
  const weekDays = computed(() =>
    Array.from({ length: 7 }, (_, offset) => {
      const date = new Date(`${today()}T12:00:00`);
      date.setDate(date.getDate() + offset);
      const key = date.toISOString().slice(0, 10);
      return {
        date: key,
        label: new Intl.DateTimeFormat("pt-MZ", { weekday: "short" })
          .format(date)
          .replace(".", ""),
        day: date.getDate(),
        count: bookings.value.filter(
          (item) => item.date === key && activeBooking(item),
        ).length,
      };
    }),
  );
  const selectedBooking = computed(() =>
    bookings.value.find((item) => item.id === detailId.value),
  );
  const bookingService = computed(() =>
    services.value.find((item) => item.id === bookingForm.serviceId),
  );
  const reservationTotal = computed(() => {
    const original = bookings.value.find((item) => item.id === bookingForm.id);
    if (
      original &&
      original.serviceId === bookingForm.serviceId &&
      Number(original.partySize || 1) === Number(bookingForm.partySize || 1)
    )
      return Number(original.total);
    return (
      bookingTotal({
        serviceId: bookingForm.serviceId || "",
        partySize: Number(bookingForm.partySize) || 1,
        coupon: bookingForm.coupon || "",
      }).total || 0
    );
  });
  const bookingStaff = computed(() =>
    team.value.filter(
      (item) =>
        item.active &&
        (!bookingForm.serviceId ||
          item.serviceIds?.includes(bookingForm.serviceId)),
    ),
  );
  const bookingResources = computed(() =>
    resources.value.filter(
      (item) =>
        item.active &&
        (!bookingService.value?.resourceType ||
          item.type === bookingService.value.resourceType),
    ),
  );
  const slots = computed(() => {
    if (!bookingForm.serviceId || !bookingForm.staffId || !bookingForm.date)
      return [];
    return availableSlots({
      businessId: companyId.value,
      serviceId: bookingForm.serviceId,
      staffId: bookingForm.staffId,
      resourceId: bookingForm.resourceId || "",
      partySize: Number(bookingForm.partySize) || 1,
      date: bookingForm.date,
      excludeBookingId: bookingForm.id,
    });
  });
  const currentTimeUnavailable = computed(
    () =>
      bookingForm.id &&
      bookingForm.time &&
      !slots.value.includes(bookingForm.time),
  );
  const editorLabels: Record<EditorCollection, string> = {
    services: "serviço",
    staff: "membro da equipa",
    resources: "recurso",
    clients: "cliente",
    promotions: "promoção",
    blocks: "bloqueio",
  };
  const editorTitle = computed(
    () =>
      `${form.id ? "Editar" : "Adicionar"} ${editorType.value ? editorLabels[editorType.value] : ""}`,
  );
  watch(
    () => state.view,
    () => {
      query.value = "";
      formError.value = "";
      resetSettings();
    },
  );
  watch(companyId, () => resetSettings(), { immediate: true });
  watch(
    () => bookingForm.serviceId,
    () => {
      if (!bookingStaff.value.some((item) => item.id === bookingForm.staffId))
        bookingForm.staffId = bookingStaff.value[0]?.id || "";
      if (
        !bookingResources.value.some(
          (item) => item.id === bookingForm.resourceId,
        )
      )
        bookingForm.resourceId = "";
    },
  );
  function resetSettings() {
    (Object.keys(settings) as (keyof Business)[]).forEach(
      (key) => delete settings[key],
    );
    Object.assign(settings, JSON.parse(JSON.stringify(company.value || {})));
  }
  function navigate(view: ViewName): void {
    go(view);
  }
  function changeDay(amount: number): void {
    const date = new Date(`${selectedDate.value}T12:00:00`);
    date.setDate(date.getDate() + amount);
    selectedDate.value = date.toISOString().slice(0, 10);
  }
  function openEditor(
    type: EditorCollection,
    record: RecordForm | null = null,
  ): void {
    if (type === "clients")
      return notify(
        "Os dados pessoais do cliente não podem ser alterados pelo gestor.",
      );
    editorType.value = type;
    formError.value = "";
    (Object.keys(form) as (keyof RecordForm)[]).forEach(
      (key) => delete form[key],
    );
    const defaults = {
      services: {
        name: "",
        description: "",
        duration: 30,
        price: 0,
        active: true,
        resourceType: "",
      },
      staff: {
        name: "",
        title: "",
        email: "",
        phone: "",
        active: true,
        serviceIds: [],
        start: company.value?.opens || "08:00",
        end: company.value?.closes || "18:00",
        days: [...(company.value?.days || [1, 2, 3, 4, 5, 6])],
      },
      resources: { name: "", type: "room", capacity: 1, active: true },
      clients: { name: "", email: "", phone: "" },
      promotions: {
        code: "",
        discount: 10,
        serviceId: "",
        active: true,
        expires: "",
      },
      blocks: {
        date: selectedDate.value,
        start: "12:00",
        end: "13:00",
        staffId: "",
        reason: "",
      },
    };
    Object.assign(form, JSON.parse(JSON.stringify(record || defaults[type])));
    editorOpen.value = true;
  }
  function saveEditor() {
    formError.value = "";
    const type = editorType.value;
    if (!type) return;
    if (type === "clients")
      return void (formError.value =
        "Os dados pessoais do cliente não podem ser alterados pelo gestor.");
    if (["services", "staff", "resources"].includes(type) && !form.name?.trim())
      return void (formError.value = "Indique um nome.");
    if (
      type === "services" &&
      (Number(form.duration) < 5 || Number(form.price) < 0)
    )
      return void (formError.value =
        "Verifique a duração e o preço do serviço.");
    if (
      type === "staff" &&
      (!form.serviceIds?.length ||
        !form.days?.length ||
        (form.start || "") >= (form.end || ""))
    )
      return void (formError.value =
        "Seleccione pelo menos um serviço, um dia e um turno válido.");
    if (type === "resources" && Number(form.capacity) < 1)
      return void (formError.value =
        "A capacidade deve ser de pelo menos uma pessoa.");
    if (type === "promotions") {
      form.code = (form.code || "").trim().toUpperCase();
      if (
        !form.code ||
        Number(form.discount) < 1 ||
        Number(form.discount) > 100 ||
        !form.expires
      )
        return void (formError.value =
          "Indique o código, um desconto entre 1% e 100% e a validade.");
      if (
        promotions.value.some(
          (item) =>
            item.id !== form.id && item.code.toUpperCase() === form.code,
        )
      )
        return void (formError.value =
          "Já existe uma promoção com este código.");
    }
    if (
      type === "blocks" &&
      (!form.date ||
        !form.reason?.trim() ||
        (form.start || "") >= (form.end || ""))
    )
      return void (formError.value =
        "Indique a data, o motivo e um período válido.");
    if (type === "blocks") {
      const blockStart: TimeOfDay = form.start || "";
      const blockEnd: TimeOfDay = form.end || "";
      const minutes = (time: TimeOfDay): number =>
        Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
      const affected = bookings.value.filter(
        (item) =>
          item.date === form.date &&
          ["confirmed", "in_progress"].includes(item.status) &&
          (!form.staffId || item.staffId === form.staffId) &&
          minutes(item.time) < minutes(blockEnd) &&
          minutes(item.time) + Number(item.duration) > minutes(blockStart),
      );
      if (affected.length)
        return void (formError.value = `${plural(affected.length, "Existe uma reserva", `Existem ${affected.length} reservas`)} neste período. Reagende antes de bloquear o horário.`);
    }
    const record = {
      ...JSON.parse(JSON.stringify(form)),
      businessId: companyId.value,
    };
    for (const field of ["duration", "price", "capacity", "discount"])
      if (field in record) record[field] = Number(record[field]);
    const result = saveRecord(type, record);
    if (result?.ok === false || result?.error)
      return void (formError.value =
        result.error || "Não foi possível guardar.");
    const account =
      type === "staff" ? ensureProfessionalAccount(result as StaffMember) : "";
    editorOpen.value = false;
    notify(
      account === "created"
        ? "Profissional guardado. A conta de acesso foi criada — defina a palavra-passe em Utilizadores."
        : "Alterações guardadas com sucesso.",
    );
  }
  /* Um profissional é uma pessoa da plataforma, não apenas uma ficha interna da
     empresa: ao guardar o membro da equipa garantimos a conta correspondente,
     para que o vínculo utilizador–empresa exista desde o início. */
  function ensureProfessionalAccount(person: StaffMember): string {
    const email = String(person.email || "")
      .trim()
      .toLowerCase();
    if (!email) return "";
    const existing = state.db.users.find(
      (item) => item.email.toLowerCase() === email,
    );
    if (existing && ["manager", "platform"].includes(existing.role)) return "";
    if (existing && existing.staffId && existing.staffId !== person.id)
      return "";
    saveRecord("users", {
      ...(existing || {}),
      name: person.name,
      email,
      phone: person.phone || existing?.phone || "",
      role: "professional",
      businessId: companyId.value,
      staffId: person.id,
      active: person.active !== false,
    });
    return existing ? "linked" : "created";
  }
  function requestRemoval(
    collection: CollectionName,
    record: { id: string; name?: string; code?: string; reason?: string },
  ): void {
    removal.value = { collection, record };
    removeOpen.value = true;
  }
  function confirmRemoval() {
    if (!removal.value) return;
    const { collection, record } = removal.value;
    if (collection === "clients") {
      const result = setBusinessClientStatus(record.id, "removed");
      if (!result.ok) return notify(result.error);
      notify("Cliente removido desta empresa. O histórico foi preservado.");
      removeOpen.value = false;
      return;
    }
    /* Qual o campo da reserva que aponta para esta colecção. Os clientes já
       saíram acima: aqui sobram as colecções que se desactivam. */
    const bookingField: Partial<Record<CollectionName, keyof Booking>> = {
      services: "serviceId",
      staff: "staffId",
      resources: "resourceId",
    };
    const field = bookingField[collection];
    const hasBookings =
      !!field && bookings.value.some((item) => item[field] === record.id);
    if (hasBookings) {
      const result = saveRecord(collection, { ...record, active: false });
      if (result?.ok === false) {
        notify(result.error || "Não foi possível desactivar o registo.");
        return;
      }
      notify("Registo desactivado. O histórico de reservas foi preservado.");
    } else {
      const result = removeRecord(collection, record.id);
      if (!result.ok) {
        notify(result.error || "Não foi possível eliminar.");
        return;
      }
      notify("Registo eliminado.");
    }
    removeOpen.value = false;
  }
  function toggleActive(
    collection: CollectionName,
    record: { id: string; active?: boolean },
  ): void {
    if (collection === "clients") {
      const active = clientStatus(record.id) === "active";
      const result = setBusinessClientStatus(
        record.id,
        active ? "inactive" : "active",
      );
      return notify(
        result.ok
          ? active
            ? "Cliente desactivado nesta empresa. O histórico foi preservado."
            : "Cliente reactivado nesta empresa."
          : result.error,
      );
    }
    const result = saveRecord(collection, {
      ...record,
      active: !record.active,
    });
    if (result?.ok === false)
      return notify(result.error || "Não foi possível guardar.");
    notify(record.active ? "Registo desactivado." : "Registo activado.");
  }
  function openBooking(record: Partial<Booking> | null = null): void {
    bookingError.value = "";
    (Object.keys(bookingForm) as (keyof Booking)[]).forEach(
      (key) => delete bookingForm[key],
    );
    Object.assign(
      bookingForm,
      record
        ? JSON.parse(JSON.stringify(record))
        : {
            serviceId: services.value.find((item) => item.active)?.id || "",
            staffId: "",
            resourceId: "",
            clientId: "",
            date: selectedDate.value < today() ? today() : selectedDate.value,
            time: "",
            partySize: 1,
            notes: "",
            paymentMethod: "onsite",
          },
    );
    if (!bookingForm.staffId)
      bookingForm.staffId = bookingStaff.value[0]?.id || "";
    detailOpen.value = false;
    bookingOpen.value = true;
  }
  function saveBooking() {
    bookingError.value = "";
    if (
      !bookingForm.clientId ||
      !bookingForm.serviceId ||
      !bookingForm.staffId ||
      !bookingForm.time
    )
      return void (bookingError.value =
        "Seleccione o cliente, serviço, profissional e horário.");
    if (bookingService.value?.resourceType && !bookingForm.resourceId)
      return void (bookingError.value =
        "Seleccione um espaço ou recurso para este serviço.");
    const client = clients.value.find(
      (item) => item.id === bookingForm.clientId,
    );
    const payload: BookingInput = {
      ...bookingForm,
      businessId: companyId.value || "",
      serviceId: bookingForm.serviceId || "",
      date: bookingForm.date || "",
      time: bookingForm.time || "",
      clientName: client?.name || bookingForm.clientName || "",
      partySize: Number(bookingForm.partySize),
      duration: bookingService.value?.duration,
    };
    const result = bookingForm.id
      ? updateBooking(bookingForm.id, payload)
      : createBooking(payload);
    if (!result?.ok)
      return void (bookingError.value =
        result?.error || "Não foi possível guardar a reserva.");
    bookingOpen.value = false;
    selectedDate.value = payload.date;
    notify(
      bookingForm.id ? "Reserva actualizada." : "Reserva criada com sucesso.",
    );
    /* Criada ao balcão: a seguir envia-se ao cliente. */
    if (!bookingForm.id && result.record) openShareBooking(result.record.id);
  }
  function inspectBooking(booking: Booking): void {
    detailId.value = booking.id;
    detailOpen.value = true;
  }
  function changeStatus(booking: Booking, status: BookingStatus): void {
    const result =
      status === "cancelled"
        ? cancelBooking(booking.id)
        : updateBooking(booking.id, { status });
    if (!result?.ok)
      return notify(result?.error || "Não foi possível actualizar a reserva.");
    notify(`Reserva: ${statusNames[status].toLowerCase()}.`);
  }
  function collectPayment(booking: Booking): void {
    const result = markPaid(booking.id);
    if (!result?.ok)
      return notify(result?.error || "Não foi possível registar o pagamento.");
    notify("Pagamento registado com sucesso.");
  }
  function saveSettings(scheduleOnly = false): void {
    if (
      !settings.name?.trim() ||
      !settings.city?.trim() ||
      !settings.address?.trim()
    )
      return notify("Preencha o nome, a cidade e a morada.");
    if (
      !settings.days?.length ||
      (settings.opens || "") >= (settings.closes || "")
    )
      return notify("Verifique os dias e o horário de funcionamento.");
    if (Number(settings.cancelHours) < 0)
      return notify("O prazo de cancelamento não pode ser negativo.");
    const result = saveRecord("businesses", {
      ...JSON.parse(JSON.stringify(settings)),
      cancelHours: Number(settings.cancelHours),
    });
    if (result?.ok === false)
      return notify(result.error || "Não foi possível guardar as definições.");
    notify(
      scheduleOnly
        ? "Horário de funcionamento actualizado."
        : "Definições guardadas.",
    );
  }
  function exportCsv(
    kind: "clients" | "reports" | "agenda" | "payments",
  ): void {
    let headers, rows;
    if (kind === "clients") {
      headers = ["Nome", "Email", "Telefone", "Reservas"];
      rows = filteredClients.value.map((item) => [
        item.name,
        item.email,
        item.phone,
        bookings.value.filter((booking) => booking.clientId === item.id).length,
      ]);
    } else {
      headers = [
        "Reserva",
        "Data",
        "Hora",
        "Cliente",
        "Serviço",
        "Profissional",
        "Estado",
        "Pagamento",
        "Total (MZN)",
      ];
      const source =
        kind === "reports"
          ? reportBookings.value
          : kind === "agenda"
            ? agendaBookings.value
            : paymentBookings.value;
      rows = source.map((item) => [
        bookingCode(item.id),
        item.date,
        item.time,
        clientName(item),
        serviceName(item.serviceId),
        staffName(item.staffId),
        statusNames[item.status],
        paymentNames[item.paymentStatus],
        item.total,
      ]);
    }
    const cell = (value: unknown): string =>
      `"${String(value ?? "")
        .replace(/^[=+@-]/, "'$&")
        .replaceAll('"', '""')}"`;
    const csv =
      "\uFEFF" +
      [headers, ...rows].map((row) => row.map(cell).join(";")).join("\r\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    const link = document.createElement("a");
    link.href = url;
    const exportNames = {
      clients: "clientes",
      reports: "relatorios",
      agenda: "agenda",
      payments: "pagamentos",
    };
    link.download = `${exportNames[kind] || kind}-${today()}.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify("Ficheiro exportado.");
  }
  const clientBookings = (id: string): Booking[] =>
    bookings.value.filter((item) => item.clientId === id);
  const clientLastVisit = (id: string): IsoDate | undefined =>
    clientBookings(id)
      .filter((item) => item.status === "completed")
      .sort((a, b) => b.date.localeCompare(a.date))[0]?.date;
  return {
    state,
    go,
    notify,
    money,
    today,
    dateLabel,
    saveRecord,
    businessClientStatus,
    setBusinessClientStatus,
    removeRecord,
    availableSlots,
    bookingTotal,
    createBooking,
    updateBooking,
    cancelBooking,
    markPaid,
    company,
    companyId,
    localRecords,
    services,
    team,
    resources,
    bookings,
    clients,
    reservableClients,
    clientStatus,
    promotions,
    blocks,
    query,
    selectedDate,
    staffFilter,
    statusFilter,
    paymentFilter,
    reportFrom,
    reportTo,
    editorOpen,
    editorType,
    form,
    formError,
    bookingOpen,
    bookingError,
    bookingForm,
    detailOpen,
    detailId,
    removeOpen,
    removal,
    settings,
    weekdays,
    statusNames,
    paymentNames,
    activeBooking,
    serviceName,
    staffName,
    clientName,
    resourceName,
    initials,
    searchable,
    statusClass,
    formatDate,
    titles,
    page,
    todayBookings,
    todayRevenue,
    outstanding,
    agendaBookings,
    filteredServices,
    filteredTeam,
    filteredResources,
    filteredClients,
    filteredPromotions,
    paymentBookings,
    reportBookings,
    reportRevenue,
    reportCompleted,
    reportCancelled,
    reportByService,
    reportByStaff,
    maxServiceCount,
    weekDays,
    selectedBooking,
    bookingService,
    reservationTotal,
    bookingStaff,
    bookingResources,
    slots,
    currentTimeUnavailable,
    editorLabels,
    editorTitle,
    resetSettings,
    navigate,
    changeDay,
    openEditor,
    saveEditor,
    requestRemoval,
    confirmRemoval,
    toggleActive,
    openBooking,
    saveBooking,
    inspectBooking,
    changeStatus,
    collectPayment,
    saveSettings,
    exportCsv,
    clientBookings,
    clientLastVisit,
  };
}
