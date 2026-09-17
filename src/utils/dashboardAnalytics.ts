import type { Booking } from "@/types/domain.ts";

/** Datas locais ao meio-dia evitam mudanças de dia em fusos horários diferentes. */
export function shiftDashboardDate(iso: string, offset: number): string {
  const date = new Date(`${iso}T12:00:00`);
  date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export interface ComparisonSeries {
  labels: string[];
  current: number[];
  previous: number[];
  currentTotal: number;
  previousTotal: number;
}

/** Cada ponto compara períodos equivalentes pelo dia marcado, sem inventar histórico. */
export function bookingComparison(
  bookings: readonly Booking[],
  endDate: string,
  days: number,
  buckets: number,
  value: (booking: Booking) => number,
): ComparisonSeries {
  const perBucket = Math.max(1, Math.floor(days / buckets));
  const labels: string[] = [];
  const current: number[] = [];
  const previous: number[] = [];
  for (let index = 0; index < buckets; index++) {
    const start = shiftDashboardDate(endDate, -days + index * perBucket + 1);
    const end = shiftDashboardDate(start, perBucket - 1);
    const previousStart = shiftDashboardDate(start, -days);
    const previousEnd = shiftDashboardDate(end, -days);
    const total = (from: string, to: string) =>
      bookings.reduce(
        (sum, booking) =>
          sum +
          (booking.date >= from && booking.date <= to ? value(booking) : 0),
        0,
      );
    current.push(total(start, end));
    previous.push(total(previousStart, previousEnd));
    labels.push(
      perBucket === 1
        ? new Date(`${start}T12:00:00`)
            .toLocaleDateString("pt-MZ", { weekday: "short" })
            .replace(".", "")
            .slice(0, 3)
        : new Date(`${start}T12:00:00`).toLocaleDateString("pt-MZ", {
            day: "2-digit",
            month: "2-digit",
          }),
    );
  }
  return {
    labels,
    current,
    previous,
    currentTotal: current.reduce((sum, amount) => sum + amount, 0),
    previousTotal: previous.reduce((sum, amount) => sum + amount, 0),
  };
}

export const activeBookingValue = (booking: Booking): number =>
  booking.status === "cancelled" ? 0 : 1;

export const completedBookingValue = (booking: Booking): number =>
  booking.status === "completed" ? 1 : 0;

export const paidBookingValue = (booking: Booking): number =>
  booking.paymentStatus === "paid" ? Number(booking.total) || 0 : 0;
