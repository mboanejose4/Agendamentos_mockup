<script setup>
import AppIcon from "@/Component/ui/AppIcon.vue";
import AppModal from "@/Component/ui/AppModal.vue";
import { useBookingFlowContext } from "@/Composable/bookings/bookingContext.js";
const {
  draft,
  error,
  paymentOpen,
  paymentMethod,
  paymentState,
  totalLabel,
  finish,
} = useBookingFlowContext();
</script>
<template>
  <AppModal v-model="paymentOpen" title="Pagamento de teste">
    <div class="flex items-center gap-5">
      <AppIcon name="credit-card" :size="30" />
      <span class="flex flex-col text-caption text-muted">
        Total a pagar
        <strong class="text-h1 text-ink">{{ totalLabel }}</strong>
      </span>
    </div>
    <p
      class="my-5 rounded-md bg-surface-muted px-3.5 py-3 text-caption text-muted"
    >
      Simulação local. Nenhum valor será cobrado e não são necessários dados
      bancários.
    </p>
    <label class="field">
      Método
      <select v-model="paymentMethod">
        <option value="mpesa">M-Pesa</option>
        <option value="card">Cartão</option>
        <option value="reference">Referência</option>
      </select>
    </label>
    <p v-if="paymentState === 'declined'" class="error-message" role="alert">
      Pagamento recusado. Pode tentar novamente ou pagar no estabelecimento.
    </p>
    <div class="grid gap-[9px]">
      <button class="btn btn-primary" @click="finish('paid')">
        <AppIcon name="check" :size="17" />Aprovar pagamento de teste
      </button>
      <button class="btn btn-secondary" @click="finish('pending')">
        Manter pagamento pendente
      </button>
      <button class="btn btn-secondary" @click="paymentState = 'declined'">
        Testar recusa
      </button>
      <button
        class="text-button"
        @click="
          paymentOpen = false;
          draft.paymentMethod = 'onsite';
        "
      >
        Pagar no estabelecimento
      </button>
    </div>
  </AppModal>
</template>
