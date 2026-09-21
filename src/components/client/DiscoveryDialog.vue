<script setup lang="ts">
import { ref, watch } from "vue";
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import AppModal from "@/components/shared/ui/AppModal.vue";
import BusinessGrid from "@/components/client/BusinessGrid.vue";
import BookingFlowPanel from "@/components/client/BookingFlowPanel.vue";
import DiscoveryCategories from "@/components/client/DiscoveryCategories.vue";
import DiscoverySearchBar from "@/components/client/DiscoverySearchBar.vue";
import { plural } from "@/utils/formatters.ts";
import { provideBusinessDiscovery } from "@/composables/discovery/discoveryContext.ts";
import { state as store } from "@/stores/applicationStore.ts";
import type { Business } from "@/types/domain.ts";
import Select from "primevue/select";

/* Procurar um estabelecimento sem sair das marcações. Reaproveita as mesmas
   peças da exploração — pesquisa, categorias, filtros e grelha —, por isso o
   que aqui se filtra é o mesmo estado que lá: quem fecha o modal e vai a
   Explorar encontra a pesquisa como a deixou. */
const open = defineModel<boolean>({ required: true });

const { state, money, sort, maxPrice, onlineOnly, results, clearFilters } =
  provideBusinessDiscovery();

/* O estabelecimento escolhido. Enquanto estiver definido, a janela mostra as
   etapas da marcação em vez da lista — a página por baixo não muda, e por isso
   não há a sensação de recomeçar do zero. */
const picked = ref<Business | null>(null);

function choose(company: Business): void {
  store.selectedBusinessId = company.id;
  store.bookingDraft = null;
  picked.value = company;
}

function backToList(): void {
  picked.value = null;
}

/* Fechar a janela limpa a escolha, para a próxima abertura começar na lista. */
watch(open, (value) => {
  if (!value) picked.value = null;
});

/* Se algo navegar para outro ecrã, a janela sai da frente. */
watch(
  () => state.view,
  () => (open.value = false),
);
</script>
<template>
  <AppModal
    v-model="open"
    :title="picked ? picked.name : 'Marcar num estabelecimento'"
    width="1040"
  >
    <!-- Etapas da marcação, na mesma janela -->
    <BookingFlowPanel
      v-if="picked"
      :key="picked.id"
      @back="backToList"
      @close="open = false"
    />

    <template v-else>
      <p class="-mt-2 mb-4 text-caption text-muted">
        Encontre o lugar e escolha o serviço. Continua tudo nesta janela.
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
            <Select
              v-model="sort"
              class="border-0 bg-transparent px-[3px] py-[7px] text-caption"
              :options="[
                { label: 'Melhor avaliação', value: 'recommended' },
                { label: 'Mais perto de mim', value: 'distance' },
                { label: 'Menor preço', value: 'price' },
                { label: 'Nome', value: 'name' },
              ]"
              option-label="label"
              option-value="value"
              append-to="self"
          /></label>
          <label class="check-field mb-0"
            ><input type="checkbox" v-model="onlineOnly" />Pagamento
            online</label
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

      <BusinessGrid columns="two" select @select="choose" />
    </template>
  </AppModal>
</template>
