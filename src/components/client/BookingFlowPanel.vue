<script setup lang="ts">
import AppIcon from "@/components/shared/ui/AppIcon.vue";

import Button from "primevue/button";

import { bookingReference } from "@/utils/formatters.ts";

import BookingServiceStep from "@/components/client/BookingServiceStep.vue";
import BookingTimeStep from "@/components/client/BookingTimeStep.vue";
import BookingReviewStep from "@/components/client/BookingReviewStep.vue";
import BookingSummary from "@/components/client/BookingSummary.vue";
import BookingPaymentDialog from "@/components/client/BookingPaymentDialog.vue";

import { provideBookingFlow } from "@/composables/bookings/bookingContext.ts";

/* As mesmas etapas da página de marcação, mas dentro de um diálogo: quem
   escolheu o estabelecimento na janela anterior continua ali mesmo, sem a
   página mudar por baixo e sem a sensação de recomeçar. O composable é
   instanciado aqui, no `mounted` deste painel, e lê o estabelecimento que o
   diálogo já seleccionou. */
const emit = defineEmits<{ back: []; close: [] }>();

const {
  state,
  money,
  dateLabel,
  draft,
  step,
  error,
  created,
  current,
  selectedService,
  next,
  confirm,
  downloadCalendar,
} = provideBookingFlow();
</script>

<template>
  <div v-if="current">
    <!-- Voltar: ao passo anterior ou à lista de estabelecimentos -->
    <Button
      v-if="step < 4"
      text
      type="button"
      class="text-button -mt-1 mb-4 !rounded-4xl"
      @click="step > 1 ? step-- : emit('back')"
    >
      <AppIcon name="arrow-left" :size="17" />
      {{ step > 1 ? "Voltar" : "Escolher outro estabelecimento" }}
    </Button>

    <!-- Cabeçalho -->
    <header class="mb-5">
      <span class="eyebrow">{{ current.name }}</span>

      <h2 class="mb-1">
        {{
          step === 4
            ? "Tem um encontro marcado."
            : "Reserve um momento para si."
        }}
      </h2>

      <p class="text-caption text-muted">
        {{
          step === 4
            ? "Encontre todos os detalhes na sua área pessoal."
            : "Cada detalhe, à sua medida."
        }}
      </p>
    </header>

    <!-- Progresso -->
    <div
      v-if="step < 4"
      class="mb-6 flex border-b border-line"
      aria-label="Progresso da marcação"
    >
      <div
        v-for="(label, index) in [
          'Serviço e preferência',
          'Data e horário',
          'Confirmação',
        ]"
        :key="label"
        class="-mb-px flex flex-1 flex-col items-start gap-2 border-b-2 border-transparent pb-3 text-muted md:flex-row md:items-center md:gap-2.5 md:pr-2.5"
        :class="{
          'border-primary-text text-primary-text': step === index + 1,
        }"
      >
        <span
          class="grid size-[26px] place-items-center rounded-full border border-line text-caption"
        >
          <AppIcon v-if="step > index + 1" name="check" :size="15" />

          <template v-else>{{ index + 1 }}</template>
        </span>

        <strong class="text-caption">{{ label }}</strong>
      </div>
    </div>

    <!-- Etapas -->
    <div
      v-if="step < 4"
      class="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.8fr)_minmax(240px,1fr)] lg:gap-10"
    >
      <section class="min-w-0">
        <BookingServiceStep v-if="step === 1" />
        <BookingTimeStep v-if="step === 2" />
        <BookingReviewStep v-if="step === 3" />

        <p v-if="error" class="error-message" role="alert">{{ error }}</p>

        <div class="form-actions">
          <span class="mr-auto text-caption text-muted">
            Passo {{ step }} de 3
          </span>

          <Button
            v-if="step < 3"
            type="button"
            class="btn btn-primary !rounded-4xl"
            :disabled="step === 1 ? !draft.serviceId : !draft.time"
            @click="next"
          >
            Continuar
            <AppIcon name="arrow-right" :size="17" />
          </Button>

          <Button
            v-else
            type="button"
            class="btn btn-primary !rounded-4xl"
            @click="confirm"
          >
            {{
              state.role === "guest"
                ? "Entrar para confirmar"
                : draft.excludeBookingId
                  ? "Confirmar alteração"
                  : "Confirmar marcação"
            }}
            <AppIcon name="check" :size="17" />
          </Button>
        </div>
      </section>

      <BookingSummary />
    </div>

    <!-- Concluída -->
    <section
      v-else
      class="mx-auto max-w-[600px] rounded-4xl border border-line bg-surface px-5 py-8 text-center sm:px-8"
    >
      <span
        class="mx-auto mb-6 grid size-[88px] place-items-center rounded-full bg-surface-muted text-primary-text"
      >
        <AppIcon name="calendar-check" :size="40" />
      </span>

      <span class="badge badge-success">
        {{
          draft.excludeBookingId
            ? "Marcação actualizada"
            : "Marcação confirmada"
        }}
      </span>

      <h2 class="mt-5 mb-2 text-h1">{{ selectedService?.name }}</h2>

      <p class="text-small">{{ current.name }}</p>

      <div class="flex flex-wrap justify-center gap-4 py-6">
        <span class="flex items-center gap-2 text-caption text-primary-text">
          <AppIcon name="calendar-days" :size="17" />
          {{ dateLabel(created?.date || draft.date) }}
        </span>

        <span class="flex items-center gap-2 text-caption text-primary-text">
          <AppIcon name="clock" :size="17" />
          {{ created?.time || draft.time }}
        </span>

        <span class="flex items-center gap-2 text-caption text-primary-text">
          <AppIcon name="receipt" :size="17" />
          {{ bookingReference(created?.id) }}
        </span>
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
        <Button
          type="button"
          outlined
          class="btn btn-secondary w-full !rounded-4xl md:w-auto"
          @click="downloadCalendar"
        >
          <AppIcon name="download" :size="17" />
          Adicionar ao calendário
        </Button>

        <Button
          type="button"
          class="btn btn-primary w-full !rounded-4xl md:w-auto"
          @click="emit('close')"
        >
          Ver marcações
          <AppIcon name="arrow-right" :size="17" />
        </Button>
      </div>
    </section>

    <BookingPaymentDialog />
  </div>
</template>
