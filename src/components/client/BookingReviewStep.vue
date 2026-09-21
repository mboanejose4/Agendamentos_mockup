<script setup lang="ts">
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import PhoneInput from "@/components/shared/ui/PhoneInput.vue";

import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import Button from "primevue/button";
import RadioButton from "primevue/radiobutton";

import { useBookingFlowContext } from "@/composables/bookings/bookingContext.ts";

const {
  state,
  money,
  dateLabel,
  draft,
  couponError,
  appliedCoupon,
  current,
  selectedService,
  isRestaurant,
  totals,
  applyCoupon,
} = useBookingFlowContext();
</script>

<template>
  <div class="flex flex-col gap-5">
    <!-- Cabeçalho -->
    <h2 class="mb-0">Está quase tudo pronto.</h2>

    <!-- Resumo da marcação -->
    <div class="mb-1">
      <div
        class="flex justify-between gap-5 border-b border-line py-3 text-caption"
      >
        <span class="text-muted">Estabelecimento</span>

        <strong class="text-right">
          {{ current?.name }}
        </strong>
      </div>

      <div
        class="flex justify-between gap-5 border-b border-line py-3 text-caption"
      >
        <span class="text-muted">Serviço</span>

        <strong class="text-right">
          {{ selectedService?.name }}
        </strong>
      </div>

      <div
        class="flex justify-between gap-5 border-b border-line py-3 text-caption"
      >
        <span class="text-muted">Data e hora</span>

        <strong class="text-right">
          {{ dateLabel(draft.date) }} · {{ draft.time }}
        </strong>
      </div>

      <div
        class="flex justify-between gap-5 border-b border-line py-3 text-caption"
      >
        <span class="text-muted">
          {{ isRestaurant ? "Pessoas" : "Profissional" }}
        </span>

        <strong class="text-right">
          {{
            isRestaurant
              ? draft.partySize
              : state.db.staff.find((person) => person.id === draft.staffId)
                  ?.name || "Primeiro disponível"
          }}
        </strong>
      </div>
    </div>

    <!-- Pedido especial -->
    <label class="field">
      <span>
        Pedido especial
        <span class="text-muted">(opcional)</span>
      </span>

      <Textarea
        v-model="draft.notes"
        name="notes"
        :rows="3"
        :maxlength="500"
        auto-resize
        placeholder="Algo que o estabelecimento deva saber?"
        class="!w-full !rounded-4xl"
      />
    </label>

    <!-- Telefone -->
    <label class="field">
      <span> Telefone para confirmação, de preferência com WhatsApp </span>

      <PhoneInput
        v-model.trim="draft.phone"
        name="phone"
        autocomplete="tel"
        required
      />

      <small class="text-muted"> A confirmação usa este contacto. </small>
    </label>

    <!-- Cupão de desconto -->
    <div class="field">
      <label for="booking-coupon"> Cupão de desconto </label>

      <div class="flex min-w-0 items-center gap-2.5">
        <InputText
          id="booking-coupon"
          v-model.trim="draft.coupon"
          name="coupon"
          placeholder="O seu código"
          class="!min-w-0 !flex-1 !rounded-4xl"
        />

        <Button
          type="button"
          class="btn btn-secondary !shrink-0 !rounded-4xl"
          @click="applyCoupon"
        >
          Aplicar
        </Button>
      </div>
    </div>

    <!-- Feedback do cupão -->
    <p v-if="couponError" class="error-message" role="alert">
      {{ couponError }}
    </p>

    <p v-else-if="appliedCoupon" class="success-message" role="status">
      Cupão {{ appliedCoupon }} aplicado: menos {{ money(totals.discount) }}.
    </p>

    <!-- Método de pagamento -->
    <div class="flex flex-col gap-2.5">
      <h3 class="mb-2">Como prefere pagar?</h3>

      <!-- Pagamento no estabelecimento -->
      <label
        for="payment-onsite"
        class="choice !rounded-4xl"
        :class="{
          'choice-selected': draft.paymentMethod === 'onsite',
        }"
      >
        <RadioButton
          v-model="draft.paymentMethod"
          input-id="payment-onsite"
          name="booking-payment-method"
          value="onsite"
        />

        <AppIcon name="wallet" />

        <span class="min-w-0 flex-1">
          <strong class="block text-caption"> No estabelecimento </strong>

          <small class="mt-1 block text-caption text-muted">
            Pague no momento do atendimento.
          </small>
        </span>
      </label>

      <!-- Pagamento online -->
      <label
        v-if="
          current?.onlinePayment &&
          state.db.settings.onlinePayments &&
          !draft.excludeBookingId
        "
        for="payment-online"
        class="choice !rounded-4xl"
        :class="{
          'choice-selected': draft.paymentMethod === 'online',
        }"
      >
        <RadioButton
          v-model="draft.paymentMethod"
          input-id="payment-online"
          name="booking-payment-method"
          value="online"
        />

        <AppIcon name="credit-card" />

        <span class="min-w-0 flex-1">
          <strong class="block text-caption"> Online </strong>

          <small class="mt-1 block text-caption text-muted">
            M-Pesa e e-Mola.
          </small>
        </span>
      </label>
    </div>

    <!-- Política de cancelamento -->
    <p class="my-2 flex items-start gap-2 text-caption text-muted">
      <AppIcon name="calendar-clock" :size="16" />

      <span>
        Pode cancelar ou reagendar até
        {{ current?.cancelHours }} horas antes.
      </span>
    </p>
  </div>
</template>
