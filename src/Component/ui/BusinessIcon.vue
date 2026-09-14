<script setup>
import AppIcon from "./AppIcon.vue";
import { normalizeBrand } from "@/Utils/theme.js";

defineProps({
  branding: Object,
  name: { type: String, default: "Empresa" },
  size: { type: Number, default: 32 },
});
</script>

<template>
  <span
    class="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-surface p-1 text-primary-text"
    :style="{ width: size + 'px', height: size + 'px' }"
  >
    <img
      v-if="normalizeBrand(branding).icon"
      :src="normalizeBrand(branding).icon"
      :alt="'Ícone de ' + name"
      class="h-full w-full object-contain"
    />
    <AppIcon v-else name="building-2" :size="Math.round(size * 0.6)" />
  </span>
</template>
