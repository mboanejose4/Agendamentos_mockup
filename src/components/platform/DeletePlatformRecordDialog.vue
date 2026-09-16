<script setup lang="ts">
import AppModal from "@/components/shared/ui/AppModal.vue";
import { usePlatformManagementContext } from "@/composables/platform/platformContext.ts";
const { businesses, removal, removalOpen, removalError, performRemoval } =
  usePlatformManagementContext();
</script>
<template>
  <AppModal
    v-model="removalOpen"
    :title="
      removal?.collection === 'users'
        ? 'Eliminar utilizador'
        : 'Remover estabelecimento'
    "
    ><p>
      Confirme a remoção de <strong>{{ removal?.item.name }}</strong
      >.
    </p>
    <p v-if="removal?.collection === 'businesses'" class="text-muted">
      Estabelecimentos com marcações serão desactivados para preservar o
      histórico.
    </p>
    <p v-if="removalError" class="error-message" role="alert">
      {{ removalError }}
    </p>
    <div class="form-actions">
      <button class="btn btn-secondary" @click="removalOpen = false">
        Cancelar</button
      ><button class="btn btn-danger" @click="performRemoval">
        Confirmar remoção
      </button>
    </div></AppModal
  >
</template>
