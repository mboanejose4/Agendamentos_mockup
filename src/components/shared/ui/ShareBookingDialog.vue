<script setup lang="ts">
import { computed, ref, watch } from "vue";
import Textarea from "primevue/textarea";

import AppIcon from "@/components/shared/ui/AppIcon.vue";
import AppModal from "@/components/shared/ui/AppModal.vue";
import PhoneInput from "@/components/shared/ui/PhoneInput.vue";

import {
  business,
  bookingShareToken,
  notify,
  saveRecord,
  service,
  state,
} from "@/stores/applicationStore.ts";

import { shareBookingId, shareOpen } from "@/stores/shareBookingStore.ts";

import {
  bookingLink,
  bookingMessage,
  isUsablePhone,
  normalizePhone,
  whatsappUrl,
} from "@/utils/whatsapp.ts";

const booking = computed(() =>
  state.db.bookings.find((item) => item.id === shareBookingId.value),
);

const company = computed(() =>
  booking.value ? business(booking.value.businessId) : undefined,
);

const item = computed(() =>
  booking.value ? service(booking.value.serviceId) : undefined,
);

const client = computed(() =>
  booking.value
    ? state.db.clients.find((entry) => entry.id === booking.value?.clientId)
    : undefined,
);

const phone = ref("");
const copied = ref(false);

watch(
  () => [shareOpen.value, booking.value?.id],
  () => {
    if (!shareOpen.value) return;

    phone.value = booking.value?.whatsapp || client.value?.phone || "";

    copied.value = false;
  },
  { immediate: true },
);

const link = computed(() =>
  booking.value ? bookingLink(bookingShareToken(booking.value.id)) : "",
);

const message = computed(() =>
  booking.value
    ? bookingMessage(booking.value, company.value, item.value, link.value)
    : "",
);

const valid = computed(() => isUsablePhone(phone.value));

const normalizedPhone = computed(() =>
  valid.value ? normalizePhone(phone.value) : "",
);

function remember(): void {
  const record = booking.value;

  if (!record) return;

  const trimmedPhone = phone.value.trim();

  record.whatsapp = trimmedPhone;

  if (client.value && !client.value.phone) {
    saveRecord("clients", {
      ...client.value,
      phone: trimmedPhone,
    });
  }
}

function send(): void {
  if (!valid.value || !booking.value) return;

  remember();

  window.open(
    whatsappUrl(phone.value, message.value),
    "_blank",
    "noopener,noreferrer",
  );

  shareOpen.value = false;
}

async function copy(): Promise<void> {
  try {
    await navigator.clipboard.writeText(link.value);
    copied.value = true;
    notify("Ligação copiada.");
  } catch {
    notify("Não foi possível copiar. Seleccione a ligação e copie à mão.");
  }
}

function closeModal(): void {
  shareOpen.value = false;
}
</script>

<template>
  <AppModal v-model="shareOpen" title="Enviar a marcação ao cliente">
    <form v-if="booking" class="share-booking-form" @submit.prevent="send">
      <!-- Contacto de WhatsApp -->
      <div class="field">
        <label for="share-booking-phone">
          Contacto de WhatsApp do cliente
        </label>

        <PhoneInput v-model="phone" required />

        <small class="field-help">
          <AppIcon name="info" :size="14" class="shrink-0" />

          <span>
            Sem indicativo assume-se Moçambique (+258).

            <template v-if="valid">
              Vai para

              <strong> +{{ normalizedPhone }} </strong>.
            </template>
          </span>
        </small>

        <small v-if="phone && !valid" class="field-error">
          <AppIcon name="circle-alert" :size="14" class="shrink-0" />

          Introduza um contacto de WhatsApp válido.
        </small>
      </div>

      <!-- Mensagem -->
      <div class="field">
        <div class="message-label">
          <label for="share-booking-message"> Mensagem </label>

          <span class="message-status rounded-4xl">
            <AppIcon name="lock" :size="12" />

            Gerada automaticamente
          </span>
        </div>

        <Textarea
          id="share-booking-message"
          :model-value="message"
          rows="9"
          readonly
          auto-resize
          class="share-textarea w-full rounded-4xl"
        />

        <small class="field-help">
          <AppIcon name="info" :size="14" class="shrink-0" />

          <span>
            A mensagem abre no WhatsApp já preenchida. Pode alterá-la antes de
            enviar.
          </span>
        </small>
      </div>

      <!-- Ligação pública -->
      <div class="share-link-section rounded-4xl">
        <div class="min-w-0 flex-1">
          <span class="block text-caption text-muted">
            Ligação da marcação
          </span>

          <span class="share-link-value">
            {{ link }}
          </span>
        </div>

        <button
          type="button"
          class="copy-link-button rounded-4xl"
          :aria-label="
            copied ? 'Ligação copiada' : 'Copiar ligação da marcação'
          "
          @click="copy"
        >
          <AppIcon :name="copied ? 'check-check' : 'copy'" :size="16" />

          <span>
            {{ copied ? "Copiada" : "Copiar" }}
          </span>
        </button>
      </div>

      <!-- Ações -->
      <div class="form-actions">
        <button
          type="button"
          class="btn btn-secondary rounded-4xl"
          @click="closeModal"
        >
          Fechar
        </button>

        <button
          type="submit"
          class="btn btn-primary rounded-4xl"
          :disabled="!valid"
        >
          <AppIcon name="send" :size="18" />

          Abrir WhatsApp
        </button>
      </div>
    </form>

    <!-- Marcação não encontrada -->
    <div v-else class="empty-booking rounded-4xl">
      <AppIcon name="calendar-x" :size="28" class="shrink-0" />

      <div>
        <strong class="text-ink"> Marcação não encontrada </strong>

        <p class="mt-1 text-caption text-muted">
          Não foi possível carregar os dados desta marcação.
        </p>

        <button
          type="button"
          class="btn btn-secondary mt-4 rounded-4xl"
          @click="closeModal"
        >
          Fechar
        </button>
      </div>
    </div>
  </AppModal>
</template>

<style scoped>
/* Os nomes `--booking-*` ficam (sao usados por toda a folha abaixo), mas
   apontam agora para os tokens da aplicacao: um unico sitio decide as cores
   dos campos nos dois temas, em vez de duas paletas paralelas aqui dentro. */
.new-booking-form {
  --booking-input-bg: var(--field-bg);
  --booking-input-text: var(--field-ink);
  --booking-input-muted: var(--muted);
  --booking-input-placeholder: var(--field-placeholder);
  --booking-input-border: var(--field-border);
  --booking-input-hover: var(--primary);
  --booking-input-focus: var(--primary);
  --booking-overlay-bg: var(--surface);
  --booking-option-hover: var(--surface-muted);
  --booking-option-active: var(--selected-bg);

  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* Permite apresentar os painéis dentro do modal */
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
  border: 1px solid var(--booking-input-border);
  border-radius: 2rem;
  background: var(--booking-input-bg);
  color: var(--booking-input-text);
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease;
}

:deep(.booking-select.p-select:hover) {
  border-color: var(--booking-input-hover);
}

:deep(.booking-select.p-focus) {
  border-color: var(--booking-input-focus);
  box-shadow: 0 0 0 3px
    color-mix(in srgb, var(--booking-input-focus) 20%, transparent);
}

:deep(.booking-select .p-select-label) {
  display: flex;
  min-width: 0;
  align-items: center;
  padding: 0.75rem 1rem;
  color: var(--booking-input-text);
}

:deep(.booking-select .p-select-dropdown) {
  width: 2.75rem;
  flex-shrink: 0;
  border-radius: 0 2rem 2rem 0;
  color: var(--booking-input-text);
}

:deep(.booking-select .p-select-overlay) {
  z-index: 1000;
  min-width: 100%;
  margin-top: 0.4rem;
  overflow: hidden;
  border: 1px solid var(--booking-input-border);
  border-radius: 1.5rem;
  background: var(--booking-overlay-bg);
  color: var(--booking-input-text);
}

:deep(.booking-select .p-select-header) {
  padding: 0.75rem;
  background: var(--booking-overlay-bg);
}

:deep(.booking-select .p-select-filter) {
  width: 100%;
  border-color: var(--booking-input-border);
  border-radius: 2rem;
  background: var(--booking-input-bg);
  color: var(--booking-input-text);
}

:deep(.booking-select .p-select-filter::placeholder) {
  color: var(--booking-input-placeholder);
}

:deep(.booking-select .p-select-list-container) {
  max-height: 240px;
  background: var(--booking-overlay-bg);
}

:deep(.booking-select .p-select-list) {
  padding: 0.4rem;
  background: var(--booking-overlay-bg);
}

:deep(.booking-select .p-select-option) {
  margin-block: 0.15rem;
  padding: 0.75rem;
  border-radius: 1rem;
  color: var(--booking-input-text);
}

:deep(.booking-select .p-select-option:hover),
:deep(.booking-select .p-select-option.p-focus) {
  background: var(--booking-option-hover);
  color: var(--booking-input-text);
}

:deep(.booking-select .p-select-option-selected) {
  background: var(--booking-option-active);
  color: var(--booking-input-text);
}

.select-placeholder {
  color: var(--booking-input-placeholder);
}

.client-option {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.75rem;
}

.option-icon {
  display: grid;
  width: 2rem;
  height: 2rem;
  flex-shrink: 0;
  place-items: center;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--booking-input-focus) 15%, transparent);
  color: var(--booking-input-focus);
}

.option-detail {
  display: block;
  overflow: hidden;
  color: var(--booking-input-muted);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.service-option,
.selected-service {
  display: flex;
  width: 100%;
  min-width: 0;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.option-price {
  flex-shrink: 0;
  color: var(--booking-input-focus);
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
  padding: 0.75rem 3rem 0.75rem 1rem;
  border: 1px solid var(--booking-input-border);
  border-radius: 2rem;
  background: var(--booking-input-bg);
  color: var(--booking-input-text);
}

:deep(.booking-datepicker .p-inputtext::placeholder) {
  color: var(--booking-input-placeholder);
  opacity: 1;
}

:deep(.booking-datepicker .p-inputtext:hover) {
  border-color: var(--booking-input-hover);
}

:deep(.booking-datepicker .p-inputtext:focus) {
  border-color: var(--booking-input-focus);
  outline: none;
  box-shadow: 0 0 0 3px
    color-mix(in srgb, var(--booking-input-focus) 20%, transparent);
}

:deep(.booking-datepicker .p-datepicker-input-icon-container) {
  right: 1rem;
  color: var(--booking-input-text);
}

:deep(.booking-datepicker .p-datepicker-panel) {
  z-index: 1000;
  margin-top: 0.4rem;
  overflow: hidden;
  border: 1px solid var(--booking-input-border);
  border-radius: 1.5rem;
  background: var(--booking-overlay-bg);
  color: var(--booking-input-text);
}

/* Textarea */
:deep(.booking-textarea.p-textarea) {
  width: 100%;
  min-height: 96px;
  padding: 0.875rem 1rem;
  border: 1px solid var(--booking-input-border);
  border-radius: 2rem;
  background: var(--booking-input-bg);
  color: var(--booking-input-text);
  resize: vertical;
}

:deep(.booking-textarea.p-textarea::placeholder) {
  color: var(--booking-input-placeholder);
  opacity: 1;
}

:deep(.booking-textarea.p-textarea:hover) {
  border-color: var(--booking-input-hover);
}

:deep(.booking-textarea.p-textarea:focus) {
  border-color: var(--booking-input-focus);
  outline: none;
  box-shadow: 0 0 0 3px
    color-mix(in srgb, var(--booking-input-focus) 20%, transparent);
}

/* Horários */
.booking-time {
  min-width: 64px;
  padding: 0.55rem 1rem;
  border: 1px solid var(--field-border);
  border-radius: 2rem;
  background: var(--field-bg);
  color: var(--field-ink);
  font-size: var(--text-caption, 0.8rem);
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 160ms ease,
    border-color 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease;
}

/* Por seleccionar: a mesma caixa dos restantes campos — no claro branca,
   no escuro verde. Antes eram todos verdes cheios e pareciam seleccionados. */
.booking-time-default {
  border-color: var(--field-border);
  background: var(--field-bg);
  color: var(--field-ink);
}

.booking-time-default:hover {
  border-color: var(--primary);
  background: var(--soft);
  transform: translateY(-1px);
}

/* Seleccionado: verde com texto branco, como em todo o projecto. */
.booking-time-active {
  border-color: var(--selected-border);
  background: var(--selected-bg);
  color: var(--selected-ink);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 30%, transparent);
}

.booking-time:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

/* Sem horários */
.empty-slots {
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  border: 1px dashed var(--booking-input-border);
  padding: 0.875rem 1rem;
  background: var(--booking-input-bg);
  color: var(--booking-input-muted);
}

/* Total */
.booking-total {
  display: flex;
  margin-right: auto;
  flex-direction: column;
  gap: 0.1rem;
}

/* Autofill */
:deep(.booking-textarea:-webkit-autofill) {
  -webkit-text-fill-color: var(--booking-input-text);
  box-shadow: 0 0 0 1000px var(--booking-input-bg) inset;
}

/* Mobile */
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
