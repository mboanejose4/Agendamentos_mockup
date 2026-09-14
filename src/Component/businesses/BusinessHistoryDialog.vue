<script setup>
import { computed } from "vue";
import AppModal from "@/Component/ui/AppModal.vue";
import { state, money, dateLabel } from "@/Store/applicationStore.js";
const props = defineProps({ subject: Object });
const open = defineModel({ type: Boolean, default: false });
const rows = computed(() =>
  state.db.bookings
    .filter(
      (b) =>
        b.businessId === state.businessId &&
        (props.subject?.type === "client"
          ? b.clientId === props.subject.id
          : b.staffId === props.subject?.id),
    )
    .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time)),
);
const names = {
  confirmed: "Confirmado",
  in_progress: "Em atendimento",
  completed: "Concluído",
  cancelled: "Cancelado",
  no_show: "Não compareceu",
};
</script>
<template>
  <AppModal
    v-model="open"
    :title="'Histórico · ' + (subject?.name || '')"
    :width="900"
    ><p class="mb-4 text-small text-muted">
      {{ rows.length }} marcações neste estabelecimento
    </p>
    <div v-if="rows.length" class="table-scroll">
      <table class="data-table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Cliente</th>
            <th>Profissional</th>
            <th>Serviço</th>
            <th>Estado</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.id">
            <td>
              {{ dateLabel(row.date)
              }}<small class="ml-1.5 text-muted">{{ row.time }}</small>
            </td>
            <td>{{ row.clientName }}</td>
            <td>
              {{
                state.db.staff.find((p) => p.id === row.staffId)?.name || "—"
              }}
            </td>
            <td>
              {{
                state.db.services.find((s) => s.id === row.serviceId)?.name ||
                "Serviço removido"
              }}
            </td>
            <td>{{ names[row.status] || row.status }}</td>
            <td>{{ money(row.total) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else class="empty-state">
      Ainda não existem marcações neste histórico.
    </p></AppModal
  >
</template>
