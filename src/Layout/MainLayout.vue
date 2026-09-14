<script setup>
import AppSidebar from "@/Component/navigation/AppSidebar.vue";
import AppTopbar from "@/Component/navigation/AppTopbar.vue";
import AppFooter from "@/Component/navigation/AppFooter.vue";
import WorkspaceSwitcher from "@/Component/navigation/WorkspaceSwitcher.vue";
import { useAppNavigation } from "@/Composable/navigation/useAppNavigation.js";
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
      v-if="mobileMenu"
      class="fixed inset-0 z-60 h-full w-full border-0 bg-scrim desk:hidden"
      aria-label="Fechar navegação"
      @click="mobileMenu = false"
    ></button>

    <AppSidebar
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

    <div class="flex min-h-dvh flex-col desk:ml-sidebar">
      <AppTopbar
        :role="state.role"
        :current-label="currentLabel"
        :unread="unread"
        :user-name="user?.name || ''"
        :company-name="companyName"
        @navigate="navigate"
        @open-menu="mobileMenu = true"
      />

      <main
        id="main-content"
        class="mx-auto w-full max-w-[1520px] min-w-0 flex-1 px-5 pt-7 pb-10 sm:px-7 lg:px-10 lg:pt-9 lg:pb-12 2xl:pt-11"
        tabindex="-1"
      >
        <slot />
      </main>

      <AppFooter
        :current-role="currentRole"
        @open-workspace="workspaceOpen = true"
      />
    </div>

    <WorkspaceSwitcher
      v-model="workspaceOpen"
      :current-role-id="state.role"
      :roles="roles"
      @select-role="chooseRole"
      @sign-out="signOut"
    />
  </div>
</template>
