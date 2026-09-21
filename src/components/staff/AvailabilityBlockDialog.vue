<script setup lang="ts">
import AppModal from "@/components/shared/ui/AppModal.vue";
import { useAccountManagementContext } from "@/composables/account/accountContext.ts";
import InputText from "primevue/inputtext";
const { today, blockOpen, blockForm, blockError, saveBlock } =
  useAccountManagementContext();
</script>
<template>
  <AppModal
    v-model="blockOpen"
    :title="blockForm.id ? 'Editar período indisponível' : 'Bloquear período'"
    ><form @submit.prevent="saveBlock">
      <div class="form-grid">
        <label class="field form-grid-full"
          ><span>Data</span
          ><input
            v-model="blockForm.date"
            type="date"
            :min="today()"
            required /></label
        ><label class="field"
          ><span>Início</span
          ><input v-model="blockForm.start" type="time" required /></label
        ><label class="field"
          ><span>Fim</span
          ><input v-model="blockForm.end" type="time" required /></label
        ><label class="field form-grid-full"
          ><span>Motivo</span
          ><InputText
            v-model="blockForm.reason"
            required
            placeholder="Ex.: Pausa, consulta, férias"
            maxlength="150"
        /></label>
      </div>
      <p v-if="blockError" class="error-message" role="alert">
        {{ blockError }}
      </p>
      <div class="form-actions">
        <button
          type="button"
          class="btn btn-secondary"
          @click="blockOpen = false"
        >
          Cancelar</button
        ><button type="submit" class="btn btn-primary">Guardar período</button>
      </div>
    </form></AppModal
  >
</template>
