/* Formatação partilhada por toda a aplicação. */
import type { IsoDate } from "@/types/domain.ts";

export const money = (value: number | string = 0): string =>
  `${new Intl.NumberFormat("pt-MZ", { maximumFractionDigits: 0 }).format(Number(value) || 0)} MT`;

/* Iniciais para o avatar: duas letras, ou o valor de recurso quando não há nome. */
export const initials = (name = "", fallback = "EU"): string =>
  String(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toLocaleUpperCase("pt") || fallback;

/* Data sempre com dois dígitos no dia e no mês: 08/09/2026, nunca 8/09/2026. */
export const dateLabel = (iso: IsoDate | undefined | null): string =>
  iso
    ? new Intl.DateTimeFormat("pt-MZ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(new Date(`${iso}T12:00:00`))
    : "";

/* Concordância de número: 1 reserva, 2 reservas. */
export const plural = (count: number, one: string, many: string): string =>
  `${count} ${Number(count) === 1 ? one : many}`;

/* Referência curta de uma marcação, a mesma em todos os ecrãs. */
export const bookingCode = (id = ""): string =>
  String(id).slice(-7).toUpperCase();
export const bookingReference = (id = ""): string => `#${bookingCode(id)}`;
