<script setup lang="ts">
import AppSidebar from "@/components/shared/navigation/AppSidebar.vue";
import AppTopbar from "@/components/shared/navigation/AppTopbar.vue";
import AppFooter from "@/components/shared/navigation/AppFooter.vue";
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
</script>

<template>
  <div class="min-h-dvh bg-background">
    <a class="skip-link" href="#main-content">Saltar para o conteúdo</a>

    <!-- Véu por trás da gaveta de navegação, só enquanto a barra lateral não é fixa. -->
    <button
      v-if="state.role !== 'guest' && mobileMenu"
      class="fixed inset-0 z-60 h-full w-full border-0 bg-scrim desk:hidden"
      aria-label="Fechar navegação"
      @click="mobileMenu = false"
    ></button>

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
        :current-label="currentLabel"
        :unread="unread"
        :user-name="user?.name || ''"
        :user-avatar="user?.avatar || ''"
        :company-name="companyName"
        @navigate="navigate"
        @open-menu="mobileMenu = true"
      />

      <main
        id="main-content"
        :class="[
          'mx-auto w-full min-w-0 flex-1 px-5 pt-7 pb-10 sm:px-7 lg:pt-9 lg:pb-12 2xl:pt-11',
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
