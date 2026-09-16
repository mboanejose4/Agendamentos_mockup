<script setup lang="ts">
import { reactive, watch } from "vue";
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import AppModal from "@/components/shared/ui/AppModal.vue";
import { useBookingFlowContext } from "@/composables/bookings/bookingContext.ts";

const { paymentOpen, paymentMethod, paymentState, totalLabel, finish } =
  useBookingFlowContext();

const details = reactive({
  phone: "",
});

function clearDetails() {
  details.phone = "";
}

watch(paymentOpen, clearDetails);

watch(paymentMethod, () => {
  clearDetails();
  paymentState.value = "ready";
});

function formatPhone(event: Event) {
  const input = event.target as HTMLInputElement;

  let digits = input.value.replace(/\D/g, "");

  if (digits.startsWith("258")) {
    digits = digits.slice(3);
  }

  digits = digits.slice(0, 9);

  details.phone = digits
    ? `${digits.slice(0, 2)}${
        digits.length > 2 ? " " + digits.slice(2, 5) : ""
      }${digits.length > 5 ? " " + digits.slice(5) : ""}`
    : "";

  input.value = details.phone;
}
</script>

<template>
  <AppModal v-model="paymentOpen" title="Selecione a forma de pagamento">
    <div class="flex items-center gap-5">
      <AppIcon name="credit-card" :size="30" />

      <span class="flex flex-col text-caption text-muted">
        Total a pagar
        <strong class="text-h1 text-ink">
          {{ totalLabel }}
        </strong>
      </span>
    </div>

    <form autocomplete="off" @submit.prevent="finish('paid')">
      <label class="field">
        Carteira móvel

        <select v-model="paymentMethod" required>
          <option value="mpesa">M-Pesa</option>
          <option value="emola">e-Mola</option>
        </select>
      </label>

      <label class="field">
        Número de telefone

        <span class="flex items-center gap-2">
          <span class="shrink-0 text-body" aria-hidden="true"> +258 </span>

          <input
            :value="details.phone"
            type="tel"
            inputmode="numeric"
            placeholder="** *** ****"
            pattern="[0-9]{2} [0-9]{3} [0-9]{4}"
            title="Introduza os 9 dígitos do número de telefone."
            aria-label="Número de telefone com indicativo +258"
            required
            @input="formatPhone"
          />
        </span>

        <small> Formato: +258 ** *** **** </small>
      </label>

      <p v-if="paymentState === 'declined'" class="error-message" role="alert">
        Pagamento recusado. Pode tentar novamente ou pagar no estabelecimento.
      </p>

      <div class="grid gap-[9px]">
        <button type="submit" class="btn btn-primary">
          <AppIcon name="check" :size="17" />
          Pagar
        </button>

        <button
          type="button"
          class="btn btn-secondary"
          @click="paymentState = 'declined'"
        >
          Testar recusa
        </button>
      </div>
    </form>
  </AppModal>
</template>
