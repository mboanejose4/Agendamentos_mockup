<script setup>
import { useBookingReminders } from "@/Composable/useBookingReminders.js";
useBookingReminders();
import { useAppearance } from "@/Composable/useAppearance.js";
useAppearance();
import { computed, watch } from "vue";
import { state } from "@/Store/applicationStore.js";
import MainLayout from "@/Layout/MainLayout.vue";
import AuthLayout from "@/Layout/AuthLayout.vue";
import AppToast from "@/Component/ui/AppToast.vue";
import { resolvePage } from "@/Page/pageRegistry.js";
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
