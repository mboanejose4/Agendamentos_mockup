import { computed, reactive } from "vue";
import type { WritableComputedRef } from "vue";

/* Cartões ou tabela, por listagem. A escolha vive no módulo para sobreviver à
   navegação: quem prefere tabelas não tem de a escolher outra vez ao voltar. */
export type ListMode = "cards" | "table";

const modes = reactive<Record<string, ListMode>>({});

export function useListMode(key: string): WritableComputedRef<ListMode> {
  return computed({
    get: () => modes[key] || "cards",
    set: (value) => {
      modes[key] = value;
    },
  });
}
