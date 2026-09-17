<script setup lang="ts">
import { computed, ref } from "vue";
import InsightCard from "@/components/shared/analytics/InsightCard.vue";
import ComparisonChart from "@/components/shared/analytics/ComparisonChart.vue";
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import { state, today } from "@/stores/applicationStore.ts";
import { money } from "@/utils/formatters.ts";
import { performanceWindow, teamPeriod } from "@/utils/performanceAnalytics.ts";
import type { ComparisonSeries } from "@/utils/dashboardAnalytics.ts";

/* Vinha com o período do painel da Visão geral; na página da Equipa escolhe-o
   aqui, porque já não há um painel acima que o defina. */
const days = ref(7);
const window = computed(() => performanceWindow(today(), days.value));
const periodName = computed(() =>
  days.value === 7 ? "nos últimos 7 dias" : "nas últimas 4 semanas",
);
const comparisonName = computed(() =>
  days.value === 7 ? "vs 7 dias anteriores" : "vs 4 semanas anteriores",
);
const companyBookings = computed(() =>
  state.db.bookings.filter(
    (booking) => booking.businessId === state.businessId,
  ),
);
const staff = computed(() =>
  state.db.staff.filter(
    (member) =>
      member.businessId === state.businessId &&
      (member.active ||
        companyBookings.value.some(
          (booking) =>
            booking.staffId === member.id &&
            booking.date >= window.value.previousStart &&
            booking.date <= window.value.end,
        )),
  ),
);
const team = computed(() =>
  teamPeriod(companyBookings.value, staff.value, window.value).sort(
    (a, b) =>
      b.visits - a.visits ||
      b.appointments - a.appointments ||
      a.name.localeCompare(b.name),
  ),
);
const currentBookings = computed(() =>
  companyBookings.value.filter(
    (booking) =>
      booking.date >= window.value.start && booking.date <= window.value.end,
  ),
);
const previousBookings = computed(() =>
  companyBookings.value.filter(
    (booking) =>
      booking.date >= window.value.previousStart &&
      booking.date <= window.value.previousEnd,
  ),
);
const withAgenda = (rows: typeof team.value, previous = false) =>
  rows.filter(
    (row) => (previous ? row.previousAppointments : row.appointments) > 0,
  ).length;
const distinctVisited = (rows: typeof currentBookings.value) =>
  new Set(
    rows
      .filter((booking) => booking.status === "completed" && booking.staffId)
      .map(
        (booking) =>
          booking.clientId || booking.clientName.toLocaleLowerCase("pt-MZ"),
      ),
  ).size;
const teamCards = computed(() => [
  {
    label: "Profissionais com marcações",
    value: String(withAgenda(team.value)),
    current: withAgenda(team.value),
    previous: withAgenda(team.value, true),
    icon: "users",
    tone: "primary" as const,
    detail: periodName.value,
  },
  {
    label: "Atendimentos concluídos",
    value: String(team.value.reduce((sum, row) => sum + row.visits, 0)),
    current: team.value.reduce((sum, row) => sum + row.visits, 0),
    previous: team.value.reduce((sum, row) => sum + row.previousVisits, 0),
    icon: "check-check",
    tone: "blue" as const,
    detail: periodName.value,
  },
  {
    label: "Clientes atendidos",
    value: String(distinctVisited(currentBookings.value)),
    current: distinctVisited(currentBookings.value),
    previous: distinctVisited(previousBookings.value),
    icon: "user-round",
    tone: "amber" as const,
    detail: periodName.value,
  },
  {
    label: "Faltas na equipa",
    value: String(team.value.reduce((sum, row) => sum + row.noShows, 0)),
    current: team.value.reduce((sum, row) => sum + row.noShows, 0),
    previous: previousBookings.value.filter(
      (booking) => booking.status === "no_show" && booking.staffId,
    ).length,
    icon: "user-x",
    tone: "violet" as const,
    detail: periodName.value,
  },
]);
const teamSeries = computed<ComparisonSeries>(() => {
  const rows = team.value.slice(0, 8);
  const current = rows.map((row) => row.visits);
  const previous = rows.map((row) => row.previousVisits);
  return {
    labels: rows.map((row) => {
      const parts = row.name.trim().split(/\s+/);
      return parts.length > 1 ? `${parts[0]} ${parts.at(-1)?.[0]}.` : row.name;
    }),
    current,
    previous,
    currentTotal: current.reduce((sum, value) => sum + value, 0),
    previousTotal: previous.reduce((sum, value) => sum + value, 0),
  };
});
</script>

<template>
  <section class="mb-10" aria-labelledby="team-performance-title">
    <div class="mb-5">
      <span class="eyebrow">EQUIPA</span>
      <h2 id="team-performance-title" class="mb-1 text-h2">
        Desempenho da equipa
      </h2>
      <p class="text-caption text-muted">
        Atendimentos atribuídos a cada profissional {{ periodName }} ·
        {{ comparisonName }}.
      </p>
      <div class="mt-3 flex gap-2" role="group" aria-label="Período">
        <button
          v-for="option in [7, 28]"
          :key="option"
          type="button"
          :class="[
            'btn btn-compact',
            days === option ? 'btn-primary' : 'btn-secondary',
          ]"
          :aria-pressed="days === option"
          @click="days = option"
        >
          {{ option === 7 ? "7 dias" : "4 semanas" }}
        </button>
      </div>
    </div>
    <div class="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <InsightCard
        v-for="card in teamCards"
        :key="card.label"
        v-bind="card"
        :comparison-label="comparisonName"
      />
    </div>
    <ComparisonChart
      v-if="team.length"
      class="mb-5"
      title="Atendimentos por profissional"
      :description="
        team.length > 8
          ? 'Visitas concluídas dos 8 profissionais mais activos'
          : 'Visitas concluídas no período actual e no período anterior'
      "
      :series="teamSeries"
      current-label="Período actual"
      previous-label="Período anterior"
      unit="atendimentos"
    />
    <div v-else class="insight-panel mb-5 text-caption text-muted">
      Ainda não existem profissionais com actividade para comparar.
    </div>
    <div v-if="team.length" class="insight-panel">
      <div class="insight-panel__header">
        <div>
          <h3 class="text-body-lg font-semibold">Detalhe da equipa</h3>
          <p>Marcações, visitas concluídas, faltas e pagamentos atribuídos.</p>
        </div>
      </div>
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>Profissional</th>
              <th>Marcações</th>
              <th>Visitas</th>
              <th>Antes</th>
              <th>Faltas</th>
              <th>Valor pago</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="member in team" :key="member.id">
              <td>
                <strong class="text-ink">{{ member.name }}</strong>
              </td>
              <td>{{ member.appointments }}</td>
              <td>{{ member.visits }}</td>
              <td>{{ member.previousVisits }}</td>
              <td>{{ member.noShows }}</td>
              <td>{{ money(member.paid) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
