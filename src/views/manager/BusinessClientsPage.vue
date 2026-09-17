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
import StatCard from "@/components/shared/ui/StatCard.vue";
import { plural } from "@/utils/formatters.ts";
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
  money,
  dateLabel,
  clientFrom,
  clientTo,
  clientRankBy,
  clientSegments,
  clientSummary,
  clientDelta,
  clientRanking,
  maxClientRank,
} = useBusinessManagementContext();

/* As três medidas ordenáveis. A ordenada é assinalada na tabela, em vez de
   repetida numa coluna extra. */
const rankColumns = [
  { key: "visits", label: "Visitas" },
  { key: "bookings", label: "Marcações" },
  { key: "revenue", label: "Receita" },
] as const;
</script>
<template>
  <div>
    <!-- Análise do período: os filtros desta secção não mexem na lista
         de clientes que vem mais abaixo. -->
    <section class="mb-10">
      <h2 class="mb-1 text-h3">Desempenho dos clientes</h2>
      <p class="mb-5 text-caption text-muted">
        Quem voltou, quem é novo e quem mais o procura no período escolhido.
      </p>

      <div
        class="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
      >
        <label class="field mb-0">
          <span>De</span>
          <input v-model="clientFrom" type="date" :max="clientTo" />
        </label>
        <label class="field mb-0">
          <span>Até</span>
          <input v-model="clientTo" type="date" :min="clientFrom" />
        </label>
        <span class="text-caption text-muted"
          >{{ plural(clientSummary.bookings, "marcação", "marcações") }} de
          {{ plural(clientSegments.active, "cliente", "clientes") }}</span
        >
      </div>

      <div class="mt-1 mb-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
        <StatCard
          label="Clientes activos"
          :value="String(clientSegments.active)"
          :delta="clientDelta('active')"
        />
        <StatCard
          label="Novos clientes"
          :value="String(clientSegments.fresh)"
          :delta="clientDelta('fresh')"
        />
        <StatCard
          label="Clientes que voltaram"
          :value="String(clientSegments.returning)"
          :delta="clientDelta('returning')"
        />
        <StatCard
          label="Taxa de regresso"
          :value="`${clientSegments.returnRate}%`"
          hint="dos activos já eram conhecidos"
        />
      </div>

      <div class="mb-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
        <StatCard
          label="Mais de uma visita"
          :value="String(clientSegments.loyal)"
          hint="clientes com duas ou mais marcações"
        />
        <StatCard
          label="Sem voltar"
          :value="String(clientSegments.dormant)"
          hint="conhecidos que não vieram no período"
        />
        <StatCard
          label="Ticket médio"
          :value="money(clientSummary.ticket)"
          hint="por marcação contabilizada"
        />
        <StatCard
          label="Faltas"
          :value="String(clientSummary.noShow)"
          :hint="`${clientSummary.noShowRate}% do total marcado`"
        />
      </div>

      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 class="text-body font-medium">Os clientes que mais o procuram</h3>
        <label class="flex items-center gap-2 text-caption text-muted"
          >Ordenar por
          <select
            v-model="clientRankBy"
            class="border-0 bg-transparent px-[3px] py-[7px] text-caption"
          >
            <option value="visits">Visitas</option>
            <option value="bookings">Marcações</option>
            <option value="revenue">Receita</option>
          </select></label
        >
      </div>

      <div v-if="clientRanking.length" class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Cliente</th>
              <th
                v-for="column in rankColumns"
                :key="column.key"
                scope="col"
                :aria-sort="
                  clientRankBy === column.key ? 'descending' : undefined
                "
                :class="clientRankBy === column.key ? 'text-ink' : ''"
              >
                {{ column.label
                }}<AppIcon
                  v-if="clientRankBy === column.key"
                  name="chevron-down"
                  :size="13"
                  class="ml-1 inline align-[-2px]"
                />
              </th>
              <th scope="col">Faltas</th>
              <th scope="col">Última visita</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(person, index) in clientRanking" :key="person.id">
              <td class="tabular text-muted">{{ index + 1 }}</td>
              <th scope="row">
                <span class="block">{{ person.name }}</span>
                <span
                  class="mt-1 block h-1.5 max-w-[140px] rounded-full bg-surface-muted"
                  ><span
                    class="block h-1.5 rounded-full bg-primary"
                    :style="{
                      width: (person[clientRankBy] / maxClientRank) * 100 + '%',
                    }"
                  ></span
                ></span>
              </th>
              <td class="tabular">{{ person.visits }}</td>
              <td class="tabular">{{ person.bookings }}</td>
              <td class="tabular">{{ money(person.revenue) }}</td>
              <td class="tabular">{{ person.noShow }}</td>
              <td>
                {{ person.lastVisit ? dateLabel(person.lastVisit) : "—" }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="text-caption text-muted">
        Sem marcações de clientes neste período.
      </p>
    </section>

    <h2 class="mb-5 text-h3">Todos os clientes</h2>
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
