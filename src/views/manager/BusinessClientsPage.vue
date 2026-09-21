<script setup lang="ts">
import { computed, ref } from "vue";

import AppIcon from "@/components/shared/ui/AppIcon.vue";
import StatCard from "@/components/shared/ui/StatCard.vue";
import BusinessHistoryDialog from "@/components/manager/BusinessHistoryDialog.vue";

import { plural } from "@/utils/formatters.ts";
import type { Client } from "@/types/domain.ts";
import { useBusinessManagementContext } from "@/composables/businesses/businessContext.ts";

import DatePicker from "primevue/datepicker";
import InputText from "primevue/inputtext";
import Select from "primevue/select";

const historyOpen = ref(false);

const historySubject = ref<{
  type: "client" | "staff";
  id: string;
  name: string;
} | null>(null);

function showHistory(item: Client) {
  historySubject.value = {
    type: "client",
    id: item.id,
    name: item.name,
  };

  historyOpen.value = true;
}

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

/*
 * O contexto utiliza datas no formato YYYY-MM-DD.
 * O DatePicker do PrimeVue trabalha com objectos Date.
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

const clientFromDate = computed<Date | null>({
  get: () => parseDate(clientFrom.value),
  set: (value) => {
    clientFrom.value = serializeDate(value);
  },
});

const clientToDate = computed<Date | null>({
  get: () => parseDate(clientTo.value),
  set: (value) => {
    clientTo.value = serializeDate(value);
  },
});

/*
 * As três medidas ordenáveis. A ordenada é assinalada na tabela,
 * em vez de ser repetida numa coluna extra.
 */
const rankColumns = [
  { key: "visits", label: "Visitas" },
  { key: "bookings", label: "Marcações" },
  { key: "revenue", label: "Receita" },
] as const;
</script>

<template>
  <div>
    <!--
      Análise do período: os filtros desta secção não interferem
      com a lista de clientes apresentada mais abaixo.
    -->
    <section class="mb-10">
      <h2 class="mb-1 text-h3">Desempenho dos clientes</h2>

      <p class="mb-5 text-caption text-muted">
        Quem voltou, quem é novo e quem mais o procura no período escolhido.
      </p>

      <div
        class="mb-6 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end"
      >
        <!--
          Intervalo alinhado à esquerda.
          Em mobile, os campos ficam empilhados e ocupam toda a largura.
        -->
        <div class="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
          <div class="flex w-full flex-col gap-1.5 sm:w-[190px]">
            <label
              for="client-from"
              class="text-caption font-medium text-muted"
            >
              De
            </label>

            <DatePicker
              id="client-from"
              v-model="clientFromDate"
              :max-date="clientToDate ?? undefined"
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
              for="client-to"
              class="text-caption font-medium text-muted"
            >
              Até
            </label>

            <DatePicker
              id="client-to"
              v-model="clientToDate"
              :min-date="clientFromDate ?? undefined"
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

        <span class="text-caption text-muted md:ml-auto md:pb-3">
          {{ plural(clientSummary.bookings, "marcação", "marcações") }}
          de {{ plural(clientSegments.active, "cliente", "clientes") }}
        </span>
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

      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 class="text-body font-medium">
          Os clientes que mais o procuram
        </h3>

        <label class="flex items-center gap-2 text-caption text-muted">
          Ordenar por

          <Select
            v-model="clientRankBy"
            class="!rounded-4xl text-caption"
            :options="[
              { label: 'Visitas', value: 'visits' },
              { label: 'Marcações', value: 'bookings' },
              { label: 'Receita', value: 'revenue' },
            ]"
            option-label="label"
            option-value="value"
            append-to="self"
          />
        </label>
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
                  clientRankBy === column.key
                    ? 'descending'
                    : undefined
                "
                :class="
                  clientRankBy === column.key
                    ? 'text-ink'
                    : ''
                "
              >
                {{ column.label }}

                <AppIcon
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
            <tr
              v-for="(person, index) in clientRanking"
              :key="person.id"
            >
              <td class="tabular text-muted">
                {{ index + 1 }}
              </td>

              <th scope="row">
                <span class="block">
                  {{ person.name }}
                </span>

                <span
                  class="mt-1 block h-1.5 max-w-[140px] rounded-full bg-surface-muted"
                >
                  <span
                    class="block h-1.5 rounded-full bg-primary"
                    :style="{
                      width:
                        (person[clientRankBy] / maxClientRank) * 100 +
                        '%',
                    }"
                  />
                </span>
              </th>

              <td class="tabular">{{ person.visits }}</td>
              <td class="tabular">{{ person.bookings }}</td>
              <td class="tabular">{{ money(person.revenue) }}</td>
              <td class="tabular">{{ person.noShow }}</td>

              <td>
                {{
                  person.lastVisit
                    ? dateLabel(person.lastVisit)
                    : "—"
                }}
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
        class="flex w-full items-center gap-2.5 rounded-4xl border border-line bg-surface px-3 text-muted sm:max-w-[390px] sm:flex-1"
      >
        <AppIcon name="search" :size="18" />

        <InputText
          v-model="query"
          placeholder="Pesquisar nome, telefone ou email"
          aria-label="Pesquisar clientes"
          class="w-full border-0 bg-transparent pl-0 text-caption"
        />
      </label>

      <button
        type="button"
        class="btn btn-secondary"
        @click="exportCsv('clients')"
      >
        <AppIcon name="download" :size="17" />
        Exportar
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

            <th>
              <span class="sr-only">Acções</span>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="item in filteredClients" :key="item.id">
            <td>
              <div class="flex items-center gap-2.5">
                <span class="avatar">
                  {{ initials(item.name) }}
                </span>

                <strong>{{ item.name }}</strong>
              </div>
            </td>

            <td>
              <div class="flex flex-col gap-0.5">
                <span>{{ item.phone || "—" }}</span>

                <small class="text-muted">
                  {{ item.email || "—" }}
                </small>
              </div>
            </td>

            <td>
              <span
                :class="[
                  'badge rounded-4xl',
                  clientStatus(item.id) === 'active'
                    ? 'badge-success'
                    : 'badge-neutral',
                ]"
              >
                {{
                  clientStatus(item.id) === "active"
                    ? "Activo"
                    : "Desactivado"
                }}
              </span>
            </td>

            <td>{{ clientBookings(item.id).length }}</td>

            <td>
              {{ formatDate(clientLastVisit(item.id)) }}
            </td>

            <td>
              <div class="flex items-center gap-1">
                <button
                  type="button"
                  class="icon-btn"
                  :aria-label="`Ver histórico de ${item.name}`"
                  title="Ver histórico"
                  @click="showHistory(item)"
                >
                  <AppIcon name="history" :size="18" />
                </button>

                <button
                  type="button"
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
                  type="button"
                  class="icon-btn"
                  :title="
                    clientStatus(item.id) === 'active'
                      ? 'Desactivar cliente'
                      : 'Reactivar cliente'
                  "
                  :aria-label="
                    `${
                      clientStatus(item.id) === 'active'
                        ? 'Desactivar'
                        : 'Reactivar'
                    } ${item.name}`
                  "
                  @click="toggleActive('clients', item)"
                >
                  <AppIcon
                    :name="
                      clientStatus(item.id) === 'active'
                        ? 'ban'
                        : 'power'
                    "
                    :size="17"
                  />
                </button>

                <button
                  type="button"
                  class="icon-btn icon-btn-danger"
                  title="Remover cliente da empresa"
                  :aria-label="`Remover ${item.name} da empresa`"
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

    <BusinessHistoryDialog
      v-model="historyOpen"
      :subject="historySubject"
    />
  </div>
</template>