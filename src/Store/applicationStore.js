import { money, dateLabel } from "../Utils/formatters.js";
export { money, dateLabel };
import { reactive, watch } from "vue";
import { makeSeed, shiftDate } from "../API/service/data/seed.js";

import {
  readApplicationSnapshot,
  writeApplicationSnapshot,
} from "../API/service/localStorageService.js";
const roles = ["guest", "client", "professional", "manager", "platform"];
const landing = {
  guest: "explore",
  client: "appointments",
  professional: "professional-agenda",
  manager: "overview",
  platform: "platform-overview",
};
const defaults = () => ({
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

function restore() {
  const initial = defaults();
  try {
    const saved = readApplicationSnapshot();
    if (!saved || saved.version !== 3 || !saved.db) return initial;
    for (const name of Object.keys(initial.db)) {
      if (Array.isArray(initial.db[name]) && Array.isArray(saved.db[name]))
        initial.db[name] = saved.db[name];
    }
    initial.db.settings = { ...initial.db.settings, ...saved.db.settings };
    if (roles.includes(saved.role)) initial.role = saved.role;
    for (const key of ["businessId", "selectedBusinessId", "staffId", "userId"])
      if (typeof saved[key] === "string") initial[key] = saved[key];
    initial.view = landing[initial.role];
  } catch {
    /* A stale or unavailable browser store must not stop the application. */
  }
  return initial;
}

export const state = reactive(restore());

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
        version: 3,
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

export const uid = (prefix = "id") =>
  `${prefix}_${globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 9)}`}`;
export const today = () => shiftDate();
export const business = (id = state.businessId) =>
  state.db.businesses.find((item) => item.id === id);
export const service = (id) => state.db.services.find((item) => item.id === id);
export const staffMember = (id) =>
  state.db.staff.find((item) => item.id === id);

export function go(view) {
  state.view = view;
  if (typeof window !== "undefined")
    window.scrollTo?.({ top: 0, behavior: "instant" });
}

export function switchRole(role) {
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

let toastTimer;
export function notify(message) {
  state.toast = message;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    state.toast = "";
  }, 4200);
  toastTimer.unref?.();
}

function audit(action, businessId = state.businessId) {
  state.db.logs.unshift({
    id: uid("log"),
    action,
    userId: state.userId,
    businessId,
    createdAt: new Date().toISOString(),
  });
  if (state.db.logs.length > 300) state.db.logs.splice(300);
}

function addNotification(userId, title, body) {
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

export function saveRecord(collection, record) {
  const list = state.db[collection];
  if (!Array.isArray(list)) throw new Error("Colecção desconhecida.");
  const clean = { ...record, id: record.id || uid(collection.slice(0, 3)) };
  delete clean.password;
  const index = list.findIndex((item) => item.id === clean.id);
  if (index === -1) list.push(clean);
  else list[index] = { ...list[index], ...clean };
  if (collection !== "logs" && collection !== "notifications")
    audit(
      `${index === -1 ? "Criado" : "Actualizado"}: ${clean.name || clean.code || clean.subject || collection}`,
      clean.businessId,
    );
  return list.find((item) => item.id === clean.id);
}

export function removeRecord(collection, id) {
  const list = state.db[collection];
  if (!Array.isArray(list))
    return { ok: false, error: "Colecção desconhecida." };
  const index = list.findIndex((item) => item.id === id);
  if (index < 0) return { ok: false, error: "Registo não encontrado." };
  const item = list[index];
  const referenceKey = {
    businesses: "businessId",
    services: "serviceId",
    staff: "staffId",
    resources: "resourceId",
    clients: "clientId",
  }[collection];
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
    item.active = false;
    audit(`Desactivado: ${item.name || collection}`, item.businessId);
    return { ok: true, record: item, archived: true };
  }
  list.splice(index, 1);
  audit(
    `Eliminado: ${item.name || item.code || item.subject || collection}`,
    item.businessId,
  );
  return { ok: true, record: item };
}

const minutes = (time) => {
  if (!/^\d{2}:\d{2}$/.test(time || "")) return NaN;
  const [hours, mins] = time.split(":").map(Number);
  return hours >= 0 && hours < 24 && mins >= 0 && mins < 60
    ? hours * 60 + mins
    : NaN;
};
const timeLabel = (value) =>
  `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
const overlaps = (start, end, otherStart, otherEnd) =>
  start < otherEnd && end > otherStart;
const occupies = (booking) =>
  !["cancelled", "no_show"].includes(booking.status);
const dateValid = (date) =>
  /^\d{4}-\d{2}-\d{2}$/.test(date || "") &&
  !Number.isNaN(new Date(`${date}T12:00:00`).getTime()) &&
  new Date(`${date}T12:00:00`).getDate() === Number(date.slice(-2));

function slotContext(options) {
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
  const weekday = new Date(`${date}T12:00:00`).getDay();
  if (!(venue.days || [0, 1, 2, 3, 4, 5, 6]).includes(weekday)) return null;
  const staffId =
    options.staffId && options.staffId !== "any" ? options.staffId : "";
  let candidates = state.db.staff.filter(
    (person) =>
      person.businessId === businessId &&
      person.active &&
      person.serviceIds?.includes(serviceId) &&
      (!staffId || person.id === staffId) &&
      (person.days || venue.days).includes(weekday),
  );
  if (item.resourceType === "table" && !staffId) candidates = [null];
  if (!candidates.length) return null;
  let resources = [null];
  if (item.resourceType || resourceId) {
    resources = state.db.resources.filter(
      (resource) =>
        resource.businessId === businessId &&
        resource.active &&
        (!item.resourceType || resource.type === item.resourceType) &&
        (!resourceId || resource.id === resourceId) &&
        Number(resource.capacity || 1) >= partySize,
    );
    resources.sort((a, b) => Number(a.capacity) - Number(b.capacity));
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

function assignSlot(context, start) {
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

export function availableSlots(options) {
  const context = slotContext(options);
  if (!context) return [];
  const step = Math.max(
    5,
    Math.min(120, Number(state.db.settings.slotMinutes) || 30),
  );
  const slots = [];
  for (
    let start = minutes(context.venue.opens);
    start + Number(context.item.duration) <= minutes(context.venue.closes);
    start += step
  ) {
    if (assignSlot(context, start)) slots.push(timeLabel(start));
  }
  return slots;
}

export function bookingTotal({ serviceId, coupon = "", partySize = 1 }) {
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

function prepareBooking(draft, excludeBookingId = "") {
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
    },
  };
}

export function createBooking(draft) {
  const result = prepareBooking(draft);
  if (!result.ok) return result;
  const record = {
    ...result.record,
    id: uid("a"),
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
    `${service(record.serviceId).name} em ${business(record.businessId).name}, ${dateLabel(record.date)} às ${record.time}.`,
  );
  const manager = state.db.users.find(
    (entry) =>
      entry.role === "manager" && entry.businessId === record.businessId,
  );
  if (manager)
    addNotification(
      manager.id,
      "Nova marcação",
      `${record.clientName}: ${service(record.serviceId).name}, ${dateLabel(record.date)} às ${record.time}.`,
    );
  audit(`Marcação criada: ${record.clientName}`, record.businessId);
  return {
    ok: true,
    record: state.db.bookings.find((entry) => entry.id === record.id),
  };
}

export function updateBooking(id, patch) {
  const existing = state.db.bookings.find((entry) => entry.id === id);
  if (!existing) return { ok: false, error: "Marcação não encontrada." };
  if (patch.status === "cancelled") return cancelBooking(id);
  if (
    patch.status &&
    !["confirmed", "in_progress", "completed", "no_show"].includes(patch.status)
  )
    return { ok: false, error: "Estado inválido." };
  if (patch.status) {
    const transitions = {
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
  const scheduling = [
    "date",
    "time",
    "serviceId",
    "staffId",
    "resourceId",
    "partySize",
    "coupon",
    "businessId",
  ].some((key) => key in patch && patch[key] !== existing[key]);
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
      `${service(existing.serviceId).name}: ${dateLabel(existing.date)} às ${existing.time}.`,
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
  if (
    "paymentStatus" in patch &&
    ["pending", "paid", "refunded"].includes(patch.paymentStatus)
  )
    existing.paymentStatus = patch.paymentStatus;
  if ("clientName" in patch && String(patch.clientName).trim())
    existing.clientName = String(patch.clientName).trim();
  audit(`Marcação actualizada: ${existing.clientName}`, existing.businessId);
  return { ok: true, record: existing };
}

function canCancel(record) {
  const hours = Number(business(record.businessId)?.cancelHours ?? 2);
  return (
    new Date(`${record.date}T${record.time}:00`).getTime() - Date.now() >=
    hours * 3600000
  );
}

export function cancelBooking(id) {
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

export function markPaid(id) {
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

const encodeBytes = (bytes) => btoa(String.fromCharCode(...bytes));
const decodeBytes = (value) =>
  Uint8Array.from(atob(value), (char) => char.charCodeAt(0));

async function passwordDigest(password, salt) {
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

export async function setAccountPassword(id, password) {
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

function enterAccount(user) {
  state.userId = user.id;
  state.role = user.role;
  if (user.businessId) state.businessId = user.businessId;
  if (user.staffId) state.staffId = user.staffId;
  go(landing[user.role] || "client");
}

export async function registerAccount({ name, email, phone, password }) {
  const cleanEmail = String(email || "")
    .trim()
    .toLowerCase();
  if (
    !String(name || "").trim() ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
  )
    return { ok: false, error: "Preencha o nome e um email válido." };
  if (String(password || "").length < 8)
    return {
      ok: false,
      error: "A palavra-passe deve ter pelo menos 8 caracteres.",
    };
  if (state.db.users.some((user) => user.email.toLowerCase() === cleanEmail))
    return { ok: false, error: "Já existe uma conta com este email." };
  if (!globalThis.crypto?.subtle)
    return {
      ok: false,
      error: "Abra a aplicação num endereço seguro para criar a sua conta.",
    };
  const passwordSalt = encodeBytes(
    globalThis.crypto.getRandomValues(new Uint8Array(16)),
  );
  const passwordHash = await passwordDigest(password, passwordSalt);
  const record = {
    id: uid("u"),
    name: String(name).trim(),
    email: cleanEmail,
    phone: String(phone || "").trim(),
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

export async function loginAccount({ email, password }) {
  const user = state.db.users.find(
    (entry) =>
      entry.email.toLowerCase() ===
      String(email || "")
        .trim()
        .toLowerCase(),
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
        "Email ou palavra-passe incorrectos. Para contas de exemplo, use os perfis de demonstração.",
    };
  const digest = await passwordDigest(
    String(password || ""),
    user.passwordSalt,
  );
  if (digest !== user.passwordHash)
    return { ok: false, error: "Email ou palavra-passe incorrectos." };
  enterAccount(user);
  audit("Sessão iniciada", user.businessId);
  return { ok: true, record: user };
}

export function logout() {
  state.role = "guest";
  state.userId = "";
  state.bookingDraft = null;
  go("explore");
  return { ok: true };
}

export function processDueReminders(now = Date.now()) {
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

export function availableProfessionals(options) {
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
