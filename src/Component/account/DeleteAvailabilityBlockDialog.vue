<script setup>
import AppModal from "@/Component/ui/AppModal.vue";
import { useAccountManagementContext } from "@/Composable/account/accountContext.js";
const { deleteBlock, deleteBlockOpen, removeBlock } =
  useAccountManagementContext();
</script>
<template>
  <AppModal v-model="deleteBlockOpen" title="Remover indisponibilidade"
    ><p>
      O período de {{ deleteBlock?.start }} a {{ deleteBlock?.end }} ficará
      novamente disponível para marcações.
    </p>
    <div class="form-actions">
      <button class="btn btn-secondary" @click="deleteBlockOpen = false">
        Manter período</button
      ><button class="btn btn-danger" @click="removeBlock">
        Remover período
      </button>
    </div></AppModal
  >
</template>
