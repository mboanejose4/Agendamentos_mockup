/* Estado da aplicação e regras de negócio do mockup.
   Sem backend: tudo acontece aqui, sobre uma base de dados em memória que é
   guardada no armazenamento local do navegador. */
import { money, dateLabel } from "@/utils/formatters.ts";
import { isUsablePhone, normalizePhone } from "@/utils/whatsapp.ts";
export { money, dateLabel };
import { reactive, watch } from "vue";
import type {
  ApplicationState,
  Block,
  Booking,
  BookingDraft,
  BookingInput,
  BookingStatus,
  Business,
  Client,
  ClientState,
  CollectionName,
  Database,
  IsoDate,
  LogEntry,
  OperationResult,
  PriceBreakdown,
  Resource,
  Role,
  Service,
  SlotQuery,
  StaffMember,
  TimeOfDay,
  User,
  ViewName,
  Weekday,
} from "@/types/domain.ts";
import { makeSeed, shiftDate } from "@/services/seed.ts";
import {
  canOpenView,
  routeFromLocation,
  writeViewRoute,
} from "@/utils/navigation/viewRoutes.ts";

import {
  readApplicationSnapshot,
  writeApplicationSnapshot,
} from "@/services/localStorageService.ts";
const roles: readonly Role[] = [
  "guest",
  "client",
  "professional",
  "manager",
  "platform",
];
const landing: Record<Role, ViewName> = {
  guest: "explore",
  client: "appointments",
  professional: "professional-agenda",
  manager: "overview",
  platform: "platform-overview",
};
const defaults = (): ApplicationState => ({
  view: "explore",
  role: "guest",
  businessId: "b1",
  selectedBusinessId: "b1",
  staffId: "p1",
  userId: "u1",
  bookingDraft: null,
  toast: "",
  db: makeSeed(),
});

function restore(): ApplicationState {
  const initial = defaults();
  try {
    const saved = readApplicationSnapshot();
    if (!saved || saved.version !== 4 || !saved.db) return initial;
    for (const name of Object.keys(initial.db) as (keyof Database)[]) {
      const current = initial.db[name];
      const stored = saved.db?.[name];
      if (Array.isArray(current) && Array.isArray(stored))
        (initial.db[name] as unknown[]) = stored as unknown[];
    }
    initial.db.settings = { ...initial.db.settings, ...saved.db.settings };
    if (roles.includes(saved.role)) initial.role = saved.role;
    for (const key of [
      "businessId",
      "selectedBusinessId",
      "staffId",
      "userId",
    ] as const)
      if (typeof saved[key] === "string") initial[key] = saved[key];
    initial.view = landing[initial.role];
  } catch {
    /* A stale or unavailable browser store must not stop the application. */
  }
  return initial;
}

export const state: ApplicationState = reactive(restore());

const initialRoute = routeFromLocation();
if (initialRoute) {
  if (canOpenView(state.role, initialRoute)) state.view = initialRoute;
  else if (state.role === "guest" && canOpenView("client", initialRoute)) {
    state.returnView = initialRoute;
    state.view = "auth";
  } else writeViewRoute(state.view, true);
}

if (typeof window !== "undefined") {
  window.addEventListener("popstate", () => {
    const route = routeFromLocation() || "explore";
    if (canOpenView(state.role, route)) state.view = route;
    else if (state.role === "guest" && canOpenView("client", route)) {
      state.returnView = route;
      state.view = "auth";
    } else state.view = landing[state.role];
  });
}

watch(
  () => [
    state.db,
    state.role,
    state.businessId,
    state.selectedBusinessId,
    state.staffId,
    state.userId,
  ],
  () => {
    try {
      writeApplicationSnapshot({
        version: 4,
        db: state.db,
        role: state.role,
        businessId: state.businessId,
        selectedBusinessId: state.selectedBusinessId,
        staffId: state.staffId,
        userId: state.userId,
      });
    } catch {
      /* Private browsing and storage quotas can disable persistence. */
    }
  },
  { deep: true, flush: "sync" },
);

export const uid = (prefix = "id"): string =>
  `${prefix}_${globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 9)}`}`;
export const today = (): IsoDate => shiftDate();
export const business = (id = state.businessId): Business | undefined =>
  state.db.businesses.find((item) => item.id === id);
export const service = (id: string): Service | undefined =>
  state.db.services.find((item) => item.id === id);
export const staffMember = (id: string): StaffMember | undefined =>
  state.db.staff.find((item) => item.id === id);

export function go(view: ViewName): void {
  state.view = view;
  writeViewRoute(view);
  if (typeof window !== "undefined")
    window.scrollTo?.({ top: 0, behavior: "instant" });
}

export function switchRole(role: Role): OperationResult<User> {
  if (!roles.includes(role))
    return { ok: false, error: "Perfil desconhecido." };
  state.role = role;
  const user = state.db.users.find((item) => item.role === role && item.active);
  if (user) {
    state.userId = user.id;
    if (user.businessId) state.businessId = user.businessId;
    if (user.staffId) state.staffId = user.staffId;
  }
  go(landing[role]);
  return { ok: true, record: user };
}

let toastTimer: ReturnType<typeof setTimeout> | undefined;
export function notify(message: string): void {
  state.toast = message;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    state.toast = "";
  }, 4200);
  (toastTimer as { unref?: () => void }).unref?.();
}

/* Nome legível de uma colecção, para o registo de actividade não mostrar a
   chave técnica ("blocks") a quem lê a monitoria. */
/** Forma mínima comum a qualquer registo guardado numa colecção. */
type StoredRecord = { id: string } & Record<string, unknown>;

const collectionLabels: Partial<Record<CollectionName, string>> = {
  businesses: "estabelecimento",
  services: "serviço",
  staff: "profissional",
  resources: "recurso",
  clients: "cliente",
  bookings: "marcação",
  promotions: "promoção",
  blocks: "período indisponível",
  tickets: "pedido de suporte",
  users: "utilizador",
  notifications: "notificação",
};
const recordLabel = (
  collection: CollectionName,
  record: Partial<Record<string, unknown>> = {},
): string =>
  String(
    record.name ||
      record.code ||
      record.subject ||
      record.reason ||
      collectionLabels[collection] ||
      collection,
  );

function audit(action: string, businessId = state.businessId): void {
  state.db.logs.unshift({
    id: uid("log"),
    action,
    userId: state.userId,
    businessId,
    createdAt: new Date().toISOString(),
  });
  if (state.db.logs.length > 300) state.db.logs.splice(300);
}

function addNotification(userId: string, title: string, body: string): void {
  if (state.db.settings.notifications === false) return;
  state.db.notifications.unshift({
    id: uid("n"),
    userId,
    title,
    body,
    read: false,
    createdAt: new Date().toISOString(),
  });
}

export function businessClientStatus(
  clientId: string,
  businessId = state.businessId,
): ClientState {
  return (
    state.db.businesses.find((item) => item.id === businessId)?.clientStates?.[
      clientId
    ] || "active"
  );
}

export function setBusinessClientStatus(
  clientId: string,
  status: ClientState,
): OperationResult<Client> {
  const company = state.db.businesses.find(
    (item) => item.id === state.businessId,
  );
  const client = state.db.clients.find((item) => item.id === clientId);
  const associated =
    client &&
    (client.businessId === state.businessId ||
      state.db.bookings.some(
        (item) =>
          item.businessId === state.businessId && item.clientId === clientId,
      ));
  if (
    state.role !== "manager" ||
    !company ||
    !associated ||
    !["active", "inactive", "removed"].includes(status)
  )
    return {
      ok: false,
      error: "Não é possível alterar este cliente nesta empresa.",
    };
  company.clientStates = { ...company.clientStates, [clientId]: status };
  audit(
    `${
      {
        removed: "Removido da empresa",
        inactive: "Desactivado na empresa",
        active: "Reactivado na empresa",
      }[status]
    }: ${client.name}`,
    company.id,
  );
  return { ok: true };
}

/** Registo guardado numa colecção, pelo nome da colecção. */
export type RecordOf<C extends CollectionName> =
  Database[C] extends Array<infer T> ? T : never;

/* Guardar devolve o registo. A única falha possível — o gestor a tentar alterar
   dados pessoais de um cliente — vem no mesmo objecto, para que quem chama
   possa verificar `result.ok === false` sem mudar de forma. */
export type SaveOutcome<T> = T & { ok?: false; error?: string };

export function saveRecord<C extends CollectionName>(
  collection: C,
  record: Partial<RecordOf<C>> & Record<string, unknown>,
): SaveOutcome<RecordOf<C>> {
  if (state.role === "manager" && collection === "clients")
    return {
      ok: false,
      error: "O gestor não pode criar ou alterar dados pessoais dos clientes.",
    } as SaveOutcome<RecordOf<C>>;
  if (collection === "businesses") {
    const company = record as Partial<Business>;
    if (
      company.package !== undefined &&
      ![1, 2, 3, 4].includes(Number(company.package))
    )
      return {
        ok: false,
        error: "Seleccione um pacote válido.",
      } as SaveOutcome<RecordOf<C>>;
    const code = String(company.code || "")
      .trim()
      .toUpperCase();
    if (Number(company.package || 3) <= 2 && !code)
      return {
        ok: false,
        error: "Este pacote exige um código de empresa para acesso directo.",
      } as SaveOutcome<RecordOf<C>>;
    if (
      code &&
      state.db.businesses.some(
        (item) => item.id !== company.id && item.code?.toUpperCase() === code,
      )
    )
      return {
        ok: false,
        error: "Este código já pertence a outra empresa.",
      } as SaveOutcome<RecordOf<C>>;
    if (
      company.noShowPenaltyPercent !== undefined &&
      (!Number.isFinite(Number(company.noShowPenaltyPercent)) ||
        Number(company.noShowPenaltyPercent) < 0 ||
        Number(company.noShowPenaltyPercent) > 10)
    )
      return {
        ok: false,
        error: "A penalização por falta deve estar entre 0% e 10%.",
      } as SaveOutcome<RecordOf<C>>;
    (record as Record<string, unknown>)["code"] = code;
  }
  if (collection === "staff") {
    const commission = Number(
      (record as Partial<StaffMember>).commissionPercent || 0,
    );
    const rent = Number(
      (record as Partial<StaffMember>).spaceRentalMonthly || 0,
    );
    if (!Number.isFinite(rent) || rent < 0)
      return {
        ok: false,
        error: "A renda mensal do espaço não pode ser negativa.",
      } as SaveOutcome<RecordOf<C>>;
    if (!Number.isFinite(commission) || commission < 0 || commission > 100)
      return {
        ok: false,
        error: "A comissão deve estar entre 0% e 100%.",
      } as SaveOutcome<RecordOf<C>>;
  }
  /* A partir daqui a colecção é dinâmica: trabalhamos sobre a forma mínima
     comum a todos os registos e devolvemos o tipo da colecção pedida. */
  const list = state.db[collection] as unknown as StoredRecord[];
  if (!Array.isArray(list)) throw new Error("Colecção desconhecida.");
  const clean: StoredRecord = {
    ...(record as unknown as StoredRecord),
    id: (record.id as string) || uid(collection.slice(0, 3)),
  };
  delete clean.password;
  const index = list.findIndex((item) => item.id === clean.id);
  if (index === -1) list.push(clean);
  else list[index] = { ...list[index], ...clean };
  if (collection !== "logs" && collection !== "notifications")
    audit(
      `${index === -1 ? "Criado" : "Actualizado"}: ${recordLabel(collection, clean)}`,
      clean.businessId as string,
    );
  return list.find((item) => item.id === clean.id) as SaveOutcome<RecordOf<C>>;
}

/* Eliminar um estabelecimento não pode deixar registos órfãos: o que só existe
   dentro dele desaparece com ele, e as contas das pessoas continuam na
   plataforma, sem vínculo a uma empresa que já não existe. */
function detachBusiness(businessId: string): void {
  const without = <T extends { businessId: string }>(list: T[]): T[] =>
    list.filter((item) => item.businessId !== businessId);
  state.db.services = without(state.db.services);
  state.db.staff = without(state.db.staff);
  state.db.resources = without(state.db.resources);
  state.db.promotions = without(state.db.promotions);
  state.db.blocks = without(state.db.blocks);
  state.db.tickets = without(state.db.tickets);
  state.db.clients = state.db.clients.map((item) =>
    item.businessId === businessId ? { ...item, businessId: "" } : item,
  );
  state.db.users = state.db.users.map((item) =>
    item.businessId === businessId
      ? {
          ...item,
          businessId: "",
          staffId: "",
          role: item.role === "platform" ? item.role : "client",
        }
      : item,
  );
  const fallback = state.db.businesses[0]?.id || "";
  if (state.businessId === businessId) state.businessId = fallback;
  if (state.selectedBusinessId === businessId)
    state.selectedBusinessId = fallback;
}

export function removeRecord<C extends CollectionName>(
  collection: C,
  id: string,
): OperationResult<RecordOf<C>> {
  if (state.role === "manager" && collection === "clients")
    return setBusinessClientStatus(id, "removed") as OperationResult<
      RecordOf<C>
    >;
  const list = state.db[collection] as unknown as StoredRecord[];
  if (!Array.isArray(list))
    return { ok: false, error: "Colecção desconhecida." };
  const index = list.findIndex((item) => item.id === id);
  if (index < 0) return { ok: false, error: "Registo não encontrado." };
  const item = list[index];
  const referenceKeys: Partial<Record<CollectionName, keyof Booking>> = {
    businesses: "businessId",
    services: "serviceId",
    staff: "staffId",
    resources: "resourceId",
    clients: "clientId",
  };
  const referenceKey = referenceKeys[collection];
  if (
    referenceKey &&
    state.db.bookings.some((booking) => booking[referenceKey] === id)
  ) {
    if (collection === "clients")
      return {
        ok: false,
        error:
          "Este cliente tem histórico de marcações e não pode ser eliminado.",
      };
    (item as { active?: boolean }).active = false;
    audit(
      `Desactivado: ${recordLabel(collection, item)}`,
      item.businessId as string,
    );
    return {
      ok: true,
      record: item as RecordOf<C>,
      archived: true,
    };
  }
  list.splice(index, 1);
  if (collection === "businesses") detachBusiness(id);
  if (collection === "staff")
    state.db.users = state.db.users.map((entry) =>
      entry.staffId === id
        ? {
            ...entry,
            staffId: "",
            businessId: "",
            role: entry.role === "professional" ? "client" : entry.role,
          }
        : entry,
    );
  audit(
    `Eliminado: ${recordLabel(collection, item)}`,
    item.businessId as string,
  );
  return { ok: true, record: item as RecordOf<C> };
}

const minutes = (time: TimeOfDay | undefined): number => {
  if (!time || !/^\d{2}:\d{2}$/.test(time)) return NaN;
  const [hours, mins] = time.split(":").map(Number);
  return hours >= 0 && hours < 24 && mins >= 0 && mins < 60
    ? hours * 60 + mins
    : NaN;
};
const timeLabel = (value: number): TimeOfDay =>
  `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
const overlaps = (
  start: number,
  end: number,
  otherStart: number,
  otherEnd: number,
): boolean => start < otherEnd && end > otherStart;
const occupies = (booking: Booking): boolean =>
  !["cancelled", "no_show"].includes(booking.status);
const dateValid = (date: IsoDate | undefined): boolean =>
  !!date &&
  /^\d{4}-\d{2}-\d{2}$/.test(date) &&
  !Number.isNaN(new Date(`${date}T12:00:00`).getTime()) &&
  new Date(`${date}T12:00:00`).getDate() === Number(date.slice(-2));

interface SlotContext {
  venue: Business;
  item: Service;
  /* null significa "sem profissional", como numa reserva de mesa. */
  candidates: (StaffMember | null)[];
  resources: (Resource | null)[];
  bookings: Booking[];
  blocks: Block[];
  date: IsoDate;
}

function slotContext(options: SlotQuery): SlotContext | null {
  const { businessId, serviceId, date, resourceId, excludeBookingId } = options;
  const venue = business(businessId);
  const item = service(serviceId);
  const partySize = Number(options.partySize || 1);
  if (
    !venue?.active ||
    !item?.active ||
    item.businessId !== businessId ||
    !dateValid(date)
  )
    return null;
  if (
    !Number.isInteger(partySize) ||
    partySize < 1 ||
    Number(item.duration) <= 0
  )
    return null;
  if (
    date < today() ||
    date > shiftDate(Number(state.db.settings.advanceDays) || 60)
  )
    return null;
  const weekday = new Date(`${date}T12:00:00`).getDay() as Weekday;
  if (!(venue.days || [0, 1, 2, 3, 4, 5, 6]).includes(weekday)) return null;
  const staffId =
    options.staffId && options.staffId !== "any" ? options.staffId : "";
  let candidates: (StaffMember | null)[] = state.db.staff.filter(
    (person) =>
      person.businessId === businessId &&
      person.active &&
      person.serviceIds?.includes(serviceId) &&
      (!staffId || person.id === staffId) &&
      (person.days || venue.days).includes(weekday),
  );
  if (item.resourceType === "table" && !staffId) candidates = [null];
  if (!candidates.length) return null;
  let resources: (Resource | null)[] = [null];
  if (item.resourceType || resourceId) {
    resources = state.db.resources.filter(
      (resource) =>
        resource.businessId === businessId &&
        resource.active &&
        (!item.resourceType || resource.type === item.resourceType) &&
        (!resourceId || resource.id === resourceId) &&
        Number(resource.capacity || 1) >= partySize,
    );
    resources.sort((a, b) => Number(a?.capacity) - Number(b?.capacity));
  }
  if (!resources.length) return null;
  return {
    venue,
    item,
    candidates,
    resources,
    bookings: state.db.bookings.filter(
      (booking) =>
        booking.businessId === businessId &&
        booking.date === date &&
        booking.id !== excludeBookingId &&
        occupies(booking),
    ),
    blocks: state.db.blocks.filter(
      (block) => block.businessId === businessId && block.date === date,
    ),
    date,
  };
}

function assignSlot(
  context: SlotContext,
  start: number,
): { staffId: string; resourceId: string } | null {
  const { venue, item, candidates, resources, bookings, blocks, date } =
    context;
  const end = start + Number(item.duration);
  if (
    !Number.isFinite(start) ||
    start < minutes(venue.opens) ||
    end > minutes(venue.closes)
  )
    return null;
  if (new Date(`${date}T${timeLabel(start)}:00`).getTime() <= Date.now())
    return null;
  for (const person of candidates) {
    if (
      person &&
      (start < minutes(person.start || venue.opens) ||
        end > minutes(person.end || venue.closes))
    )
      continue;
    if (
      blocks.some(
        (block) =>
          (!block.staffId || block.staffId === person?.id) &&
          overlaps(start, end, minutes(block.start), minutes(block.end)),
      )
    )
      continue;
    if (
      person &&
      bookings.some(
        (booking) =>
          booking.staffId === person.id &&
          overlaps(
            start,
            end,
            minutes(booking.time),
            minutes(booking.time) + Number(booking.duration),
          ),
      )
    )
      continue;
    for (const resource of resources) {
      if (
        resource &&
        bookings.some(
          (booking) =>
            booking.resourceId === resource.id &&
            overlaps(
              start,
              end,
              minutes(booking.time),
              minutes(booking.time) + Number(booking.duration),
            ),
        )
      )
        continue;
      return { staffId: person?.id || "", resourceId: resource?.id || "" };
    }
  }
  return null;
}

export function availableSlots(options: SlotQuery): TimeOfDay[] {
  const context = slotContext(options);
  if (!context) return [];
  const step = Math.max(
    5,
    Math.min(120, Number(state.db.settings.slotMinutes) || 30),
  );
  const slots: TimeOfDay[] = [];
  for (
    let start = minutes(context.venue.opens);
    start + Number(context.item.duration) <= minutes(context.venue.closes);
    start += step
  ) {
    if (assignSlot(context, start)) slots.push(timeLabel(start));
  }
  return slots;
}

export function bookingTotal({
  serviceId,
  coupon = "",
  partySize = 1,
}: {
  serviceId: string;
  coupon?: string;
  partySize?: number;
  businessId?: string;
}): PriceBreakdown {
  const item = service(serviceId);
  if (!item)
    return {
      total: 0,
      subtotal: 0,
      discount: 0,
      coupon: "",
      error: "Escolha um serviço.",
    };
  const subtotal = Math.round(
    Number(item.price) * (item.pricePerPerson ? Number(partySize || 1) : 1),
  );
  const code = String(coupon).trim().toUpperCase();
  if (!code) return { total: subtotal, subtotal, discount: 0, coupon: "" };
  const promo = state.db.promotions.find(
    (entry) =>
      entry.code?.trim().toUpperCase() === code &&
      entry.businessId === item.businessId &&
      entry.active &&
      (!entry.serviceId || entry.serviceId === serviceId) &&
      (!entry.expires || entry.expires >= today()),
  );
  if (!state.db.settings.promotions || !promo)
    return {
      total: subtotal,
      subtotal,
      discount: 0,
      coupon: code,
      error: "Este cupão não é válido para o serviço ou já expirou.",
    };
  const percentage = Math.max(0, Math.min(100, Number(promo.discount) || 0));
  const discount = Math.round((subtotal * percentage) / 100);
  return {
    total: subtotal - discount,
    subtotal,
    discount,
    coupon: code,
    percentage,
  };
}

/** Uma marcação já validada, à espera de identificador e estado. */
type PreparedBooking = Omit<
  Booking,
  "id" | "status" | "paymentStatus" | "createdAt"
>;

function prepareBooking(
  draft: BookingInput,
  excludeBookingId = "",
): { ok: true; record: PreparedBooking } | { ok: false; error: string } {
  const item = service(draft.serviceId);
  if (!item) return { ok: false, error: "Seleccione um serviço válido." };
  const options = {
    ...draft,
    businessId: draft.businessId || item.businessId,
    excludeBookingId,
  };
  const context = slotContext(options);
  const assignment =
    context &&
    availableSlots(options).includes(draft.time) &&
    assignSlot(context, minutes(draft.time));
  if (!assignment)
    return {
      ok: false,
      error:
        "Este horário já não está disponível. Escolha outro horário ou profissional.",
    };
  const original = state.db.bookings.find(
    (entry) => entry.id === excludeBookingId,
  );
  const keepPrice =
    original &&
    draft.serviceId === original.serviceId &&
    Number(draft.partySize || 1) === Number(original.partySize || 1) &&
    (draft.coupon || "") === (original.coupon || "");
  const price = keepPrice
    ? {
        total: original.total,
        subtotal:
          original.subtotal ?? original.total + (original.discount || 0),
        discount: original.discount || 0,
        coupon: original.coupon || "",
      }
    : bookingTotal({
        serviceId: draft.serviceId,
        coupon: draft.coupon || "",
        partySize: draft.partySize,
      });
  if (price.error) return { ok: false, error: price.error };
  const paymentMethod = draft.paymentMethod || "onsite";
  if (!["onsite", "online"].includes(paymentMethod))
    return { ok: false, error: "Seleccione um método de pagamento válido." };
  if (
    paymentMethod === "online" &&
    (!context.venue.onlinePayment || !state.db.settings.onlinePayments)
  )
    return {
      ok: false,
      error: "Este estabelecimento aceita pagamento no local.",
    };
  const clientId = draft.clientId || state.userId || uid("c");
  const client =
    state.db.clients.find((entry) => entry.id === clientId) ||
    state.db.users.find((entry) => entry.id === clientId);
  const clientName = String(draft.clientName || client?.name || "").trim();
  if (!clientName) return { ok: false, error: "Indique o nome do cliente." };
  return {
    ok: true,
    record: {
      businessId: options.businessId,
      serviceId: item.id,
      ...assignment,
      clientId,
      clientName,
      date: draft.date,
      time: draft.time,
      duration: Number(item.duration),
      total: price.total,
      subtotal: price.subtotal,
      discount: price.discount,
      coupon: price.coupon,
      paymentMethod,
      partySize: Number(draft.partySize || 1),
      notes: String(draft.notes || "").trim(),
      whatsapp: String(
        draft.phone || draft.whatsapp || client?.phone || "",
      ).trim(),
    },
  };
}

export function createBooking(draft: BookingInput): OperationResult<Booking> {
  const businessId =
    draft.businessId ||
    service(draft.serviceId)?.businessId ||
    state.businessId;
  if (
    businessClientStatus(draft.clientId || state.userId, businessId) !==
    "active"
  )
    return {
      ok: false,
      error:
        "Este cliente está desactivado ou removido nesta empresa e não pode efectuar novas reservas.",
    };
  const result = prepareBooking(draft);
  if (!result.ok) return result;
  const record: Booking = {
    ...result.record,
    id: uid("a"),
    shareToken: uid("lnk").replace("lnk_", ""),
    status: "confirmed",
    paymentStatus: draft.paymentStatus === "paid" ? "paid" : "pending",
    createdAt: new Date().toISOString(),
  };
  state.db.bookings.push(record);
  if (!state.db.clients.some((client) => client.id === record.clientId)) {
    const user = state.db.users.find((entry) => entry.id === record.clientId);
    state.db.clients.push({
      id: record.clientId || uid("c"),
      businessId: record.businessId,
      name: record.clientName,
      email: draft.email || user?.email || "",
      phone: draft.phone || user?.phone || "",
    });
  }
  addNotification(
    record.clientId,
    "Marcação confirmada",
    `${service(record.serviceId)?.name || "Serviço"} em ${business(record.businessId)?.name || "Estabelecimento"}, ${dateLabel(record.date)} às ${record.time}.`,
  );
  const manager = state.db.users.find(
    (entry) =>
      entry.role === "manager" && entry.businessId === record.businessId,
  );
  if (manager)
    addNotification(
      manager.id,
      "Nova marcação",
      `${record.clientName}: ${service(record.serviceId)?.name || "Serviço"}, ${dateLabel(record.date)} às ${record.time}.`,
    );
  audit(`Marcação criada: ${record.clientName}`, record.businessId);
  return { ok: true, record };
}

export function updateBooking(
  id: string,
  patch: Partial<Booking> & Partial<BookingDraft>,
): OperationResult<Booking> {
  const existing = state.db.bookings.find((entry) => entry.id === id);
  if (!existing) return { ok: false, error: "Marcação não encontrada." };
  if (patch.status === "cancelled") return cancelBooking(id);
  if (
    patch.status &&
    !["confirmed", "in_progress", "completed", "no_show"].includes(patch.status)
  )
    return { ok: false, error: "Estado inválido." };
  if (patch.status) {
    const transitions: Record<BookingStatus, BookingStatus[]> = {
      confirmed: ["confirmed", "in_progress", "completed", "no_show"],
      in_progress: ["in_progress", "completed", "no_show"],
      completed: ["completed"],
      no_show: ["no_show"],
      cancelled: [],
    };
    if (!transitions[existing.status]?.includes(patch.status))
      return {
        ok: false,
        error: "Não é possível efectuar esta alteração de estado.",
      };
  }
  const schedulingKeys = [
    "date",
    "time",
    "serviceId",
    "staffId",
    "resourceId",
    "partySize",
    "coupon",
    "businessId",
  ] as const satisfies readonly (keyof Booking)[];
  const scheduling = schedulingKeys.some(
    (key) => key in patch && patch[key] !== existing[key],
  );
  if (scheduling) {
    if (["cancelled", "completed", "no_show"].includes(existing.status))
      return { ok: false, error: "Só pode reagendar uma marcação activa." };
    if (state.role === "client" && !canCancel(existing))
      return {
        ok: false,
        error: "O prazo de alteração terminou. Contacte o estabelecimento.",
      };
    const result = prepareBooking({ ...existing, ...patch }, id);
    if (!result.ok) return result;
    Object.assign(existing, result.record);
    addNotification(
      existing.clientId,
      "Marcação reagendada",
      `${service(existing.serviceId)?.name || "Serviço"}: ${dateLabel(existing.date)} às ${existing.time}.`,
    );
  }
  if (patch.status) {
    existing.status = patch.status;
    if (patch.status === "completed")
      addNotification(
        existing.clientId,
        "Atendimento concluído",
        `Obrigado pela sua visita a ${business(existing.businessId)?.name || "nós"}.`,
      );
  }
  if ("notes" in patch) existing.notes = String(patch.notes || "").trim();
  if ("whatsapp" in patch && patch.whatsapp)
    existing.whatsapp = String(patch.whatsapp).trim();
  if (
    patch.paymentStatus &&
    ["pending", "paid", "refunded"].includes(patch.paymentStatus)
  )
    existing.paymentStatus = patch.paymentStatus;
  if ("clientName" in patch && String(patch.clientName).trim())
    existing.clientName = String(patch.clientName).trim();
  audit(`Marcação actualizada: ${existing.clientName}`, existing.businessId);
  return { ok: true, record: existing };
}

/** O cliente comunica um atraso; o estabelecimento decide se ainda o pode atender. */
export function requestBookingDelay(
  id: string,
  minutesLate: number,
): OperationResult<Booking> {
  const booking = state.db.bookings.find((item) => item.id === id);
  if (
    !booking ||
    state.role !== "client" ||
    booking.clientId !== state.userId ||
    booking.status !== "confirmed"
  )
    return { ok: false, error: "Esta marcação não aceita pedidos de atraso." };
  if (![5, 10, 15, 20, 30].includes(minutesLate))
    return { ok: false, error: "Seleccione um tempo de atraso predefinido." };
  booking.delayMinutes = minutesLate;
  booking.delayStatus = "requested";
  const recipients = state.db.users.filter(
    (user) =>
      user.active &&
      user.businessId === booking.businessId &&
      (user.role === "manager" ||
        (user.role === "professional" && user.staffId === booking.staffId)),
  );
  for (const recipient of recipients)
    addNotification(
      recipient.id,
      "Pedido de atraso",
      `${booking.clientName} prevê ${minutesLate} minutos de atraso na marcação de ${dateLabel(booking.date)} às ${booking.time}. Confirme se ainda pode atender.`,
    );
  audit(`Atraso solicitado: ${minutesLate} min`, booking.businessId);
  return { ok: true, record: booking };
}

export function respondBookingDelay(
  id: string,
  accept: boolean,
): OperationResult<Booking> {
  const booking = state.db.bookings.find((item) => item.id === id);
  if (
    !booking ||
    !["manager", "professional"].includes(state.role) ||
    booking.businessId !== state.businessId ||
    (state.role === "professional" && booking.staffId !== state.staffId) ||
    booking.delayStatus !== "requested"
  )
    return { ok: false, error: "Pedido de atraso indisponível." };
  booking.delayStatus = accept ? "accepted" : "declined";
  addNotification(
    booking.clientId,
    accept ? "Atraso aceite" : "Atraso recusado",
    accept
      ? `O estabelecimento confirmou que pode atender com ${booking.delayMinutes} minutos de atraso.`
      : "Contacte o estabelecimento para combinar uma alternativa.",
  );
  audit(
    `Atraso ${accept ? "aceite" : "recusado"}: ${booking.clientName}`,
    booking.businessId,
  );
  return { ok: true, record: booking };
}

/** O gestor decide aplicar a taxa depois de registar a falta. */
export function applyNoShowPenalty(id: string): OperationResult<Booking> {
  const booking = state.db.bookings.find((item) => item.id === id);
  const venue = booking && business(booking.businessId);
  if (
    !booking ||
    !venue ||
    state.role !== "manager" ||
    booking.businessId !== state.businessId ||
    booking.status !== "no_show"
  )
    return {
      ok: false,
      error: "A penalização só pode ser aplicada pelo gestor após uma falta.",
    };
  const percent = Number(venue.noShowPenaltyPercent || 0);
  if (!Number.isFinite(percent) || percent <= 0 || percent > 10)
    return {
      ok: false,
      error: "Defina uma taxa entre 0% e 10% nas preferências da empresa.",
    };
  if (booking.noShowPenalty)
    return { ok: false, error: "A penalização já foi aplicada." };
  booking.noShowPenalty =
    Math.round(Number(service(booking.serviceId)?.price || 0) * percent) / 100;
  addNotification(
    booking.clientId,
    "Penalização por falta",
    `${venue.name} aplicou ${money(booking.noShowPenalty)} pela falta à marcação.`,
  );
  audit(
    `Penalização por falta: ${money(booking.noShowPenalty)}`,
    booking.businessId,
  );
  return { ok: true, record: booking };
}

/** Acrescenta um serviço durante o atendimento, conservando a marcação original. */
export function addServiceDuringVisit(
  id: string,
  serviceId: string,
): OperationResult<Booking> {
  const booking = state.db.bookings.find((item) => item.id === id);
  const extra = service(serviceId);
  if (
    !booking ||
    !extra ||
    !["manager", "professional"].includes(state.role) ||
    booking.businessId !== state.businessId ||
    (state.role === "professional" && booking.staffId !== state.staffId) ||
    booking.status !== "in_progress" ||
    !extra.active ||
    extra.businessId !== booking.businessId
  )
    return {
      ok: false,
      error: "Serviço adicional indisponível para este atendimento.",
    };
  if (
    booking.serviceId === serviceId ||
    booking.extraServiceIds?.includes(serviceId)
  )
    return { ok: false, error: "Este serviço já está incluído." };
  const professional = staffMember(booking.staffId);
  if (professional && !professional.serviceIds.includes(serviceId))
    return { ok: false, error: "O profissional não realiza este serviço." };
  const end = minutes(booking.time) + booking.duration + extra.duration;
  if (
    end > minutes(business(booking.businessId)?.closes || "23:59") ||
    state.db.bookings.some(
      (other) =>
        other.id !== id &&
        other.date === booking.date &&
        other.staffId === booking.staffId &&
        !["cancelled", "no_show"].includes(other.status) &&
        minutes(other.time) < end &&
        minutes(other.time) + other.duration > minutes(booking.time),
    )
  )
    return {
      ok: false,
      error: "Não há tempo livre suficiente para acrescentar o serviço.",
    };
  booking.extraServiceIds = [...(booking.extraServiceIds || []), serviceId];
  booking.duration += extra.duration;
  booking.total += extra.price * booking.partySize;
  booking.subtotal =
    Number(
      booking.subtotal ?? booking.total - extra.price * booking.partySize,
    ) +
    extra.price * booking.partySize;
  booking.paymentStatus = "pending";
  addNotification(
    booking.clientId,
    "Serviço acrescentado",
    `${extra.name} foi adicionado ao atendimento. Novo total: ${money(booking.total)}.`,
  );
  audit(`Serviço adicional: ${extra.name}`, booking.businessId);
  return { ok: true, record: booking };
}

function canCancel(record: Booking): boolean {
  const hours = Number(business(record.businessId)?.cancelHours ?? 2);
  return (
    new Date(`${record.date}T${record.time}:00`).getTime() - Date.now() >=
    hours * 3600000
  );
}

export function cancelBooking(id: string): OperationResult<Booking> {
  const record = state.db.bookings.find((entry) => entry.id === id);
  if (!record) return { ok: false, error: "Marcação não encontrada." };
  if (!["confirmed", "in_progress"].includes(record.status))
    return { ok: false, error: "Esta marcação já não pode ser cancelada." };
  if (state.role === "client" && !canCancel(record))
    return {
      ok: false,
      error: `O cancelamento exige ${business(record.businessId)?.cancelHours ?? 2} horas de antecedência. Contacte o estabelecimento.`,
    };
  record.status = "cancelled";
  if (record.paymentStatus === "paid") record.paymentStatus = "refunded";
  addNotification(
    record.clientId,
    "Marcação cancelada",
    `${service(record.serviceId)?.name || "Serviço"} em ${dateLabel(record.date)}, às ${record.time}.${record.paymentStatus === "refunded" ? " Reembolso registado." : ""}`,
  );
  audit(`Marcação cancelada: ${record.clientName}`, record.businessId);
  return { ok: true, record };
}

/* A ligação partilhável de uma marcação. As marcações antigas não têm token:
   é criado na primeira vez que alguém a partilha. */
export function bookingShareToken(id: string): string {
  const record = state.db.bookings.find((entry) => entry.id === id);
  if (!record) return "";
  /* O observador profundo do estado trata de guardar. */
  if (!record.shareToken) record.shareToken = uid("lnk").replace("lnk_", "");
  return record.shareToken;
}

export function bookingByToken(token: string): Booking | undefined {
  if (!token) return undefined;
  return state.db.bookings.find((entry) => entry.shareToken === token);
}

export function markPaid(id: string): OperationResult<Booking> {
  const record = state.db.bookings.find((entry) => entry.id === id);
  if (!record) return { ok: false, error: "Marcação não encontrada." };
  if (record.status === "cancelled")
    return {
      ok: false,
      error: "Não é possível cobrar uma marcação cancelada.",
    };
  if (record.paymentStatus !== "paid") {
    record.paymentStatus = "paid";
    record.paidAt = new Date().toISOString();
    addNotification(
      record.clientId,
      "Pagamento registado",
      `${money(record.total)} · ${service(record.serviceId)?.name || "Serviço"}.`,
    );
    audit(`Pagamento registado: ${money(record.total)}`, record.businessId);
  }
  return { ok: true, record };
}

const encodeBytes = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...bytes));
const decodeBytes = (value: string) =>
  Uint8Array.from(atob(value), (char) => char.charCodeAt(0));

async function passwordDigest(password: string, salt: string): Promise<string> {
  const key = await globalThis.crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bytes = await globalThis.crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: decodeBytes(salt),
      iterations: 100000,
      hash: "SHA-256",
    },
    key,
    256,
  );
  return encodeBytes(new Uint8Array(bytes));
}

export async function setAccountPassword(
  id: string,
  password: string,
): Promise<OperationResult<User>> {
  const user = state.db.users.find((entry) => entry.id === id);
  if (!user) return { ok: false, error: "Conta não encontrada." };
  if (String(password || "").length < 8)
    return {
      ok: false,
      error: "A palavra-passe deve ter pelo menos 8 caracteres.",
    };
  if (!globalThis.crypto?.subtle)
    return {
      ok: false,
      error:
        "Abra a aplicação num endereço seguro para alterar a palavra-passe.",
    };
  const passwordSalt = encodeBytes(
    globalThis.crypto.getRandomValues(new Uint8Array(16)),
  );
  const passwordHash = await passwordDigest(password, passwordSalt);
  user.passwordSalt = passwordSalt;
  user.passwordHash = passwordHash;
  audit("Palavra-passe actualizada", user.businessId);
  return { ok: true, record: user };
}

function enterAccount(user: User): void {
  state.userId = user.id;
  state.role = user.role;
  if (user.businessId) state.businessId = user.businessId;
  if (user.staffId) state.staffId = user.staffId;
  go(landing[user.role] || "client");
}

export async function registerAccount({
  name,
  email,
  phone,
  password,
}: {
  name: string;
  email: string;
  phone?: string;
  password: string;
}): Promise<OperationResult<User>> {
  const cleanEmail = String(email || "")
    .trim()
    .toLowerCase();
  const cleanPhone = String(phone || "").trim();
  if (!String(name || "").trim())
    return { ok: false, error: "Preencha o nome." };
  if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail))
    return { ok: false, error: "Introduza um email válido ou deixe-o vazio." };
  if (!isUsablePhone(cleanPhone))
    return { ok: false, error: "Introduza um contacto válido." };
  if (String(password || "").length < 8)
    return {
      ok: false,
      error: "A palavra-passe deve ter pelo menos 8 caracteres.",
    };
  if (
    cleanEmail &&
    state.db.users.some((user) => user.email.toLowerCase() === cleanEmail)
  )
    return { ok: false, error: "Já existe uma conta com este email." };
  if (
    state.db.users.some(
      (user) => normalizePhone(user.phone) === normalizePhone(cleanPhone),
    )
  )
    return { ok: false, error: "Já existe uma conta com este contacto." };
  if (!globalThis.crypto?.subtle)
    return {
      ok: false,
      error: "Abra a aplicação num endereço seguro para criar a sua conta.",
    };
  const passwordSalt = encodeBytes(
    globalThis.crypto.getRandomValues(new Uint8Array(16)),
  );
  const passwordHash = await passwordDigest(password, passwordSalt);
  const record: User = {
    id: uid("u"),
    name: String(name).trim(),
    email: cleanEmail,
    phone: cleanPhone,
    role: "client",
    businessId: "",
    active: true,
    passwordSalt,
    passwordHash,
  };
  state.db.users.push(record);
  state.db.clients.push({
    id: record.id,
    name: record.name,
    email: record.email,
    phone: record.phone,
    businessId: state.selectedBusinessId,
  });
  enterAccount(record);
  audit("Conta criada", "");
  return { ok: true, record };
}

export async function loginAccount({
  identifier,
  password,
}: {
  identifier: string;
  password: string;
}): Promise<OperationResult<User>> {
  const cleanIdentifier = String(identifier || "")
    .trim()
    .toLowerCase();
  const contactIdentifier = isUsablePhone(cleanIdentifier)
    ? normalizePhone(cleanIdentifier)
    : "";
  const user = state.db.users.find(
    (entry) =>
      entry.email.toLowerCase() === cleanIdentifier ||
      (contactIdentifier && normalizePhone(entry.phone) === contactIdentifier),
  );
  if (
    !user?.active ||
    !user.passwordHash ||
    !user.passwordSalt ||
    !globalThis.crypto?.subtle
  )
    return {
      ok: false,
      error:
        "Contacto, email ou palavra-passe incorrectos. Para contas de exemplo, use os perfis de demonstração.",
    };
  const digest = await passwordDigest(
    String(password || ""),
    user.passwordSalt,
  );
  if (digest !== user.passwordHash)
    return {
      ok: false,
      error: "Contacto, email ou palavra-passe incorrectos.",
    };
  enterAccount(user);
  audit("Sessão iniciada", user.businessId);
  return { ok: true, record: user };
}

export function logout(): OperationResult<User> {
  state.role = "guest";
  state.userId = "";
  state.bookingDraft = null;
  go("explore");
  return { ok: true };
}

export function processDueReminders(now = Date.now()): number {
  if (state.db.settings.notifications === false) return 0;
  let count = 0;
  for (const booking of state.db.bookings) {
    const start = new Date(booking.date + "T" + booking.time + ":00").getTime();
    if (
      booking.status !== "confirmed" ||
      start <= now ||
      start - now > 24 * 60 * 60 * 1000
    )
      continue;
    const key =
      "reminder:" + booking.id + ":" + booking.date + ":" + booking.time;
    if (state.db.notifications.some((n) => n.reminderKey === key)) continue;
    state.db.notifications.unshift({
      id: uid("n"),
      userId: booking.clientId,
      title: "Lembrete da marcação",
      body:
        (service(booking.serviceId)?.name || "Serviço") +
        " em " +
        (business(booking.businessId)?.name || "Estabelecimento") +
        ", " +
        dateLabel(booking.date) +
        " às " +
        booking.time +
        ".",
      read: false,
      createdAt: new Date(now).toISOString(),
      reminderKey: key,
    });
    count++;
  }
  return count;
}

export function availableProfessionals(options: SlotQuery): StaffMember[] {
  const item = service(options.serviceId);
  if (!item?.active || item.businessId !== options.businessId) return [];
  return state.db.staff.filter(
    (person) =>
      person.active &&
      person.businessId === options.businessId &&
      person.serviceIds?.includes(item.id) &&
      availableSlots({ ...options, staffId: person.id }).length > 0,
  );
}
