<script setup lang="ts">
import { computed } from "vue";
import DatePicker from "primevue/datepicker";
import Select from "primevue/select";

import AppIcon from "@/components/shared/ui/AppIcon.vue";
import RoleDashboard from "@/components/shared/analytics/RoleDashboard.vue";
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
  shiftDate,
  schedule,
  myBlocks,
} = useAccountManagementContext();

const statusOptions = [
  {
    label: "Todos os estados",
    value: "all",
  },
  {
    label: "Confirmados",
    value: "confirmed",
  },
  {
    label: "Em atendimento",
    value: "in_progress",
  },
  {
    label: "Concluídos",
    value: "completed",
  },
  {
    label: "Cancelados",
    value: "cancelled",
  },
  {
    label: "Não compareceu",
    value: "no_show",
  },
];

/**
 * Converte a data YYYY-MM-DD do contexto para Date,
 * formato esperado pelo DatePicker do PrimeVue.
 */
const selectedAgendaDate = computed<Date | null>({
  get() {
    if (!agendaDate.value) return null;

    const [year, month, day] = agendaDate.value.split("-").map(Number);

    if (!year || !month || !day) return null;

    return new Date(year, month - 1, day);
  },

  set(value) {
    if (!value) return;

    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");

    agendaDate.value = `${year}-${month}-${day}`;
  },
});
</script>

<template>
  <div>
    <RoleDashboard role="professional" :anchor="agendaDate" />

    <div
      class="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
    >
      <div class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          class="icon-btn"
          title="Dia anterior"
          aria-label="Dia anterior"
          @click="shiftDate(-1)"
        >
          <AppIcon name="chevron-left" />
        </button>

        <DatePicker
          v-model="selectedAgendaDate"
          date-format="dd/mm/yy"
          show-icon
          icon-display="input"
          placeholder="Selecionar data"
          aria-label="Dia da agenda"
          class="agenda-date-picker min-w-0 flex-1"
          input-class="w-full rounded-4xl"
          append-to="self"
        />

        <button
          type="button"
          class="icon-btn"
          title="Dia seguinte"
          aria-label="Dia seguinte"
          @click="shiftDate(1)"
        >
          <AppIcon name="chevron-right" />
        </button>

        <button
          type="button"
          class="btn btn-secondary"
          @click="agendaDate = today()"
        >
          Hoje
        </button>
      </div>

      <Select
        v-model="agendaFilter"
        :options="statusOptions"
        option-label="label"
        option-value="value"
        aria-label="Estado do agendamento"
        class="agenda-status-select w-full rounded-4xl sm:w-56"
        placeholder="Selecione o estado"
        append-to="self"
      />

      <button
        type="button"
        class="btn btn-primary w-full sm:w-auto"
        @click="openNewBooking"
      >
        <AppIcon name="calendar-plus" :size="18" />
        Nova marcação
      </button>
    </div>

    <div v-if="dayBookings.length" class="flex flex-col gap-4">
      <article
        v-for="item in dayBookings"
        :key="item.id"
        class="card flex flex-col gap-4 rounded-4xl p-4 sm:flex-row sm:items-start sm:gap-5 sm:p-5"
      >
        <div
          class="flex shrink-0 flex-row items-center gap-2 sm:w-24 sm:flex-col sm:items-start sm:gap-0.5"
        >
          <strong class="text-body-lg text-ink">
            {{ item.time }}
          </strong>

          <span class="text-caption text-muted"> {{ item.duration }} min </span>
        </div>

        <div class="min-w-0 flex-1">
          <div class="mb-1 flex flex-wrap items-center justify-between gap-2">
            <h2 class="mb-0 text-body-lg">
              {{ item.clientName }}
            </h2>

            <span
              :class="[
                'badge rounded-4xl',
                `badge-${statusClass(item.status)}`,
              ]"
            >
              {{ statusNames[item.status] }}
            </span>
          </div>

          <p class="text-small text-muted">
            {{ service(item.serviceId)?.name || "Serviço" }}
          </p>

          <small
            v-if="item.partySize > 1"
            class="mt-1 block text-caption text-muted"
          >
            {{ plural(item.partySize, "pessoa", "pessoas") }}
          </small>

          <p
            v-if="item.notes"
            class="mt-2 flex items-center gap-1.5 text-caption text-muted"
          >
            <AppIcon name="message-square" :size="14" />
            {{ item.notes }}
          </p>

          <div
            class="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3"
          >
            <button
              type="button"
              class="btn btn-secondary"
              @click="openBooking(item)"
            >
              Detalhes
            </button>

            <button
              v-if="item.status === 'confirmed'"
              type="button"
              class="btn btn-primary"
              @click="changeStatus(item, 'in_progress')"
            >
              <AppIcon name="play" />
              Confirmar presença
            </button>

            <button
              v-if="item.status === 'in_progress'"
              type="button"
              class="btn btn-primary"
              @click="changeStatus(item, 'completed')"
            >
              <AppIcon name="check" />
              Concluir atendimento
            </button>
          </div>
        </div>
      </article>
    </div>

    <div v-else class="empty-state">
      <AppIcon name="calendar-check-2" />

      <h2>Sem atendimentos neste dia</h2>

      <p>As novas marcações aparecem automaticamente na sua agenda.</p>

      <button
        type="button"
        class="btn btn-secondary"
        @click="go('professional-schedule')"
      >
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
          <strong class="text-small text-ink">
            {{ item.start }} – {{ item.end }}
          </strong>

          <p class="text-caption text-muted">
            {{ item.reason || "Indisponível" }}
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/*
 * DatePicker
 */
.agenda-date-picker {
  width: 100%;
}

:deep(.agenda-date-picker .p-inputtext) {
  min-height: 44px;
  border-radius: 2rem;
  padding-inline: 1rem 2.75rem;
}

:deep(.agenda-date-picker .p-datepicker-dropdown) {
  border-radius: 0 2rem 2rem 0;
}

/*
 * Select
 */
:deep(.agenda-status-select.p-select) {
  min-height: 44px;
  border-radius: 2rem;
}

:deep(.agenda-status-select .p-select-label) {
  display: flex;
  align-items: center;
  padding-inline: 1rem;
}

:deep(.agenda-status-select .p-select-dropdown) {
  border-radius: 0 2rem 2rem 0;
}

/*
 * Estado de foco seguindo a identidade visual do projeto.
 */
:deep(.agenda-date-picker .p-inputtext:focus),
:deep(.agenda-status-select.p-focus) {
  border-color: var(--brand-500);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-500) 18%, transparent);
}

@media (min-width: 640px) {
  .agenda-date-picker {
    width: 13rem;
    flex: initial;
  }
}
</style>
