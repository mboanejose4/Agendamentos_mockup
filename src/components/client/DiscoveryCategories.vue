<script setup lang="ts">
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import { useBusinessDiscoveryContext } from "@/composables/discovery/discoveryContext.ts";
const { category, categories } = useBusinessDiscoveryContext();
</script>
<template>
  <div
    class="grid grid-cols-5 gap-1.5 border-b border-line py-[30px] mb-[30px] max-sm:gap-1 max-sm:py-5 max-sm:mb-[25px]"
    aria-label="Categorias"
  >
    <button
      v-for="item in categories"
      :key="item.name"
      :class="[
        'flex flex-col items-center gap-[11px] rounded-md border px-[7px] py-3 text-caption hover:bg-surface-muted max-sm:gap-2.5 max-sm:px-[3px] max-sm:py-2.5 max-sm:leading-[1.4]',
        category === item.name
          ? 'border-primary-text bg-soft font-semibold text-primary-text'
          : 'border-transparent text-muted',
      ]"
      :aria-pressed="category === item.name"
      @click="category = item.name"
    >
      <span
        :class="[
          'inline-grid size-[46px] shrink-0 place-items-center rounded-xl max-sm:size-10 max-sm:rounded-[10px] max-[480px]:size-[38px]',
          {
            mint: 'bg-soft text-primary-text',
            peach: 'bg-warning-soft text-warning',
            lavender: 'bg-secondary-soft text-secondary-text',
            blue: 'bg-secondary-soft text-secondary-text',
            yellow: 'bg-warning-soft text-warning',
          }[item.color],
        ]"
        ><AppIcon :name="item.icon" :size="23" /></span
      ><span>{{ item.label }}</span>
    </button>
  </div>
</template>
