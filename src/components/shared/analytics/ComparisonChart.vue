<script setup lang="ts">
import { computed } from "vue";
import type { ComparisonSeries } from "@/utils/dashboardAnalytics.ts";

const props = withDefaults(
  defineProps<{
    title: string;
    description: string;
    series: ComparisonSeries;
    currentLabel: string;
    previousLabel: string;
    unit?: string;
  }>(),
  { unit: "" },
);
const peak = computed(() =>
  Math.max(1, ...props.series.current, ...props.series.previous),
);
const height = (value: number) =>
  `${value ? Math.max(4, (value / peak.value) * 100) : 2}%`;
const display = (value: number) =>
  new Intl.NumberFormat("pt-MZ", {
    maximumFractionDigits: props.unit ? 0 : 1,
  }).format(value);
const dataSummary = computed(() =>
  props.series.labels
    .map(
      (label, index) =>
        `${label}: ${display(props.series.current[index] || 0)} ${props.currentLabel}; ${display(props.series.previous[index] || 0)} ${props.previousLabel}`,
    )
    .join(". "),
);
</script>

<template>
  <section class="insight-panel">
    <header class="insight-panel__header">
      <div>
        <h2>{{ title }}</h2>
        <p>{{ description }}</p>
      </div>
      <div class="comparison-legend" aria-hidden="true">
        <span
          ><i class="comparison-legend__current"></i>{{ currentLabel }}</span
        >
        <span
          ><i class="comparison-legend__previous"></i>{{ previousLabel }}</span
        >
      </div>
    </header>
    <div
      class="comparison-chart"
      role="img"
      :aria-label="`${title}. ${description}. ${dataSummary}`"
    >
      <div
        class="comparison-chart__plot"
        :style="{ '--chart-columns': series.labels.length }"
        aria-hidden="true"
      >
        <div
          v-for="(label, index) in series.labels"
          :key="`${label}-${index}`"
          class="comparison-chart__group"
        >
          <div class="comparison-chart__bars">
            <span
              class="comparison-chart__bar comparison-chart__bar--previous"
              :style="{ height: height(series.previous[index] || 0) }"
              :title="`${previousLabel}: ${display(series.previous[index] || 0)} ${unit}`"
            ></span>
            <span
              class="comparison-chart__bar comparison-chart__bar--current"
              :style="{ height: height(series.current[index] || 0) }"
              :title="`${currentLabel}: ${display(series.current[index] || 0)} ${unit}`"
            ></span>
          </div>
          <span class="comparison-chart__label">{{ label }}</span>
        </div>
      </div>
    </div>
    <div class="insight-panel__footer">
      <span
        >{{ currentLabel }}:
        <strong>{{ display(series.currentTotal) }} {{ unit }}</strong></span
      >
      <span
        >{{ previousLabel }}:
        <strong>{{ display(series.previousTotal) }} {{ unit }}</strong></span
      >
    </div>
  </section>
</template>
