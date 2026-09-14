import { ref, computed } from "vue";
const key = "marcafacil.appearance";
let saved = "system";
try {
  saved = localStorage.getItem(key) || "system";
} catch {}
export const themePreference = ref(
  ["light", "dark", "system"].includes(saved) ? saved : "system",
);
const media =
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-color-scheme: dark)")
    : null;
const systemDark = ref(media?.matches || false);
media?.addEventListener("change", (event) => {
  systemDark.value = event.matches;
});
export const isDark = computed(
  () =>
    themePreference.value === "dark" ||
    (themePreference.value === "system" && systemDark.value),
);
export function setTheme(value) {
  if (!["light", "dark", "system"].includes(value)) return;
  themePreference.value = value;
  try {
    localStorage.setItem(key, value);
  } catch {}
}
