<script setup lang="ts">
import AppModal from "@/components/shared/ui/AppModal.vue";
import { plural } from "@/utils/formatters.ts";
import { useBusinessDiscoveryContext } from "@/composables/discovery/discoveryContext.ts";

const { money, maxPrice, onlineOnly, filtersOpen, results, clearFilters } =
  useBusinessDiscoveryContext();
</script>

<template>
  <AppModal
    v-model="filtersOpen"
    title="Filtrar estabelecimentos"
    panel-class="!rounded-4xl"
  >
    <form @submit.prevent="filtersOpen = false">
      <label class="field">
        Preço inicial máximo

        <strong>
          {{ money(maxPrice) }}
        </strong>

        <input
          v-model.number="maxPrice"
          type="range"
          min="0"
          max="10000"
          step="100"
        />
      </label>

      <label class="check-field">
        <input v-model="onlineOnly" type="checkbox" />

        Aceita pagamento online
      </label>

      <div class="form-actions">
        <button
          type="button"
          class="btn btn-secondary rounded-4xl"
          @click="clearFilters"
        >
          Limpar
        </button>

        <button type="submit" class="btn btn-primary rounded-4xl">
          Ver
          {{ plural(results.length, "resultado", "resultados") }}
        </button>
      </div>
    </form>
  </AppModal>
</template>
