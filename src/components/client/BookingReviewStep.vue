<script setup lang="ts">
import AppIcon from "@/components/shared/ui/AppIcon.vue";

import { useBookingFlowContext } from "@/composables/bookings/bookingContext.ts";
const {
  state,
  money,
  dateLabel,
  draft,
  error,
  couponError,
  appliedCoupon,
  paymentMethod,
  current,
  selectedService,
  isRestaurant,
  totals,
  applyCoupon,
} = useBookingFlowContext();
</script>
<template>
  <div>
    <h2>Está quase tudo pronto.</h2>
    <div class="mb-6">
      <div
        class="flex justify-between gap-5 border-b border-line py-3 text-caption"
      >
        <span class="text-muted">Estabelecimento</span
        ><strong class="text-right">{{ current?.name }}</strong>
      </div>
      <div
        class="flex justify-between gap-5 border-b border-line py-3 text-caption"
      >
        <span class="text-muted">Serviço</span
        ><strong class="text-right">{{ selectedService?.name }}</strong>
      </div>
      <div
        class="flex justify-between gap-5 border-b border-line py-3 text-caption"
      >
        <span class="text-muted">Data e hora</span
        ><strong class="text-right"
          >{{ dateLabel(draft.date) }} · {{ draft.time }}</strong
        >
      </div>
      <div
        class="flex justify-between gap-5 border-b border-line py-3 text-caption"
      >
        <span class="text-muted">{{
          isRestaurant ? "Pessoas" : "Profissional"
        }}</span
        ><strong class="text-right">{{
          isRestaurant
            ? draft.partySize
            : state.db.staff.find((p) => p.id === draft.staffId)?.name ||
              "Primeiro disponível"
        }}</strong>
      </div>
    </div>
    <label class="field"
      >Pedido especial <span class="text-muted">(opcional)</span
      ><textarea
        v-model="draft.notes"
        rows="2"
        placeholder="Algo que o estabelecimento deva saber?"
        maxlength="500"
      /></label
    ><label class="field"
      >Telefone para confirmação, de preferência com WhatsApp
      <input
        v-model.trim="draft.phone"
        type="tel"
        inputmode="tel"
        autocomplete="tel"
        placeholder="+258 84 000 0000"
        required
      />
      <small>A confirmação usa este contacto.</small></label
    ><label class="field"
      >Cupão de desconto
      <div class="flex gap-2.5">
        <input
          v-model.trim="draft.coupon"
          class="min-w-0 flex-1"
          placeholder="O seu código"
        /><button class="btn btn-secondary" type="button" @click="applyCoupon">
          Aplicar
        </button>
      </div></label
    >
    <p v-if="couponError" class="error-message">{{ couponError }}</p>
    <p v-else-if="appliedCoupon" class="success-message">
      Cupão {{ appliedCoupon }} aplicado: menos {{ money(totals.discount) }}.
    </p>
    <h3>Como prefere pagar?</h3>
    <label
      class="choice mb-2.5"
      :class="{ 'choice-selected': draft.paymentMethod === 'onsite' }"
      ><input
        type="radio"
        v-model="draft.paymentMethod"
        value="onsite"
      /><AppIcon name="wallet" /><span
        ><strong class="block text-caption">No estabelecimento</strong
        ><small class="mt-1 block text-caption text-muted"
          >Pague no momento do atendimento.</small
        ></span
      ></label
    ><label
      v-if="
        current?.onlinePayment &&
        state.db.settings.onlinePayments &&
        !draft.excludeBookingId
      "
      class="choice mb-2.5"
      :class="{ 'choice-selected': draft.paymentMethod === 'online' }"
      ><input
        type="radio"
        v-model="draft.paymentMethod"
        value="online"
      /><AppIcon name="credit-card" /><span
        ><strong class="block text-caption">Online</strong
        ><small class="mt-1 block text-caption text-muted"
          >M-Pesa e e-Mola.</small
        ></span
      ></label
    >
    <p class="my-5 flex gap-2 text-caption text-muted">
      <AppIcon name="calendar-clock" :size="16" />Pode cancelar ou reagendar até
      {{ current?.cancelHours }} horas antes.
    </p>
  </div>
</template>
