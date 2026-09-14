<script setup>
import AppIcon from "@/Component/ui/AppIcon.vue";
import { useBusinessManagementContext } from "@/Composable/businesses/businessContext.js";
const {
  state,
  money,
  reportFrom,
  reportTo,
  initials,
  reportBookings,
  reportRevenue,
  reportCompleted,
  reportCancelled,
  reportByService,
  reportByStaff,
  maxServiceCount,
} = useBusinessManagementContext();
</script>
<template>
  <div>
    <div
      class="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
    >
      <label class="field mb-0">
        <span>De</span>
        <input v-model="reportFrom" type="date" :max="reportTo" />
      </label>
      <label class="field mb-0">
        <span>Até</span>
        <input v-model="reportTo" type="date" :min="reportFrom" />
      </label>
      <span class="text-caption text-muted"
        >{{ reportBookings.length }} reservas no período</span
      >
    </div>
    <div class="mt-1 mb-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
      <div class="min-w-0 border-b border-line py-5 pr-5">
        <span class="text-caption text-muted">Receita recebida</span>
        <strong class="my-2.5 block text-[clamp(24px,7vw,28px)] leading-tight break-words">{{
          money(reportRevenue)
        }}</strong>
        <small class="block text-caption text-muted">No período seleccionado</small>
      </div>
      <div class="min-w-0 border-b border-line py-5 pr-5">
        <span class="text-caption text-muted">Atendimentos</span>
        <strong class="my-2.5 block text-[clamp(24px,7vw,28px)] leading-tight break-words">{{
          reportCompleted
        }}</strong>
        <small class="block text-caption text-muted">Reservas concluídas</small>
      </div>
      <div class="min-w-0 border-b border-line py-5 pr-5">
        <span class="text-caption text-muted">Valor médio pago</span>
        <strong class="my-2.5 block text-[clamp(24px,7vw,28px)] leading-tight break-words">{{
          money(
            reportRevenue /
              Math.max(
                1,
                reportBookings.filter((item) => item.paymentStatus === "paid")
                  .length,
              ),
          )
        }}</strong>
        <small class="block text-caption text-muted">Por reserva paga</small>
      </div>
      <div class="min-w-0 border-b border-line py-5 pr-5">
        <span class="text-caption text-muted">Cancelamentos</span>
        <strong class="my-2.5 block text-[clamp(24px,7vw,28px)] leading-tight break-words">{{
          reportCancelled
        }}</strong>
        <small class="block text-caption text-muted"
          >{{
            reportBookings.length
              ? Math.round((reportCancelled / reportBookings.length) * 100)
              : 0
          }}% das reservas do período</small
        >
      </div>
    </div>
    <section class="mb-10">
      <div class="mb-5 flex flex-wrap items-center justify-between gap-4">
        <h2 class="mb-0">Serviços mais procurados</h2>
        <span class="text-caption text-muted">Reservas válidas</span>
      </div>
      <div v-if="!reportByService.length" class="empty-state py-8">
        <AppIcon name="chart-no-axes-combined" :size="32" />
        <h3>Sem reservas neste período</h3>
        <p>Altere as datas para consultar outro período.</p>
      </div>
      <div
        v-for="item in reportByService"
        :key="item.id"
        class="flex items-center gap-4 border-b border-line py-3 last:border-b-0"
      >
        <div class="w-28 shrink-0 sm:w-44">
          <strong class="block truncate text-small">{{ item.name }}</strong>
          <small class="block text-caption text-muted"
            >{{ money(item.revenue) }} recebidos</small
          >
        </div>
        <div class="h-2 flex-1 overflow-hidden rounded-full bg-surface-muted">
          <span
            class="block h-full rounded-full bg-primary"
            :style="{ width: `${(item.count / maxServiceCount) * 100}%` }"
          ></span>
        </div>
        <strong class="w-8 shrink-0 text-right text-small">{{
          item.count
        }}</strong>
      </div>
    </section>
    <section class="mb-10">
      <div class="mb-5 flex flex-wrap items-center justify-between gap-4">
        <h2 class="mb-0">Desempenho da equipa</h2>
      </div>
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>Profissional</th>
              <th>Reservas</th>
              <th>Concluídas</th>
              <th>Receita recebida</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="person in reportByStaff" :key="person.id">
              <td>
                <div class="flex items-center gap-2.5">
                  <span class="avatar">{{ initials(person.name) }}</span>
                  <strong>{{ person.name }}</strong>
                </div>
              </td>
              <td>{{ person.count }}</td>
              <td>{{ person.completed }}</td>
              <td>{{ money(person.revenue) }}</td>
            </tr>
            <tr v-if="!reportByStaff.length">
              <td colspan="4" class="text-muted">
                Ainda não há membros na equipa.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
