import { computed, watchEffect } from "vue";
import { state } from "@/stores/applicationStore.ts";
import { isDark } from "@/stores/themeStore.ts";
import { normalizeBrand, textOn, accessibleAccent } from "@/utils/theme.ts";
export function useAppearance() {
  const activeBrand = computed(() => {
    let id: string | undefined;
    if (state.view === "booking")
      id = state.bookingDraft?.businessId || state.selectedBusinessId;
    else if (state.view === "business") id = state.selectedBusinessId;
    else if (
      ["manager", "professional"].includes(state.role) &&
      !["auth", "onboard", "explore", "favorites"].includes(state.view)
    )
      id = state.businessId;
    return normalizeBrand(
      state.db.businesses.find((b) => b.id === id)?.branding,
    );
  });
  watchEffect(() => {
    const root = document.documentElement,
      dark = isDark.value,
      brand = activeBrand.value;
    root.dataset.theme = dark ? "dark" : "light";
    root.style.colorScheme = dark ? "dark" : "light";
    for (const [key, value] of Object.entries({
      "--primary": brand.primaryColor,
      "--secondary": brand.secondaryColor,
      "--on-primary": textOn(brand.primaryColor),
      "--on-secondary": textOn(brand.secondaryColor),
      "--primary-text": accessibleAccent(
        brand.primaryColor,
        dark ? "#112018" : "#ffffff",
      ),
      "--secondary-text": accessibleAccent(
        brand.secondaryColor,
        dark ? "#112018" : "#ffffff",
      ),
    }))
      root.style.setProperty(key, value);
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", dark ? "#06120c" : "#f4faf7");
  });
  return { activeBrand };
}
