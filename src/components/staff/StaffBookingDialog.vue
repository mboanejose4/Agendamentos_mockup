<script setup lang="ts">
import { computed } from "vue";
import Select from "primevue/select";
import DatePicker from "primevue/datepicker";
import Textarea from "primevue/textarea";

import AppIcon from "@/components/shared/ui/AppIcon.vue";
import AppModal from "@/components/shared/ui/AppModal.vue";
import { useAccountManagementContext } from "@/composables/account/accountContext.ts";

const {
  money,
  today,
  assignedServices,
  bookingClients,
  newBooking,
  newBookingOpen,
  newBookingError,
  newBookingSlots,
  newBookingTotal,
  saveNewBooking,
} = useAccountManagementContext();

/**
 * O sistema guarda a data como YYYY-MM-DD.
 * O DatePicker do PrimeVue trabalha com Date.
 */
const selectedDate = computed<Date | null>({
  get() {
    if (!newBooking.date) return null;

    const [year, month, day] = newBooking.date.split("-").map(Number);

    if (!year || !month || !day) return null;

    return new Date(year, month - 1, day);
  },

  set(value) {
    if (!value) {
      newBooking.date = "";
      newBooking.time = "";
      return;
    }

    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");

    newBooking.date = `${year}-${month}-${day}`;

    // Limpa a hora porque os horários dependem da data.
    newBooking.time = "";
  },
});

/**
 * Impede a seleção de datas anteriores à data atual.
 */
const minimumDate = computed<Date>(() => {
  const [year, month, day] = today().split("-").map(Number);

  return new Date(year, month - 1, day);
});

/**
 * Devolve o serviço atualmente selecionado.
 */
const selectedService = computed(() =>
  assignedServices.value.find((item) => item.id === newBooking.serviceId),
);

function handleServiceChange(): void {
  // Ao mudar o serviço, os horários disponíveis também mudam.
  newBooking.time = "";
}

function closeModal(): void {
  newBookingOpen.value = false;
}
</script>

<template>
  <AppModal v-model="newBookingOpen" title="Nova marcação">
    <form class="new-booking-form" @submit.prevent="saveNewBooking">
      <!-- Cliente -->
      <div class="field">
        <label for="new-booking-client"> Cliente </label>

        <Select
          v-model="newBooking.clientId"
          input-id="new-booking-client"
          :options="bookingClients"
          option-label="name"
          option-value="id"
          placeholder="Escolher cliente"
          empty-message="Nenhum cliente disponível"
          empty-filter-message="Nenhum cliente encontrado"
          append-to="self"
          class="booking-select w-full rounded-4xl"
          filter
          required
        >
          <template #option="{ option }">
            <div class="client-option">
              <div class="client-avatar">
                <AppIcon name="user" :size="17" />
              </div>

              <div class="min-w-0">
                <strong class="block truncate text-small text-ink">
                  {{ option.name }}
                </strong>

                <span
                  v-if="option.phone || option.email"
                  class="block truncate text-caption text-muted"
                >
                  {{ option.phone || option.email }}
                </span>
              </div>
            </div>
          </template>

          <template #value="{ value, placeholder }">
            <span v-if="value" class="truncate">
              {{
                bookingClients.find((person) => person.id === value)?.name ||
                "Cliente"
              }}
            </span>

            <span v-else class="text-muted">
              {{ placeholder }}
            </span>
          </template>
        </Select>

        <small v-if="!bookingClients.length" class="text-caption text-muted">
          Ainda não há clientes nesta empresa.
        </small>
      </div>

      <!-- Serviço -->
      <div class="field">
        <label for="new-booking-service"> Serviço </label>

        <Select
          v-model="newBooking.serviceId"
          input-id="new-booking-service"
          :options="assignedServices"
          option-label="name"
          option-value="id"
          placeholder="Escolher serviço"
          empty-message="Nenhum serviço disponível"
          append-to="self"
          class="booking-select w-full rounded-4xl"
          required
          @change="handleServiceChange"
        >
          <template #option="{ option }">
            <div class="service-option">
              <div class="min-w-0">
                <strong class="block truncate text-small text-ink">
                  {{ option.name }}
                </strong>

                <span
                  v-if="option.duration"
                  class="block text-caption text-muted"
                >
                  {{ option.duration }} min
                </span>
              </div>

              <strong class="service-price">
                {{ money(option.price) }}
              </strong>
            </div>
          </template>

          <template #value="{ value, placeholder }">
            <div
              v-if="value && selectedService"
              class="flex min-w-0 items-center justify-between gap-3"
            >
              <span class="truncate">
                {{ selectedService.name }}
              </span>

              <strong class="shrink-0 text-primary-text">
                {{ money(selectedService.price) }}
              </strong>
            </div>

            <span v-else class="text-muted">
              {{ placeholder }}
            </span>
          </template>
        </Select>

        <small v-if="!assignedServices.length" class="text-caption text-muted">
          Não existem serviços associados a este profissional.
        </small>
      </div>

      <!-- Data -->
      <div class="form-grid">
        <div class="field">
          <label for="new-booking-date"> Data </label>

          <DatePicker
            v-model="selectedDate"
            input-id="new-booking-date"
            :min-date="minimumDate"
            date-format="dd/mm/yy"
            placeholder="Escolher data"
            append-to="self"
            class="booking-datepicker w-full"
            input-class="w-full rounded-4xl"
            show-icon
            icon-display="input"
            required
          />
        </div>
      </div>

      <!-- Horários -->
      <fieldset class="field">
        <legend class="mb-2">
          Hora<span class="required-marker" aria-hidden="true">*</span>
        </legend>

        <div v-if="newBookingSlots.length" class="flex flex-wrap gap-2">
          <button
            v-for="slot in newBookingSlots"
            :key="slot"
            type="button"
            :class="[
              'booking-time rounded-4xl border px-3.5 py-2 text-caption',
              newBooking.time === slot
                ? 'booking-time-active'
                : 'booking-time-default',
            ]"
            :aria-pressed="newBooking.time === slot"
            @click="newBooking.time = slot"
          >
            {{ slot }}
          </button>
        </div>

        <div v-else class="empty-slots rounded-4xl">
          <AppIcon name="clock" :size="18" class="shrink-0" />

          <p class="text-caption">
            <template v-if="!newBooking.serviceId">
              Escolha um serviço para consultar os horários.
            </template>

            <template v-else>
              Sem horários livres neste dia para este serviço.
            </template>
          </p>
        </div>
      </fieldset>

      <!-- Notas -->
      <div class="field">
        <label for="new-booking-notes"> Notas </label>

        <Textarea
          id="new-booking-notes"
          v-model="newBooking.notes"
          rows="3"
          placeholder="Indicações do cliente"
          class="booking-textarea w-full rounded-4xl"
          auto-resize
        />
      </div>

      <!-- Erro -->
      <div
        v-if="newBookingError"
        class="error-message flex items-start gap-2 rounded-4xl"
        role="alert"
      >
        <AppIcon name="circle-alert" :size="18" class="mt-0.5 shrink-0" />

        <span>{{ newBookingError }}</span>
      </div>

      <!-- Ações -->
      <div class="form-actions">
        <div class="booking-total">
          <span class="text-caption text-muted"> Total </span>

          <strong class="text-body-lg text-ink">
            {{ money(newBookingTotal) }}
          </strong>
        </div>

        <button
          type="button"
          class="btn btn-secondary rounded-4xl"
          @click="closeModal"
        >
          Cancelar
        </button>

        <button type="submit" class="btn btn-primary rounded-4xl">
          <AppIcon name="calendar-plus" :size="18" />

          Criar e enviar
        </button>
      </div>
    </form>
  </AppModal>
</template>

<style scoped>
.new-booking-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/*
 * Permite que os painéis internos do PrimeVue
 * apareçam dentro do AppModal.
 */
:deep(.modal-panel),
:deep(.modal-content),
:deep(.modal-body) {
  overflow: visible;
}

/* Select */
:deep(.booking-select.p-select) {
  position: relative;
  width: 100%;
  min-height: 46px;
  overflow: visible;
  border-radius: 2rem;
}

:deep(.booking-select .p-select-label) {
  display: flex;
  min-width: 0;
  align-items: center;
  padding: 0.75rem 1rem;
}

:deep(.booking-select .p-select-dropdown) {
  width: 2.75rem;
  flex-shrink: 0;
  border-radius: 0 2rem 2rem 0;
}

/*
 * Como append-to="self", o painel permanece
 * dentro do Select e acima do conteúdo do modal.
 */
:deep(.booking-select .p-select-overlay) {
  z-index: 1000;
  min-width: 100%;
  margin-top: 0.4rem;
  overflow: hidden;
  border-radius: 1.5rem;
}

:deep(.booking-select .p-select-header) {
  padding: 0.75rem;
}

:deep(.booking-select .p-select-filter) {
  width: 100%;
  border-radius: 2rem;
}

:deep(.booking-select .p-select-list-container) {
  max-height: 240px;
}

:deep(.booking-select .p-select-list) {
  padding: 0.35rem;
}

:deep(.booking-select .p-select-option) {
  margin-block: 0.15rem;
  padding: 0.75rem;
  border-radius: 1rem;
}

/* Opção de cliente */
.client-option {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.75rem;
}

.client-avatar {
  display: grid;
  width: 2rem;
  height: 2rem;
  flex-shrink: 0;
  place-items: center;
  border-radius: 9999px;
  background: var(--soft, #eef8f3);
  color: var(--brand-700);
}

/* Opção de serviço */
.service-option {
  display: flex;
  width: 100%;
  min-width: 0;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.service-price {
  flex-shrink: 0;
  color: var(--brand-700);
}

/* DatePicker */
:deep(.booking-datepicker) {
  position: relative;
  width: 100%;
  overflow: visible;
}

:deep(.booking-datepicker .p-inputtext) {
  width: 100%;
  min-height: 46px;
  border-radius: 2rem;
  padding: 0.75rem 3rem 0.75rem 1rem;
}

:deep(.booking-datepicker .p-datepicker-input-icon-container) {
  right: 1rem;
}

:deep(.booking-datepicker .p-datepicker-panel) {
  z-index: 1000;
  margin-top: 0.4rem;
  overflow: hidden;
  border-radius: 1.5rem;
}

/* Textarea */
:deep(.booking-textarea.p-textarea) {
  width: 100%;
  min-height: 96px;
  padding: 0.875rem 1rem;
  border-radius: 2rem;
  resize: vertical;
}

/* Estados de foco */
:deep(.booking-select.p-focus),
:deep(.booking-textarea.p-textarea:focus),
:deep(.booking-datepicker .p-inputtext:focus) {
  border-color: var(--brand-500);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-500) 18%, transparent);
}

/* Horários */
.booking-time {
  min-width: 64px;
  transition:
    border-color 160ms ease,
    background-color 160ms ease,
    color 160ms ease,
    transform 160ms ease;
}

.booking-time:hover {
  border-color: var(--brand-500);
  color: var(--brand-700);
  transform: translateY(-1px);
}

.booking-time:focus-visible {
  outline: 2px solid var(--brand-500);
  outline-offset: 2px;
}

.booking-time-default {
  border-color: var(--border);
  background: var(--field-bg);
  color: var(--field-ink);
}

/* Seleccionado: fundo verde, texto branco — o mesmo de `.is-selected`. */
.booking-time-active {
  border-color: var(--selected-border);
  background: var(--selected-bg);
  font-weight: 600;
  color: var(--selected-ink);
}

.empty-slots {
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  border: 1px dashed var(--line);
  padding: 0.875rem 1rem;
  color: var(--muted);
}

/* Total */
.booking-total {
  display: flex;
  margin-right: auto;
  flex-direction: column;
  gap: 0.1rem;
}

/* Telemóvel */
@media (max-width: 639px) {
  .form-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    width: 100%;
  }

  .booking-total {
    grid-column: 1 / -1;
    margin-right: 0;
    margin-bottom: 0.25rem;
  }

  .form-actions .btn {
    width: 100%;
  }
}
</style>
