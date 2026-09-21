<script setup lang="ts">
import { computed } from "vue";
import Checkbox from "primevue/checkbox";
import DatePicker from "primevue/datepicker";

import AppIcon from "@/components/shared/ui/AppIcon.vue";
import { useAccountManagementContext } from "@/composables/account/accountContext.ts";

const {
  state,
  dateLabel,
  business,
  dayOptions,
  schedule,
  scheduleError,
  saveSchedule,
  myBlocks,
  openBlock,
  confirmRemoveBlock,
} = useAccountManagementContext();

function timeStringToDate(value: string): Date | null {
  if (!value) return null;

  const [hours, minutes] = value.split(":").map(Number);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return null;
  }

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date;
}

function dateToTimeString(value: Date | null): string {
  if (!value) return "";

  const hours = String(value.getHours()).padStart(2, "0");
  const minutes = String(value.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

const scheduleStart = computed<Date | null>({
  get() {
    return timeStringToDate(schedule.start);
  },

  set(value) {
    schedule.start = dateToTimeString(value);
  },
});

const scheduleEnd = computed<Date | null>({
  get() {
    return timeStringToDate(schedule.end);
  },

  set(value) {
    schedule.end = dateToTimeString(value);
  },
});

function dayInputId(dayId: number): string {
  return `schedule-day-${dayId}`;
}
</script>

<template>
  <div class="schedule-page">
    <div
      class="grid grid-cols-1 gap-8 lg:grid-cols-[1.8fr_1fr] lg:gap-10"
    >
      <!-- Horário regular -->
      <form
        class="schedule-form"
        @submit.prevent="saveSchedule"
      >
        <header class="mb-5">
          <h2 class="mb-1 text-body-lg">
            Horário regular
          </h2>

          <p class="text-small text-muted">
            {{ business(state.businessId)?.name }}
          </p>
        </header>

        <!-- Dias da semana -->
        <fieldset>
          <legend class="mb-3 block text-caption font-medium">
            Dias de trabalho
          </legend>

          <div class="days-grid mb-5">
            <label
              v-for="day in dayOptions"
              :key="day.id"
              :for="dayInputId(day.id)"
              :class="[
                'day-option rounded-4xl',
                schedule.days.includes(day.id)
                  ? 'day-option-selected'
                  : '',
              ]"
            >
              <Checkbox
                v-model="schedule.days"
                :input-id="dayInputId(day.id)"
                :value="day.id"
                class="day-checkbox"
              />

              <span>{{ day.name }}</span>
            </label>
          </div>
        </fieldset>

        <!-- Horas -->
        <div class="form-grid">
          <div class="field">
            <label for="schedule-start">
              Início do turno
            </label>

            <DatePicker
              v-model="scheduleStart"
              input-id="schedule-start"
              time-only
              hour-format="24"
              placeholder="00:00"
              append-to="self"
              class="schedule-time-picker w-full"
              input-class="w-full rounded-4xl"
              show-icon
              icon-display="input"
            >
              <template #inputicon>
                <AppIcon
                  name="clock"
                  :size="17"
                />
              </template>
            </DatePicker>
          </div>

          <div class="field">
            <label for="schedule-end">
              Fim do turno
            </label>

            <DatePicker
              v-model="scheduleEnd"
              input-id="schedule-end"
              time-only
              hour-format="24"
              placeholder="00:00"
              append-to="self"
              class="schedule-time-picker w-full"
              input-class="w-full rounded-4xl"
              show-icon
              icon-display="input"
            >
              <template #inputicon>
                <AppIcon
                  name="clock"
                  :size="17"
                />
              </template>
            </DatePicker>
          </div>
        </div>

        <!-- Erro -->
        <div
          v-if="scheduleError"
          class="error-message flex items-start gap-2 rounded-4xl"
          role="alert"
        >
          <AppIcon
            name="circle-alert"
            :size="18"
            class="shrink-0"
          />

          <span>{{ scheduleError }}</span>
        </div>

        <div class="form-actions">
          <button
            class="btn btn-primary rounded-4xl"
            type="submit"
          >
            <AppIcon name="check" />
            Guardar horário
          </button>
        </div>
      </form>

      <!-- Pausas e ausências -->
      <section class="blocks-section">
        <div class="mb-5 flex items-center justify-between gap-4">
          <h2 class="mb-0 text-body-lg">
            Pausas e ausências
          </h2>

          <span class="badge badge-neutral !rounded-4xl">
            {{ myBlocks.length }}
          </span>
        </div>

        <div
          v-if="myBlocks.length"
          class="flex flex-col"
        >
          <article
            v-for="item in myBlocks"
            :key="item.id"
            class="block-item flex flex-col gap-3 border-b border-line py-4 last:border-b-0 sm:flex-row sm:items-center"
          >
            <span class="block-icon">
              <AppIcon
                name="calendar-off"
                :size="19"
              />
            </span>

            <div class="min-w-0 flex-1">
              <strong class="block text-small text-ink">
                {{ item.reason || "Indisponível" }}
              </strong>

              <p class="mt-0.5 text-caption text-muted">
                {{ dateLabel(item.date) }} ·
                {{ item.start }} – {{ item.end }}
              </p>

              <small
                v-if="!item.staffId"
                class="mt-0.5 block text-caption text-muted"
              >
                Todo o estabelecimento
              </small>
            </div>

            <div
              v-if="item.staffId === state.staffId"
              class="flex shrink-0 items-center gap-1 self-start sm:self-center"
            >
              <button
                type="button"
                class="icon-btn rounded-4xl"
                title="Editar período"
                aria-label="Editar período"
                @click="openBlock(item)"
              >
                <AppIcon name="pencil" />
              </button>

              <button
                type="button"
                class="icon-btn rounded-4xl"
                title="Remover período"
                aria-label="Remover período"
                @click="confirmRemoveBlock(item)"
              >
                <AppIcon name="trash-2" />
              </button>
            </div>
          </article>
        </div>

        <div
          v-else
          class="empty-state rounded-4xl"
        >
          <AppIcon name="coffee" />

          <h3>Nenhuma ausência registada</h3>

          <p>
            O seu horário regular está disponível para marcações.
          </p>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.schedule-page {
  --schedule-input-bg: #ffffff;
  --schedule-input-text: #17211d;
  --schedule-input-muted: #69756f;
  --schedule-input-placeholder: #89938e;
  --schedule-input-border: #dce3df;
  --schedule-input-hover: #acbab2;
  --schedule-input-focus: var(--brand-500, #019e51);
  --schedule-option-bg: #ffffff;
  --schedule-option-selected-bg: #e2f6eb;
  --schedule-option-selected-text: #09653c;
  --schedule-panel-bg: #ffffff;

  color-scheme: light;
}

/* Modo escuro */
:global(.dark) .schedule-page,
:global([data-theme="dark"]) .schedule-page {
  --schedule-input-bg: #123d2d;
  --schedule-input-text: #ffffff;
  --schedule-input-muted: #d1e5da;
  --schedule-input-placeholder: #b5d2c2;
  --schedule-input-border: #2d684d;
  --schedule-input-hover: #47916d;
  --schedule-input-focus: #4ade80;
  --schedule-option-bg: #123d2d;
  --schedule-option-selected-bg: #1b704c;
  --schedule-option-selected-text: #ffffff;
  --schedule-panel-bg: #0e3325;

  color-scheme: dark;
}

.schedule-form {
  min-width: 0;
}

/* Dias da semana */
.days-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.5rem;
}

.day-option {
  display: flex;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: 1px solid var(--schedule-input-border);
  padding: 0.6rem 0.5rem;
  background: var(--schedule-option-bg);
  color: var(--schedule-input-text);
  font-size: var(--text-caption, 0.8rem);
  cursor: pointer;
  transition:
    border-color 160ms ease,
    background-color 160ms ease,
    color 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease;
}

.day-option:hover {
  border-color: var(--schedule-input-hover);
  transform: translateY(-1px);
}

.day-option-selected {
  border-color: var(--schedule-input-focus);
  background: var(--schedule-option-selected-bg);
  color: var(--schedule-option-selected-text);
  font-weight: 600;
  box-shadow:
    0 0 0 2px
    color-mix(
      in srgb,
      var(--schedule-input-focus) 18%,
      transparent
    );
}

:deep(.day-checkbox.p-checkbox) {
  width: 18px;
  height: 18px;
}

:deep(.day-checkbox .p-checkbox-box) {
  width: 18px;
  height: 18px;
  border-color: var(--schedule-input-border);
  border-radius: 0.4rem;
  background: var(--schedule-input-bg);
}

:deep(.day-checkbox.p-checkbox-checked .p-checkbox-box) {
  border-color: var(--schedule-input-focus);
  background: var(--schedule-input-focus);
  color: #ffffff;
}

/* DatePicker de hora */
:deep(.schedule-time-picker) {
  position: relative;
  width: 100%;
  overflow: visible;
}

:deep(.schedule-time-picker .p-inputtext) {
  width: 100%;
  min-height: 46px;
  padding: 0.75rem 3rem 0.75rem 1rem;
  border: 1px solid var(--schedule-input-border);
  border-radius: 2rem;
  background: var(--schedule-input-bg);
  color: var(--schedule-input-text);
  transition:
    border-color 160ms ease,
    background-color 160ms ease,
    color 160ms ease,
    box-shadow 160ms ease;
}

:deep(.schedule-time-picker .p-inputtext::placeholder) {
  color: var(--schedule-input-placeholder);
  opacity: 1;
}

:deep(.schedule-time-picker .p-inputtext:hover) {
  border-color: var(--schedule-input-hover);
}

:deep(.schedule-time-picker .p-inputtext:focus) {
  border-color: var(--schedule-input-focus);
  outline: none;
  box-shadow:
    0 0 0 3px
    color-mix(
      in srgb,
      var(--schedule-input-focus) 20%,
      transparent
    );
}

:deep(
  .schedule-time-picker
  .p-datepicker-input-icon-container
) {
  right: 1rem;
  color: var(--schedule-input-text);
}

:deep(.schedule-time-picker .p-datepicker-panel) {
  z-index: 1000;
  margin-top: 0.4rem;
  overflow: hidden;
  border: 1px solid var(--schedule-input-border);
  border-radius: 1.5rem;
  background: var(--schedule-panel-bg);
  color: var(--schedule-input-text);
}

:deep(.schedule-time-picker .p-datepicker-time-picker) {
  background: var(--schedule-panel-bg);
  color: var(--schedule-input-text);
}

:deep(.schedule-time-picker .p-datepicker-hour-picker),
:deep(.schedule-time-picker .p-datepicker-minute-picker) {
  color: var(--schedule-input-text);
}

/* Erro */
.error-message {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
}

/* Pausas */
.blocks-section {
  min-width: 0;
}

.block-item {
  transition: background-color 160ms ease;
}

.block-icon {
  display: grid;
  width: 2.25rem;
  height: 2.25rem;
  flex-shrink: 0;
  place-items: center;
  border-radius: 9999px;
  background:
    color-mix(
      in srgb,
      var(--schedule-input-focus) 13%,
      transparent
    );
  color: var(--schedule-input-focus);
}

/* Mobile */
@media (min-width: 640px) {
  .days-grid {
    grid-template-columns: repeat(7, minmax(0, 1fr));
  }
}

@media (max-width: 639px) {
  .form-actions .btn {
    width: 100%;
  }
}
</style>