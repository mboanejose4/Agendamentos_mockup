import { test } from "vitest";
import assert from "node:assert/strict";
import type { Booking, StaffMember } from "@/types/domain.ts";
import {
  customerPeriod,
  performanceWindow,
  rankCustomers,
  teamPeriod,
} from "@/utils/performanceAnalytics.ts";

const booking = (
  id: string,
  date: string,
  clientId: string,
  staffId: string,
  status: Booking["status"] = "confirmed",
  paymentStatus: Booking["paymentStatus"] = "pending",
): Booking =>
  ({
    id,
    date,
    clientId,
    clientName: clientId,
    staffId,
    status,
    paymentStatus,
    total: 200,
  }) as Booking;

test("customer comparison distinguishes new clients, returns and completed visits", () => {
  const rows = [
    booking("old", "2026-08-01", "c1", "p1", "completed"),
    booking("return", "2026-09-01", "c1", "p1", "completed", "paid"),
    booking("cancelled", "2026-09-02", "c2", "p1", "cancelled"),
    booking("new", "2026-09-03", "c3", "p2"),
    booking("visit", "2026-09-04", "c3", "p2", "completed"),
  ];
  const result = customerPeriod(rows, "2026-09-01", "2026-09-07");
  assert.equal(result.customers, 2);
  assert.equal(result.newCustomers, 1);
  assert.equal(result.returningCustomers, 1);
  assert.equal(result.visits, 2);
  assert.deepEqual(
    result.rows.map((row) => [row.key, row.appointments, row.visits]),
    [
      ["c1", 1, 1],
      ["c3", 2, 1],
    ],
  );
});

test("team comparison keeps each professional's current and prior activity separate", () => {
  const window = performanceWindow("2026-09-07", 7);
  assert.deepEqual(window, {
    start: "2026-09-01",
    end: "2026-09-07",
    previousStart: "2026-08-25",
    previousEnd: "2026-08-31",
  });
  const staff = [
    { id: "p1", name: "Ana" },
    { id: "p2", name: "Bia" },
  ] as StaffMember[];
  const rows = teamPeriod(
    [
      booking("previous", "2026-08-31", "c1", "p1", "completed"),
      booking("current", "2026-09-01", "c1", "p1", "completed", "paid"),
      booking("absent", "2026-09-02", "c2", "p1", "no_show"),
      booking("other", "2026-09-03", "c3", "p2"),
    ],
    staff,
    window,
  );
  assert.deepEqual(
    rows.map((row) => [
      row.appointments,
      row.previousAppointments,
      row.visits,
      row.previousVisits,
      row.noShows,
      row.paid,
    ]),
    [
      [2, 1, 1, 1, 1, 200],
      [1, 0, 0, 0, 0, 0],
    ],
  );
});

test("customer ranking changes order between visits and bookings", () => {
  const rows = [
    {
      key: "a",
      name: "Ana",
      visits: 2,
      appointments: 2,
      noShows: 0,
      paid: 0,
      lastDate: "2026-09-01",
    },
    {
      key: "b",
      name: "Bia",
      visits: 1,
      appointments: 4,
      noShows: 0,
      paid: 0,
      lastDate: "2026-09-01",
    },
    {
      key: "c",
      name: "Célia",
      visits: 0,
      appointments: 0,
      noShows: 0,
      paid: 0,
      lastDate: "2026-09-01",
    },
  ];
  assert.deepEqual(
    rankCustomers(rows, "visits").map((row) => row.key),
    ["a", "b"],
  );
  assert.deepEqual(
    rankCustomers(rows, "appointments").map((row) => row.key),
    ["b", "a"],
  );
});
