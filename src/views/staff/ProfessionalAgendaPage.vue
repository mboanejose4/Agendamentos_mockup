<script setup lang="ts">
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import { plural } from "@/utils/formatters.ts";
import { useAccountManagementContext } from "@/composables/account/accountContext.ts";
const {
  state,
  go,
  today,
  service,
  professional,
  statusNames,
  statusClass,
  openBooking,
  openNewBooking,
  changeStatus,
  agendaDate,
  agendaFilter,
  dayBookings,
  agendaStats,
  shiftDate,
  schedule,
  myBlocks,
} = useAccountManagementContext();
</script>
<template>
  <div>
    <div class="mt-1 mb-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
      <div class="min-w-0 border-b border-line py-5 pr-5">
        <span class="text-caption text-muted">Atendimentos</span
        ><strong
          class="my-2.5 block text-[clamp(24px,7vw,28px)] leading-tight break-words"
          >{{ agendaStats.total }}</strong
        ><span class="text-caption text-muted">no dia seleccionado</span>
      </div>
      <div class="min-w-0 border-b border-line py-5 pr-5">
        <span class="text-caption text-muted">Concluídos</span
        ><strong
          class="my-2.5 block text-[clamp(24px,7vw,28px)] leading-tight break-words"
          >{{ agendaStats.completed }}</strong
        ><span class="text-caption text-muted"
          >{{ agendaStats.pending }} por atender</span
        >
      </div>
      <div class="min-w-0 border-b border-line py-5 pr-5">
        <span class="text-caption text-muted">Tempo reservado</span
        ><strong
          class="my-2.5 block text-[clamp(24px,7vw,28px)] leading-tight break-words"
          >{{ Math.floor(agendaStats.minutes / 60)
          }}<small class="text-caption">h</small> {{ agendaStats.minutes % 60
          }}<small class="text-caption">min</small></strong
        ><span class="text-caption text-muted">na sua agenda</span>
      </div>
    </div>
    <div
      class="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
    >
      <div class="flex flex-wrap items-center gap-2">
        <button
          class="icon-btn"
          title="Dia anterior"
          aria-label="Dia anterior"
          @click="shiftDate(-1)"
        >
          <AppIcon name="chevron-left" /></button
        ><input
          v-model="agendaDate"
          type="date"
          aria-label="Dia da agenda"
          required
          class="min-w-0 flex-1"
        /><button
          class="icon-btn"
          title="Dia seguinte"
          aria-label="Dia seguinte"
          @click="shiftDate(1)"
        >
          <AppIcon name="chevron-right" /></button
        ><button class="btn btn-secondary" @click="agendaDate = today()">
          Hoje
        </button>
      </div>
      <select
        v-model="agendaFilter"
        aria-label="Estado do agendamento"
        class="w-full sm:w-auto"
      >
        <option value="all">Todos os estados</option>
        <option value="confirmed">Confirmados</option>
        <option value="in_progress">Em atendimento</option>
        <option value="completed">Concluídos</option>
        <option value="cancelled">Cancelados</option>
        <option value="no_show">Não compareceu</option></select
      ><button class="btn btn-primary w-full sm:w-auto" @click="openNewBooking">
        <AppIcon name="calendar-plus" :size="18" /> Nova marcação
      </button>
    </div>
    <div v-if="dayBookings.length" class="flex flex-col gap-4">
      <article
        v-for="item in dayBookings"
        :key="item.id"
        class="card flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:gap-5 sm:p-5"
      >
        <div
          class="flex shrink-0 flex-row items-center gap-2 sm:w-24 sm:flex-col sm:items-start sm:gap-0.5"
        >
          <strong class="text-body-lg text-ink">{{ item.time }}</strong
          ><span class="text-caption text-muted">{{ item.duration }} min</span>
        </div>
        <div class="min-w-0 flex-1">
          <div class="mb-1 flex flex-wrap items-center justify-between gap-2">
            <h2 class="mb-0 text-body-lg">{{ item.clientName }}</h2>
            <span :class="['badge', `badge-${statusClass(item.status)}`]">{{
              statusNames[item.status]
            }}</span>
          </div>
          <p class="text-small text-muted">
            {{ service(item.serviceId)?.name || "Serviço" }}
          </p>
          <small
            v-if="item.partySize > 1"
            class="mt-1 block text-caption text-muted"
            >{{ plural(item.partySize, "pessoa", "pessoas") }}</small
          >
          <p
            v-if="item.notes"
            class="mt-2 flex items-center gap-1.5 text-caption text-muted"
          >
            <AppIcon name="message-square" :size="14" /> {{ item.notes }}
          </p>
          <div
            class="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3"
          >
            <button class="btn btn-secondary" @click="openBooking(item)">
              Detalhes</button
            ><button
              v-if="item.status === 'confirmed'"
              class="btn btn-primary"
              @click="changeStatus(item, 'in_progress')"
            >
              <AppIcon name="play" /> Confirmar presença</button
            ><button
              v-if="item.status === 'in_progress'"
              class="btn btn-primary"
              @click="changeStatus(item, 'completed')"
            >
              <AppIcon name="check" /> Concluir atendimento
            </button>
          </div>
        </div>
      </article>
    </div>
    <div v-else class="empty-state">
      <AppIcon name="calendar-check-2" />
      <h2>Sem atendimentos neste dia</h2>
      <p>As novas marcações aparecem automaticamente na sua agenda.</p>
      <button class="btn btn-secondary" @click="go('professional-schedule')">
        Gerir disponibilidade
      </button>
    </div>
    <section
      v-if="myBlocks.some((item) => item.date === agendaDate)"
      class="mt-8"
    >
      <h2 class="mb-4 text-body-lg">Períodos indisponíveis</h2>
      <div
        v-for="item in myBlocks.filter((item) => item.date === agendaDate)"
        :key="item.id"
        class="flex items-center gap-3 border-b border-line py-4 last:border-b-0"
      >
        <AppIcon name="calendar-off" class="shrink-0 text-muted" />
        <div class="min-w-0">
          <strong class="text-small text-ink"
            >{{ item.start }} – {{ item.end }}</strong
          >
          <p class="text-caption text-muted">
            {{ item.reason || "Indisponível" }}
          </p>
        </div>
      </div>
    </section>
  </div>
</template>
