<script setup lang="ts">
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import AppModal from "@/components/shared/ui/AppModal.vue";
import { useBusinessManagementContext } from "@/composables/businesses/businessContext.ts";
const { form, removeOpen, removal, confirmRemoval } =
  useBusinessManagementContext();
</script>
<template>
  <AppModal
    v-model="removeOpen"
    :title="
      removal?.collection === 'clients'
        ? 'Remover cliente da empresa'
        : 'Eliminar registo'
    "
    ><div>
      <p>
        {{
          removal?.collection === "clients"
            ? "Deseja remover desta empresa"
            : "Deseja eliminar"
        }}
        <strong>{{
          removal?.record.name || removal?.record.code || removal?.record.reason
        }}</strong
        >?
      </p>
      <p class="mt-2 text-caption text-muted">
        {{
          removal?.collection === "clients"
            ? "O cliente será removido da lista desta empresa. Os dados pessoais e o histórico de reservas serão preservados."
            : "Os registos associados a reservas serão desactivados para preservar o histórico."
        }}
      </p>
      <div class="form-actions">
        <button class="btn btn-secondary" @click="removeOpen = false">
          Voltar</button
        ><button class="btn btn-danger" @click="confirmRemoval">
          <AppIcon name="trash-2" :size="17" />
          {{ removal?.collection === "clients" ? "Remover" : "Eliminar" }}
        </button>
      </div>
    </div></AppModal
  >
</template>
