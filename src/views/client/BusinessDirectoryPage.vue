<script setup lang="ts">
import BusinessCard from "@/components/client/BusinessCard.vue";
import { plural } from "@/utils/formatters.ts";
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import AppModal from "@/components/shared/ui/AppModal.vue";
import { useBusinessDiscovery } from "@/composables/discovery/useBusinessDiscovery.ts";
const {
  state,
  go,
  money,
  business,
  search,
  category,
  city,
  sort,
  maxPrice,
  onlineOnly,
  filtersOpen,
  categories,
  cities,
  favorites,
  servicesFor,
  minPrice,
  results,
  selectedCategory,
  openCompany,
  favorite,
  clearFilters,
  photoError,
} = useBusinessDiscovery();
</script>
<template>
  <div>
    <header
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
    <form
      class="flex min-h-[65px] rounded-lg border border-line bg-surface p-2 shadow-soft max-sm:min-h-[58px] max-sm:p-1.5"
      @submit.prevent
    >
      <div
        class="flex min-w-0 flex-1 items-center gap-3 pl-[15px] text-muted max-sm:gap-2 max-sm:pl-2"
      >
        <AppIcon name="search" /><input
          v-model="search"
          placeholder="Serviço, estabelecimento ou especialidade"
          aria-label="Pesquisar serviços ou estabelecimentos"
          class="w-full border-0 bg-transparent pl-0 text-[12px] outline-none focus:outline-none focus:ring-1 focus:ring-primary max-sm:py-2"
        /><button
          v-if="search"
          type="button"
          class="icon-btn"
          title="Limpar pesquisa"
          @click="search = ''"
        >
          <AppIcon name="x" :size="16" />
        </button>
      </div>
      <div
        class="hidden items-center gap-2 border-l border-line mx-[10px] my-1.5 pl-4 text-muted lg:flex"
      >
        <AppIcon name="map-pin" :size="19" /><select
          v-model="city"
          aria-label="Localização"
          class="max-w-[190px] min-h-[34px] outline-none focus:outline-none focus:ring-1 focus:ring-primary border-0 p-[5px] text-caption lg:max-w-[150px] xl:max-w-[190px]"
        >
          <option>Todas as localizações</option>
          <option v-for="location in cities" :key="location">
            {{ location }}
          </option>
        </select>
      </div>
      <button
        class="btn btn-primary min-w-[115px] text-caption max-sm:min-w-[42px] max-sm:p-2.5"
        type="submit"
      >
        <AppIcon name="search" :size="18" /><span class="max-sm:hidden"
          >Pesquisar</span
        >
      </button>
    </form>
    <div
      class="grid grid-cols-5 gap-1.5 border-b border-line py-[30px] mb-[30px] max-sm:gap-1 max-sm:py-5 max-sm:mb-[25px]"
      aria-label="Categorias"
    >
      <button
        v-for="item in categories"
        :key="item.name"
        :class="[
          'flex flex-col items-center gap-[11px] rounded-md border px-[7px] py-3 text-caption hover:bg-surface-muted max-sm:gap-2.5 max-sm:px-[3px] max-sm:py-2.5 max-sm:leading-[1.4]',
          category === item.name
            ? 'border-primary-text bg-soft font-semibold text-primary-text'
            : 'border-transparent text-muted',
        ]"
        :aria-pressed="category === item.name"
        @click="category = item.name"
      >
        <span
          :class="[
            'inline-grid size-[46px] shrink-0 place-items-center rounded-xl max-sm:size-10 max-sm:rounded-[10px] max-[480px]:size-[38px]',
            {
              mint: 'bg-soft text-primary-text',
              peach: 'bg-warning-soft text-warning',
              lavender: 'bg-secondary-soft text-secondary-text',
              blue: 'bg-secondary-soft text-secondary-text',
              yellow: 'bg-warning-soft text-warning',
            }[item.color],
          ]"
          ><AppIcon :name="item.icon" :size="23" /></span
        ><span>{{ item.label }}</span>
      </button>
    </div>
    <section>
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
      <div
        v-if="results.length"
        class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 xl:gap-[23px] 2xl:grid-cols-4"
      >
        <BusinessCard
          v-for="company in results"
          :key="company.id"
          :company="company"
          :services="servicesFor(company.id)"
          :starting-price="money(minPrice(company.id))"
          :is-favorite="favorites.includes(company.id)"
          :category-icon="selectedCategory(company.category).icon"
          @open="openCompany"
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
    </section>
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
  </div>
</template>
