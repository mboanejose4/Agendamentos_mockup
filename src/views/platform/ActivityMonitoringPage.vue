<script setup lang="ts">
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import { usePlatformManagementContext } from "@/composables/platform/platformContext.ts";
const {
  state,
  business,
  businesses,
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
      class="mb-6 flex flex-wrap items-start gap-3 rounded-lg bg-surface-muted p-4 sm:flex-nowrap sm:items-center"
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
    <div
      class="mb-8 grid grid-cols-2 gap-x-4 gap-y-5 sm:gap-x-5 lg:grid-cols-4"
    >
      <div class="min-w-0 border-b border-line py-4 pr-4 sm:py-5 sm:pr-5">
        <span class="text-caption text-muted">Registos de actividade</span
        ><strong
          class="my-2 block text-2xl leading-tight break-words sm:text-[clamp(24px,7vw,28px)]"
          >{{ state.db.logs.length }}</strong
        ><span class="text-caption text-muted">operações guardadas</span>
      </div>
      <div class="min-w-0 border-b border-line py-4 pr-4 sm:py-5 sm:pr-5">
        <span class="text-caption text-muted">Dados armazenados</span
        ><strong
          class="my-2 block text-2xl leading-tight break-words sm:text-[clamp(24px,7vw,28px)]"
          >{{ (localStorageSize / 1024).toFixed(1) }} <small>KB</small></strong
        ><span class="text-caption text-muted">base de dados local</span>
      </div>
      <div class="min-w-0 border-b border-line py-4 pr-4 sm:py-5 sm:pr-5">
        <span class="text-caption text-muted">Agendamentos</span
        ><strong
          class="my-2 block text-2xl leading-tight break-words sm:text-[clamp(24px,7vw,28px)]"
          >{{ state.db.bookings.length }}</strong
        ><span class="text-caption text-muted">incluindo o histórico</span>
      </div>
      <div class="min-w-0 border-b border-line py-4 pr-4 sm:py-5 sm:pr-5">
        <span class="text-caption text-muted">Inconsistências</span
        ><strong
          class="my-2 block text-2xl leading-tight break-words sm:text-[clamp(24px,7vw,28px)]"
          >{{ validationIssues.length }}</strong
        ><span class="text-caption text-muted">referências em falta</span>
      </div>
    </div>
    <div
      v-if="validationIssues.length"
      class="mb-8 flex flex-col gap-3 rounded-lg border border-line bg-warning-soft p-4"
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
        class="flex min-h-11 flex-1 items-center gap-2 rounded-md border border-line bg-surface px-3 text-muted sm:min-w-[170px] sm:max-w-[390px]"
        ><AppIcon name="search" /><input
          v-model="logSearch"
          placeholder="Pesquisar operação ou utilizador"
          aria-label="Pesquisar registos"
          class="w-full border-0 bg-transparent pl-0 text-caption outline-offset-0"
      /></label>
      <select
        v-model="logBusiness"
        aria-label="Estabelecimento"
        class="w-full text-caption sm:w-auto"
      >
        <option value="all">Todos os estabelecimentos</option>
        <option v-for="item in businesses" :key="item.id" :value="item.id">
          {{ item.name }}
        </option>
      </select>
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
