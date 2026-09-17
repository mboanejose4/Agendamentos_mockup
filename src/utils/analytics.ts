import type { Booking, IsoDate } from "@/types/domain.ts";

/* Cálculo de desempenho partilhado pelo gestor e pelo funcionário. São funções
   puras sobre reservas: quem chama decide que reservas entram — a empresa
   inteira, uma equipa ou um profissional. */

/** Reservas que contam para desempenho: canceladas e faltas ficam de fora. */
export const counts = (booking: Booking): boolean =>
  !["cancelled", "no_show"].includes(booking.status);

export const inRange = (
  bookings: Booking[],
  from: IsoDate,
  to: IsoDate,
): Booking[] => bookings.filter((item) => item.date >= from && item.date <= to);

export interface Summary {
  bookings: number;
  completed: number;
  cancelled: number;
  noShow: number;
  revenue: number;
  /** Receita média por reserva contabilizada. */
  ticket: number;
  /** Minutos ocupados pelas reservas que contam. */
  minutes: number;
  /** Percentagem de reservas concluídas, entre as que não foram canceladas. */
  completionRate: number;
  /** Percentagem de faltas sobre o total marcado. */
  noShowRate: number;
  clients: number;
}

export function summarize(bookings: Booking[]): Summary {
  const valid = bookings.filter(counts);
  const paid = valid.filter((item) => item.paymentStatus === "paid");
  const revenue = paid.reduce((sum, item) => sum + Number(item.total || 0), 0);
  const completed = valid.filter((item) => item.status === "completed").length;
  const noShow = bookings.filter((item) => item.status === "no_show").length;
  return {
    bookings: valid.length,
    completed,
    cancelled: bookings.filter((item) => item.status === "cancelled").length,
    noShow,
    revenue,
    ticket: valid.length ? Math.round(revenue / valid.length) : 0,
    minutes: valid.reduce((sum, item) => sum + Number(item.duration || 0), 0),
    completionRate: valid.length
      ? Math.round((completed / valid.length) * 100)
      : 0,
    noShowRate: bookings.length
      ? Math.round((noShow / bookings.length) * 100)
      : 0,
    clients: new Set(valid.map((item) => item.clientId)).size,
  };
}

/** Variação percentual face ao período anterior; null quando não há base. */
export function change(current: number, previous: number): number | null {
  if (!previous) return current ? null : 0;
  return Math.round(((current - previous) / previous) * 100);
}

/** O período imediatamente anterior, do mesmo comprimento. */
export function previousRange(
  from: IsoDate,
  to: IsoDate,
): { from: IsoDate; to: IsoDate } {
  const start = new Date(`${from}T12:00:00`);
  const end = new Date(`${to}T12:00:00`);
  const days = Math.max(
    1,
    Math.round((end.getTime() - start.getTime()) / 86400000) + 1,
  );
  const previousEnd = new Date(start);
  previousEnd.setDate(previousEnd.getDate() - 1);
  const previousStart = new Date(previousEnd);
  previousStart.setDate(previousStart.getDate() - days + 1);
  const iso = (date: Date): IsoDate => date.toISOString().slice(0, 10);
  return { from: iso(previousStart), to: iso(previousEnd) };
}

export interface Bucket {
  key: IsoDate;
  label: string;
  bookings: number;
  revenue: number;
}

/* Um período longo agrupado ao dia dá um gráfico ilegível: acima de seis
   semanas passa a semanas, acima de um ano passa a meses. */
export function bucketize(
  bookings: Booking[],
  from: IsoDate,
  to: IsoDate,
): Bucket[] {
  const start = new Date(`${from}T12:00:00`);
  const end = new Date(`${to}T12:00:00`);
  const days = Math.max(
    1,
    Math.round((end.getTime() - start.getTime()) / 86400000) + 1,
  );
  const step = days > 370 ? "month" : days > 42 ? "week" : "day";
  const iso = (date: Date): IsoDate => date.toISOString().slice(0, 10);

  const keyOf = (date: IsoDate): IsoDate => {
    if (step === "day") return date;
    const value = new Date(`${date}T12:00:00`);
    if (step === "month") return `${date.slice(0, 7)}-01`;
    /* Semana a começar na segunda-feira. */
    const weekday = (value.getDay() + 6) % 7;
    value.setDate(value.getDate() - weekday);
    return iso(value);
  };

  const buckets = new Map<IsoDate, Bucket>();
  const cursor = new Date(start);
  while (cursor <= end) {
    const key = keyOf(iso(cursor));
    if (!buckets.has(key))
      buckets.set(key, {
        key,
        label: labelFor(key, step),
        bookings: 0,
        revenue: 0,
      });
    cursor.setDate(cursor.getDate() + 1);
  }
  bookings.filter(counts).forEach((item) => {
    const bucket = buckets.get(keyOf(item.date));
    if (!bucket) return;
    bucket.bookings += 1;
    if (item.paymentStatus === "paid")
      bucket.revenue += Number(item.total || 0);
  });
  return [...buckets.values()].sort((a, b) => a.key.localeCompare(b.key));
}

function labelFor(key: IsoDate, step: "day" | "week" | "month"): string {
  const date = new Date(`${key}T12:00:00`);
  if (step === "month")
    return new Intl.DateTimeFormat("pt-MZ", { month: "short" }).format(date);
  return new Intl.DateTimeFormat("pt-MZ", {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

export interface ClientRank {
  id: string;
  name: string;
  visits: number;
  bookings: number;
  revenue: number;
  noShow: number;
  firstVisit?: IsoDate;
  lastVisit?: IsoDate;
}

/** Um cliente por linha, com o que fez no período pedido. */
export function rankClients(
  bookings: Booking[],
  nameOf: (id: string) => string,
): ClientRank[] {
  const rows = new Map<string, ClientRank>();
  bookings.forEach((item) => {
    if (!item.clientId) return;
    const row =
      rows.get(item.clientId) ||
      ({
        id: item.clientId,
        name: nameOf(item.clientId) || item.clientName || "Cliente",
        visits: 0,
        bookings: 0,
        revenue: 0,
        noShow: 0,
      } as ClientRank);
    if (item.status === "no_show") row.noShow += 1;
    if (counts(item)) {
      row.bookings += 1;
      if (item.status === "completed") {
        row.visits += 1;
        if (!row.firstVisit || item.date < row.firstVisit)
          row.firstVisit = item.date;
        if (!row.lastVisit || item.date > row.lastVisit)
          row.lastVisit = item.date;
      }
      if (item.paymentStatus === "paid") row.revenue += Number(item.total || 0);
    }
    rows.set(item.clientId, row);
  });
  return [...rows.values()];
}

export interface ClientSegments {
  /** Clientes com pelo menos uma reserva no período. */
  active: number;
  /** Primeira reserva de sempre caiu dentro do período. */
  fresh: number;
  /** Já tinham histórico antes do período. */
  returning: number;
  /** Mais de uma reserva no período. */
  loyal: number;
  /** Tinham histórico e não voltaram no período. */
  dormant: number;
  /** Percentagem de clientes do período que já eram conhecidos. */
  returnRate: number;
}

export function segmentClients(
  all: Booking[],
  from: IsoDate,
  to: IsoDate,
): ClientSegments {
  const period = inRange(all, from, to).filter(counts);
  const before = all.filter((item) => item.date < from && counts(item));
  const known = new Set(before.map((item) => item.clientId));
  const seen = new Map<string, number>();
  period.forEach((item) =>
    seen.set(item.clientId, (seen.get(item.clientId) || 0) + 1),
  );
  const active = seen.size;
  let fresh = 0;
  let returning = 0;
  let loyal = 0;
  seen.forEach((count, id) => {
    if (known.has(id)) returning += 1;
    else fresh += 1;
    if (count > 1) loyal += 1;
  });
  let dormant = 0;
  known.forEach((id) => {
    if (!seen.has(id)) dormant += 1;
  });
  return {
    active,
    fresh,
    returning,
    loyal,
    dormant,
    returnRate: active ? Math.round((returning / active) * 100) : 0,
  };
}
