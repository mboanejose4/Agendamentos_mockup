import { test } from "vitest";
import assert from "node:assert/strict";
import type { Booking } from "@/types/domain.ts";
import {
  activeBookingValue,
  bookingComparison,
  paidBookingValue,
  shiftDashboardDate,
} from "@/utils/dashboardAnalytics.ts";

const booking = (
  date: string,
  status: Booking["status"] = "confirmed",
  paymentStatus: Booking["paymentStatus"] = "pending",
  total = 100,
): Booking => ({ date, status, paymentStatus, total }) as Booking;

test("compares equivalent seven-day periods across month boundaries", () => {
  const records = [
    booking("2026-08-24"),
    booking("2026-08-31"),
    booking("2026-09-01"),
    booking("2026-09-02"),
    booking("2026-09-07", "cancelled"),
  ];
  const result = bookingComparison(
    records,
    "2026-09-07",
    7,
    7,
    activeBookingValue,
  );
  assert.deepEqual(result.current, [1, 1, 0, 0, 0, 0, 0]);
  assert.deepEqual(result.previous, [0, 0, 0, 0, 0, 0, 1]);
  assert.equal(result.currentTotal, 2);
  assert.equal(result.previousTotal, 1);
  assert.equal(shiftDashboardDate("2026-12-31", 1), "2027-01-01");
});

test("compares four complete weeks and totals paid amounts by booking date", () => {
  const records = [
    booking("2026-08-10", "completed", "paid", 200),
    booking("2026-08-31", "completed", "paid", 300),
    booking("2026-09-07", "completed", "paid", 100),
    booking("2026-09-07", "completed", "pending", 500),
  ];
  const result = bookingComparison(
    records,
    "2026-09-07",
    28,
    4,
    paidBookingValue,
  );
  assert.deepEqual(result.current, [0, 0, 300, 100]);
  assert.deepEqual(result.previous, [0, 0, 0, 200]);
  assert.equal(result.currentTotal, 400);
  assert.equal(result.previousTotal, 200);
});
