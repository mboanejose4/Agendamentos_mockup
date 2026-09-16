<script setup lang="ts">
import { ref } from "vue";
import BusinessHistoryDialog from "@/components/manager/BusinessHistoryDialog.vue";
import type { Client } from "@/types/domain.ts";
const historyOpen = ref(false),
  historySubject = ref<{
    type: "client" | "staff";
    id: string;
    name: string;
  } | null>(null);
function showHistory(item: Client) {
  historySubject.value = { type: "client", id: item.id, name: item.name };
  historyOpen.value = true;
}
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import { useBusinessManagementContext } from "@/composables/businesses/businessContext.ts";
const {
  state,
  clients,
  query,
  bookingForm,
  initials,
  formatDate,
  filteredClients,
  clientStatus,
  toggleActive,
  requestRemoval,
  openBooking,
  exportCsv,
  clientBookings,
  clientLastVisit,
} = useBusinessManagementContext();
</script>
<template>
  <div>
    <div
      class="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
    >
      <label
        class="flex w-full items-center gap-2.5 rounded-md border border-line bg-surface px-3 text-muted sm:max-w-[390px] sm:flex-1"
      >
        <AppIcon name="search" :size="18" />
        <input
          v-model="query"
          placeholder="Pesquisar nome, telefone ou email"
          aria-label="Pesquisar clientes"
          class="w-full border-0 bg-transparent pl-0 text-caption"
        />
      </label>
      <button class="btn btn-secondary" @click="exportCsv('clients')">
        <AppIcon name="download" :size="17" /> Exportar
      </button>
    </div>
    <div v-if="!filteredClients.length" class="empty-state">
      <AppIcon name="contact-round" :size="34" />
      <h3>Nenhum cliente encontrado</h3>
      <p>
        Experimente outra pesquisa. Os clientes aparecem após se associarem à
        empresa através de uma reserva.
      </p>
    </div>
    <div v-else class="table-scroll">
      <table class="data-table">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Contacto</th>
            <th>Estado</th>
            <th>Reservas</th>
            <th>Última visita</th>
            <th><span class="sr-only">Acções</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredClients" :key="item.id">
            <td>
              <div class="flex items-center gap-2.5">
                <span class="avatar">{{ initials(item.name) }}</span>
                <strong>{{ item.name }}</strong>
              </div>
            </td>
            <td>
              <div class="flex flex-col gap-0.5">
                <span>{{ item.phone || "—" }}</span>
                <small class="text-muted">{{ item.email || "—" }}</small>
              </div>
            </td>
            <td>
              <span
                class="badge"
                :class="
                  clientStatus(item.id) === 'active'
                    ? 'badge-success'
                    : 'badge-neutral'
                "
                >{{
                  clientStatus(item.id) === "active" ? "Activo" : "Desactivado"
                }}</span
              >
            </td>
            <td>{{ clientBookings(item.id).length }}</td>
            <td>{{ formatDate(clientLastVisit(item.id)) }}</td>
            <td>
              <div class="flex items-center gap-1">
                <button
                  type="button"
                  class="icon-btn"
                  :aria-label="'Ver histórico de ' + item.name"
                  title="Ver histórico"
                  @click="showHistory(item)"
                >
                  <AppIcon name="history" :size="18" />
                </button>
                <button
                  class="icon-btn"
                  title="Reservar para este cliente"
                  :disabled="clientStatus(item.id) !== 'active'"
                  @click="
                    openBooking();
                    bookingForm.clientId = item.id;
                  "
                >
                  <AppIcon name="calendar-plus" :size="17" />
                </button>
                <button
                  class="icon-btn"
                  :title="
                    clientStatus(item.id) === 'active'
                      ? 'Desactivar cliente'
                      : 'Reactivar cliente'
                  "
                  :aria-label="
                    (clientStatus(item.id) === 'active'
                      ? 'Desactivar '
                      : 'Reactivar ') + item.name
                  "
                  @click="toggleActive('clients', item)"
                >
                  <AppIcon
                    :name="clientStatus(item.id) === 'active' ? 'ban' : 'power'"
                    :size="17"
                  />
                </button>
                <button
                  class="icon-btn icon-btn-danger"
                  title="Remover cliente da empresa"
                  @click="requestRemoval('clients', item)"
                >
                  <AppIcon name="trash-2" :size="17" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <BusinessHistoryDialog v-model="historyOpen" :subject="historySubject" />
  </div>
</template>
