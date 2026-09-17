<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  title: string;
  description: string;
  segments: readonly { label: string; value: number }[];
  totalLabel: string;
}>();
const palette = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
];
const total = computed(() =>
  props.segments.reduce((sum, item) => sum + item.value, 0),
);
const fill = computed(() => {
  if (!total.value) return "var(--surface-muted)";
  let position = 0;
  const stops = props.segments.map((item, index) => {
    const end = position + (item.value / total.value) * 100;
    const stop = `${palette[index % palette.length]} ${position}% ${end}%`;
    position = end;
    return stop;
  });
  return `conic-gradient(${stops.join(", ")})`;
});
</script>

<template>
  <section class="insight-panel">
    <header class="insight-panel__header">
      <div>
        <h2>{{ title }}</h2>
        <p>{{ description }}</p>
      </div>
    </header>
    <div class="distribution-chart">
      <div
        class="distribution-chart__ring"
        :style="{ background: fill }"
        role="img"
        :aria-label="
          segments.map((item) => `${item.label}: ${item.value}`).join(', ') ||
          'Sem dados'
        "
      >
        <div class="distribution-chart__center">
          <strong>{{ total }}</strong>
          <span>{{ totalLabel }}</span>
        </div>
      </div>
      <ul class="distribution-chart__legend">
        <li v-for="(item, index) in segments" :key="item.label">
          <span
            class="distribution-chart__swatch"
            :style="{ background: palette[index % palette.length] }"
          ></span>
          <span class="min-w-0 flex-1 truncate">{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <small
            >{{ total ? Math.round((item.value / total) * 100) : 0 }}%</small
          >
        </li>
      </ul>
    </div>
    <p v-if="!total" class="mt-4 text-caption text-muted">
      Ainda não há dados neste período.
    </p>
  </section>
</template>
