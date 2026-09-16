import { ref } from "vue";
import type { Branding } from "@/types/domain.ts";

/* Marca ainda por gravar. Enquanto alguém está a escolher as cores da empresa
   — a registá-la ou a alterar as definições — é esta que manda na aparência,
   para que o resultado se veja antes de gravar. Volta a null ao sair do ecrã. */
export const brandPreview = ref<Partial<Branding> | null>(null);
