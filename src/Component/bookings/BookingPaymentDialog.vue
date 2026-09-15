<script setup>
import { computed, reactive, watch } from "vue";
import AppIcon from "@/Component/ui/AppIcon.vue";
import AppModal from "@/Component/ui/AppModal.vue";
import { useBookingFlowContext } from "@/Composable/bookings/bookingContext.js";
const { draft, paymentOpen, paymentMethod, paymentState, totalLabel, finish } =
  useBookingFlowContext();

const paymentCategory = computed({
  get: () => (paymentMethod.value === "card" ? "card" : "mobile"),
  set: (value) => {
    paymentMethod.value = value === "card" ? "card" : "mpesa";
  },
});
const details = reactive({
  phone: "",
  holder: "",
  number: "",
  expiry: "",
  cvv: "",
});
const currentMonth = new Date();
const minimumExpiry = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`;

function clearDetails() {
  Object.keys(details).forEach((key) => (details[key] = ""));
}
watch(paymentOpen, clearDetails);
watch(paymentMethod, () => {
  clearDetails();
  paymentState.value = "ready";
});
function formatPhone(event) {
  let digits = event.target.value.replace(/\D/g, "");
  if (digits.startsWith("258")) digits = digits.slice(3);
  digits = digits.slice(0, 9);
  details.phone = digits
    ? `${digits.slice(0, 2)}${digits.length > 2 ? " " + digits.slice(2, 5) : ""}${digits.length > 5 ? " " + digits.slice(5) : ""}`
    : "";
  event.target.value = details.phone;
}
function formatCardNumber(event) {
  details.number = event.target.value
    .replace(/\D/g, "")
    .slice(0, 19)
    .replace(/(.{4})(?=.)/g, "$1 ");
  event.target.value = details.number;
}
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
   
    <form @submit.prevent="finish('paid')" autocomplete="off">
      <label class="field">
        Método de pagamento
        <select v-model="paymentCategory">
          <option value="mobile">Carteiras Móveis</option>
          <option value="card">Cartão de Crédito</option>
        </select>
      </label>
      <template v-if="paymentCategory === 'mobile'">
        <label class="field">
          Carteira móvel
          <select v-model="paymentMethod">
            <option value="mkesh">Mkesh</option>
            <option value="mpesa">Mpesa</option>
            <option value="emola">eMola</option>
          </select>
        </label>
        <label class="field">
          Número de telefone
          <span class="flex items-center gap-2">
            <span class="shrink-0 text-body" aria-hidden="true">+258</span>
            <input
              :value="details.phone"
              @input="formatPhone"
              type="tel"
              inputmode="numeric"
              placeholder="** *** ****"
              pattern="[0-9]{2} [0-9]{3} [0-9]{4}"
              title="Introduza os 9 dígitos do número de telefone."
              aria-label="Número de telefone com indicativo +258"
              required
            />
          </span>
          <small>Formato: +258 ** *** ****</small>
        </label>
      </template>
      <div v-else class="form-grid">
        <label class="field form-grid-full">
          Nome do titular
          <input
            v-model="details.holder"
            type="text"
            placeholder="Nome como aparece no cartão"
            required
          />
        </label>
        <label class="field form-grid-full">
          Número do cartão
          <input
            :value="details.number"
            @input="formatCardNumber"
            type="text"
            inputmode="numeric"
            placeholder="0000 0000 0000 0000"
            pattern="(?:[0-9] ?){12,18}[0-9]"
            minlength="15"
            maxlength="23"
            required
          />
        </label>
        <label class="field">
          Validade
          <input
            v-model="details.expiry"
            type="month"
            :min="minimumExpiry"
            required
          />
        </label>
        <label class="field">
          Código de segurança (CVV)
          <input
            v-model="details.cvv"
            type="password"
            inputmode="numeric"
            placeholder="123"
            pattern="[0-9]{3,4}"
            maxlength="4"
            required
          />
        </label>
      </div>
      <p v-if="paymentState === 'declined'" class="error-message" role="alert">
        Pagamento recusado. Pode tentar novamente ou pagar no estabelecimento.
      </p>
      <div class="grid gap-[9px]">
        <button type="submit" class="btn btn-primary">
          <AppIcon name="check" :size="17" />Pagar
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
