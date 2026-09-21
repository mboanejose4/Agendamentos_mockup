<script setup lang="ts">
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import ViewModeToggle from "@/components/shared/ui/ViewModeToggle.vue";
import { useListMode } from "@/composables/useListMode.ts";
import { useBusinessManagementContext } from "@/composables/businesses/businessContext.ts";
import Select from "primevue/select";
const {
  state,
  money,
  today,
  team,
  selectedDate,
  staffFilter,
  statusFilter,
  statusNames,
  paymentNames,
  serviceName,
  staffName,
  clientName,
  resourceName,
  statusClass,
  formatDate,
  agendaBookings,
  changeDay,
  openBooking,
  inspectBooking,
  exportCsv,
} = useBusinessManagementContext();
const mode = useListMode("agenda");
</script>
<template>
  <div>
    <div
      class="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
    >
      <div class="flex flex-wrap items-center gap-2">
        <button class="icon-btn" title="Dia anterior" @click="changeDay(-1)">
          <AppIcon name="chevron-left" :size="18" />
        </button>
        <input
          v-model="selectedDate"
          type="date"
          aria-label="Dia da agenda"
          class="min-w-0 flex-1"
        />
        <button class="icon-btn" title="Dia seguinte" @click="changeDay(1)">
          <AppIcon name="chevron-right" :size="18" />
        </button>
        <button class="btn btn-secondary" @click="selectedDate = today()">
          Hoje
        </button>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <Select
          v-model="staffFilter"
          aria-label="Filtrar profissional"
          class="w-full sm:w-auto"
          :options="[
            { label: 'Toda a equipa', value: '' },
            ...team.map((person) => ({ label: person.name, value: person.id })),
          ]"
          option-label="label"
          option-value="value"
          append-to="self"
        />
        <Select
          v-model="statusFilter"
          aria-label="Filtrar estado"
          class="w-full sm:w-auto"
          :options="[
            { label: 'Todos os estados', value: '' },
            ...Object.entries(statusNames).map(([value, label]) => ({
              label,
              value,
            })),
          ]"
          option-label="label"
          option-value="value"
          append-to="self"
        />
        <button
          class="icon-btn"
          title="Exportar agenda"
          @click="exportCsv('agenda')"
        >
          <AppIcon name="download" :size="18" />
        </button>
      </div>
      <ViewModeToggle v-model="mode" />
    </div>
    <div class="mb-5 flex flex-wrap items-center justify-between gap-4">
      <h2 class="mb-0">{{ formatDate(selectedDate) }}</h2>
      <span class="text-caption text-muted"
        >{{ agendaBookings.length }}
        {{ agendaBookings.length === 1 ? "reserva" : "reservas" }}</span
      >
    </div>
    <div v-if="!agendaBookings.length" class="empty-state">
      <AppIcon name="calendar-days" :size="36" />
      <h3>Nenhuma reserva para este dia</h3>
      <p>Escolha outra data ou adicione uma nova reserva.</p>
      <button class="btn btn-primary" @click="openBooking()">
        <AppIcon name="plus" :size="17" /> Criar reserva
      </button>
    </div>
    <div v-else-if="mode === 'table'" class="table-scroll">
      <table class="data-table">
        <thead>
          <tr>
            <th scope="col">Hora</th>
            <th scope="col">Serviço</th>
            <th scope="col">Cliente</th>
            <th scope="col">Profissional</th>
            <th scope="col">Estado</th>
            <th scope="col"><span class="sr-only">Acções</span></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in agendaBookings"
            :key="item.id"
            :class="{ 'opacity-60': item.status === 'cancelled' }"
          >
            <th scope="row" class="tabular">
              <span class="block text-ink">{{ item.time }}</span>
              <small class="block text-caption text-muted"
                >{{ item.duration }} min</small
              >
            </th>
            <td>{{ serviceName(item.serviceId) }}</td>
            <td>{{ clientName(item) }}</td>
            <td>
              {{ staffName(item.staffId)
              }}<template v-if="item.resourceId">
                · {{ resourceName(item.resourceId) }}</template
              >
            </td>
            <td>
              <span :class="['badge', `badge-${statusClass(item.status)}`]">{{
                statusNames[item.status]
              }}</span>
            </td>
            <td>
              <button
                class="btn btn-secondary btn-compact"
                @click="inspectBooking(item)"
              >
                Ver
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="flex flex-col gap-4">
      <article
        v-for="item in agendaBookings"
        :key="item.id"
        class="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5"
        :class="{ 'opacity-60': item.status === 'cancelled' }"
      >
        <div
          class="flex shrink-0 flex-row items-center gap-2 sm:w-20 sm:flex-col sm:items-start sm:gap-0.5"
        >
          <strong class="text-body-lg text-ink">{{ item.time }}</strong>
          <span class="text-caption text-muted">{{ item.duration }} min</span>
        </div>
        <button class="min-w-0 flex-1 text-left" @click="inspectBooking(item)">
          <strong class="block text-body text-ink">{{
            serviceName(item.serviceId)
          }}</strong>
          <span class="block text-caption text-muted">{{
            clientName(item)
          }}</span>
          <small class="mt-1 flex items-center gap-1.5 text-caption text-muted">
            <AppIcon name="user-round" :size="13" />
            {{ staffName(item.staffId)
            }}<template v-if="item.resourceId">
              · {{ resourceName(item.resourceId) }}</template
            >
          </small>
        </button>
        <div
          class="flex shrink-0 flex-wrap items-center gap-3 sm:flex-col sm:items-end sm:gap-1.5"
        >
          <span :class="['badge', `badge-${statusClass(item.status)}`]">{{
            statusNames[item.status]
          }}</span>
          <span class="text-small text-ink"
            >{{ money(item.total) }}
            <small
              :class="
                item.paymentStatus === 'paid' ? 'text-success' : 'text-muted'
              "
              >{{ paymentNames[item.paymentStatus] }}</small
            ></span
          >
        </div>
        <button
          class="icon-btn shrink-0"
          title="Ver detalhes da reserva"
          @click="inspectBooking(item)"
        >
          <AppIcon name="chevron-right" :size="19" />
        </button>
      </article>
    </div>
  </div>
</template>
