import { beforeEach, test } from "vitest";
import assert from "node:assert/strict";
import { makeSeed, shiftDate } from "@/services/seed.ts";
import type {
  Booking,
  BookingInput,
  OperationResult,
  SlotQuery,
} from "@/types/domain.ts";

const storage = new Map<string, string>();
globalThis.localStorage = {
  getItem: (key: string) => storage.get(key) || null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => storage.delete(key),
} as unknown as Storage;
const {
  processDueReminders,
  state,
  availableSlots,
  createBooking,
  updateBooking,
  cancelBooking,
  markPaid,
  bookingTotal,
  registerAccount,
  loginAccount,
  logout,
  removeRecord,
  setAccountPassword,
} = await import("@/stores/applicationStore.ts");

beforeEach(() => {
  state.db = makeSeed();
  state.db.bookings = [];
  state.db.blocks = [];
  state.role = "client";
  state.userId = "u1";
  state.businessId = "b1";
  state.selectedBusinessId = "b1";
});

/* Devolve o registo de uma operação bem sucedida, falhando o teste se não o for. */
function recordOf<T>(result: OperationResult<T>): T {
  assert.equal(result.ok, true, "operação falhou");
  const record = (result as { record?: T }).record;
  if (record === undefined) throw new Error("operação sem registo");
  return record;
}

type TestDraft = BookingInput & SlotQuery;

const draft = (patch: Partial<TestDraft> = {}): TestDraft => ({
  staffId: "p1",
  clientId: "u1",
  paymentMethod: "onsite",
  ...patch,
  businessId: patch.businessId ?? "b1",
  serviceId: patch.serviceId ?? "s1",
  date: patch.date ?? shiftDate(2),
  time: patch.time ?? "10:00",
});

test("availability respects full duration, staff eligibility, blocks and occupied intervals", () => {
  state.db.blocks.push({
    id: "block-test",
    businessId: "b1",
    staffId: "p1",
    date: shiftDate(2),
    start: "12:00",
    end: "13:00",
    reason: "Teste",
  });
  assert.equal(createBooking(draft()).ok, true);
  const slots = availableSlots(draft());
  assert.equal(slots.includes("09:30"), false);
  assert.equal(slots.includes("10:00"), false);
  assert.equal(slots.includes("10:30"), false);
  assert.equal(slots.includes("11:00"), true);
  assert.equal(slots.includes("11:30"), false);
  assert.equal(slots.includes("12:30"), false);
  assert.equal(slots.includes("13:00"), true);
  assert.equal(slots.includes("18:30"), false);
  assert.deepEqual(availableSlots(draft({ staffId: "p2" })), []);
  assert.deepEqual(availableSlots(draft({ date: shiftDate(-1) })), []);
  assert.deepEqual(availableSlots(draft({ date: "2026-02-31" })), []);
});

test("overlapping bookings fail without partial writes and rescheduling excludes the current appointment", () => {
  const first = recordOf(createBooking(draft()));
  assert.equal(createBooking(draft({ time: "10:30" })).ok, false);
  assert.equal(state.db.bookings.length, 1);
  assert.equal(updateBooking(first.id, { time: "10:30" }).ok, true);
  assert.equal(state.db.bookings.length, 1);
  assert.equal(first.time, "10:30");
  assert.equal(createBooking(draft({ time: "12:00" })).ok, true);
  assert.equal(updateBooking(first.id, { time: "11:30" }).ok, false);
  assert.equal(first.time, "10:30");
});

test("restaurant reservations assign tables by capacity and allow independent concurrent tables", () => {
  const tableDraft = draft({
    businessId: "b4",
    serviceId: "s10",
    staffId: "",
    time: "13:00",
    partySize: 4,
  });
  const first = recordOf(createBooking(tableDraft));
  assert.equal(first.resourceId, "r7");
  assert.equal(first.staffId, "");
  const second = recordOf(createBooking(tableDraft));
  assert.equal(second.resourceId, "r8");
  assert.equal(createBooking({ ...tableDraft, resourceId: "r6" }).ok, false);
  assert.equal(createBooking({ ...tableDraft, resourceId: "r7" }).ok, false);
  assert.equal(createBooking({ ...tableDraft, partySize: 13 }).ok, false);
  assert.equal(bookingTotal({ serviceId: "s11", partySize: 4 }).total, 11200);
});

test("discounts persist in totals, reject expired or cross-business coupons, and online payments start pending", () => {
  const booking = recordOf(
    createBooking(draft({ coupon: " bemvindo10 ", paymentMethod: "online" })),
  );
  assert.equal(booking.total, 1080);
  assert.equal(booking.subtotal, 1200);
  assert.equal(booking.discount, 120);
  assert.equal(booking.paymentStatus, "pending");
  assert.ok(bookingTotal({ serviceId: "s5", coupon: "BEMVINDO10" }).error);
  state.db.promotions[0].expires = shiftDate(-1);
  assert.ok(bookingTotal({ serviceId: "s1", coupon: "BEMVINDO10" }).error);
  assert.equal(markPaid(booking.id).ok, true);
  assert.equal(booking.paymentStatus, "paid");
  const stored = JSON.parse(storage.get("marcafacil.agendamento.v4") || "{}");
  assert.equal(stored.db.bookings[0].total, 1080);
  assert.equal(stored.db.bookings[0].paymentStatus, "paid");
});

test("cancellation enforces client notice and records refunds while reopening availability", () => {
  const booking = recordOf(
    createBooking(draft({ paymentMethod: "online", paymentStatus: "paid" })),
  );
  state.db.businesses[0].cancelHours = 999;
  assert.equal(cancelBooking(booking.id).ok, false);
  assert.equal(booking.status, "confirmed");
  state.role = "manager";
  assert.equal(cancelBooking(booking.id).ok, true);
  assert.equal(booking.status, "cancelled");
  assert.equal(booking.paymentStatus, "refunded");
  assert.equal(availableSlots(draft()).includes("10:00"), true);
  assert.equal(markPaid(booking.id).ok, false);
  assert.equal(updateBooking(booking.id, { status: "confirmed" }).ok, false);
});

test("deactivating a service preserves the appointment history and prevents new bookings", () => {
  assert.equal(createBooking(draft()).ok, true);
  const result = removeRecord("services", "s1");
  assert.equal(result.ok, true);
  assert.equal((result as { archived?: boolean }).archived, true);
  assert.equal(
    state.db.services.find((entry) => entry.id === "s1")?.active,
    false,
  );
  assert.equal(state.db.bookings.length, 1);
  assert.deepEqual(availableSlots(draft({ time: "14:00" })), []);
});

test("accounts can register and sign in with a salted hash, without storing plaintext passwords", async () => {
  const password = "strong-secret-123";
  const result = await registerAccount({
    name: "Cliente Teste",
    email: "TEST@example.com",
    phone: "+258 840000001",
    password,
  });
  const account = recordOf(result);
  assert.equal(account.email, "test@example.com");
  assert.equal(state.role, "client");
  assert.equal(state.view, "appointments");
  assert.equal(JSON.stringify(account).includes(password), false);
  assert.equal(
    (storage.get("marcafacil.agendamento.v3") || "").includes(password),
    false,
  );
  assert.equal(
    (
      await registerAccount({
        name: "Repetido",
        email: "test@example.com",
        password,
      })
    ).ok,
    false,
  );
  logout();
  assert.equal(state.role, "guest");
  assert.equal(
    (
      await loginAccount({
        email: "test@example.com",
        password: "wrong-password",
      })
    ).ok,
    false,
  );
  assert.equal(
    (await loginAccount({ email: "test@example.com", password })).ok,
    true,
  );
  assert.equal(state.userId, account.id);
  assert.equal(
    (await setAccountPassword(account.id, "new-strong-secret")).ok,
    true,
  );
  assert.equal(
    (await loginAccount({ email: "test@example.com", password })).ok,
    false,
  );
  assert.equal(
    (
      await loginAccount({
        email: "test@example.com",
        password: "new-strong-secret",
      })
    ).ok,
    true,
  );
});

test("reminders are generated once per upcoming booking time and respect notification settings", () => {
  const now = new Date(2026, 8, 14, 10).getTime();
  state.db.notifications = [];
  state.db.bookings = [
    {
      id: "reminder-test",
      clientId: "u1",
      clientName: "José Mboane",
      businessId: "b1",
      serviceId: "s1",
      staffId: "p1",
      resourceId: "",
      date: "2026-09-14",
      time: "12:00",
      duration: 60,
      total: 1200,
      discount: 0,
      paymentMethod: "onsite",
      paymentStatus: "pending",
      status: "confirmed",
      partySize: 1,
      notes: "",
      createdAt: new Date().toISOString(),
    },
  ];
  assert.equal(processDueReminders(now), 1);
  assert.equal(processDueReminders(now), 0);
  assert.equal(state.db.notifications[0].userId, "u1");
  state.db.bookings[0].time = "13:00";
  assert.equal(processDueReminders(now), 1);
  state.db.settings.notifications = false;
  state.db.bookings[0].time = "14:00";
  assert.equal(processDueReminders(now), 0);
  state.db.settings.notifications = true;
  state.db.bookings[0].status = "cancelled";
  assert.equal(processDueReminders(now), 0);
});

test("manager cannot change client profiles and status changes are company scoped", async () => {
  const { saveRecord, setBusinessClientStatus, businessClientStatus } =
    await import("@/stores/applicationStore.ts");
  const booking = createBooking(draft());
  assert.equal(booking.ok, true);
  const created = recordOf(booking);
  const client = state.db.clients.find((item) => item.id === created.clientId);
  if (!client) throw new Error("cliente da reserva não encontrado");
  assert.ok(client, "cliente da marcação em falta");
  const original = JSON.parse(JSON.stringify(client));
  state.role = "manager";
  assert.equal(
    saveRecord("clients", { ...client, name: "Alterado" }).ok,
    false,
  );
  assert.equal(saveRecord("clients", { name: "Novo cliente" }).ok, false);
  assert.deepEqual(JSON.parse(JSON.stringify(client)), original);
  assert.equal(setBusinessClientStatus(client.id, "inactive").ok, true);
  assert.equal(businessClientStatus(client.id, "b1"), "inactive");
  assert.equal(businessClientStatus(client.id, "b2"), "active");
  assert.equal(createBooking(draft({ time: "12:00" })).ok, false);
  assert.equal(removeRecord("clients", client.id).ok, true);
  assert.equal(businessClientStatus(client.id, "b1"), "removed");
  assert.deepEqual(JSON.parse(JSON.stringify(client)), original);
  assert.equal(state.db.bookings.length, 1);
  assert.equal(state.db.bookings[0].id, created.id);
});

test("manager cannot deactivate clients belonging only to another company", async () => {
  const { setBusinessClientStatus } =
    await import("@/stores/applicationStore.ts");
  state.db.clients.push({
    id: "other-company-client",
    businessId: "b2",
    name: "Outro cliente",
    email: "outro@example.com",
    phone: "",
  });
  state.role = "manager";
  assert.equal(
    setBusinessClientStatus("other-company-client", "inactive").ok,
    false,
  );
  assert.equal(removeRecord("clients", "other-company-client").ok, false);
  assert.equal(
    state.db.clients.some((item) => item.id === "other-company-client"),
    true,
  );
});

test("a empresa aplica a penalização por falta uma vez, dentro do limite de 10%", async () => {
  const { saveRecord, applyNoShowPenalty } =
    await import("@/stores/applicationStore.ts");
  const booking = recordOf(createBooking(draft()));
  state.role = "manager";
  assert.equal(
    saveRecord("businesses", {
      ...state.db.businesses[0],
      noShowPenaltyPercent: 11,
    }).ok,
    false,
  );
  assert.equal(
    saveRecord("businesses", {
      ...state.db.businesses[0],
      noShowPenaltyPercent: 10,
    }).ok,
    undefined,
  );
  assert.equal(applyNoShowPenalty(booking.id).ok, false);
  assert.equal(updateBooking(booking.id, { status: "no_show" }).ok, true);
  assert.equal(applyNoShowPenalty(booking.id).ok, true);
  assert.equal(booking.noShowPenalty, 120);
  assert.equal(applyNoShowPenalty(booking.id).ok, false);
});

test("o cliente pede atraso e a empresa responde sem alterar a hora original", async () => {
  const { requestBookingDelay, respondBookingDelay } =
    await import("@/stores/applicationStore.ts");
  const booking = recordOf(createBooking(draft()));
  state.db.notifications = [];
  assert.equal(requestBookingDelay(booking.id, 12).ok, false);
  assert.equal(requestBookingDelay(booking.id, 15).ok, true);
  assert.equal(booking.delayStatus, "requested");
  assert.deepEqual(state.db.notifications.map((item) => item.userId).sort(), [
    "u2",
    "u3",
  ]);
  assert.equal(
    state.db.notifications.every(
      (item) => item.title === "Pedido de atraso" && !item.read,
    ),
    true,
  );
  state.role = "professional";
  state.userId = "u2";
  state.staffId = "p1";
  assert.equal(respondBookingDelay(booking.id, true).ok, true);
  assert.equal(booking.delayStatus, "accepted");
  assert.equal(booking.time, "10:00");
  assert.equal(state.db.notifications[0].userId, "u1");
  assert.equal(state.db.notifications[0].title, "Atraso aceite");
  state.role = "client";
  state.userId = "u1";
  assert.equal(requestBookingDelay(booking.id, 20).ok, true);
  state.role = "manager";
  state.userId = "u3";
  assert.equal(respondBookingDelay(booking.id, false).ok, true);
  assert.equal(state.db.notifications[0].userId, "u1");
  assert.equal(state.db.notifications[0].title, "Atraso recusado");
});

test("serviço adicional só entra durante atendimento e respeita a agenda", async () => {
  const { addServiceDuringVisit } =
    await import("@/stores/applicationStore.ts");
  const booking = recordOf(createBooking(draft()));
  state.role = "manager";
  assert.equal(addServiceDuringVisit(booking.id, "s3").ok, false);
  assert.equal(updateBooking(booking.id, { status: "in_progress" }).ok, true);
  assert.equal(addServiceDuringVisit(booking.id, "s2").ok, false);
  assert.equal(addServiceDuringVisit(booking.id, "s3").ok, true);
  assert.deepEqual(booking.extraServiceIds, ["s3"]);
  assert.equal(booking.duration, 180);
  assert.equal(booking.total, 4700);
  assert.equal(addServiceDuringVisit(booking.id, "s3").ok, false);
});

test("pacotes de acesso directo exigem códigos únicos", async () => {
  const { saveRecord } = await import("@/stores/applicationStore.ts");
  state.role = "manager";
  const company = state.db.businesses[0];
  assert.equal(
    saveRecord("businesses", { ...company, package: 1, code: "" }).ok,
    false,
  );
  assert.notEqual(
    saveRecord("businesses", { ...company, package: 1, code: "LUME" }).ok,
    false,
  );
  assert.equal(state.db.businesses[0].code, "LUME");
  assert.equal(
    saveRecord("businesses", {
      ...state.db.businesses[1],
      package: 2,
      code: "lume",
    }).ok,
    false,
  );
});
