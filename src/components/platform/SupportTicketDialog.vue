<script setup lang="ts">
import AppModal from "@/components/shared/ui/AppModal.vue";
import { usePlatformManagementContext } from "@/composables/platform/platformContext.ts";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import Select from "primevue/select";
const {
  isPlatform,
  businesses,
  ticketOpen,
  ticketForm,
  ticketError,
  saveTicket,
} = usePlatformManagementContext();
</script>
<template>
  <AppModal v-model="ticketOpen" title="Novo pedido de suporte"
    ><form @submit.prevent="saveTicket">
      <div class="form-grid">
        <label class="field form-grid-full"
          ><span>Assunto</span
          ><InputText
            v-model="ticketForm.subject"
            placeholder="Qual é a situação?"
            required
            maxlength="160" /></label
        ><label v-if="isPlatform" class="field"
          ><span>Estabelecimento</span
          ><Select
            v-model="ticketForm.businessId"
            required
            :options="[
              { label: 'Seleccionar', value: '' },
              ...businesses.map((item) => ({
                label: item.name,
                value: item.id,
              })),
            ]"
            option-label="label"
            option-value="value"
            append-to="self" /></label
        ><label class="field"
          >Prioridade<Select
            v-model="ticketForm.priority"
            :options="[
              { label: 'Baixa', value: 'low' },
              { label: 'Normal', value: 'normal' },
              { label: 'Alta', value: 'high' },
              { label: 'Urgente', value: 'urgent' },
            ]"
            option-label="label"
            option-value="value"
            append-to="self" /></label
        ><label class="field form-grid-full"
          ><span>Descrição</span
          ><Textarea
            v-model="ticketForm.body"
            rows="5"
            required
            maxlength="5000"
            placeholder="Descreva a situação e o resultado esperado."
          />
        </label>
      </div>
      <p v-if="ticketError" class="error-message" role="alert">
        {{ ticketError }}
      </p>
      <div class="form-actions">
        <button
          class="btn btn-secondary"
          type="button"
          @click="ticketOpen = false"
        >
          Cancelar</button
        ><button class="btn btn-primary" type="submit">Criar pedido</button>
      </div>
    </form></AppModal
  >
</template>
