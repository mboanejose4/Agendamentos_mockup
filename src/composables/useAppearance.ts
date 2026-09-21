import { computed, watchEffect } from "vue";
import { state } from "@/stores/applicationStore.ts";
import { isDark } from "@/stores/themeStore.ts";
import { brandPreview } from "@/stores/brandPreview.ts";
import { normalizeBrand, textOn, accessibleAccent } from "@/utils/theme.ts";
export function useAppearance() {
  const activeBrand = computed(() => {
    /* Quem está a escolher as cores vê-as já aplicadas, antes de gravar. */
    if (brandPreview.value) return normalizeBrand(brandPreview.value);
    let id: string | undefined;
    if (state.view === "booking")
      id = state.bookingDraft?.businessId || state.selectedBusinessId;
    else if (state.view === "business") id = state.selectedBusinessId;
    else if (
      ["manager", "professional"].includes(state.role) &&
      !["auth", "onboard", "explore", "directory", "favorites"].includes(
        state.view,
      )
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
      /* No tema escuro o texto de realce e branco — e a regra da plataforma,
         e um verde da marca sobre o fundo escuro nao chegaria aos 4.5:1.
         No claro mantem-se o tom da marca, escurecido ate ser legivel. */
      "--primary-text": dark
        ? "#ffffff"
        : accessibleAccent(brand.primaryColor, "#ffffff"),
      "--secondary-text": dark
        ? "#ffffff"
        : accessibleAccent(brand.secondaryColor, "#ffffff"),
    }))
      root.style.setProperty(key, value);
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", dark ? "#04150d" : "#f4faf7");
  });
  return { activeBrand };
}
