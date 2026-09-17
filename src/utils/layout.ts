import type { Role } from "@/types/domain.ts";

/* Largura da coluna de conteúdo. Quem ainda não entrou não tem barra lateral a
   comer espaço, por isso o ecrã inteiro ficava largo de mais para ler: a coluna
   encolhe e as margens laterais crescem. O cabeçalho usa a mesma medida, para o
   seu conteúdo alinhar com o da página — a barra em si continua de ponta a
   ponta, com a sua linha inferior. */
export const contentWidth = (role: Role): string =>
  role === "guest"
    ? "max-w-[1180px] lg:px-14 xl:px-20"
    : "max-w-[1520px] lg:px-10";
