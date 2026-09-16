<script setup lang="ts">
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import { bookingReference } from "@/utils/formatters.ts";
import BookingServiceStep from "@/components/client/BookingServiceStep.vue";
import BookingTimeStep from "@/components/client/BookingTimeStep.vue";
import BookingReviewStep from "@/components/client/BookingReviewStep.vue";
import BookingSummary from "@/components/client/BookingSummary.vue";
import BookingPaymentDialog from "@/components/client/BookingPaymentDialog.vue";
import { provideBookingFlow } from "@/composables/bookings/bookingContext.ts";
const {
  state,
  go,
  money,
  dateLabel,
  business,
  draft,
  step,
  error,
  paymentMethod,
  created,
  current,
  selectedService,
  next,
  confirm,
  downloadCalendar,
} = provideBookingFlow();
</script>
<template>
  <div v-if="current" class="mx-auto max-w-[1050px]">
    <button
      v-if="step < 4"
      class="text-button -mt-[5px] mb-[22px] text-caption"
      @click="step > 1 ? step-- : go('business')"
    >
      <AppIcon name="arrow-left" :size="17" />Voltar
    </button>
    <header class="mb-[30px] flex items-start justify-between gap-5">
      <div class="min-w-0">
        <span class="eyebrow">{{ current.name }}</span>
        <h1>
          {{
            step === 4
              ? "Tem um encontro marcado."
              : draft.excludeBookingId
                ? "Um novo momento para si."
                : "Reserve um momento para si."
          }}
        </h1>
        <p>
          {{
            step === 4
              ? "Encontre todos os detalhes na sua área pessoal."
              : "Cada detalhe, à sua medida."
          }}
        </p>
      </div>
    </header>
    <div
      v-if="step < 4"
      class="mt-[22px] mb-7 flex border-b border-line md:mt-[30px] md:mb-[35px]"
      aria-label="Progresso da marcação"
    >
      <div
        v-for="(label, index) in [
          'Serviço e preferência',
          'Data e horário',
          'Confirmação',
        ]"
        :key="label"
        class="-mb-px flex flex-1 flex-col items-start gap-2 border-b-2 border-transparent pb-[13px] text-muted md:flex-row md:items-center md:gap-2.5 md:pr-2.5 md:pb-[17px]"
        :class="{
          'border-primary-text text-primary-text': step === index + 1,
        }"
      >
        <span
          class="grid size-[26px] place-items-center rounded-full border border-line text-caption"
          ><AppIcon v-if="step > index + 1" name="check" :size="15" /><template
            v-else
            >{{ index + 1 }}</template
          ></span
        ><strong class="text-caption md:text-caption">{{ label }}</strong>
      </div>
    </div>
    <div
      v-if="step < 4"
      class="grid grid-cols-1 gap-[25px] lg:grid-cols-[minmax(0,1.8fr)_minmax(240px,1fr)] lg:gap-[45px]"
    >
      <section class="min-w-0">
        <BookingServiceStep v-if="step === 1" />
        <BookingTimeStep v-if="step === 2" />
        <BookingReviewStep v-if="step === 3" />
        <p v-if="error" class="error-message" role="alert">{{ error }}</p>
        <div class="form-actions">
          <span class="mr-auto text-caption text-muted"
            >Passo {{ step }} de 3</span
          ><button
            v-if="step < 3"
            class="btn btn-primary"
            :disabled="step === 1 ? !draft.serviceId : !draft.time"
            @click="next"
          >
            Continuar<AppIcon name="arrow-right" :size="17" /></button
          ><button v-else class="btn btn-primary" @click="confirm">
            {{
              state.role === "guest"
                ? "Entrar para confirmar"
                : draft.excludeBookingId
                  ? "Confirmar alteração"
                  : "Confirmar marcação"
            }}<AppIcon name="check" :size="17" />
          </button>
        </div>
      </section>
      <BookingSummary />
    </div>
    <section
      v-else
      class="mx-auto mt-[10px] mb-[40px] max-w-[600px] py-5 text-center md:mt-[40px]"
    >
      <span
        class="mx-auto mb-[25px] grid size-[88px] place-items-center rounded-full bg-surface-muted text-primary-text"
        ><AppIcon name="calendar-check" :size="40" /></span
      ><span class="badge badge-success">{{
        draft.excludeBookingId ? "Marcação actualizada" : "Marcação confirmada"
      }}</span>
      <h2 class="mt-5 mb-2 text-h1">{{ selectedService?.name }}</h2>
      <p class="text-small">{{ current.name }}</p>
      <div class="flex flex-wrap justify-center gap-[15px] py-[25px] md:gap-5">
        <span class="flex items-center gap-2 text-caption text-primary-text"
          ><AppIcon name="calendar-days" class="w-[17px]" />{{
            dateLabel(created?.date || draft.date)
          }}</span
        ><span class="flex items-center gap-2 text-caption text-primary-text"
          ><AppIcon name="clock" class="w-[17px]" />{{
            created?.time || draft.time
          }}</span
        ><span class="flex items-center gap-2 text-caption text-primary-text"
          ><AppIcon name="receipt" class="w-[17px]" />{{
            bookingReference(created?.id)
          }}</span
        >
      </div>
      <p class="text-small text-muted">
        {{
          created?.paymentStatus === "paid"
            ? "Pagamento de teste aprovado."
            : created?.paymentMethod === "online"
              ? "Pagamento online pendente."
              : "Pagamento no estabelecimento."
        }}
        Total: {{ money(created?.total || 0) }}
      </p>
      <div class="form-actions justify-center">
        <button
          class="btn btn-secondary w-full md:w-auto"
          @click="downloadCalendar"
        >
          <AppIcon name="download" :size="17" />Adicionar ao calendário</button
        ><button
          class="btn btn-primary w-full md:w-auto"
          @click="go('appointments')"
        >
          Ver marcações<AppIcon name="arrow-right" :size="17" />
        </button>
      </div>
    </section>
    <BookingPaymentDialog />
  </div>
</template>
