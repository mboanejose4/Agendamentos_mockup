<script setup>
import { ref } from "vue";
import BusinessHistoryDialog from "@/Component/businesses/BusinessHistoryDialog.vue";
const historyOpen = ref(false),
  historySubject = ref(null);
function showHistory(item) {
  historySubject.value = { type: "client", id: item.id, name: item.name };
  historyOpen.value = true;
}
import AppIcon from "@/Component/ui/AppIcon.vue";
import { useBusinessManagementContext } from "@/Composable/businesses/businessContext.js";
const {
  state,
  clients,
  query,
  bookingForm,
  initials,
  formatDate,
  filteredClients,
  openEditor,
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
      <p>Adicione um cliente ou experimente outra pesquisa.</p>
    </div>
    <div v-else class="table-scroll">
      <table class="data-table">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Contacto</th>
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
                  @click="
                    openBooking();
                    bookingForm.clientId = item.id;
                  "
                >
                  <AppIcon name="calendar-plus" :size="17" />
                </button>
                <button
                  class="icon-btn"
                  title="Editar cliente"
                  @click="openEditor('clients', item)"
                >
                  <AppIcon name="pencil" :size="17" />
                </button>
                <button
                  class="icon-btn icon-btn-danger"
                  title="Eliminar cliente"
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
