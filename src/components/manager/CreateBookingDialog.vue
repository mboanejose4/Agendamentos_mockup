<script setup lang="ts">
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import { plural } from "@/utils/formatters.ts";
import AppModal from "@/components/shared/ui/AppModal.vue";
import { useBusinessManagementContext } from "@/composables/businesses/businessContext.ts";
const {
  money,
  today,
  company,
  services,
  reservableClients,
  form,
  bookingOpen,
  bookingError,
  bookingForm,
  bookingService,
  bookingStaff,
  bookingResources,
  slots,
  currentTimeUnavailable,
  saveBooking,
} = useBusinessManagementContext();
</script>
<template>
  <AppModal
    v-model="bookingOpen"
    :title="bookingForm.id ? 'Editar reserva' : 'Nova reserva'"
  >
    <form @submit.prevent="saveBooking">
      <div
        v-if="bookingError"
        class="error-message mb-[18px] flex items-center gap-2"
        role="alert"
      >
        <AppIcon name="circle-alert" :size="17" /> {{ bookingError }}
      </div>
      <div class="form-grid">
        <label class="field form-grid-full"
          ><span>Cliente</span
          ><select v-model="bookingForm.clientId" required>
            <option disabled value="">Seleccionar cliente</option>
            <option
              v-for="item in reservableClients"
              :key="item.id"
              :value="item.id"
            >
              {{ item.name }}{{ item.phone ? " · " + item.phone : "" }}
            </option>
          </select></label
        >
        <p
          v-if="!reservableClients.length"
          class="form-grid-full text-caption text-muted"
        >
          Não existem clientes activos disponíveis para uma nova reserva nesta
          empresa.
        </p>
        <label class="field form-grid-full"
          ><span>Serviço</span
          ><select v-model="bookingForm.serviceId" required>
            <option disabled value="">Seleccionar serviço</option>
            <option
              v-for="item in services.filter(
                (item) => item.active || item.id === bookingForm.serviceId,
              )"
              :key="item.id"
              :value="item.id"
            >
              {{ item.name }} · {{ money(item.price) }} ·
              {{ item.duration }} min
            </option>
          </select></label
        ><label class="field"
          ><span>Profissional</span
          ><select v-model="bookingForm.staffId" required>
            <option disabled value="">Seleccionar profissional</option>
            <option
              v-for="person in bookingStaff"
              :key="person.id"
              :value="person.id"
            >
              {{ person.name }}
            </option>
          </select></label
        ><label class="field"
          ><span>Data</span
          ><input
            v-model="bookingForm.date"
            type="date"
            :min="today()"
            required /></label
        ><label
          v-if="bookingResources.length || bookingService?.resourceType"
          class="field"
          ><span
            >Espaço ou recurso
            {{ bookingService?.resourceType ? "" : "(opcional)" }}</span
          ><select
            v-model="bookingForm.resourceId"
            :required="!!bookingService?.resourceType"
          >
            <option value="">Seleccionar recurso</option>
            <option
              v-for="item in bookingResources"
              :key="item.id"
              :value="item.id"
            >
              {{ item.name }} · {{ plural(item.capacity, "pessoa", "pessoas") }}
            </option>
          </select></label
        ><label
          v-if="bookingResources.length || company?.category === 'Restauração'"
          class="field"
          ><span>Número de pessoas</span
          ><input
            v-model.number="bookingForm.partySize"
            type="number"
            min="1"
            max="500"
            required
        /></label>
      </div>
      <fieldset class="mb-[18px]">
        <legend class="mb-3 block text-caption font-medium">
          Horários disponíveis
        </legend>
        <div
          v-if="slots.length"
          class="grid grid-cols-3 gap-2.5 sm:grid-cols-4"
        >
          <button
            v-for="slot in slots"
            :key="slot"
            type="button"
            class="min-h-[43px] rounded-[5px] border border-line bg-surface text-caption"
            :class="
              bookingForm.time === slot
                ? 'border-primary bg-primary text-on-primary'
                : ''
            "
            @click="bookingForm.time = slot"
          >
            {{ slot }}
          </button>
        </div>
        <p v-else class="text-caption text-muted">
          Não existem horários disponíveis. Experimente outra data ou
          profissional.
        </p>
        <p v-if="currentTimeUnavailable" class="mt-2 text-caption text-warning">
          Horário actual: {{ bookingForm.time }}. Seleccione um horário
          disponível para reagendar.
        </p>
      </fieldset>
      <label class="field"
        ><span>Telefone para confirmação por WhatsApp</span>
        <input
          v-model.trim="bookingForm.whatsapp"
          type="tel"
          placeholder="+258 84 000 0000"
        />
        <small>Se vazio, será usado o telefone da ficha do cliente.</small>
      </label>
      <label class="field"
        ><span>Observações (opcional)</span
        ><textarea
          v-model="bookingForm.notes"
          rows="2"
          maxlength="500"
          placeholder="Preferências ou informações para a equipa"
        ></textarea>
      </label>
      <div
        class="mb-5 flex items-center justify-between border-t border-line pt-4 text-small"
      >
        <span>{{ bookingForm.id ? "Valor da reserva" : "Total" }}</span
        ><strong class="text-h3 text-primary-text">{{
          money(
            bookingForm.id && bookingForm.total != null
              ? bookingForm.total
              : bookingService?.price || 0,
          )
        }}</strong>
      </div>
      <div class="form-actions">
        <button
          class="btn btn-secondary"
          type="button"
          @click="bookingOpen = false"
        >
          Cancelar</button
        ><button
          class="btn btn-primary"
          type="submit"
          :disabled="
            !reservableClients.length ||
            !bookingForm.time ||
            !slots.includes(bookingForm.time)
          "
        >
          <AppIcon name="check" :size="17" />
          {{ bookingForm.id ? "Guardar alterações" : "Confirmar reserva" }}
        </button>
      </div>
    </form>
  </AppModal>
</template>
