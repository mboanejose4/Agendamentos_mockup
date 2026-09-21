<script setup lang="ts">
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import InsightCard from "@/components/shared/analytics/InsightCard.vue";
import { plural } from "@/utils/formatters.ts";
import { usePlatformManagementContext } from "@/composables/platform/platformContext.ts";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
const {
  state,
  business,
  businesses,
  totalBookings,
  dateTime,
  logSearch,
  logBusiness,
  filteredLogs,
  localStorageSize,
  validationIssues,
} = usePlatformManagementContext();
</script>
<template>
  <div>
    <div
      class="mb-6 flex flex-wrap items-start gap-3 rounded-4xl bg-surface-muted p-4 sm:flex-nowrap sm:items-center"
    >
      <AppIcon name="database" class="shrink-0 text-muted" />
      <div class="min-w-0 flex-1">
        <strong class="block text-small text-ink">Dados deste navegador</strong>
        <p class="mt-1 text-caption leading-relaxed text-muted">
          As métricas e os registos reflectem a actividade guardada neste
          dispositivo.
        </p>
      </div>
      <span
        :class="[
          'badge',
          validationIssues.length ? 'badge-warning' : 'badge-success',
        ]"
        >{{
          validationIssues.length ? "Requer atenção" : "Dados consistentes"
        }}</span
      >
    </div>
    <div class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <InsightCard
        label="Registos de actividade"
        :value="String(state.db.logs.length)"
        icon="history"
        :detail="
          filteredLogs.length === state.db.logs.length
            ? 'todas as operações guardadas'
            : `${filteredLogs.length} visíveis com os filtros actuais`
        "
        tone="primary"
      />
      <InsightCard
        label="Agendamentos"
        :value="String(state.db.bookings.length)"
        icon="calendar-days"
        :detail="`${totalBookings.length} activos · ${plural(state.db.bookings.length - totalBookings.length, 'cancelado', 'cancelados')}`"
        tone="blue"
      />
      <InsightCard
        label="Dados armazenados"
        :value="`${(localStorageSize / 1024).toFixed(1)} KB`"
        icon="database"
        :detail="`${plural(
          state.db.businesses.length +
            state.db.users.length +
            state.db.bookings.length +
            state.db.logs.length,
          'registo guardado',
          'registos guardados',
        )} neste navegador`"
        tone="amber"
      />
      <InsightCard
        label="Inconsistências"
        :value="String(validationIssues.length)"
        icon="circle-alert"
        :detail="
          validationIssues.length
            ? 'referências em falta a corrigir'
            : 'nenhuma referência em falta'
        "
        tone="violet"
      />
    </div>
    <div
      v-if="validationIssues.length"
      class="mb-8 flex flex-col gap-3 rounded-4xl border border-line bg-warning-soft p-4"
    >
      <h2 class="mb-0 text-body-lg">Registos a verificar</h2>
      <p
        v-for="item in validationIssues"
        :key="item.id"
        class="flex items-center gap-2 text-caption text-warning"
      >
        <AppIcon name="triangle-alert" :size="16" class="shrink-0" />
        {{ item.text }}
      </p>
    </div>
    <div class="mb-5 flex items-center justify-between gap-4">
      <h2 class="mb-0">Registo de actividade</h2>
    </div>
    <div
      class="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
    >
      <label
        class="flex min-h-11 flex-1 items-center gap-2 rounded-4xl border border-line bg-surface px-3 text-muted sm:min-w-[170px] sm:max-w-[390px]"
        ><AppIcon name="search" /><InputText
          v-model="logSearch"
          placeholder="Pesquisar operação ou utilizador"
          aria-label="Pesquisar registos"
          class="w-full border-0 bg-transparent pl-0 text-caption outline-offset-0"
      /></label>
      <Select
        v-model="logBusiness"
        aria-label="Estabelecimento"
        class="w-full text-caption sm:w-auto"
        :options="[
          { label: 'Todos os estabelecimentos', value: 'all' },
          ...businesses.map((item) => ({ label: item.name, value: item.id })),
        ]"
        option-label="label"
        option-value="value"
        append-to="self"
      />
    </div>
    <div v-if="filteredLogs.length" class="table-scroll">
      <table class="data-table">
        <thead>
          <tr>
            <th>Operação</th>
            <th>Utilizador</th>
            <th>Estabelecimento</th>
            <th>Data e hora</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredLogs" :key="item.id">
            <td>{{ item.action }}</td>
            <td>
              {{
                state.db.users.find((user) => user.id === item.userId)?.name ||
                "Sistema"
              }}
            </td>
            <td>{{ business(item.businessId)?.name || "Plataforma" }}</td>
            <td>{{ dateTime(item.createdAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="empty-state">
      <AppIcon name="activity" />
      <h2>Nenhuma operação encontrada</h2>
      <p>As alterações ficam registadas automaticamente.</p>
    </div>
  </div>
</template>
