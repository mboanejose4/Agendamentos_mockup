<script setup lang="ts">
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import { plural } from "@/utils/formatters.ts";
import { useBusinessManagementContext } from "@/composables/businesses/businessContext.ts";
const {
  state,
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
    <div class="mt-1 mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
      <div class="min-w-0 border-b border-line py-5 pr-5">
        <span class="text-caption text-muted">Total recebido</span>
        <strong
          class="my-2.5 block text-[clamp(24px,7vw,28px)] leading-tight break-words"
          >{{
            money(
              bookings
                .filter((item) => item.paymentStatus === "paid")
                .reduce((sum, item) => sum + Number(item.total), 0),
            )
          }}</strong
        >
        <small class="block text-caption text-muted"
          >Todos os pagamentos confirmados</small
        >
      </div>
      <div class="min-w-0 border-b border-line py-5 pr-5">
        <span class="text-caption text-muted">Por receber</span>
        <strong
          class="my-2.5 block text-[clamp(24px,7vw,28px)] leading-tight break-words"
          >{{
            money(
              outstanding.reduce((sum, item) => sum + Number(item.total), 0),
            )
          }}</strong
        >
        <small class="block text-caption text-muted">{{
          plural(outstanding.length, "reserva pendente", "reservas pendentes")
        }}</small>
      </div>
      <div class="min-w-0 border-b border-line py-5 pr-5">
        <span class="text-caption text-muted">Reembolsado</span>
        <strong
          class="my-2.5 block text-[clamp(24px,7vw,28px)] leading-tight break-words"
          >{{
            money(
              bookings
                .filter((item) => item.paymentStatus === "refunded")
                .reduce((sum, item) => sum + Number(item.total), 0),
            )
          }}</strong
        >
        <small class="block text-caption text-muted"
          >Reservas canceladas e reembolsadas</small
        >
      </div>
    </div>
    <div
      class="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
    >
      <div class="tabs mb-0 border-b-0">
        <button
          :class="{ active: paymentFilter === 'pending' }"
          @click="paymentFilter = 'pending'"
        >
          Por receber
        </button>
        <button
          :class="{ active: paymentFilter === 'paid' }"
          @click="paymentFilter = 'paid'"
        >
          Recebidos
        </button>
        <button
          :class="{ active: paymentFilter === 'refunded' }"
          @click="paymentFilter = 'refunded'"
        >
          Reembolsos
        </button>
      </div>
      <label
        class="flex w-full items-center gap-2.5 rounded-md border border-line bg-surface px-3 text-muted sm:max-w-[390px] sm:flex-1"
      >
        <AppIcon name="search" :size="18" />
        <input
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
            <th><span class="sr-only">Acções</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in paymentBookings" :key="item.id">
            <td>
              <button
                class="flex flex-col items-start gap-0.5 border-0 bg-transparent p-0 text-left"
                @click="inspectBooking(item)"
              >
                <strong class="text-small">{{ clientName(item) }}</strong>
                <small class="text-caption text-muted">{{
                  serviceName(item.serviceId)
                }}</small>
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
                :class="['badge', `badge-${statusClass(item.paymentStatus)}`]"
                >{{ paymentNames[item.paymentStatus] }}</span
              >
            </td>
            <td>
              <button
                v-if="item.paymentStatus === 'pending'"
                class="btn btn-secondary"
                @click="collectPayment(item)"
              >
                <AppIcon name="check" :size="16" /> Receber
              </button>
              <button
                v-else
                class="icon-btn"
                title="Ver recibo e reserva"
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
