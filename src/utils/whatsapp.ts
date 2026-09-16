import type { Booking, Business, Service } from "@/types/domain.ts";
import { dateLabel, money } from "@/utils/formatters.ts";

/* Ligações de WhatsApp e a mensagem que acompanha uma marcação feita ao
   balcão. Nada é enviado por aqui: abre-se o WhatsApp com o texto preenchido e
   é a pessoa do estabelecimento que carrega em enviar. */

/** Indicativo de Moçambique. */
const COUNTRY = "258";

/** Reduz um contacto ao formato que o wa.me aceita: só dígitos, com país. */
export function normalizePhone(raw: string, country = COUNTRY): string {
  const digits = String(raw || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith(country)) return digits;
  /* Número nacional escrito com o zero à frente. */
  return country + digits.replace(/^0+/, "");
}

/** Um número moçambicano tem nove dígitos depois do indicativo. */
export function isUsablePhone(raw: string): boolean {
  const digits = normalizePhone(raw);
  return digits.length >= 11 && digits.length <= 15;
}

export function whatsappUrl(phone: string, text: string): string {
  return `https://wa.me/${normalizePhone(phone)}?text=${encodeURIComponent(text)}`;
}

/** Endereço que abre a marcação, para colar onde for preciso. */
export function bookingLink(token: string): string {
  if (typeof window === "undefined") return "";
  const { origin, pathname } = window.location;
  return `${origin}${pathname}?m=${token}`;
}

export function bookingMessage(
  booking: Booking,
  company: Business | undefined,
  item: Service | undefined,
  link: string,
): string {
  const nome = (booking.clientName || "").split(/\s+/)[0] || "Olá";
  const linhas = [
    `Olá ${nome}, aqui é ${company?.name || "o estabelecimento"}.`,
    "",
    `A sua marcação está confirmada:`,
    `• ${item?.name || "Serviço"}`,
    `• ${dateLabel(booking.date)} às ${booking.time}`,
    `• ${money(booking.total)}`,
    "",
    booking.paymentStatus === "paid"
      ? "Já está paga."
      : "Pode pagar já, ou no momento do atendimento.",
    "",
    "Veja os detalhes aqui:",
    link,
  ];
  return linhas.join("\n");
}
