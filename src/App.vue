<script setup lang="ts">
import { useBookingReminders } from "@/composables/useBookingReminders.ts";
useBookingReminders();
import { useAppearance } from "@/composables/useAppearance.ts";
useAppearance();
import { computed, watch } from "vue";
import { state } from "@/stores/applicationStore.ts";
import MainLayout from "@/layouts/MainLayout.vue";
import AuthLayout from "@/layouts/AuthLayout.vue";
import AppToast from "@/components/shared/ui/AppToast.vue";
import { resolvePage } from "@/views/pageRegistry.ts";
import { openSharedLink } from "@/stores/sharedBookingStore.ts";

/* Uma marcação aberta por ligação manda no ecrã inicial. */
openSharedLink();
const layout = computed(() =>
  ["auth", "shared"].includes(state.view) ? AuthLayout : MainLayout,
);
const page = computed(() => resolvePage(state.view, state.role));
watch(
  () => state.view,
  (view) => {
    /* Estas duas vistas usam o AuthLayout, que não monta a navegação — o
       título do separador tem de vir daqui. */
    if (view === "auth") document.title = "A sua conta · MarcaFácil";
    if (view === "shared") document.title = "A sua marcação · MarcaFácil";
  },
  { immediate: true },
);
</script>
<template>
  <component :is="layout">
    <div :key="state.view" class="page-motion"><component :is="page" /></div>
  </component>
  <AppToast :message="state.toast" />
</template>
