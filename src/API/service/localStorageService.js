const STORAGE_KEY = "marcafacil.agendamento.v3";
export function readApplicationSnapshot() {
  try {
    return JSON.parse(globalThis.localStorage?.getItem(STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}
export function writeApplicationSnapshot(snapshot) {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    /* Storage may be unavailable or full. */
  }
}
