<script setup>
import AppModal from "@/Component/ui/AppModal.vue";
import { usePlatformManagementContext } from "@/Composable/platform/platformContext.js";
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
          >Assunto<input
            v-model="ticketForm.subject"
            placeholder="Qual é a situação?"
            required
            maxlength="160" /></label
        ><label v-if="isPlatform" class="field"
          >Estabelecimento<select v-model="ticketForm.businessId" required>
            <option value="" disabled>Seleccionar</option>
            <option v-for="item in businesses" :key="item.id" :value="item.id">
              {{ item.name }}
            </option>
          </select></label
        ><label class="field"
          >Prioridade<select v-model="ticketForm.priority">
            <option value="low">Baixa</option>
            <option value="normal">Normal</option>
            <option value="high">Alta</option>
            <option value="urgent">Urgente</option>
          </select></label
        ><label class="field form-grid-full"
          >Descrição<textarea
            v-model="ticketForm.body"
            rows="5"
            required
            maxlength="5000"
            placeholder="Descreva a situação e o resultado esperado."
          ></textarea>
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
