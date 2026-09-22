import type { ViewName } from "@/types/domain.ts";

export type LandingLink =
  | { label: string; section: string; view?: never }
  | { label: string; view: ViewName; section?: never };

export const landingLinks: readonly LandingLink[] = [
  { label: "Como funciona", section: "como-funciona" },
  { label: "Explorar", section: "estabelecimentos" },
  { label: "Para negócios", section: "empresas" },
  { label: "Sobre", view: "about" },
  { label: "Perguntas frequentes", section: "faq" },
];
