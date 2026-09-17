<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

/* Uma série, um eixo. Duas medidas de grandezas diferentes — reservas e
   receita — pedem dois gráficos destes, nunca dois eixos no mesmo desenho.
   O SVG é medido em pixéis reais, para os traços não esticarem. */

const props = withDefaults(
  defineProps<{
    title: string;
    points: { label: string; value: number }[];
    /** Como escrever um valor na dica, no rótulo e na tabela. */
    format?: (value: number) => string;
    /** Nome da coluna de valores na tabela equivalente. */
    unit?: string;
    height?: number;
  }>(),
  {
    format: (value: number) => String(value),
    unit: "Valor",
    height: 168,
  },
);

const host = ref<HTMLElement | null>(null);
const width = ref(0);
const inner = ref(0);
const active = ref(-1);

let observer: ResizeObserver | null = null;
onMounted(() => {
  if (!host.value) return;
  width.value = host.value.clientWidth;
  inner.value = host.value.clientHeight;
  observer = new ResizeObserver(() => {
    if (!host.value) return;
    width.value = host.value.clientWidth;
    inner.value = host.value.clientHeight;
  });
  observer.observe(host.value);
});
onBeforeUnmount(() => observer?.disconnect());

/* Espaço para os rótulos do eixo: sem isto o cartão ganharia um scroll interno.
   A goteira esquerda acompanha o rótulo mais largo — valores em meticais são
   muito mais compridos do que contagens. */
const PAD = { right: 14, top: 14, bottom: 26 };
const padLeft = computed(() => {
  const longest = Math.max(
    ...[0, 0.5, 1].map(
      (fraction) => props.format(Math.round(ceiling.value * fraction)).length,
    ),
  );
  return Math.min(88, Math.max(30, 14 + longest * 6.4));
});

/* Altura de desenho: a medida real da caixa, não a do adereço. Com moldura e
   box-sizing border-box, um SVG com a altura total criava um scroll de 2px. */
const canvas = computed(() => inner.value || props.height);
const plot = computed(() => ({
  w: Math.max(0, width.value - padLeft.value - PAD.right),
  h: Math.max(0, canvas.value - PAD.top - PAD.bottom),
}));

/* Topo do eixo arredondado para cima, para as linhas caírem em números redondos. */
const ceiling = computed(() => {
  const top = Math.max(0, ...props.points.map((item) => item.value));
  if (top <= 0) return 2;
  /* Contagens pequenas sobem ao par seguinte, para o rótulo do meio ser
     inteiro: com topo 3, o meio seria 1,5 e o rótulo mentia. */
  if (top <= 10) return Math.max(2, Math.ceil(top / 2) * 2);
  const size = 10 ** Math.floor(Math.log10(top));
  return Math.ceil(top / (size / 2)) * (size / 2);
});

const coords = computed(() => {
  const { w, h } = plot.value;
  const count = props.points.length;
  if (!count || !w) return [] as { x: number; y: number; value: number }[];
  const step = count > 1 ? w / (count - 1) : 0;
  return props.points.map((item, index) => ({
    x: padLeft.value + (count > 1 ? index * step : w / 2),
    y: PAD.top + h - (item.value / ceiling.value) * h,
    value: item.value,
  }));
});

const line = computed(() =>
  coords.value.map((p, i) => `${i ? "L" : "M"}${p.x} ${p.y}`).join(" "),
);
const area = computed(() => {
  const list = coords.value;
  if (list.length < 2) return "";
  const base = PAD.top + plot.value.h;
  return `${line.value} L${list[list.length - 1].x} ${base} L${list[0].x} ${base} Z`;
});

/* Três linhas de grelha: base, meio e topo. */
const gridlines = computed(() =>
  [0, 0.5, 1].map((fraction) => ({
    y: PAD.top + plot.value.h * (1 - fraction),
    label: props.format(Math.round(ceiling.value * fraction)),
  })),
);

/* Rotula-se o ponto mais alto, não todos: um número por ponto é ilegível. */
const peak = computed(() => {
  if (coords.value.length < 2) return -1;
  let best = 0;
  coords.value.forEach((p, i) => {
    if (p.value > coords.value[best].value) best = i;
  });
  return coords.value[best].value > 0 ? best : -1;
});

/* Rótulos do eixo horizontal: só entra o que fica a 58px do anterior. Um
   passo fixo colava o último rótulo ao penúltimo. */
const ticks = computed(() => {
  const list = coords.value;
  const chosen = new Set<number>();
  if (!list.length) return chosen;
  chosen.add(0);
  let lastX = list[0].x;
  for (let i = 1; i < list.length; i++)
    if (list[i].x - lastX >= 58) {
      chosen.add(i);
      lastX = list[i].x;
    }
  return chosen;
});

/* Mantém o rótulo dentro da caixa: o último ponto encosta à margem. */
const labelX = (x: number): number =>
  Math.min(Math.max(x, 18), Math.max(18, width.value - 18));

const total = computed(() =>
  props.points.reduce((sum, item) => sum + item.value, 0),
);
const empty = computed(() => !props.points.length || total.value === 0);

function move(step: number): void {
  if (!props.points.length) return;
  const next = active.value < 0 ? 0 : active.value + step;
  active.value = Math.min(props.points.length - 1, Math.max(0, next));
}
function pointerMove(event: PointerEvent): void {
  const box = host.value?.getBoundingClientRect();
  const count = props.points.length;
  if (!box || !count || !plot.value.w) return;
  const x = event.clientX - box.left - padLeft.value;
  const step = count > 1 ? plot.value.w / (count - 1) : plot.value.w;
  active.value = Math.min(count - 1, Math.max(0, Math.round(x / step)));
}
</script>
<template>
  <figure class="m-0 min-w-0">
    <figcaption class="mb-3 flex items-baseline justify-between gap-4">
      <h3 class="text-body font-medium">{{ title }}</h3>
      <span class="text-caption text-muted"
        >{{ format(total) }} no período</span
      >
    </figcaption>

    <div
      ref="host"
      class="relative w-full min-w-0 rounded-card border border-line bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      :style="{ height: height + 'px' }"
      tabindex="0"
      role="img"
      :aria-label="`${title}. ${format(total)} no período, em ${points.length} intervalos. Use as setas para percorrer os valores.`"
      @pointermove="pointerMove"
      @pointerleave="active = -1"
      @keydown.left.prevent="move(-1)"
      @keydown.right.prevent="move(1)"
      @keydown.esc="active = -1"
      @blur="active = -1"
    >
      <svg
        v-if="width"
        :width="width"
        :height="canvas"
        :viewBox="`0 0 ${width} ${canvas}`"
        class="block max-w-full"
        aria-hidden="true"
      >
        <!-- Grelha: traços finos e sólidos, um tom acima da superfície. -->
        <g>
          <line
            v-for="row in gridlines"
            :key="row.y"
            :x1="padLeft"
            :x2="width - PAD.right"
            :y1="row.y"
            :y2="row.y"
            stroke="var(--border)"
            stroke-width="1"
          />
          <text
            v-for="row in gridlines"
            :key="`t${row.y}`"
            :x="padLeft - 8"
            :y="row.y + 4"
            text-anchor="end"
            fill="var(--muted)"
            style="font-size: 11px; font-variant-numeric: tabular-nums"
          >
            {{ row.label }}
          </text>
        </g>

        <template v-if="!empty">
          <path v-if="area" :d="area" fill="var(--primary)" opacity="0.10" />
          <path
            :d="line"
            fill="none"
            stroke="var(--primary)"
            stroke-width="2"
            stroke-linejoin="round"
            stroke-linecap="round"
          />

          <!-- Só o ponto mais alto é rotulado. -->
          <g v-if="peak >= 0 && active < 0">
            <circle
              :cx="coords[peak].x"
              :cy="coords[peak].y"
              r="4"
              fill="var(--primary)"
              stroke="var(--surface)"
              stroke-width="2"
            />
            <text
              :x="
                Math.min(
                  Math.max(coords[peak].x, padLeft + 16),
                  width - PAD.right - 16,
                )
              "
              :y="Math.max(coords[peak].y - 10, 12)"
              text-anchor="middle"
              fill="var(--ink)"
              style="font-size: 11px; font-weight: 600"
            >
              {{ format(coords[peak].value) }}
            </text>
          </g>

          <g v-if="active >= 0 && coords[active]">
            <line
              :x1="coords[active].x"
              :x2="coords[active].x"
              :y1="PAD.top"
              :y2="PAD.top + plot.h"
              stroke="var(--border)"
              stroke-width="1"
            />
            <circle
              :cx="coords[active].x"
              :cy="coords[active].y"
              r="5"
              fill="var(--primary)"
              stroke="var(--surface)"
              stroke-width="2"
            />
          </g>
        </template>

        <g>
          <text
            v-for="(item, index) in points"
            v-show="ticks.has(index)"
            :key="item.label + index"
            :x="labelX(coords[index]?.x || 0)"
            :y="canvas - 8"
            text-anchor="middle"
            fill="var(--muted)"
            style="font-size: 11px; font-variant-numeric: tabular-nums"
          >
            {{ item.label }}
          </text>
        </g>
      </svg>

      <p
        v-if="empty"
        class="absolute inset-0 grid place-items-center text-caption text-muted"
      >
        Sem dados neste período.
      </p>

      <div
        v-if="active >= 0 && points[active] && !empty"
        class="pointer-events-none absolute z-1 -translate-x-1/2 rounded-md border border-line bg-surface px-2.5 py-1.5 shadow-card"
        :style="{
          left:
            Math.min(Math.max(coords[active]?.x || 0, 60), width - 60) + 'px',
          top: '6px',
        }"
      >
        <strong class="block text-caption">{{ points[active].label }}</strong>
        <span class="block text-caption text-muted">{{
          format(points[active].value)
        }}</span>
      </div>
    </div>

    <!-- Equivalente em tabela: nenhum valor existe só na dica. -->
    <details class="mt-2">
      <summary
        class="cursor-pointer list-none text-caption text-muted [&::-webkit-details-marker]:hidden"
      >
        Ver tabela
      </summary>
      <div class="table-scroll mt-2">
        <table class="data-table">
          <thead>
            <tr>
              <th scope="col">Período</th>
              <th scope="col">{{ unit }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in points" :key="item.label + index">
              <th scope="row">{{ item.label }}</th>
              <td class="tabular">{{ format(item.value) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </details>
  </figure>
</template>
