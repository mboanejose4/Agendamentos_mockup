<script setup lang="ts">
import { computed } from "vue";
import BusinessFiltersDialog from "@/components/client/BusinessFiltersDialog.vue";
import BusinessGrid from "@/components/client/BusinessGrid.vue";
import BusinessMap from "@/components/client/BusinessMap.vue";
import DiscoveryCategories from "@/components/client/DiscoveryCategories.vue";
import DiscoverySearchBar from "@/components/client/DiscoverySearchBar.vue";
import DiscoveryHero from "@/components/client/DiscoveryHero.vue";
import DiscoveryLanding from "@/components/client/DiscoveryLanding.vue";
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import { provideBusinessDiscovery } from "@/composables/discovery/discoveryContext.ts";
const {
  state,
  go,
  category,
  sort,
  maxPrice,
  onlineOnly,
  filtersOpen,
  results,
  selectedCategory,
  openCompany,
} = provideBusinessDiscovery();

/* A apresentação da plataforma só faz sentido na exploração: em Favoritos o
   visitante já sabe o que aqui vem fazer. */
const isExplore = computed(() => state.view === "explore");
const showHero = computed(() => isExplore.value && state.role === "guest");

/* O registo de empresa exige conta: o visitante passa primeiro pela entrada. */
function registerBusiness(): void {
  if (state.role === "guest") {
    state.returnView = "onboard";
    go("auth");
  } else go("onboard");
}
</script>
<template>
  <div>
    <DiscoveryHero v-if="showHero" @register="registerBusiness" />
    <header
      v-else
      class="mb-6 flex flex-col gap-5 sm:mb-[30px] sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <span class="eyebrow max-sm:text-caption">UM TEMPO SÓ SEU</span>
        <h1 class="max-sm:max-w-[340px] max-sm:text-h1 max-sm:leading-[1.25]">
          {{
            state.view === "favorites"
              ? "Os seus lugares favoritos."
              : "O que vamos marcar hoje?"
          }}
        </h1>
        <p class="max-sm:text-caption text-muted">
          {{
            state.view === "favorites"
              ? "Os espaços que quer voltar a visitar."
              : "Encontre o lugar certo. Escolha o seu momento."
          }}
        </p>
      </div>
      <span class="hidden items-center gap-2 text-caption text-muted xl:flex"
        ><AppIcon name="calendar-days" :size="17" />{{
          new Intl.DateTimeFormat("pt-MZ", {
            day: "numeric",
            month: "long",
          }).format(new Date())
        }}</span
      >
    </header>
    <DiscoverySearchBar />
    <DiscoveryCategories />
    <BusinessMap v-if="isExplore" :companies="results" @open="openCompany" />
    <section id="estabelecimentos" class="scroll-mt-6">
      <div
        class="mb-[22px] flex items-center justify-between gap-[15px] max-sm:mb-[18px] max-sm:flex-wrap max-sm:gap-[13px]"
      >
        <div>
          <h2 class="text-h3 font-medium sm:text-h3">
            {{
              category === "Todos"
                ? "Bons lugares, perto de si"
                : selectedCategory(category).label
            }}
          </h2>
          <p class="mt-1.5 text-caption text-muted">
            {{ results.length }}
            {{
              results.length === 1
                ? "estabelecimento disponível"
                : "estabelecimentos disponíveis"
            }}
            <span class="px-[7px] text-muted">·</span> Escolha o seu próximo
            momento
          </p>
        </div>
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
            @click="go('directory')"
          >
            Ver todos<AppIcon name="arrow-right" :size="17" /></button
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
    <DiscoveryLanding v-if="isExplore" @register="registerBusiness" />
    <section
      class="mt-[34px] flex flex-col items-start gap-[10px] border-t border-line pt-[26px] sm:flex-row sm:items-center sm:justify-between sm:gap-5"
    >
      <div class="flex items-center gap-4">
        <span
          class="inline-grid size-[46px] shrink-0 place-items-center rounded-xl bg-warning-soft text-warning max-sm:size-10 max-sm:rounded-[10px] max-[480px]:size-[38px]"
          ><AppIcon name="calendar-check" :size="24"
        /></span>
        <div>
          <h3 class="mb-1 text-body">O seu dia merece espaço.</h3>
          <p class="text-caption text-muted">
            Uma mesa entre amigos, um cuidado de rotina ou uma pausa para si.
          </p>
        </div>
      </div>
      <button
        class="text-button text-caption whitespace-nowrap"
        @click="
          state.role === 'guest'
            ? ((state.returnView = 'appointments'), go('auth'))
            : go('appointments')
        "
      >
        As minhas marcações <AppIcon name="arrow-right" :size="18" />
      </button>
    </section>
    <BusinessFiltersDialog />
  </div>
</template>
