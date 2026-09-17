<script setup lang="ts">
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import AppModal from "@/components/shared/ui/AppModal.vue";
import { useAccountManagementContext } from "@/composables/account/accountContext.ts";
const {
  money,
  today,
  assignedServices,
  bookingClients,
  newBooking,
  newBookingOpen,
  newBookingError,
  newBookingSlots,
  newBookingTotal,
  saveNewBooking,
} = useAccountManagementContext();
</script>
<template>
  <AppModal v-model="newBookingOpen" title="Nova marcação">
    <form @submit.prevent="saveNewBooking">
      <label class="field"
        >Cliente
        <select v-model="newBooking.clientId" required>
          <option value="">Escolher cliente</option>
          <option
            v-for="person in bookingClients"
            :key="person.id"
            :value="person.id"
          >
            {{ person.name }}
          </option>
        </select>
        <small v-if="!bookingClients.length" class="text-caption text-muted"
          >Ainda não há clientes nesta empresa.</small
        ></label
      >

      <label class="field"
        >Serviço
        <select v-model="newBooking.serviceId" required>
          <option value="">Escolher serviço</option>
          <option
            v-for="item in assignedServices"
            :key="item.id"
            :value="item.id"
          >
            {{ item.name }} · {{ money(item.price) }}
          </option>
        </select></label
      >

      <div class="form-grid">
        <label class="field"
          >Data
          <input v-model="newBooking.date" type="date" :min="today()" required
        /></label>
      </div>

      <fieldset class="field">
        <legend class="mb-2">Hora</legend>
        <div v-if="newBookingSlots.length" class="flex flex-wrap gap-2">
          <button
            v-for="slot in newBookingSlots"
            :key="slot"
            type="button"
            :class="[
              'rounded border px-2.5 py-1.5 text-caption',
              newBooking.time === slot
                ? 'border-primary-text bg-soft font-semibold text-primary-text'
                : 'border-line text-muted',
            ]"
            :aria-pressed="newBooking.time === slot"
            @click="newBooking.time = slot"
          >
            {{ slot }}
          </button>
        </div>
        <p v-else class="text-caption text-muted">
          Sem horários livres neste dia para este serviço.
        </p>
      </fieldset>

      <label class="field"
        >Notas
        <textarea
          v-model="newBooking.notes"
          rows="2"
          placeholder="Indicações do cliente"
        ></textarea>
      </label>

      <p v-if="newBookingError" class="error-message">{{ newBookingError }}</p>

      <div class="form-actions">
        <span class="mr-auto text-caption text-muted"
          >Total
          <strong class="ml-1 text-body text-ink">{{
            money(newBookingTotal)
          }}</strong></span
        ><button
          type="button"
          class="btn btn-secondary"
          @click="newBookingOpen = false"
        >
          Cancelar</button
        ><button class="btn btn-primary">
          <AppIcon name="calendar-plus" :size="18" /> Criar e enviar
        </button>
      </div>
    </form>
  </AppModal>
</template>
