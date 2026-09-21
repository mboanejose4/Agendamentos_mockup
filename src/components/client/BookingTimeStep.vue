<script setup lang="ts">
import { computed } from "vue";

import DatePicker from "primevue/datepicker";
import Button from "primevue/button";

import ProfessionalPicker from "@/components/client/ProfessionalPicker.vue";
import AppIcon from "@/components/shared/ui/AppIcon.vue";

import { useBookingFlowContext } from "@/composables/bookings/bookingContext.ts";

const { today, draft, selectedService, people, slots, dates, maxDate } =
  useBookingFlowContext();

/*
 * Converte uma data no formato YYYY-MM-DD
 * para um objecto Date no horário local.
 *
 * Evita problemas de fuso horário associados
 * à interpretação directa de datas UTC.
 */
function parseLocalDate(value: string): Date | null {
  if (!value) return null;

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) return null;

  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

/*
 * Converte um objecto Date para YYYY-MM-DD,
 * formato utilizado pelo bookingContext.
 */
function formatLocalDate(date: Date): string {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/*
 * Permite que o DatePicker trabalhe com Date
 * sem alterar o tipo original de draft.date.
 */
const selectedDate = computed<Date | null>({
  get: () => parseLocalDate(draft.date),

  set: (value) => {
    if (!value) return;

    const formattedDate = formatLocalDate(value);

    if (draft.date !== formattedDate) {
      draft.date = formattedDate;

      // Evita manter um horário da data anterior.
      draft.time = "";
    }
  },
});

/* Limites permitidos no calendário */
const minBookingDate = computed(() => parseLocalDate(today()));

const maxBookingDate = computed(() => parseLocalDate(maxDate.value));

/*
 * Selecciona uma data através dos cartões
 * apresentados abaixo do calendário.
 */
function selectDate(date: string): void {
  if (draft.date === date) return;

  draft.date = date;

  // O horário anterior deixa de estar seleccionado.
  draft.time = "";
}

/*
 * Formatação dos dias da semana.
 */
const weekdayFormatter = new Intl.DateTimeFormat("pt-MZ", {
  weekday: "short",
});

const monthFormatter = new Intl.DateTimeFormat("pt-MZ", {
  month: "short",
});

function weekdayLabel(date: string): string {
  const parsedDate = parseLocalDate(date);

  return parsedDate ? weekdayFormatter.format(parsedDate) : "";
}

function monthLabel(date: string): string {
  const parsedDate = parseLocalDate(date);

  return parsedDate ? monthFormatter.format(parsedDate) : "";
}

/*
 * Apresenta a duração do serviço.
 */
const durationLabel = computed(() => {
  const duration = selectedService.value?.duration;

  return duration ? `${duration} minutos` : "";
});
</script>

<template>
  <div class="flex flex-col">
    <!-- Cabeçalho e selecção da data -->
    <div class="mb-5 flex flex-wrap items-center justify-between gap-4">
      <h2 class="mb-0">
        Qual é o melhor dia?<span class="required-marker" aria-hidden="true"
          >*</span
        >
      </h2>

      <!-- Calendário PrimeVue -->
      <DatePicker
        v-model="selectedDate"
        date-format="dd/mm/yy"
        :min-date="minBookingDate ?? undefined"
        :max-date="maxBookingDate ?? undefined"
        :manual-input="false"
        show-icon
        icon-display="input"
        placeholder="Seleccione uma data"
        aria-label="Data da marcação"
        class="booking-datepicker !rounded-4xl"
        input-class="!rounded-4xl"
        panel-class="booking-calendar-panel"
        append-to="self"
        required
      />
    </div>

    <!-- Lista de datas disponíveis -->
    <div
      class="mt-6 mb-[33px] grid grid-cols-4 gap-2 sm:grid-cols-7"
      aria-label="Datas disponíveis para marcação"
    >
      <Button
        v-for="date in dates"
        :key="date"
        type="button"
        :aria-pressed="draft.date === date"
        class="booking-date-card flex min-w-0 flex-col items-center justify-center gap-2 !rounded-4xl !border !px-1 !py-[13px] !shadow-none"
        :class="
          draft.date === date
            ? 'is-selected'
            : '!border-line !bg-surface !text-ink hover:!border-primary hover:!bg-soft'
        "
        @click="selectDate(date)"
      >
        <small class="text-caption text-muted">
          {{ weekdayLabel(date) }}
        </small>

        <strong class="text-h3">
          {{ date.slice(8) }}
        </strong>

        <span class="text-caption text-muted">
          {{ monthLabel(date) }}
        </span>
      </Button>
    </div>

    <!-- Selecção do profissional -->
    <ProfessionalPicker
      v-if="selectedService?.resourceType !== 'table'"
      v-model="draft.staffId"
      :professionals="people"
    />

    <!-- Cabeçalho dos horários -->
    <div class="mb-5 flex flex-wrap items-center justify-between gap-[15px]">
      <h3 class="mb-0">Horários disponíveis</h3>

      <span class="text-caption text-muted">
        {{ durationLabel }}
      </span>
    </div>

    <!-- Horários disponíveis -->
    <div
      v-if="slots.length"
      class="grid grid-cols-3 gap-2.5 sm:grid-cols-4"
      aria-label="Selecção de horário"
    >
      <Button
        v-for="time in slots"
        :key="time"
        type="button"
        :aria-pressed="draft.time === time"
        class="booking-time-button min-h-[43px] !rounded-4xl !border !text-caption !shadow-none"
        :class="[
          draft.time === time
            ? 'is-selected'
            : '!border-line !bg-surface !text-ink hover:!border-primary hover:!bg-soft',
        ]"
        @click="draft.time = time"
      >
        {{ time }}
      </Button>
    </div>

    <!-- Sem horários disponíveis -->
    <div v-else class="empty-state rounded-4xl">
      <AppIcon name="calendar-clock" :size="32" />

      <h3>Sem horários neste dia</h3>

      <p>
        Escolha outra data ou ajuste a preferência de profissional ou recurso.
      </p>
    </div>
  </div>
</template>

<style scoped>
/*
 * Campo do DatePicker.
 * Arredondamento do elemento externo e do input.
 */
.booking-datepicker {
  border-radius: var(--radius-4xl, 2rem);
}

.booking-datepicker :deep(.p-datepicker-input) {
  border-radius: var(--radius-4xl, 2rem);
  min-height: 43px;
}

/*
 * Cartões de data.
 */
.booking-date-card {
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
}

/*
 * Botões de horário.
 */
.booking-time-button {
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
}

/*
 * Painel do calendário.
 *
 * O overlay do PrimeVue pode ser renderizado
 * fora do componente através de Teleport.
 * Por isso utilizamos :global().
 */
:global(.booking-calendar-panel) {
  border-radius: var(--radius-4xl, 2rem);
  overflow: hidden;
}

/*
 * Dias do calendário.
 */
:global(.booking-calendar-panel .p-datepicker-day) {
  border-radius: 9999px;
}
</style>
