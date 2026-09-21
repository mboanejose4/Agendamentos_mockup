<script setup lang="ts">
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import BusinessCard from "@/components/client/BusinessCard.vue";
import type { Business } from "@/types/domain.ts";
import { useBusinessDiscoveryContext } from "@/composables/discovery/discoveryContext.ts";

/* `columns: "two"` fixa duas colunas por linha — e o que o diálogo de marcação
   pede, onde o espaço é menor do que o da página.
   `select` troca a navegação pela emissão de `select`: dentro de um diálogo, o
   estabelecimento escolhido continua ali, em vez de mudar a página por baixo. */
const props = withDefaults(
  defineProps<{ columns?: "auto" | "two"; select?: boolean }>(),
  { columns: "auto", select: false },
);

const emit = defineEmits<{ select: [company: Business] }>();

const {
  state,
  go,
  money,
  favorites,
  servicesFor,
  minPrice,
  distanceFrom,
  results,
  selectedCategory,
  openCompany,
  favorite,
  clearFilters,
} = useBusinessDiscoveryContext();

function choose(company: Business): void {
  if (props.select) emit("select", company);
  else openCompany(company);
}
</script>
<template>
  <div>
    <div
      v-if="results.length"
      :class="[
        'grid grid-cols-1 gap-4',
        columns === 'two'
          ? 'sm:grid-cols-2'
          : 'sm:grid-cols-2 xl:grid-cols-3 xl:gap-[23px] 2xl:grid-cols-4',
      ]"
    >
      <BusinessCard
        v-for="company in results"
        :key="company.id"
        :company="company"
        :starting-price="money(minPrice(company.id))"
        :is-favorite="favorites.includes(company.id)"
        :distance="distanceFrom(company)"
        :category-icon="selectedCategory(company.category).icon"
        @open="choose"
        @toggle-favorite="favorite"
      />
    </div>
    <div v-else class="empty-state">
      <AppIcon
        :name="state.view === 'favorites' ? 'heart' : 'search'"
        :size="36"
      />
      <h3>
        {{
          state.view === "favorites"
            ? "Ainda sem favoritos"
            : "Não encontrámos resultados"
        }}
      </h3>
      <p>
        {{
          state.view === "favorites"
            ? "Guarde os estabelecimentos que mais gosta."
            : "Experimente outro serviço, categoria ou localização."
        }}
      </p>
      <button
        class="btn btn-secondary"
        @click="
          clearFilters();
          go('explore');
        "
      >
        {{
          state.view === "favorites"
            ? "Explorar estabelecimentos"
            : "Limpar filtros"
        }}
      </button>
    </div>
  </div>
</template>
