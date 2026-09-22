<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted } from "vue";
import AppSidebar from "@/components/shared/navigation/AppSidebar.vue";
import GuestSidebar from "@/components/shared/navigation/GuestSidebar.vue";
import AppTopbar from "@/components/shared/navigation/AppTopbar.vue";
import AppFooter from "@/components/shared/navigation/AppFooter.vue";
import LandingFooter from "@/components/shared/navigation/LandingFooter.vue";
import WorkspaceSwitcher from "@/components/shared/navigation/WorkspaceSwitcher.vue";
import ShareBookingDialog from "@/components/shared/ui/ShareBookingDialog.vue";
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import { useAppNavigation } from "@/composables/navigation/useAppNavigation.ts";
import { contentWidth } from "@/utils/layout.ts";
const {
  state,
  mobileMenu,
  workspaceOpen,
  roles,
  currentRole,
  user,
  unread,
  navigation,
  currentLabel,
  professionalList,
  companyName,
  navigate,
  chooseRole,
  selectBusiness,
  selectStaff,
  signOut,
} = useAppNavigation();

async function navigateToLandingSection(section: string): Promise<void> {
  mobileMenu.value = false;
  if (state.view !== "explore") {
    navigate("explore");
    await nextTick();
  }
  document
    .getElementById(section)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function navigateToLandingHome(): void {
  mobileMenu.value = false;
  navigate("explore");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function closeMenuOnEscape(event: KeyboardEvent): void {
  if (event.key === "Escape") mobileMenu.value = false;
}

onMounted(() => window.addEventListener("keydown", closeMenuOnEscape));
onBeforeUnmount(() => window.removeEventListener("keydown", closeMenuOnEscape));
</script>

<template>
  <!-- overflow-x-clip: a faixa da marca sangra com 100dvw, medida que inclui
       a barra de deslocamento, e sem isto a página ganharia uns pixéis de
       deslocamento horizontal. `clip` corta o excesso sem criar um contexto de
       deslocamento — ao contrário de `hidden`, que quebraria o `sticky` da
       barra de topo. -->
  <div class="min-h-dvh overflow-x-clip bg-background">
    <a class="skip-link" href="#main-content">Saltar para o conteúdo</a>

    <!-- Véu por trás da gaveta de navegação, só enquanto a barra lateral não é fixa. -->
    <button
      v-if="mobileMenu"
      class="fixed inset-0 z-60 h-full w-full border-0 bg-scrim"
      :class="state.role === 'guest' ? 'xl:hidden' : 'desk:hidden'"
      aria-label="Fechar navegação"
      @click="mobileMenu = false"
    ></button>

    <GuestSidebar
      v-if="state.role === 'guest'"
      :open="mobileMenu"
      @close="mobileMenu = false"
      @home="navigateToLandingHome"
      @navigate="navigate"
      @navigate-section="navigateToLandingSection"
    />

    <AppSidebar
      v-if="state.role !== 'guest'"
      :open="mobileMenu"
      :role="state.role"
      :active-view="state.view"
      :business-id="state.businessId"
      :staff-id="state.staffId"
      :businesses="state.db.businesses"
      :professional-list="professionalList"
      :navigation="navigation"
      :unread="unread"
      :user-name="user?.name || ''"
      :user-avatar="user?.avatar || ''"
      :current-role="currentRole"
      @navigate="
        (view) => {
          navigate(view);
          mobileMenu = false;
        }
      "
      @select-business="selectBusiness"
      @select-staff="selectStaff"
      @open-workspace="workspaceOpen = true"
      @close="mobileMenu = false"
    />

    <div
      class="flex min-h-dvh flex-col"
      :class="state.role !== 'guest' ? 'desk:ml-sidebar' : ''"
    >
      <AppTopbar
        :role="state.role"
        :menu-open="mobileMenu"
        :current-label="currentLabel"
        :unread="unread"
        :user-name="user?.name || ''"
        :user-avatar="user?.avatar || ''"
        :company-name="companyName"
        @navigate="navigate"
        @navigate-section="navigateToLandingSection"
        @open-menu="mobileMenu = true"
      />

      <main
        id="main-content"
        :class="[
          'mx-auto w-full min-w-0 flex-1 px-5 pb-10 sm:px-7 lg:pb-12',
          state.role === 'guest' && state.view === 'explore'
            ? 'pt-0'
            : 'pt-7 lg:pt-9 2xl:pt-11',
          contentWidth(state.role),
        ]"
        tabindex="-1"
      >
        <slot />
      </main>

      <AppFooter
        v-if="state.role !== 'guest'"
        :current-role="currentRole"
        @open-workspace="workspaceOpen = true"
      />
      <LandingFooter v-else-if="['explore', 'about'].includes(state.view)" />
    </div>

    <button
      v-if="state.role === 'guest'"
      class="fixed bottom-5 left-5 z-50 flex min-h-12 items-center gap-2 rounded-full border border-line bg-surface px-4 text-small font-semibold text-ink shadow-lg hover:bg-surface-muted sm:bottom-7 sm:left-7"
      type="button"
      aria-label="Escolher espaço de trabalho"
      @click="workspaceOpen = true"
    >
      <AppIcon name="compass" :size="19" />
      <span>Explorar perfis</span>
      <AppIcon name="chevron-down" :size="16" />
    </button>

    <WorkspaceSwitcher
      v-model="workspaceOpen"
      :current-role-id="state.role"
      :roles="roles"
      @select-role="chooseRole"
      @sign-out="signOut"
    />

    <!-- Partilhar uma marcação é possível a partir de vários ecrãs: o diálogo
         mora aqui, uma só vez. -->
    <ShareBookingDialog />
  </div>
</template>
