<script setup lang="ts">
import { computed } from "vue";
import AppIcon from "@/components/shared/ui/AppIcon.vue";

/* Um número com contexto. A variação vem do período anterior do mesmo
   comprimento; `invert` serve para indicadores em que descer é bom. */
const props = withDefaults(
  defineProps<{
    label: string;
    value: string;
    hint?: string;
    /** Variação percentual; null quando não há período anterior comparável. */
    delta?: number | null;
    invert?: boolean;
  }>(),
  { hint: "", delta: undefined, invert: false },
);

const tone = computed(() => {
  if (props.delta === null || props.delta === undefined || props.delta === 0)
    return "text-muted";
  const good = props.invert ? props.delta < 0 : props.delta > 0;
  return good ? "text-success" : "text-danger";
});
</script>
<template>
  <div
    class="elevated-edge min-w-0 rounded-4xl border border-line bg-surface p-5 sm:p-6"
  >
    <span class="text-caption text-muted">{{ label }}</span>
    <strong
      class="my-2.5 block text-[clamp(24px,7vw,28px)] leading-tight break-words"
      >{{ value }}</strong
    >
    <span
      v-if="delta !== undefined && delta !== null"
      :class="['flex items-center gap-1 text-caption', tone]"
    >
      <AppIcon
        :name="
          delta > 0 ? 'arrow-up-right' : delta < 0 ? 'arrow-right' : 'minus'
        "
        :size="14"
      />{{ delta > 0 ? "+" : "" }}{{ delta }}%
      <span class="text-muted">vs. período anterior</span>
    </span>
    <span v-else class="text-caption text-muted">{{
      hint || (delta === null ? "sem período anterior para comparar" : "")
    }}</span>
  </div>
</template>
