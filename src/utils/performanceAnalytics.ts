import type { Booking, StaffMember } from "@/types/domain.ts";
import { shiftDashboardDate } from "@/utils/dashboardAnalytics.ts";

export interface PerformanceWindow {
  start: string;
  end: string;
  previousStart: string;
  previousEnd: string;
}

export function performanceWindow(
  end: string,
  days: number,
): PerformanceWindow {
  const start = shiftDashboardDate(end, -days + 1);
  return {
    start,
    end,
    previousStart: shiftDashboardDate(start, -days),
    previousEnd: shiftDashboardDate(end, -days),
  };
}

const active = (booking: Booking) => booking.status !== "cancelled";
const clientKey = (booking: Booking) =>
  booking.clientId ||
  booking.clientName.trim().toLocaleLowerCase("pt-MZ") ||
  booking.id;

export interface CustomerRow {
  key: string;
  name: string;
  appointments: number;
  visits: number;
  noShows: number;
  paid: number;
  lastDate: string;
}

export interface CustomerPeriod {
  customers: number;
  newCustomers: number;
  returningCustomers: number;
  visits: number;
  rows: CustomerRow[];
}

export function rankCustomers(
  rows: readonly CustomerRow[],
  by: "visits" | "appointments",
  limit = 10,
): CustomerRow[] {
  return [...rows]
    .filter((row) => row[by] > 0)
    .sort(
      (a, b) =>
        b[by] - a[by] ||
        b.appointments - a.appointments ||
        b.visits - a.visits ||
        a.name.localeCompare(b.name),
    )
    .slice(0, limit);
}

export function customerPeriod(
  bookings: readonly Booking[],
  start: string,
  end: string,
): CustomerPeriod {
  const history = bookings.filter(active);
  const current = history.filter(
    (booking) => booking.date >= start && booking.date <= end,
  );
  const grouped = new Map<string, CustomerRow>();
  for (const booking of current) {
    const key = clientKey(booking);
    const row = grouped.get(key) || {
      key,
      name: booking.clientName || "Cliente",
      appointments: 0,
      visits: 0,
      noShows: 0,
      paid: 0,
      lastDate: booking.date,
    };
    row.appointments++;
    if (booking.status === "completed") row.visits++;
    if (booking.status === "no_show") row.noShows++;
    if (booking.paymentStatus === "paid")
      row.paid += Number(booking.total) || 0;
    if (booking.date >= row.lastDate) {
      row.lastDate = booking.date;
      row.name = booking.clientName || row.name;
    }
    grouped.set(key, row);
  }
  const rows = [...grouped.values()];
  const keysBefore = new Set(
    history.filter((booking) => booking.date < start).map(clientKey),
  );
  const visitedBefore = new Set(
    history
      .filter(
        (booking) => booking.date < start && booking.status === "completed",
      )
      .map(clientKey),
  );
  return {
    customers: rows.length,
    newCustomers: rows.filter((row) => !keysBefore.has(row.key)).length,
    returningCustomers: rows.filter((row) => visitedBefore.has(row.key)).length,
    visits: rows.reduce((sum, row) => sum + row.visits, 0),
    rows,
  };
}

export interface TeamRow {
  id: string;
  name: string;
  appointments: number;
  previousAppointments: number;
  visits: number;
  previousVisits: number;
  customers: number;
  noShows: number;
  paid: number;
}

export function teamPeriod(
  bookings: readonly Booking[],
  staff: readonly StaffMember[],
  window: PerformanceWindow,
): TeamRow[] {
  return staff.map((member) => {
    const own = bookings.filter((booking) => booking.staffId === member.id);
    const current = own.filter(
      (booking) => booking.date >= window.start && booking.date <= window.end,
    );
    const previous = own.filter(
      (booking) =>
        booking.date >= window.previousStart &&
        booking.date <= window.previousEnd,
    );
    const visits = current.filter((booking) => booking.status === "completed");
    return {
      id: member.id,
      name: member.name,
      appointments: current.filter(active).length,
      previousAppointments: previous.filter(active).length,
      visits: visits.length,
      previousVisits: previous.filter(
        (booking) => booking.status === "completed",
      ).length,
      customers: new Set(visits.map(clientKey)).size,
      noShows: current.filter((booking) => booking.status === "no_show").length,
      paid: current
        .filter((booking) => booking.paymentStatus === "paid")
        .reduce((sum, booking) => sum + (Number(booking.total) || 0), 0),
    };
  });
}
