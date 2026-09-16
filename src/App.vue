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
const layout = computed(() =>
  state.view === "auth" ? AuthLayout : MainLayout,
);
const page = computed(() => resolvePage(state.view, state.role));
watch(
  () => state.view,
  (view) => {
    if (view === "auth") document.title = "A sua conta · MarcaFácil";
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
