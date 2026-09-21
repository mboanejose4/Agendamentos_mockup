<script setup lang="ts">
import { computed, reactive, watch } from "vue";

import AppIcon from "@/components/shared/ui/AppIcon.vue";
import AppModal from "@/components/shared/ui/AppModal.vue";

import Select from "primevue/select";
import InputText from "primevue/inputtext";
import Button from "primevue/button";

import { useBookingFlowContext } from "@/composables/bookings/bookingContext.ts";

const { paymentOpen, paymentMethod, paymentState, totalLabel, finish } =
  useBookingFlowContext();

/* ==========================================
   MÉTODOS DE PAGAMENTO
========================================== */

const paymentOptions = [
  {
    label: "M-Pesa",
    value: "mpesa",
  },
  {
    label: "e-Mola",
    value: "emola",
  },
];

/* ==========================================
   DADOS DO PAGAMENTO
========================================== */

const details = reactive({
  phone: "",
});

/* Limpar os dados */
function clearDetails(): void {
  details.phone = "";
}

/* Limpar quando o modal abre ou fecha */
watch(paymentOpen, clearDetails);

/* Limpar quando o método de pagamento muda */
watch(paymentMethod, () => {
  clearDetails();

  paymentState.value = "ready";
});

/* ==========================================
   FORMATAÇÃO DO TELEMÓVEL
========================================== */

function formatPhone(value: string): string {
  let digits = value.replace(/\D/g, "");

  /* Remover o indicativo quando introduzido */
  if (digits.startsWith("258")) {
    digits = digits.slice(3);
  }

  /* Limitar aos 9 dígitos nacionais */
  digits = digits.slice(0, 9);

  if (!digits) return "";

  return (
    digits.slice(0, 2) +
    (digits.length > 2 ? " " + digits.slice(2, 5) : "") +
    (digits.length > 5 ? " " + digits.slice(5) : "")
  );
}

/*
 * Modelo utilizado pelo InputText.
 * Mantém o número sincronizado com o formulário.
 */
const formattedPhone = computed<string>({
  get: () => details.phone,

  set: (value: string) => {
    details.phone = formatPhone(value);

    if (paymentState.value === "declined") {
      paymentState.value = "ready";
    }
  },
});

/* ==========================================
   VALIDAÇÃO
========================================== */

const isPhoneValid = computed(() => {
  return /^\d{2} \d{3} \d{4}$/.test(details.phone);
});

const isPaymentValid = computed(() => {
  return ["mpesa", "emola"].includes(paymentMethod.value) && isPhoneValid.value;
});

/* ==========================================
   CONFIRMAR PAGAMENTO
========================================== */

function submitPayment(): void {
  if (!isPaymentValid.value) return;

  // Simulação de pagamento do ambiente de teste.
  finish("paid");
}
</script>

<template>
  <AppModal
    v-model="paymentOpen"
    title="Seleccione a forma de pagamento"
    panel-class="payment-modal"
  >
    <!-- TOTAL A PAGAR -->
    <div class="mb-6 flex items-center gap-5">
      <span
        class="grid size-14 shrink-0 place-items-center rounded-4xl bg-soft text-primary-text"
      >
        <AppIcon name="credit-card" :size="28" />
      </span>

      <span class="flex flex-col text-caption text-muted">
        Total a pagar

        <strong class="text-h1 text-ink">
          {{ totalLabel }}
        </strong>
      </span>
    </div>

    <!-- FORMULÁRIO -->
    <form
      autocomplete="off"
      class="payment-form flex flex-col gap-5"
      @submit.prevent="submitPayment"
    >
      <!-- CARTEIRA MÓVEL -->
      <div class="field">
        <label for="payment-wallet"> Carteira móvel </label>

        <Select
          v-model="paymentMethod"
          input-id="payment-wallet"
          :options="paymentOptions"
          option-label="label"
          option-value="value"
          placeholder="Seleccione a carteira móvel"
          append-to="self"
          overlay-class="payment-options-panel"
          fluid
          required
          class="payment-select !w-full !rounded-4xl"
        >
          <!-- OPÇÃO SELECCIONADA -->
          <template #value="slotProps">
            <span v-if="slotProps.value" class="payment-selected-label">
              {{
                paymentOptions.find((item) => item.value === slotProps.value)
                  ?.label ?? "Seleccione a carteira móvel"
              }}
            </span>

            <span v-else class="payment-placeholder">
              Seleccione a carteira móvel
            </span>
          </template>

          <!-- ITENS DO MENU -->
          <template #option="slotProps">
            <span class="payment-option-label">
              {{ slotProps.option.label }}
            </span>
          </template>
        </Select>
      </div>

      <!-- NÚMERO DE TELEFONE -->
      <div class="field">
        <label for="payment-phone"> Número de telefone </label>

        <div class="payment-phone-group">
          <!-- INDICATIVO FIXO -->
          <span class="payment-phone-prefix" aria-hidden="true"> +258 </span>

          <!-- INPUT PRIMEVUE -->
          <InputText
            id="payment-phone"
            v-model="formattedPhone"
            name="phone"
            type="tel"
            inputmode="numeric"
            autocomplete="off"
            placeholder="84 123 4567"
            maxlength="11"
            required
            pattern="8[2-8] [0-9]{3} [0-9]{4}"
            title="Introduza nove dígitos: 8, seguido de um dígito entre 2 e 8, e mais sete dígitos."
            aria-label="Número de telefone com indicativo +258"
            class="payment-phone-input"
          />
        </div>

        <small class="text-caption text-muted">
          Formato: +258 84 123 4567
        </small>
      </div>

      <!-- ERRO DE PAGAMENTO -->
      <p
        v-if="paymentState === 'declined'"
        class="error-message rounded-4xl"
        role="alert"
      >
        Pagamento recusado. Pode tentar novamente ou pagar no estabelecimento.
      </p>

      <!-- BOTÕES -->
      <div class="grid gap-[9px]">
        <Button
          type="submit"
          :disabled="!isPaymentValid"
          class="btn btn-primary !w-full !rounded-4xl"
        >
          <AppIcon name="check" :size="17" />

          Pagar
        </Button>

        <Button
          type="button"
          class="btn btn-secondary !w-full !rounded-4xl"
          @click="paymentState = 'declined'"
        >
          Testar recusa
        </Button>
      </div>
    </form>
  </AppModal>
</template>

<style>
/* ==========================================
   MODAL — ESTRUTURA
========================================== */

/*
 * O Select apresenta o painel dentro do modal.
 * O overflow visível impede que o menu seja
 * cortado pelos limites do diálogo.
 */

.payment-modal {
  border-radius: 2rem !important;
  overflow: visible !important;
}

.payment-modal .dialog-inner {
  overflow: visible !important;
  border-radius: 2rem;
}

/* ==========================================
   SELECT
   Cores pelos tokens partilhados (`--field-*`, `--surface`, `--ink`):
   um so conjunto serve os dois temas, sem bloco de modo escuro a repetir
   tudo com cinzentos proprios.
========================================== */

.payment-modal .payment-select {
  width: 100%;
  min-height: 44px;

  border: 1px solid var(--field-border) !important;
  border-radius: 2rem !important;

  background: var(--field-bg) !important;
  color: var(--field-ink) !important;

  box-shadow: none !important;
}

/* Texto do campo */
.payment-modal .payment-select .p-select-label,
.payment-modal .payment-selected-label {
  color: var(--field-ink) !important;
}

/* Placeholder */
.payment-modal .payment-placeholder,
.payment-modal .p-select-label.p-placeholder {
  color: var(--field-placeholder) !important;
}

/* Ícone da seta */
.payment-modal .payment-select .p-select-dropdown {
  color: var(--field-placeholder) !important;
}

/* Foco */
.payment-modal .payment-select.p-focus {
  border-color: var(--brand-500, #019e51) !important;

  box-shadow: 0 0 0 1px var(--brand-500, #019e51) !important;
}

/* ==========================================
   MENU DE OPÇÕES
========================================== */

/*
 * O painel fica dentro do próprio diálogo
 * graças ao append-to="self".
 */

.payment-modal .payment-options-panel {
  z-index: 100 !important;

  border: 1px solid var(--border) !important;
  border-radius: 2rem !important;

  background: var(--surface) !important;
  color: var(--ink) !important;

  box-shadow: 0 8px 24px rgb(0 0 0 / 12%) !important;

  overflow: hidden;
}

/* Lista de opções */
.payment-modal .payment-options-panel .p-select-list {
  padding: 0.4rem;
  background: var(--surface) !important;
}

/* Cada opção */
.payment-modal .payment-options-panel .p-select-option {
  min-height: 44px;
  padding: 0.75rem 1rem;

  border-radius: 1rem;

  background: transparent;
  color: var(--field-ink) !important;
}

/* Texto da opção */
.payment-modal .payment-option-label {
  color: inherit;
}

/* Hover */
.payment-modal .payment-options-panel .p-select-option:hover {
  background: #e8f5ed !important;
  color: #116b3c !important;
}

/* Opção seleccionada */
.payment-modal
  .payment-options-panel
  .p-select-option.p-select-option-selected {
  background: #d8f3e3 !important;
  color: #116b3c !important;
}

/* ==========================================
   TELEFONE — MODO CLARO
========================================== */

.payment-modal .payment-phone-group {
  display: flex;
  align-items: center;

  width: 100%;
  min-height: 44px;

  overflow: hidden;

  border: 1px solid var(--field-border);
  border-radius: 2rem;

  background: #ffffff;

  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

/* Indicativo */
.payment-modal .payment-phone-prefix {
  display: flex;
  align-items: center;
  align-self: stretch;

  flex-shrink: 0;

  padding: 0 1rem;

  border-right: 1px solid var(--field-border);

  color: var(--field-ink);
  font-weight: 600;
  font-size: 0.875rem;
}

/* Campo de telefone */
.payment-modal .payment-phone-input {
  flex: 1;

  width: 100%;
  min-width: 0;

  border: none !important;
  border-radius: 0 !important;

  background: transparent !important;
  color: var(--field-ink) !important;

  box-shadow: none !important;
  outline: none !important;
}

/* Placeholder */
.payment-modal .payment-phone-input::placeholder {
  color: var(--field-placeholder) !important;
}

/* Foco */
.payment-modal .payment-phone-group:focus-within {
  border-color: var(--brand-500, #019e51);

  box-shadow: 0 0 0 1px var(--brand-500, #019e51);
}
</style>
