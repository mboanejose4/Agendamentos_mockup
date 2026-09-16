<script setup lang="ts">
import { computed, ref, watch } from "vue";
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import AppModal from "@/components/shared/ui/AppModal.vue";
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

/* Envio da marcação ao cliente. Nada sai daqui sozinho: abre-se o WhatsApp
   com a mensagem escrita e é a pessoa ao balcão que carrega em enviar. */

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

/* O contacto começa no que já se conhece do cliente. */
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

/* Guardar o contacto poupa o trabalho de o escrever outra vez. */
function remember(): void {
  const record = booking.value;
  if (!record) return;
  record.whatsapp = phone.value.trim();
  if (client.value && !client.value.phone)
    saveRecord("clients", { ...client.value, phone: phone.value.trim() });
}

function send(): void {
  if (!valid.value || !booking.value) return;
  remember();
  window.open(whatsappUrl(phone.value, message.value), "_blank", "noopener");
  shareOpen.value = false;
}

async function copy(): Promise<void> {
  try {
    await navigator.clipboard.writeText(link.value);
    copied.value = true;
  } catch {
    notify("Não foi possível copiar. Seleccione a ligação e copie à mão.");
  }
}
</script>
<template>
  <AppModal v-model="shareOpen" title="Enviar a marcação ao cliente">
    <form v-if="booking" @submit.prevent="send">
      <label class="field"
        >Contacto de WhatsApp do cliente
        <input
          v-model="phone"
          type="tel"
          inputmode="tel"
          placeholder="84 123 4567"
          autocomplete="tel"
          required
        />
        <small class="text-caption text-muted"
          >Sem indicativo assume-se Moçambique (+258).<template v-if="valid">
            Vai para <strong>+{{ normalizePhone(phone) }}</strong
            >.</template
          ></small
        ></label
      >

      <label class="field"
        >Mensagem
        <textarea v-model="message" rows="9" readonly></textarea>
        <small class="text-caption text-muted"
          >Abre no WhatsApp já escrita. Pode alterá-la lá antes de
          enviar.</small
        ></label
      >

      <button type="button" class="text-button mb-4 text-caption" @click="copy">
        <AppIcon :name="copied ? 'check-check' : 'copy'" :size="16" />
        {{ copied ? "Ligação copiada" : "Copiar só a ligação" }}
      </button>

      <div class="form-actions">
        <button
          type="button"
          class="btn btn-secondary"
          @click="shareOpen = false"
        >
          Fechar</button
        ><button class="btn btn-primary" :disabled="!valid">
          <AppIcon name="send" :size="18" /> Abrir WhatsApp
        </button>
      </div>
    </form>
  </AppModal>
</template>
