import { computed, ref } from "vue";

export type ThemePreference = "light" | "dark" | "system";
const options: readonly ThemePreference[] = ["light", "dark", "system"];
const key = "marcafacil.appearance";
let saved: string | null = "system";
try {
  saved = localStorage.getItem(key) || "system";
} catch {}
export const themePreference = ref<ThemePreference>(
  options.includes(saved as ThemePreference)
    ? (saved as ThemePreference)
    : "system",
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
export function setTheme(value: ThemePreference): void {
  if (!options.includes(value)) return;
  themePreference.value = value;
  try {
    localStorage.setItem(key, value);
  } catch {}
}
