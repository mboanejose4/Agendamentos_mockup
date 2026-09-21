<script setup lang="ts">
import { computed } from "vue";

import AppIcon from "@/components/shared/ui/AppIcon.vue";
import StatCard from "@/components/shared/ui/StatCard.vue";
import TrendChart from "@/components/shared/ui/TrendChart.vue";

import { plural } from "@/utils/formatters.ts";
import { useBusinessManagementContext } from "@/composables/businesses/businessContext.ts";

import DatePicker from "primevue/datepicker";

const {
  money,
  reportFrom,
  reportTo,
  initials,
  reportBookings,
  reportRevenue,
  reportCompleted,
  reportCancelled,
  reportByService,
  reportByStaff,
  maxServiceCount,
  reportBuckets,
  reportSummary,
  reportDelta,
} = useBusinessManagementContext();

/*
 * O contexto guarda as datas no formato YYYY-MM-DD,
 * enquanto o DatePicker do PrimeVue utiliza objectos Date.
 */
function parseDate(value: string): Date | null {
  if (!value) return null;

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
}

function serializeDate(value: Date | null): string {
  if (!value) return "";

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const reportFromDate = computed<Date | null>({
  get: () => parseDate(reportFrom.value),
  set: (value) => {
    reportFrom.value = serializeDate(value);
  },
});

const reportToDate = computed<Date | null>({
  get: () => parseDate(reportTo.value),
  set: (value) => {
    reportTo.value = serializeDate(value);
  },
});
</script>

<template>
  <div>
    <div
      class="mb-6 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end"
    >
      <!-- Datas alinhadas à esquerda em tablets e desktop -->
      <div class="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
        <div class="flex w-full flex-col gap-1.5 sm:w-[190px]">
          <label
            for="report-from"
            class="text-caption font-medium text-muted"
          >
            De
          </label>

          <DatePicker
            id="report-from"
            v-model="reportFromDate"
            :max-date="reportToDate ?? undefined"
            date-format="dd/mm/yy"
            placeholder="Data inicial"
            show-icon
            icon-display="input"
            fluid
            class="w-full"
            input-class="!rounded-4xl text-caption"
          />
        </div>

        <div class="flex w-full flex-col gap-1.5 sm:w-[190px]">
          <label
            for="report-to"
            class="text-caption font-medium text-muted"
          >
            Até
          </label>

          <DatePicker
            id="report-to"
            v-model="reportToDate"
            :min-date="reportFromDate ?? undefined"
            date-format="dd/mm/yy"
            placeholder="Data final"
            show-icon
            icon-display="input"
            fluid
            class="w-full"
            input-class="!rounded-4xl text-caption"
          />
        </div>
      </div>

      <!-- Resumo alinhado à direita em tablets e desktop -->
      <span class="text-caption text-muted md:ml-auto md:pb-3">
        {{ plural(reportBookings.length, "reserva", "reservas") }}
        no período
      </span>
    </div>

    <div class="mt-1 mb-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
      <StatCard
        label="Receita recebida"
        :value="money(reportRevenue)"
        :delta="reportDelta('revenue')"
      />

      <StatCard
        label="Atendimentos"
        :value="String(reportCompleted)"
        :delta="reportDelta('completed')"
      />

      <StatCard
        label="Valor médio pago"
        :value="money(reportSummary.ticket)"
        :delta="reportDelta('ticket')"
      />

      <StatCard
        label="Cancelamentos"
        :value="String(reportCancelled)"
        :hint="`${
          reportBookings.length
            ? Math.round(
                (reportCancelled / reportBookings.length) * 100,
              )
            : 0
        }% das reservas do período`"
      />
    </div>

    <!--
      Reservas e receita têm grandezas diferentes:
      são apresentados em dois gráficos separados.
    -->
    <div class="mb-10 grid gap-6 lg:grid-cols-2">
      <TrendChart
        title="Reservas ao longo do período"
        unit="Reservas"
        :points="
          reportBuckets.map((bucket) => ({
            label: bucket.label,
            value: bucket.bookings,
          }))
        "
      />

      <TrendChart
        title="Receita ao longo do período"
        unit="Receita"
        :format="money"
        :points="
          reportBuckets.map((bucket) => ({
            label: bucket.label,
            value: bucket.revenue,
          }))
        "
      />
    </div>

    <section class="mb-10">
      <div class="mb-5 flex flex-wrap items-center justify-between gap-4">
        <h2 class="mb-0">Serviços mais procurados</h2>

        <span class="text-caption text-muted">
          Reservas válidas
        </span>
      </div>

      <div
        v-if="!reportByService.length"
        class="empty-state py-8"
      >
        <AppIcon
          name="chart-no-axes-combined"
          :size="32"
        />

        <h3>Sem reservas neste período</h3>

        <p>Altere as datas para consultar outro período.</p>
      </div>

      <template v-else>
        <div
          v-for="item in reportByService"
          :key="item.id"
          class="flex items-center gap-4 border-b border-line py-3 last:border-b-0"
        >
          <div class="w-28 shrink-0 sm:w-44">
            <strong class="block truncate text-small">
              {{ item.name }}
            </strong>

            <small class="block text-caption text-muted">
              {{ money(item.revenue) }} recebidos
            </small>
          </div>

          <div
            class="h-2 flex-1 overflow-hidden rounded-full bg-surface-muted"
          >
            <span
              class="block h-full rounded-full bg-primary"
              :style="{
                width: `${
                  maxServiceCount
                    ? (item.count / maxServiceCount) * 100
                    : 0
                }%`,
              }"
            />
          </div>

          <strong class="w-8 shrink-0 text-right text-small">
            {{ item.count }}
          </strong>
        </div>
      </template>
    </section>

    <section class="mb-10">
      <div class="mb-5 flex flex-wrap items-center justify-between gap-4">
        <h2 class="mb-0">Desempenho da equipa</h2>
      </div>

      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>Profissional</th>
              <th>Reservas</th>
              <th>Concluídas</th>
              <th>Receita recebida</th>
              <th>Comissão a pagar</th>
              <th>Renda mensal do espaço</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="person in reportByStaff"
              :key="person.id"
            >
              <td>
                <div class="flex items-center gap-2.5">
                  <span class="avatar">
                    {{ initials(person.name) }}
                  </span>

                  <strong>{{ person.name }}</strong>
                </div>
              </td>

              <td>{{ person.count }}</td>

              <td>{{ person.completed }}</td>

              <td>{{ money(person.revenue) }}</td>

              <td>
                {{
                  person.independent
                    ? money(person.commission)
                    : "—"
                }}
              </td>

              <td>
                {{
                  person.independent
                    ? money(person.spaceRentalMonthly || 0)
                    : "—"
                }}
              </td>
            </tr>

            <tr v-if="!reportByStaff.length">
              <td colspan="6" class="text-muted">
                Ainda não há membros na equipa.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>