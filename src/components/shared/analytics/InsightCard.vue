<script setup lang="ts">
import { computed } from "vue";
import AppIcon from "@/components/shared/ui/AppIcon.vue";

const props = withDefaults(
  defineProps<{
    label: string;
    value: string;
    icon: string;
    detail: string;
    current?: number;
    previous?: number;
    comparisonLabel?: string;
    tone?: "primary" | "blue" | "amber" | "violet";
  }>(),
  { tone: "primary" },
);

const comparison = computed(() => {
  if (props.current === undefined || props.previous === undefined) return "";
  if (props.previous === 0)
    return props.current === 0
      ? "Sem variação"
      : "Sem registos no período anterior";
  const change =
    ((props.current - props.previous) / Math.abs(props.previous)) * 100;
  return `${change > 0 ? "+" : ""}${new Intl.NumberFormat("pt-MZ", { maximumFractionDigits: 0 }).format(change)}%`;
});
</script>

<template>
  <article class="insight-card" :class="`insight-card--${tone}`">
    <div class="insight-card__top">
      <span class="insight-card__label">{{ label }}</span>
      <span class="insight-card__icon"
        ><AppIcon :name="icon" :size="20"
      /></span>
    </div>
    <strong class="insight-card__value">{{ value }}</strong>
    <p class="insight-card__detail">{{ detail }}</p>
    <div v-if="comparison" class="insight-card__comparison">
      <span class="insight-card__delta">{{ comparison }}</span>
      <span>{{ comparisonLabel || "face ao período anterior" }}</span>
    </div>
  </article>
</template>
