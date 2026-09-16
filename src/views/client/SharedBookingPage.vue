<script setup lang="ts">
import { computed, ref } from "vue";
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import BusinessIcon from "@/components/shared/ui/BusinessIcon.vue";
import { dateLabel, money, bookingReference } from "@/utils/formatters.ts";
import {
  business,
  go,
  markPaid,
  notify,
  service,
  staffMember,
  state,
} from "@/stores/applicationStore.ts";
import {
  leaveSharedLink,
  sharedBooking,
  sharedToken,
} from "@/stores/sharedBookingStore.ts";

/* O que o cliente vê ao abrir a ligação que o estabelecimento lhe enviou.
   Não exige sessão iniciada: a ligação é a credencial. */

const booking = sharedBooking;
const company = computed(() =>
  booking.value ? business(booking.value.businessId) : undefined,
);
const item = computed(() =>
  booking.value ? service(booking.value.serviceId) : undefined,
);
const person = computed(() =>
  booking.value ? staffMember(booking.value.staffId) : undefined,
);

const payable = computed(
  () =>
    !!booking.value &&
    booking.value.status !== "cancelled" &&
    booking.value.paymentStatus === "pending" &&
    !!company.value?.onlinePayment &&
    state.db.settings.onlinePayments &&
    booking.value.total > 0,
);

const statusNames: Record<string, string> = {
  confirmed: "Confirmada",
  in_progress: "Em curso",
  completed: "Concluída",
  cancelled: "Cancelada",
  no_show: "Falta registada",
};

const paying = ref(false);
function pay(): void {
  if (!booking.value || paying.value) return;
  paying.value = true;
  /* Pagamento simulado, como no resto do mockup. */
  window.setTimeout(() => {
    const result = markPaid(booking.value!.id);
    paying.value = false;
    notify(
      result.ok
        ? "Pagamento registado. Obrigado!"
        : result.error || "Não foi possível registar o pagamento.",
    );
  }, 900);
}

function explore(): void {
  leaveSharedLink();
  go("explore");
}
</script>
<template>
  <div class="mx-auto w-full max-w-[560px]">
    <div v-if="booking && company" class="card overflow-hidden">
      <header class="flex items-center gap-3.5 border-b border-line p-[22px]">
        <BusinessIcon
          :branding="company.branding"
          :name="company.name"
          :size="42"
        />
        <div class="min-w-0">
          <span class="eyebrow mb-0">A SUA MARCAÇÃO</span>
          <h1 class="truncate text-h3">{{ company.name }}</h1>
        </div>
      </header>

      <div class="flex flex-col gap-3.5 p-[22px]">
        <div class="flex items-center justify-between gap-4">
          <span class="text-caption text-muted">Referência</span>
          <strong class="text-caption tabular-nums">{{
            bookingReference(booking.id)
          }}</strong>
        </div>
        <div class="flex items-center justify-between gap-4">
          <span class="text-caption text-muted">Estado</span>
          <strong class="text-caption">{{
            statusNames[booking.status] || booking.status
          }}</strong>
        </div>
        <div class="flex items-center justify-between gap-4">
          <span class="text-caption text-muted">Serviço</span>
          <strong class="text-right text-caption">{{
            item?.name || "Serviço"
          }}</strong>
        </div>
        <div v-if="person" class="flex items-center justify-between gap-4">
          <span class="text-caption text-muted">Profissional</span>
          <strong class="text-right text-caption">{{ person.name }}</strong>
        </div>
        <div class="flex items-center justify-between gap-4">
          <span class="text-caption text-muted">Quando</span>
          <strong class="text-right text-caption"
            >{{ dateLabel(booking.date) }} às {{ booking.time }}</strong
          >
        </div>
        <div class="flex items-center justify-between gap-4">
          <span class="text-caption text-muted">Onde</span>
          <strong class="text-right text-caption">{{ company.address }}</strong>
        </div>
        <div
          class="mt-1 flex items-center justify-between gap-4 border-t border-line pt-3.5"
        >
          <span class="text-caption text-muted">Total</span>
          <strong class="text-body-lg">{{ money(booking.total) }}</strong>
        </div>
        <p
          :class="[
            'flex items-center gap-2 text-caption',
            booking.paymentStatus === 'paid' ? 'text-success' : 'text-muted',
          ]"
        >
          <AppIcon
            :name="booking.paymentStatus === 'paid' ? 'circle-check' : 'wallet'"
            :size="16"
          />
          {{
            booking.paymentStatus === "paid"
              ? "Pagamento recebido."
              : "Por pagar. Pode pagar aqui ou no atendimento."
          }}
        </p>
      </div>

      <div class="flex flex-wrap gap-2.5 border-t border-line p-[22px]">
        <button
          v-if="payable"
          class="btn btn-primary"
          :disabled="paying"
          @click="pay"
        >
          <AppIcon
            :name="paying ? 'loader-circle' : 'credit-card'"
            :size="18"
          />
          {{ paying ? "A processar…" : "Pagar agora" }}</button
        ><button class="btn btn-secondary" @click="explore">
          <AppIcon name="compass" :size="18" /> Explorar o MarcaFácil
        </button>
      </div>
    </div>

    <div v-else class="card p-[26px] text-center">
      <AppIcon name="circle-alert" :size="34" class="mx-auto text-muted" />
      <h1 class="mt-3 text-h3">Não encontrámos esta marcação.</h1>
      <p class="mt-2 text-caption text-muted">
        A ligação pode ter expirado ou estar incompleta<template
          v-if="sharedToken"
        >
          ({{ sharedToken }})</template
        >. Peça ao estabelecimento que a envie de novo.
      </p>
      <button class="btn btn-secondary mt-5" @click="explore">
        Explorar o MarcaFácil
      </button>
    </div>
  </div>
</template>
