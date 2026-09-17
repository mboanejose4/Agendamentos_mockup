<script setup lang="ts">
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import type { ListMode } from "@/composables/useListMode.ts";

/* Alterna entre cartões e tabela. Dois botões com estado, não um interruptor
   solto: assim o leitor de ecrã anuncia qual está activo. */
const mode = defineModel<ListMode>({ required: true });

const options: { id: ListMode; label: string; icon: string }[] = [
  { id: "cards", label: "Cartões", icon: "grid-2x2" },
  { id: "table", label: "Tabela", icon: "list" },
];
</script>
<template>
  <div
    class="flex items-center gap-1 rounded-md border border-line bg-surface p-1"
    role="group"
    aria-label="Formato da listagem"
  >
    <button
      v-for="option in options"
      :key="option.id"
      type="button"
      :class="[
        'flex items-center gap-1.5 rounded px-2.5 py-1.5 text-caption',
        mode === option.id
          ? 'bg-soft font-semibold text-primary-text'
          : 'text-muted',
      ]"
      :aria-pressed="mode === option.id"
      @click="mode = option.id"
    >
      <AppIcon :name="option.icon" :size="15" />{{ option.label }}
    </button>
  </div>
</template>
