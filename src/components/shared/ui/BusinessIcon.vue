<script setup lang="ts">
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import type { Branding } from "@/types/domain.ts";
import { normalizeBrand } from "@/utils/theme.ts";

withDefaults(
  defineProps<{
    branding?: Partial<Branding>;
    name?: string;
    size?: number;
  }>(),
  { name: "Empresa", size: 32 },
);
</script>

<template>
  <span
    class="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-4xl border border-line bg-surface p-1 text-primary-text"
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
