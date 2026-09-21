<script setup lang="ts">
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import StatCard from "@/components/shared/ui/StatCard.vue";

import { plural } from "@/utils/formatters.ts";
import { useBusinessManagementContext } from "@/composables/businesses/businessContext.ts";

import InputText from "primevue/inputtext";

const {
  money,
  bookings,
  query,
  paymentFilter,
  paymentNames,
  serviceName,
  clientName,
  statusClass,
  formatDate,
  outstanding,
  paymentBookings,
  inspectBooking,
  collectPayment,
} = useBusinessManagementContext();
</script>

<template>
  <div>
    <!-- KPI Cards padronizados -->
    <div class="mt-1 mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
      <StatCard
        label="Total recebido"
        :value="
          money(
            bookings
              .filter((item) => item.paymentStatus === 'paid')
              .reduce(
                (sum, item) => sum + Number(item.total),
                0,
              ),
          )
        "
        hint="Todos os pagamentos confirmados"
      />

      <StatCard
        label="Por receber"
        :value="
          money(
            outstanding.reduce(
              (sum, item) => sum + Number(item.total),
              0,
            ),
          )
        "
        :hint="
          plural(
            outstanding.length,
            'reserva pendente',
            'reservas pendentes',
          )
        "
      />

      <StatCard
        label="Reembolsado"
        :value="
          money(
            bookings
              .filter(
                (item) => item.paymentStatus === 'refunded',
              )
              .reduce(
                (sum, item) => sum + Number(item.total),
                0,
              ),
          )
        "
        hint="Reservas canceladas e reembolsadas"
      />
    </div>

    <div
      class="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
    >
      <div class="tabs mb-0 border-b-0">
        <button
          type="button"
          :class="{ active: paymentFilter === 'pending' }"
          @click="paymentFilter = 'pending'"
        >
          Por receber
        </button>

        <button
          type="button"
          :class="{ active: paymentFilter === 'paid' }"
          @click="paymentFilter = 'paid'"
        >
          Recebidos
        </button>

        <button
          type="button"
          :class="{ active: paymentFilter === 'refunded' }"
          @click="paymentFilter = 'refunded'"
        >
          Reembolsos
        </button>
      </div>

      <label
        class="flex w-full items-center gap-2.5 rounded-4xl border border-line bg-surface px-3 text-muted sm:max-w-[390px] sm:flex-1"
      >
        <AppIcon name="search" :size="18" />

        <InputText
          v-model="query"
          placeholder="Pesquisar pagamentos"
          aria-label="Pesquisar pagamentos"
          class="w-full border-0 bg-transparent pl-0 text-caption"
        />
      </label>
    </div>

    <div v-if="!paymentBookings.length" class="empty-state">
      <AppIcon name="receipt" :size="34" />

      <h3>Nenhum pagamento nesta lista</h3>

      <p>Os pagamentos das reservas aparecem aqui.</p>
    </div>

    <div v-else class="table-scroll">
      <table class="data-table">
        <thead>
          <tr>
            <th>Cliente e serviço</th>
            <th>Data</th>
            <th>Método</th>
            <th>Valor</th>
            <th>Estado</th>

            <th>
              <span class="sr-only">Acções</span>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="item in paymentBookings"
            :key="item.id"
          >
            <td>
              <button
                type="button"
                class="flex flex-col items-start gap-0.5 border-0 bg-transparent p-0 text-left"
                @click="inspectBooking(item)"
              >
                <strong class="text-small">
                  {{ clientName(item) }}
                </strong>

                <small class="text-caption text-muted">
                  {{ serviceName(item.serviceId) }}
                </small>
              </button>
            </td>

            <td>{{ formatDate(item.date) }}</td>

            <td>
              {{
                item.paymentMethod === "online"
                  ? "Online"
                  : "No estabelecimento"
              }}
            </td>

            <td>
              <strong>{{ money(item.total) }}</strong>
            </td>

            <td>
              <span
                :class="[
                  'badge rounded-4xl',
                  `badge-${statusClass(item.paymentStatus)}`,
                ]"
              >
                {{ paymentNames[item.paymentStatus] }}
              </span>
            </td>

            <td>
              <button
                v-if="item.paymentStatus === 'pending'"
                type="button"
                class="btn btn-secondary"
                @click="collectPayment(item)"
              >
                <AppIcon name="check" :size="16" />
                Receber
              </button>

              <button
                v-else
                type="button"
                class="icon-btn"
                title="Ver recibo e reserva"
                aria-label="Ver recibo e reserva"
                @click="inspectBooking(item)"
              >
                <AppIcon name="receipt-text" :size="18" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>