<script setup lang="ts">
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import { useBusinessDiscoveryContext } from "@/composables/discovery/discoveryContext.ts";

const { category, categories } = useBusinessDiscoveryContext();
</script>

<template>
  <div
    class="mb-[30px] grid grid-cols-5 gap-1.5 border-b border-line py-[30px] max-sm:mb-[25px] max-sm:gap-1 max-sm:py-5"
    aria-label="Categorias"
  >
    <button
      v-for="(item, index) in categories"
      :key="item.name"
      :class="[
        'flex flex-col items-center gap-[11px] rounded-4xl border px-[7px] py-3 text-caption hover:bg-surface-muted max-sm:gap-2.5 max-sm:px-[3px] max-sm:py-2.5 max-sm:leading-[1.4]',
        category === item.name
          ? 'border-primary-text bg-soft font-semibold text-primary-text'
          : 'border-transparent text-muted',
      ]"
      :aria-pressed="category === item.name"
      @click="category = item.name"
    >
      <span
        class="category-icon inline-grid size-[46px] shrink-0 place-items-center rounded-full text-primary-text max-sm:size-10 max-[480px]:size-[38px]"
        :style="{ animationDelay: `${index * 140}ms` }"
      >
        <AppIcon :name="item.icon" :size="23" />
      </span>

      <span>{{ item.label }}</span>
    </button>
  </div>
</template>

<style scoped>
.category-icon {
  background: transparent;
  animation: category-pulse 2.2s ease-out infinite;
}

@keyframes category-pulse {
  0% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--primary) 50%, transparent);
  }

  70% {
    box-shadow: 0 0 0 9px color-mix(in srgb, var(--primary) 0%, transparent);
  }

  100% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--primary) 0%, transparent);
  }
}

@media (prefers-reduced-motion: reduce) {
  .category-icon {
    animation: none;
  }
}
</style>
