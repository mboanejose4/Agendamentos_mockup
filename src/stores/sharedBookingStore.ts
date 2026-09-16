import { computed, ref } from "vue";
import { bookingByToken, state } from "@/stores/applicationStore.ts";

/* A marcação aberta por ligação. O token vem do endereço e fica guardado aqui
   para a página o poder ler mesmo depois de a pessoa navegar e voltar. */
export const sharedToken = ref("");

export const sharedBooking = computed(() => bookingByToken(sharedToken.value));

/** Lê o endereço à entrada. Devolve verdadeiro quando encontrou a marcação. */
export function openSharedLink(): boolean {
  if (typeof window === "undefined") return false;
  const token = new URLSearchParams(window.location.search).get("m") || "";
  if (!token) return false;
  sharedToken.value = token;
  if (!bookingByToken(token)) return false;
  state.view = "shared";
  return true;
}

/** Sai da marcação partilhada e limpa o endereço, para não voltar a abrir. */
export function leaveSharedLink(): void {
  sharedToken.value = "";
  if (typeof window !== "undefined")
    window.history.replaceState({}, "", window.location.pathname);
}
