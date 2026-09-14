<script setup>
import AppModal from "@/Component/ui/AppModal.vue";
import { useAccountManagementContext } from "@/Composable/account/accountContext.js";
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
          >Data<input
            v-model="blockForm.date"
            type="date"
            :min="today()"
            required /></label
        ><label class="field"
          >Desde<input v-model="blockForm.start" type="time" required /></label
        ><label class="field"
          >Até<input v-model="blockForm.end" type="time" required /></label
        ><label class="field form-grid-full"
          >Motivo<input
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
