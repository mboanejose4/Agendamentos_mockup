/* Persistência local do mockup: uma chave, um instantâneo do estado. */
import type { ApplicationSnapshot } from "@/types/domain.ts";

const STORAGE_KEY = "marcafacil.agendamento.v4";

export function readApplicationSnapshot(): ApplicationSnapshot | null {
  try {
    return JSON.parse(
      globalThis.localStorage?.getItem(STORAGE_KEY) || "null",
    ) as ApplicationSnapshot | null;
  } catch {
    return null;
  }
}

export function writeApplicationSnapshot(snapshot: ApplicationSnapshot): void {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    /* O armazenamento pode estar indisponível ou cheio. */
  }
}
