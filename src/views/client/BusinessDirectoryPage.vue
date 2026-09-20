<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

import BusinessFiltersDialog from "@/components/client/BusinessFiltersDialog.vue";
import BusinessGrid from "@/components/client/BusinessGrid.vue";
import BusinessMap from "@/components/client/BusinessMap.vue";
import DiscoveryCategories from "@/components/client/DiscoveryCategories.vue";
import DiscoverySearchBar from "@/components/client/DiscoverySearchBar.vue";
import DiscoveryHero from "@/components/client/DiscoveryHero.vue";
import DiscoveryLanding from "@/components/client/DiscoveryLanding.vue";
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import BrandBanner from "@/components/shared/ui/BrandBanner.vue";

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

const isExplore = computed(() => state.view === "explore");
const isDirectory = computed(() => state.view === "directory");
const isFavorites = computed(() => state.view === "favorites");

const showHero = computed(() => isExplore.value && state.role === "guest");

const showMap = computed(() => isExplore.value || isDirectory.value);

const showPromo = computed(() => isExplore.value && state.role === "guest");

const sortOpen = ref(false);
const sortHost = ref<HTMLElement | null>(null);

const sortOptions = [
  {
    value: "recommended",
    label: "Melhor avaliação",
  },
  {
    value: "distance",
    label: "Mais perto de mim",
  },
  {
    value: "price",
    label: "Menor preço",
  },
  {
    value: "name",
    label: "Nome",
  },
] as const;

const currentSortLabel = computed(
  () =>
    sortOptions.find((option) => option.value === sort.value)?.label ??
    "Melhor avaliação",
);

function registerBusiness(): void {
  if (state.role === "guest") {
    state.returnView = "onboard";
    go("auth");
    return;
  }

  go("onboard");
}

function openAppointments(): void {
  if (state.role === "guest") {
    state.returnView = "appointments";
    go("auth");
    return;
  }

  go("appointments");
}

function selectSort(value: (typeof sortOptions)[number]["value"]): void {
  sort.value = value;
  sortOpen.value = false;
}

function closeSortOnOutsideClick(event: MouseEvent): void {
  if (sortHost.value && !sortHost.value.contains(event.target as Node)) {
    sortOpen.value = false;
  }
}

function closeSortOnEscape(event: KeyboardEvent): void {
  if (event.key === "Escape") {
    sortOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener("click", closeSortOnOutsideClick);
  document.addEventListener("keydown", closeSortOnEscape);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", closeSortOnOutsideClick);
  document.removeEventListener("keydown", closeSortOnEscape);
});
</script>

<template>
  <div>
    <DiscoveryHero v-if="showHero" @register="registerBusiness" />

    <BrandBanner
      v-else-if="isDirectory"
      class="brand-banner-narrow"
      labelledby="directory-title"
    >
      <span class="directory-banner__eyebrow"> TODOS OS ESTABELECIMENTOS </span>

      <h1 id="directory-title" class="directory-banner__title">
        Procure entre todos.
      </h1>

      <p class="directory-banner__description">
        Pesquise, filtre por categoria, localização ou preço.
      </p>
    </BrandBanner>

    <BrandBanner
      v-else
      compact
      class="brand-banner-narrow"
      labelledby="explore-title"
    >
      <span class="directory-banner__eyebrow"> UM TEMPO SÓ SEU </span>

      <h1 id="explore-title" class="directory-banner__title">
        {{
          isFavorites
            ? "Os seus lugares favoritos."
            : "O que vamos marcar hoje?"
        }}
      </h1>

      <p class="directory-banner__description">
        {{
          isFavorites
            ? "Os espaços que quer voltar a visitar."
            : "Encontre o lugar certo. Escolha o seu momento."
        }}
      </p>
    </BrandBanner>

    <DiscoverySearchBar />

    <DiscoveryCategories />

    <BusinessMap v-if="showMap" :companies="results" @open="openCompany" />

    <section id="estabelecimentos" class="scroll-mt-28">
      <div
        class="mb-[22px] flex items-center justify-between gap-[15px] max-sm:mb-[18px] max-sm:flex-wrap max-sm:gap-[13px]"
      >
        <div>
          <h2 class="text-h3 font-medium">
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

            <span class="px-[7px] text-muted">·</span>

            Escolha o seu próximo momento
          </p>
        </div>

        <div class="flex min-w-0 flex-wrap items-center justify-end gap-3">
          <div ref="sortHost" class="sort-menu">
            <button
              class="sort-menu__trigger"
              type="button"
              aria-haspopup="listbox"
              :aria-expanded="sortOpen"
              @click.stop="sortOpen = !sortOpen"
            >
              <span>{{ currentSortLabel }}</span>

              <AppIcon
                name="chevron-down"
                :size="16"
                :class="[
                  'sort-menu__chevron',
                  { 'sort-menu__chevron--open': sortOpen },
                ]"
              />
            </button>

            <div
              v-if="sortOpen"
              class="sort-menu__options"
              role="listbox"
              aria-label="Ordenar estabelecimentos"
            >
              <button
                v-for="option in sortOptions"
                :key="option.value"
                class="sort-menu__option"
                :class="{
                  'sort-menu__option--selected': sort === option.value,
                }"
                type="button"
                role="option"
                :aria-selected="sort === option.value"
                @click="selectSort(option.value)"
              >
                <span>{{ option.label }}</span>

                <AppIcon v-if="sort === option.value" name="check" :size="16" />
              </button>
            </div>
          </div>

          <button
            v-if="!isDirectory"
            class="discovery-action btn btn-compact rounded-4xl"
            type="button"
            @click="go('directory')"
          >
            Ver todos

            <AppIcon name="arrow-right" :size="17" />
          </button>

          <button
            class="discovery-action btn btn-compact rounded-4xl"
            type="button"
            :aria-expanded="filtersOpen"
            @click="filtersOpen = true"
          >
            <AppIcon name="sliders-horizontal" :size="17" />

            Filtros

            <span
              v-if="onlineOnly || maxPrice < 10000"
              class="size-[6px] rounded-full bg-white"
              aria-label="Existem filtros ativos"
            ></span>
          </button>
        </div>
      </div>

      <BusinessGrid />
    </section>

    <DiscoveryLanding v-if="showPromo" @register="registerBusiness" />

    <section
      class="mt-[34px] flex flex-col items-start gap-[10px] border-t border-line pt-[26px] sm:flex-row sm:items-center sm:justify-between sm:gap-5"
    >
      <div class="flex items-center gap-4">
        <span
          class="inline-grid size-[46px] shrink-0 place-items-center rounded-xl bg-warning-soft text-warning max-sm:size-10 max-sm:rounded-[10px] max-[480px]:size-[38px]"
        >
          <AppIcon name="calendar-check" :size="24" />
        </span>

        <div>
          <h3 class="mb-1 text-body">O seu dia merece espaço.</h3>

          <p class="text-caption text-muted">
            Uma mesa entre amigos, um cuidado de rotina ou uma pausa para si.
          </p>
        </div>
      </div>

      <button
        class="discovery-action btn btn-compact rounded-4xl whitespace-nowrap"
        type="button"
        @click="openAppointments"
      >
        As minhas marcações

        <AppIcon name="arrow-right" :size="18" />
      </button>
    </section>

    <BusinessFiltersDialog />
  </div>
</template>

<style scoped>
/*
 * Só o raio. A largura é do BrandBanner: com barra lateral a faixa fica
 * dentro da coluna, alinhada com os cartões; sem barra lateral ocupa a página
 * inteira. Fixá-la em `100dvw` media o ecrã todo e ignorava a barra lateral,
 * pelo que a faixa passava para lá da margem direita.
 */
.brand-banner-narrow {
  border-radius: 32px;
}

.directory-banner__eyebrow {
  display: block;
  margin-bottom: 12px;
  color: rgba(255, 255, 255, 0.76);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.11em;
  line-height: 1.4;
}

.directory-banner__title {
  margin: 0;
  color: #ffffff;
  font-size: clamp(30px, 4vw, 48px);
  font-weight: 700;
  letter-spacing: -0.035em;
  line-height: 1.08;
}

.directory-banner__description {
  max-width: 620px;
  margin-top: 14px;
  color: rgba(255, 255, 255, 0.78);
  font-size: 16px;
  line-height: 1.6;
}

.discovery-action {
  background-color: var(--brand-700);
  border-color: var(--brand-700);
  color: #ffffff;
}

.discovery-action:hover:not(:disabled) {
  background-color: var(--brand-800);
  border-color: var(--brand-800);
  color: #ffffff;
}

.discovery-action:active:not(:disabled) {
  background-color: var(--brand-900);
  border-color: var(--brand-900);
  color: #ffffff;
}

.discovery-action:focus-visible {
  box-shadow:
    0 0 0 2px var(--surface),
    0 0 0 4px var(--brand-500);
}

.discovery-action:disabled {
  background-color: var(--brand-700);
  border-color: var(--brand-700);
  color: #ffffff;
  opacity: 0.55;
}

.discovery-action :deep(svg) {
  color: #ffffff;
  stroke: currentColor;
}

.sort-menu {
  position: relative;
  z-index: 20;
}

.sort-menu__trigger {
  display: flex;
  min-height: 38px;
  min-width: 178px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border: 1px solid var(--brand-700);
  border-radius: 9999px;
  background: var(--brand-700);
  padding: 7px 14px;
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  appearance: none;
  outline: none;
}

.sort-menu__trigger:hover {
  border-color: var(--brand-800);
  background: var(--brand-800);
}

.sort-menu__trigger:focus-visible {
  box-shadow:
    0 0 0 2px var(--surface),
    0 0 0 4px var(--brand-500);
}

.sort-menu__chevron {
  flex-shrink: 0;
  color: #ffffff;
  transition: transform 180ms ease;
}

.sort-menu__chevron--open {
  transform: rotate(180deg);
}

.sort-menu__options {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  display: grid;
  width: max-content;
  min-width: 210px;
  gap: 4px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 24px;
  background: var(--brand-700);
  padding: 7px;
  box-shadow:
    0 18px 42px rgba(4, 24, 18, 0.22),
    0 4px 12px rgba(4, 24, 18, 0.14);
}

.sort-menu__option {
  display: flex;
  width: 100%;
  min-height: 40px;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  border: 0;
  border-radius: 9999px;
  background: transparent;
  padding: 8px 13px;
  color: rgba(255, 255, 255, 0.82);
  font: inherit;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  outline: none;
}

.sort-menu__option:hover,
.sort-menu__option:focus-visible {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
}

.sort-menu__option--selected {
  background: rgba(255, 255, 255, 0.17);
  color: #ffffff;
  font-weight: 700;
}

@media (max-width: 639px) {
  .directory-banner__eyebrow {
    margin-bottom: 9px;
    font-size: 11px;
  }

  .directory-banner__title {
    font-size: 30px;
  }

  .directory-banner__description {
    margin-top: 10px;
    font-size: 14px;
    line-height: 1.5;
  }

  .sort-menu,
  .sort-menu__trigger {
    min-width: 100%;
  }

  .sort-menu__options {
    right: auto;
    left: 0;
    min-width: 220px;
  }
}
</style>
