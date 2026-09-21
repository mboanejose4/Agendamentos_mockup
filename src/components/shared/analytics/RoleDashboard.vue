<script setup lang="ts">
import { computed, ref } from "vue";
import InsightCard from "@/components/shared/analytics/InsightCard.vue";
import ComparisonChart from "@/components/shared/analytics/ComparisonChart.vue";
import DistributionChart from "@/components/shared/analytics/DistributionChart.vue";
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import { state, today } from "@/stores/applicationStore.ts";
import Select from "primevue/select";
import { money } from "@/utils/formatters.ts";
import {
  activeBookingValue,
  bookingComparison,
  completedBookingValue,
  paidBookingValue,
  shiftDashboardDate,
} from "@/utils/dashboardAnalytics.ts";
import type { Booking, Role } from "@/types/domain.ts";

const props = defineProps<{ role: Role; anchor?: string }>();
const days = ref(props.role === "client" ? 28 : 7);
const endDate = computed(() => props.anchor || today());
const periodLabel = computed(() => {
  if (props.role === "professional" && props.anchor && props.anchor !== today())
    return days.value === 7
      ? "nos 7 dias até à data escolhida"
      : "nas 4 semanas até à data escolhida";
  return days.value === 7 ? "nos últimos 7 dias" : "nas últimas 4 semanas";
});
const comparisonLabel = computed(() =>
  days.value === 7 ? "vs 7 dias anteriores" : "vs 4 semanas anteriores",
);
const scopedBookings = computed(() => {
  if (props.role === "manager")
    return state.db.bookings.filter(
      (item) => item.businessId === state.businessId,
    );
  if (props.role === "professional")
    return state.db.bookings.filter(
      (item) =>
        item.businessId === state.businessId && item.staffId === state.staffId,
    );
  if (props.role === "client") {
    const email = state.db.users.find(
      (user) => user.id === state.userId,
    )?.email;
    const ids = new Set([
      state.userId,
      ...state.db.clients
        .filter((client) => email && client.email === email)
        .map((client) => client.id),
    ]);
    return state.db.bookings.filter((item) => ids.has(item.clientId));
  }
  return state.db.bookings;
});
const seriesFor = (value: (booking: Booking) => number) =>
  bookingComparison(
    scopedBookings.value,
    endDate.value,
    days.value,
    days.value === 7 ? 7 : 4,
    value,
  );

const periodOptions = [
  { label: "7 dias", value: 7 },
  { label: "4 semanas", value: 28 },
];

const bookings = computed(() => seriesFor(activeBookingValue));
const completed = computed(() => seriesFor(completedBookingValue));
const paid = computed(() => seriesFor(paidBookingValue));
const pending = computed(() =>
  seriesFor((item) =>
    item.status !== "cancelled" && item.paymentStatus === "pending" ? 1 : 0,
  ),
);
const cancelled = computed(() =>
  seriesFor((item) => (item.status === "cancelled" ? 1 : 0)),
);
const noShow = computed(() =>
  seriesFor((item) => (item.status === "no_show" ? 1 : 0)),
);
const number = (value: number) => new Intl.NumberFormat("pt-MZ").format(value);
type Card = {
  label: string;
  value: string;
  icon: string;
  detail: string;
  current?: number;
  previous?: number;
  tone?: "primary" | "blue" | "amber" | "violet";
};
const periodCard = (
  label: string,
  icon: string,
  current: number,
  previous: number,
  tone: Card["tone"] = "primary",
  format = number,
): Card => ({
  label,
  icon,
  value: format(current),
  current,
  previous,
  tone,
  detail: periodLabel.value,
});
const cards = computed<Card[]>(() => {
  const activeBusinesses = state.db.businesses.filter((item) => item.active);
  if (props.role === "guest")
    return [
      {
        label: "Estabelecimentos activos",
        value: number(activeBusinesses.length),
        icon: "building-2",
        detail: "disponíveis neste protótipo",
        tone: "primary",
      },
      {
        label: "Serviços disponíveis",
        value: number(
          state.db.services.filter(
            (item) =>
              item.active &&
              activeBusinesses.some(
                (company) => company.id === item.businessId,
              ),
          ).length,
        ),
        icon: "scissors",
        detail: "em empresas activas",
        tone: "blue",
      },
      periodCard(
        "Marcações",
        "calendar-days",
        bookings.value.currentTotal,
        bookings.value.previousTotal,
        "amber",
      ),
      {
        label: "Áreas de serviço",
        value: number(
          new Set(activeBusinesses.map((item) => item.category)).size,
        ),
        icon: "grid-2x2",
        detail: "categorias para explorar",
        tone: "violet",
      },
    ];
  if (props.role === "client") {
    const upcoming = scopedBookings.value.filter(
      (item) =>
        ["confirmed", "in_progress"].includes(item.status) &&
        new Date(`${item.date}T${item.time}`).getTime() >= Date.now(),
    );
    return [
      {
        label: "Próximas marcações",
        value: number(upcoming.length),
        icon: "calendar-clock",
        detail: "a partir de hoje",
        tone: "primary",
      },
      periodCard(
        "Concluídas",
        "check-check",
        completed.value.currentTotal,
        completed.value.previousTotal,
        "blue",
      ),
      periodCard(
        "Valor pago",
        "wallet",
        paid.value.currentTotal,
        paid.value.previousTotal,
        "amber",
        money,
      ),
      periodCard(
        "Canceladas",
        "circle-x",
        cancelled.value.currentTotal,
        cancelled.value.previousTotal,
        "violet",
      ),
    ];
  }
  if (props.role === "professional")
    return [
      periodCard(
        "Atendimentos",
        "calendar-days",
        bookings.value.currentTotal,
        bookings.value.previousTotal,
      ),
      periodCard(
        "Concluídos",
        "check-check",
        completed.value.currentTotal,
        completed.value.previousTotal,
        "blue",
      ),
      periodCard(
        "Por receber",
        "clock-3",
        pending.value.currentTotal,
        pending.value.previousTotal,
        "amber",
      ),
      periodCard(
        "Valor pago",
        "wallet",
        paid.value.currentTotal,
        paid.value.previousTotal,
        "violet",
        money,
      ),
    ];
  if (props.role === "manager")
    return [
      periodCard(
        "Reservas",
        "calendar-days",
        bookings.value.currentTotal,
        bookings.value.previousTotal,
      ),
      periodCard(
        "Concluídas",
        "check-check",
        completed.value.currentTotal,
        completed.value.previousTotal,
        "blue",
      ),
      periodCard(
        "Valor pago",
        "wallet",
        paid.value.currentTotal,
        paid.value.previousTotal,
        "amber",
        money,
      ),
      periodCard(
        "Por receber",
        "clock-3",
        pending.value.currentTotal,
        pending.value.previousTotal,
        "violet",
      ),
    ];
  return [
    {
      label: "Empresas activas",
      value: number(activeBusinesses.length),
      icon: "building-2",
      detail: `de ${state.db.businesses.length} registadas`,
      tone: "primary",
    },
    periodCard(
      "Marcações",
      "calendar-days",
      bookings.value.currentTotal,
      bookings.value.previousTotal,
      "blue",
    ),
    periodCard(
      "Valor pago",
      "wallet",
      paid.value.currentTotal,
      paid.value.previousTotal,
      "amber",
      money,
    ),
    periodCard(
      "Faltas",
      "user-x",
      noShow.value.currentTotal,
      noShow.value.previousTotal,
      "violet",
    ),
  ];
});
const periodBookings = computed(() => {
  const start = shiftDashboardDate(endDate.value, -days.value + 1);
  return scopedBookings.value.filter(
    (item) => item.date >= start && item.date <= endDate.value,
  );
});
const segments = computed(() => {
  if (props.role === "guest" || props.role === "platform")
    return [
      ...new Set(
        state.db.businesses
          .filter((item) => item.active)
          .map((item) => item.category),
      ),
    ]
      .map((category) => ({
        label: category,
        value: state.db.businesses.filter(
          (item) => item.active && item.category === category,
        ).length,
      }))
      .sort((a, b) => b.value - a.value);
  return [
    {
      label: "Confirmadas",
      value: periodBookings.value.filter((item) => item.status === "confirmed")
        .length,
    },
    {
      label: "Em atendimento",
      value: periodBookings.value.filter(
        (item) => item.status === "in_progress",
      ).length,
    },
    {
      label: "Concluídas",
      value: periodBookings.value.filter((item) => item.status === "completed")
        .length,
    },
    {
      label: "Faltas",
      value: periodBookings.value.filter((item) => item.status === "no_show")
        .length,
    },
    {
      label: "Canceladas",
      value: periodBookings.value.filter((item) => item.status === "cancelled")
        .length,
    },
  ].filter((item) => item.value > 0);
});
const title = computed(
  () =>
    ({
      guest: "A plataforma em números",
      client: "O seu histórico em perspectiva",
      professional: "O seu desempenho pessoal",
      manager: "Desempenho geral da empresa",
      platform: "Visão da plataforma",
    })[props.role],
);
const chartTitle = computed(() =>
  props.role === "professional" ? "Ritmo da agenda" : "Evolução das marcações",
);
const note = computed(() => {
  if (props.role === "manager")
    return `${pending.value.currentTotal} reservas por receber ${periodLabel.value}. Consulte os pagamentos e a agenda para decidir os próximos contactos.`;
  if (props.role === "professional")
    return `${pending.value.currentTotal} atendimentos com pagamento pendente ${periodLabel.value}. Verifique os detalhes antes de fechar o dia.`;
  if (props.role === "client")
    return `${completed.value.currentTotal} atendimentos concluídos ${periodLabel.value}. Compare o valor pago e os cancelamentos com o período anterior.`;
  if (props.role === "platform")
    return `${noShow.value.currentTotal} faltas ${periodLabel.value}. Compare a actividade com o período anterior antes de ajustar a operação.`;
  return "Estes números vêm dos dados de demonstração guardados neste navegador; compare os sectores antes de escolher onde explorar.";
});
</script>

<template>
  <section class="mb-10" :aria-label="title">
    <div class="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <span class="eyebrow">ANÁLISE COMPARATIVA</span>
        <h2 class="mb-1 text-h2">{{ title }}</h2>
        <p class="text-caption text-muted">
          Dados por data da marcação · {{ comparisonLabel }}.
        </p>
      </div>
      <div class="flex items-center gap-2 text-caption text-muted">
        <label for="analytics-period"> Período </label>

        <Select
          v-model="days"
          input-id="analytics-period"
          :options="periodOptions"
          option-label="label"
          option-value="value"
          aria-label="Período da análise"
          append-to="body"
          overlay-class="analytics-period-overlay"
          class="analytics-period-select !min-h-10 !rounded-4xl"
        />
      </div>
    </div>
    <div class="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <InsightCard
        v-for="card in cards"
        :key="card.label"
        v-bind="card"
        :comparison-label="comparisonLabel"
      />
    </div>
    <div
      class="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]"
    >
      <ComparisonChart
        :title="chartTitle"
        :description="`${periodLabel} comparados com um período da mesma duração`"
        :series="bookings"
        current-label="Período actual"
        previous-label="Período anterior"
        unit="marcações"
      />
      <DistributionChart
        :title="
          role === 'guest' || role === 'platform'
            ? 'Sectores activos'
            : 'Estado das marcações'
        "
        :description="
          role === 'guest' || role === 'platform'
            ? 'Distribuição das empresas activas'
            : `Distribuição ${periodLabel}`
        "
        :segments="segments"
        :total-label="
          role === 'guest' || role === 'platform' ? 'empresas' : 'marcações'
        "
      />
    </div>
    <p
      class="mt-4 flex items-start gap-2 rounded-4xl border border-line bg-soft px-4 py-3 text-caption text-ink"
    >
      <AppIcon
        name="info"
        :size="18"
        class="mt-0.5 shrink-0 text-primary-text"
      />{{ note }}
    </p>
  </section>
  <slot :days="days" />
</template>

<style scoped>
/* Select do periodo: cores pelos tokens partilhados, iguais em ambos os
   temas sem um bloco de modo escuro a repetir a folha com outros cinzentos. */
.analytics-period-select {
  min-width: 130px;
  border: 1px solid var(--field-border) !important;
  border-radius: 2rem !important;
  background: var(--field-bg) !important;
  color: var(--field-ink) !important;
  box-shadow: none !important;
}

.analytics-period-select :deep(.p-select-label) {
  color: var(--field-ink) !important;
}

.analytics-period-select :deep(.p-select-dropdown) {
  color: var(--muted) !important;
}

/* Foco */
.analytics-period-select.p-focus {
  border-color: var(--primary) !important;
  box-shadow: 0 0 0 1px var(--primary) !important;
}
</style>
