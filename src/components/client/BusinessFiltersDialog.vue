<script setup lang="ts">
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import AppModal from "@/components/shared/ui/AppModal.vue";
import { plural } from "@/utils/formatters.ts";
import { useBusinessDiscoveryContext } from "@/composables/discovery/discoveryContext.ts";
const { money, maxPrice, onlineOnly, filtersOpen, results, clearFilters } =
  useBusinessDiscoveryContext();
</script>
<template>
  <AppModal v-model="filtersOpen" title="Filtrar estabelecimentos"
    ><form @submit.prevent="filtersOpen = false">
      <label class="field"
        >Preço inicial máximo <strong>{{ money(maxPrice) }}</strong
        ><input
          type="range"
          min="0"
          max="10000"
          step="100"
          v-model.number="maxPrice" /></label
      ><label class="check-field"
        ><input type="checkbox" v-model="onlineOnly" />Aceita pagamento
        online</label
      >
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" @click="clearFilters">
          Limpar</button
        ><button class="btn btn-primary">
          Ver {{ plural(results.length, "resultado", "resultados") }}
        </button>
      </div>
    </form></AppModal
  >
</template>
