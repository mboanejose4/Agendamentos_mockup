<script setup lang="ts">
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import BrandBanner from "@/components/shared/ui/BrandBanner.vue";
import BusinessFiltersDialog from "@/components/client/BusinessFiltersDialog.vue";
import BusinessGrid from "@/components/client/BusinessGrid.vue";
import DiscoveryCategories from "@/components/client/DiscoveryCategories.vue";
import DiscoverySearchBar from "@/components/client/DiscoverySearchBar.vue";
import { provideBusinessDiscovery } from "@/composables/discovery/discoveryContext.ts";

/* Listagem completa: só estabelecimentos, pesquisa, categorias e filtros.
   Sem banner, sem mapa e sem as secções de apresentação — quem chega aqui já
   sabe o que procura. */
const { go, sort, onlineOnly, maxPrice, filtersOpen, results } =
  provideBusinessDiscovery();
</script>
<template>
  <div>
    <button
      class="text-button -mt-[5px] mb-[22px] text-caption"
      @click="go('explore')"
    >
      <AppIcon name="arrow-left" :size="17" />Voltar a explorar
    </button>

    <!-- A mesma faixa da marca do resto da aplicação. -->
    <BrandBanner labelledby="directory-title">
      <span
        class="directory-banner__eyebrow text-caption font-semibold tracking-[0.14em]"
      >
        TODOS OS ESTABELECIMENTOS
      </span>

      <h1
        id="directory-title"
        class="directory-banner__title mt-2 max-w-[620px]"
      >
        Procure entre todos.
      </h1>

      <p
        class="directory-banner__description mt-3 max-w-[560px] text-body max-sm:text-caption"
      >
        Pesquise, filtre por categoria, localização ou preço.
      </p>
    </BrandBanner>

    <DiscoverySearchBar />
    <DiscoveryCategories />

    <section>
      <div
        class="mb-[22px] flex items-center justify-between gap-[15px] max-sm:mb-[18px] max-sm:flex-wrap max-sm:gap-[13px]"
      >
        <p class="text-caption text-muted">
          {{ results.length }}
          {{
            results.length === 1
              ? "estabelecimento encontrado"
              : "estabelecimentos encontrados"
          }}
        </p>
        <div class="flex items-center gap-3">
          <select
            v-model="sort"
            aria-label="Ordenar estabelecimentos"
            class="border-0 bg-transparent px-[3px] py-[7px] text-caption text-muted"
          >
            <option value="recommended">Melhor avaliação</option>
            <option value="distance">Mais perto de mim</option>
            <option value="price">Menor preço</option>
            <option value="name">Nome</option></select
          ><button
            class="btn btn-secondary btn-compact"
            @click="filtersOpen = true"
          >
            <AppIcon name="sliders-horizontal" :size="17" /> Filtros<span
              v-if="onlineOnly || maxPrice < 10000"
              class="size-[5px] rounded-full bg-primary"
            ></span>
          </button>
        </div>
      </div>
      <BusinessGrid />
    </section>

    <BusinessFiltersDialog />
  </div>
</template>
