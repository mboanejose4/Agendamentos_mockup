import { beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import { makeSeed, shiftDate } from "../../src/API/service/data/seed.js";

const storage = new Map();
globalThis.localStorage = {
  getItem: (key) => storage.get(key) || null,
  setItem: (key, value) => storage.set(key, value),
  removeItem: (key) => storage.delete(key),
};
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
} = await import("../../src/Store/applicationStore.js");

beforeEach(() => {
  state.db = makeSeed();
  state.db.bookings = [];
  state.db.blocks = [];
  state.role = "client";
  state.userId = "u1";
  state.businessId = "b1";
  state.selectedBusinessId = "b1";
});

const draft = (patch = {}) => ({
  businessId: "b1",
  serviceId: "s1",
  staffId: "p1",
  date: shiftDate(2),
  time: "10:00",
  clientId: "u1",
  paymentMethod: "onsite",
  ...patch,
});

test("availability respects full duration, staff eligibility, blocks and occupied intervals", () => {
  state.db.blocks.push({
    id: "block-test",
    businessId: "b1",
    staffId: "p1",
    date: shiftDate(2),
    start: "12:00",
    end: "13:00",
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
  const first = createBooking(draft());
  assert.equal(first.ok, true);
  assert.equal(createBooking(draft({ time: "10:30" })).ok, false);
  assert.equal(state.db.bookings.length, 1);
  assert.equal(updateBooking(first.record.id, { time: "10:30" }).ok, true);
  assert.equal(state.db.bookings.length, 1);
  assert.equal(first.record.time, "10:30");
  const second = createBooking(draft({ time: "12:00" }));
  assert.equal(second.ok, true);
  assert.equal(updateBooking(first.record.id, { time: "11:30" }).ok, false);
  assert.equal(first.record.time, "10:30");
});

test("restaurant reservations assign tables by capacity and allow independent concurrent tables", () => {
  const tableDraft = draft({
    businessId: "b4",
    serviceId: "s10",
    staffId: "",
    time: "13:00",
    partySize: 4,
  });
  const first = createBooking(tableDraft);
  assert.equal(first.ok, true);
  assert.equal(first.record.resourceId, "r7");
  assert.equal(first.record.staffId, "");
  const second = createBooking(tableDraft);
  assert.equal(second.ok, true);
  assert.equal(second.record.resourceId, "r8");
  assert.equal(createBooking({ ...tableDraft, resourceId: "r6" }).ok, false);
  assert.equal(createBooking({ ...tableDraft, resourceId: "r7" }).ok, false);
  assert.equal(createBooking({ ...tableDraft, partySize: 13 }).ok, false);
  assert.equal(bookingTotal({ serviceId: "s11", partySize: 4 }).total, 11200);
});

test("discounts persist in totals, reject expired or cross-business coupons, and online payments start pending", () => {
  const result = createBooking(
    draft({ coupon: " bemvindo10 ", paymentMethod: "online" }),
  );
  assert.equal(result.ok, true);
  assert.equal(result.record.total, 1080);
  assert.equal(result.record.subtotal, 1200);
  assert.equal(result.record.discount, 120);
  assert.equal(result.record.paymentStatus, "pending");
  assert.ok(bookingTotal({ serviceId: "s5", coupon: "BEMVINDO10" }).error);
  state.db.promotions[0].expires = shiftDate(-1);
  assert.ok(bookingTotal({ serviceId: "s1", coupon: "BEMVINDO10" }).error);
  assert.equal(markPaid(result.record.id).ok, true);
  assert.equal(result.record.paymentStatus, "paid");
  const stored = JSON.parse(storage.get("marcafacil.agendamento.v3"));
  assert.equal(stored.db.bookings[0].total, 1080);
  assert.equal(stored.db.bookings[0].paymentStatus, "paid");
});

test("cancellation enforces client notice and records refunds while reopening availability", () => {
  const result = createBooking(
    draft({ paymentMethod: "online", paymentStatus: "paid" }),
  );
  state.db.businesses[0].cancelHours = 999;
  assert.equal(cancelBooking(result.record.id).ok, false);
  assert.equal(result.record.status, "confirmed");
  state.role = "manager";
  assert.equal(cancelBooking(result.record.id).ok, true);
  assert.equal(result.record.status, "cancelled");
  assert.equal(result.record.paymentStatus, "refunded");
  assert.equal(availableSlots(draft()).includes("10:00"), true);
  assert.equal(markPaid(result.record.id).ok, false);
  assert.equal(
    updateBooking(result.record.id, { status: "confirmed" }).ok,
    false,
  );
});

test("deactivating a service preserves the appointment history and prevents new bookings", () => {
  assert.equal(createBooking(draft()).ok, true);
  const result = removeRecord("services", "s1");
  assert.equal(result.ok, true);
  assert.equal(result.archived, true);
  assert.equal(
    state.db.services.find((entry) => entry.id === "s1").active,
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
  assert.equal(result.ok, true);
  assert.equal(result.record.email, "test@example.com");
  assert.equal(state.role, "client");
  assert.equal(state.view, "appointments");
  assert.equal(JSON.stringify(result.record).includes(password), false);
  assert.equal(
    storage.get("marcafacil.agendamento.v3").includes(password),
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
  assert.equal(state.userId, result.record.id);
  assert.equal(
    (await setAccountPassword(result.record.id, "new-strong-secret")).ok,
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
      businessId: "b1",
      serviceId: "s1",
      date: "2026-09-14",
      time: "12:00",
      status: "confirmed",
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
