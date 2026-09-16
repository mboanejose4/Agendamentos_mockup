<script setup lang="ts">
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import { plural } from "@/utils/formatters.ts";
import { useBusinessManagementContext } from "@/composables/businesses/businessContext.ts";
const {
  state,
  money,
  today,
  company,
  services,
  team,
  resources,
  clients,
  selectedDate,
  settings,
  statusNames,
  serviceName,
  staffName,
  clientName,
  statusClass,
  todayBookings,
  todayRevenue,
  outstanding,
  weekDays,
  navigate,
  openBooking,
  inspectBooking,
} = useBusinessManagementContext();
</script>
<template>
  <div>
    <div class="mt-1 mb-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
      <div class="min-w-0 border-b border-line py-5 pr-5">
        <span class="flex items-center gap-1.5 text-caption text-muted">
          <AppIcon name="calendar-days" :size="18" /> Reservas de hoje</span
        >
        <strong
          class="my-2.5 block text-[clamp(24px,7vw,28px)] leading-tight break-words"
          >{{ todayBookings.length }}</strong
        >
        <small class="block text-caption text-muted"
          >{{
            todayBookings.filter((item) => item.status === "completed").length
          }}
          atendimentos concluídos</small
        >
      </div>
      <div class="min-w-0 border-b border-line py-5 pr-5">
        <span class="flex items-center gap-1.5 text-caption text-muted">
          <AppIcon name="wallet" :size="18" /> Recebido hoje</span
        >
        <strong
          class="my-2.5 block text-[clamp(24px,7vw,28px)] leading-tight break-words"
          >{{ money(todayRevenue) }}</strong
        >
        <small class="block text-caption text-muted"
          >Pagamentos confirmados</small
        >
      </div>
      <div class="min-w-0 border-b border-line py-5 pr-5">
        <span class="flex items-center gap-1.5 text-caption text-muted">
          <AppIcon name="users" :size="18" /> Clientes</span
        >
        <strong
          class="my-2.5 block text-[clamp(24px,7vw,28px)] leading-tight break-words"
          >{{ clients.length }}</strong
        >
        <small class="block text-caption text-muted"
          >Na sua base de contactos</small
        >
      </div>
      <div class="min-w-0 border-b border-line py-5 pr-5">
        <span class="flex items-center gap-1.5 text-caption text-muted">
          <AppIcon name="clock-3" :size="18" /> Por receber</span
        >
        <strong
          class="my-2.5 block text-[clamp(24px,7vw,28px)] leading-tight break-words"
          >{{
            money(
              outstanding.reduce((sum, item) => sum + Number(item.total), 0),
            )
          }}</strong
        >
        <small class="block text-caption text-muted"
          >{{ plural(outstanding.length, "reserva", "reservas") }} com pagamento
          pendente</small
        >
      </div>
    </div>
    <section class="mb-10">
      <div class="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="mb-0">Os próximos 7 dias</h2>
          <p class="mt-1.5 text-caption text-muted">
            Reservas confirmadas e atendimentos
          </p>
        </div>
        <button class="btn btn-secondary" @click="navigate('agenda')">
          Abrir agenda <AppIcon name="arrow-up-right" :size="16" />
        </button>
      </div>
      <div class="grid grid-cols-4 gap-2 sm:grid-cols-7">
        <button
          v-for="day in weekDays"
          :key="day.date"
          class="flex flex-col items-center gap-1.5 rounded-md border border-line bg-surface px-1 py-3 text-caption"
          :class="
            day.date === today()
              ? 'border-primary-text bg-soft text-primary-text'
              : 'text-muted hover:bg-surface-muted'
          "
          @click="
            selectedDate = day.date;
            navigate('agenda');
          "
        >
          <span>{{ day.label }}</span>
          <strong class="text-h3">{{ day.day }}</strong>
          <small class="text-caption"
            >{{ day.count }}
            {{ day.count === 1 ? "reserva" : "reservas" }}</small
          >
        </button>
      </div>
    </section>
    <div
      class="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-10"
    >
      <section>
        <div class="mb-5 flex flex-wrap items-center justify-between gap-4">
          <h2 class="mb-0">Agenda de hoje</h2>
          <span class="badge badge-neutral">{{ todayBookings.length }}</span>
        </div>
        <div v-if="!todayBookings.length" class="empty-state">
          <AppIcon name="calendar-check" :size="32" />
          <h3>Um dia por preencher</h3>
          <p>As novas reservas de hoje aparecem aqui.</p>
          <button class="btn btn-secondary" @click="openBooking()">
            Criar reserva
          </button>
        </div>
        <button
          v-for="item in todayBookings.slice(0, 6)"
          :key="item.id"
          class="flex w-full items-center gap-3 border-b border-line py-3.5 text-left last:border-b-0 hover:bg-surface-muted"
          @click="inspectBooking(item)"
        >
          <span class="w-12 shrink-0 text-small font-medium text-ink">{{
            item.time
          }}</span>
          <span class="min-w-0 flex-1">
            <strong class="block truncate text-small text-ink">{{
              clientName(item)
            }}</strong>
            <small class="block truncate text-caption text-muted"
              >{{ serviceName(item.serviceId) }} ·
              {{ staffName(item.staffId) }}</small
            >
          </span>
          <span :class="['badge', `badge-${statusClass(item.status)}`]">{{
            statusNames[item.status]
          }}</span>
          <AppIcon
            name="chevron-right"
            :size="16"
            class="shrink-0 text-muted"
          />
        </button>
      </section>
      <section>
        <div class="mb-5 flex flex-wrap items-center justify-between gap-4">
          <h2 class="mb-0">O estabelecimento</h2>
          <button
            class="icon-btn"
            title="Editar estabelecimento"
            @click="navigate('settings')"
          >
            <AppIcon name="pencil" :size="17" />
          </button>
        </div>
        <img
          v-if="company?.image"
          class="mb-4 h-[160px] w-full rounded-lg bg-surface-muted object-cover"
          :src="company.image"
          :alt="company.name"
        />
        <h3>{{ company?.name }}</h3>
        <p class="text-small text-muted">
          {{ company?.category }} · {{ company?.city }}
        </p>
        <div
          class="my-5 grid grid-cols-3 gap-3 border-y border-line py-4 text-center"
        >
          <div>
            <strong class="block text-h3">{{
              services.filter((item) => item.active).length
            }}</strong>
            <span class="text-caption text-muted">Serviços activos</span>
          </div>
          <div>
            <strong class="block text-h3">{{
              team.filter((item) => item.active).length
            }}</strong>
            <span class="text-caption text-muted">Na equipa</span>
          </div>
          <div>
            <strong class="block text-h3">{{
              resources.filter((item) => item.active).length
            }}</strong>
            <span class="text-caption text-muted">Recursos</span>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-3 text-caption text-muted">
          <AppIcon name="clock-3" :size="17" />
          <span>{{ company?.opens }} – {{ company?.closes }}</span>
          <span
            :class="[
              'badge',
              company?.active ? 'badge-success' : 'badge-neutral',
            ]"
            >{{
              company?.active ? "A receber reservas" : "Reservas suspensas"
            }}</span
          >
        </div>
      </section>
    </div>
  </div>
</template>
