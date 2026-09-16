<script setup lang="ts">
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import { useAccountManagementContext } from "@/composables/account/accountContext.ts";
const {
  state,
  money,
  dateLabel,
  service,
  statusNames,
  statusClass,
  search,
  openBooking,
  historySearch,
  historyStatus,
  historyFrom,
  historyTo,
  history,
} = useAccountManagementContext();
</script>
<template>
  <div>
    <div
      class="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
    >
      <label
        class="flex min-w-0 items-center gap-2.5 rounded-md border border-line bg-surface px-3 text-muted sm:max-w-[390px] sm:flex-1"
        ><AppIcon name="search" /><input
          v-model="historySearch"
          placeholder="Pesquisar cliente ou serviço"
          aria-label="Pesquisar histórico"
          class="border-0 bg-transparent pl-0 text-caption"
      /></label>
      <label class="field mb-0"
        >Desde<input
          v-model="historyFrom"
          type="date"
          :max="historyTo || undefined" /></label
      ><label class="field mb-0"
        >Até<input
          v-model="historyTo"
          type="date"
          :min="historyFrom || undefined"
      /></label>
      <select
        v-model="historyStatus"
        aria-label="Estado"
        class="w-full sm:w-auto"
      >
        <option value="all">Todos os estados</option>
        <option value="completed">Concluídos</option>
        <option value="cancelled">Cancelados</option>
        <option value="no_show">Não compareceu</option>
      </select>
    </div>
    <div v-if="history.length" class="table-scroll">
      <table class="data-table">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Serviço</th>
            <th>Data e hora</th>
            <th>Estado</th>
            <th>Valor</th>
            <th><span class="sr-only">Acções</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in history" :key="item.id">
            <td>
              <strong>{{ item.clientName }}</strong>
            </td>
            <td>{{ service(item.serviceId)?.name }}</td>
            <td>
              {{ dateLabel(item.date)
              }}<small class="ml-1.5 text-muted">{{ item.time }}</small>
            </td>
            <td>
              <span :class="['badge', `badge-${statusClass(item.status)}`]">{{
                statusNames[item.status]
              }}</span>
            </td>
            <td>{{ money(item.total) }}</td>
            <td>
              <button
                class="icon-btn"
                title="Ver atendimento"
                aria-label="Ver atendimento"
                @click="openBooking(item)"
              >
                <AppIcon name="arrow-up-right" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="empty-state">
      <AppIcon name="history" />
      <h2>Nenhum atendimento encontrado</h2>
      <p>
        Os atendimentos concluídos, cancelados e as faltas ficam disponíveis
        aqui.
      </p>
    </div>
  </div>
</template>
