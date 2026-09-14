<script setup>
import AppIcon from "@/Component/ui/AppIcon.vue";
import AppModal from "@/Component/ui/AppModal.vue";
import { useBusinessManagementContext } from "@/Composable/businesses/businessContext.js";
const { form, removeOpen, removal, confirmRemoval } =
  useBusinessManagementContext();
</script>
<template>
  <AppModal v-model="removeOpen" title="Eliminar registo"
    ><div>
      <p>
        Deseja eliminar
        <strong>{{
          removal?.record.name || removal?.record.code || removal?.record.reason
        }}</strong
        >?
      </p>
      <p class="mt-2 text-caption text-muted">
        Os registos associados a reservas serão desactivados para preservar o
        histórico. Clientes com reservas não podem ser eliminados.
      </p>
      <div class="form-actions">
        <button class="btn btn-secondary" @click="removeOpen = false">
          Voltar</button
        ><button class="btn btn-danger" @click="confirmRemoval">
          <AppIcon name="trash-2" :size="17" /> Eliminar
        </button>
      </div>
    </div></AppModal
  >
</template>
