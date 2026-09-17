<script setup lang="ts">
import { watch } from "vue";
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import AppModal from "@/components/shared/ui/AppModal.vue";
import BusinessGrid from "@/components/client/BusinessGrid.vue";
import DiscoveryCategories from "@/components/client/DiscoveryCategories.vue";
import DiscoverySearchBar from "@/components/client/DiscoverySearchBar.vue";
import { plural } from "@/utils/formatters.ts";
import { provideBusinessDiscovery } from "@/composables/discovery/discoveryContext.ts";

/* Procurar um estabelecimento sem sair das marcações. Reaproveita as mesmas
   peças da exploração — pesquisa, categorias, filtros e grelha —, por isso o
   que aqui se filtra é o mesmo estado que lá: quem fecha o modal e vai a
   Explorar encontra a pesquisa como a deixou. */
const open = defineModel<boolean>({ required: true });

const { state, money, sort, maxPrice, onlineOnly, results, clearFilters } =
  provideBusinessDiscovery();

/* Escolher um estabelecimento leva à página dele: o modal sai da frente. */
watch(
  () => state.view,
  () => (open.value = false),
);
</script>
<template>
  <AppModal v-model="open" title="Marcar num estabelecimento" width="1040">
    <p class="-mt-2 mb-4 text-caption text-muted">
      Encontre o lugar e escolha o serviço. Ao abrir um estabelecimento, esta
      janela fecha-se.
    </p>

    <DiscoverySearchBar />
    <DiscoveryCategories />

    <div
      class="mb-[18px] flex flex-wrap items-center justify-between gap-3 border-b border-line pb-[18px]"
    >
      <p class="text-caption text-muted">
        {{ plural(results.length, "estabelecimento", "estabelecimentos") }}
      </p>
      <div class="flex flex-wrap items-center gap-3">
        <label class="flex items-center gap-2 text-caption text-muted"
          >Ordenar
          <select
            v-model="sort"
            class="border-0 bg-transparent px-[3px] py-[7px] text-caption"
          >
            <option value="recommended">Melhor avaliação</option>
            <option value="distance">Mais perto de mim</option>
            <option value="price">Menor preço</option>
            <option value="name">Nome</option>
          </select></label
        >
        <label class="check-field mb-0"
          ><input type="checkbox" v-model="onlineOnly" />Pagamento online</label
        >
      </div>
    </div>

    <!-- Os filtros vivem aqui dentro, não num segundo diálogo por cima deste. -->
    <details class="mb-[22px]">
      <summary
        class="cursor-pointer list-none text-caption text-muted [&::-webkit-details-marker]:hidden"
      >
        <AppIcon
          name="sliders-horizontal"
          :size="15"
          class="mr-1 inline align-[-2px]"
        />Mais filtros
      </summary>
      <div class="mt-3 flex flex-wrap items-end gap-5">
        <label class="field mb-0 min-w-[220px] flex-1"
          >Preço inicial máximo <strong>{{ money(maxPrice) }}</strong>
          <input
            type="range"
            min="0"
            max="10000"
            step="100"
            v-model.number="maxPrice"
        /></label>
        <button type="button" class="btn btn-secondary" @click="clearFilters">
          Limpar filtros
        </button>
      </div>
    </details>

    <BusinessGrid />
  </AppModal>
</template>
