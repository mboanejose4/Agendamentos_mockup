<script setup lang="ts">
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import StatCard from "@/components/shared/ui/StatCard.vue";
import TrendChart from "@/components/shared/ui/TrendChart.vue";
import { plural } from "@/utils/formatters.ts";
import { useAccountManagementContext } from "@/composables/account/accountContext.ts";

const {
  money,
  dateLabel,
  professional,
  performanceFrom,
  performanceTo,
  performance,
  performanceDelta,
  performanceBuckets,
  performanceByService,
  performanceMaxService,
  performanceClients,
  performanceCommission,
} = useAccountManagementContext();
</script>
<template>
  <div>
    <!-- Uma só linha de filtros, acima de tudo o que ela delimita. -->
    <div
      class="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
    >
      <label class="field mb-0">
        <span>De</span>
        <input v-model="performanceFrom" type="date" :max="performanceTo" />
      </label>
      <label class="field mb-0">
        <span>Até</span>
        <input v-model="performanceTo" type="date" :min="performanceFrom" />
      </label>
      <span class="text-caption text-muted"
        >{{ plural(performance.bookings, "atendimento", "atendimentos") }} no
        período</span
      >
    </div>

    <div class="mt-1 mb-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
      <StatCard
        label="Atendimentos"
        :value="String(performance.bookings)"
        :delta="performanceDelta('bookings')"
      />
      <StatCard
        label="Concluídos"
        :value="String(performance.completed)"
        :delta="performanceDelta('completed')"
      />
      <StatCard
        label="Receita gerada"
        :value="money(performance.revenue)"
        :delta="performanceDelta('revenue')"
      />
      <StatCard
        v-if="professional.independent"
        label="A sua comissão"
        :value="money(performanceCommission)"
        :hint="`${professional.commissionPercent || 0}% do que recebeu`"
      />
      <StatCard
        v-else
        label="Clientes atendidos"
        :value="String(performance.clients)"
        hint="pessoas diferentes"
      />
    </div>

    <div class="mb-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
      <StatCard
        label="Taxa de conclusão"
        :value="`${performance.completionRate}%`"
        hint="dos atendimentos marcados"
      />
      <StatCard
        label="Faltas"
        :value="String(performance.noShow)"
        :hint="`${performance.noShowRate}% do total`"
      />
      <StatCard
        label="Cancelamentos"
        :value="String(performance.cancelled)"
        hint="no período"
      />
      <StatCard
        label="Tempo ocupado"
        :value="`${Math.floor(performance.minutes / 60)}h ${performance.minutes % 60}m`"
        hint="soma da duração dos serviços"
      />
    </div>

    <!-- Duas medidas de grandezas diferentes: dois gráficos, um eixo cada. -->
    <div class="mb-8 grid gap-6 lg:grid-cols-2">
      <TrendChart
        title="Atendimentos ao longo do período"
        unit="Atendimentos"
        :points="
          performanceBuckets.map((b) => ({ label: b.label, value: b.bookings }))
        "
      />
      <TrendChart
        title="Receita ao longo do período"
        unit="Receita"
        :format="money"
        :points="
          performanceBuckets.map((b) => ({ label: b.label, value: b.revenue }))
        "
      />
    </div>

    <section class="mb-8">
      <h2 class="mb-4 text-h3">Os seus serviços mais feitos</h2>
      <div
        v-if="performanceByService.length"
        class="flex flex-col gap-3.5 border-t border-line pt-4"
      >
        <div v-for="item in performanceByService" :key="item.name">
          <div class="mb-1.5 flex items-baseline justify-between gap-4">
            <span class="text-caption">{{ item.name }}</span>
            <span class="text-caption text-muted"
              >{{ plural(item.count, "vez", "vezes") }} ·
              {{ money(item.revenue) }}</span
            >
          </div>
          <div class="h-1.5 w-full rounded-full bg-surface-muted">
            <div
              class="h-1.5 rounded-full bg-primary"
              :style="{
                width: (item.count / performanceMaxService) * 100 + '%',
              }"
            ></div>
          </div>
        </div>
      </div>
      <p v-else class="text-caption text-muted">
        Ainda não há atendimentos neste período.
      </p>
    </section>

    <section>
      <h2 class="mb-4 text-h3">Os clientes que mais o procuram</h2>
      <div v-if="performanceClients.length" class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th scope="col">Cliente</th>
              <th scope="col">Visitas</th>
              <th scope="col">Marcações</th>
              <th scope="col">Receita</th>
              <th scope="col">Última visita</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="person in performanceClients" :key="person.id">
              <th scope="row">{{ person.name }}</th>
              <td class="tabular">{{ person.visits }}</td>
              <td class="tabular">{{ person.bookings }}</td>
              <td class="tabular">{{ money(person.revenue) }}</td>
              <td>
                {{ person.lastVisit ? dateLabel(person.lastVisit) : "—" }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="empty-state">
        <AppIcon name="users" :size="30" />
        Sem clientes atendidos neste período.
      </p>
    </section>
  </div>
</template>
