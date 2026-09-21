<script setup lang="ts">
/* Barra de pesquisa do directório, partilhada pela exploração e pela
   listagem completa. */
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import { useBusinessDiscoveryContext } from "@/composables/discovery/discoveryContext.ts";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
const { search, city, cities } = useBusinessDiscoveryContext();
</script>
<template>
  <form
    class="flex min-h-[65px] rounded-4xl border border-line bg-surface p-2 shadow-soft max-sm:min-h-[58px] max-sm:p-1.5"
    @submit.prevent
  >
    <div
      class="flex min-w-0 flex-1 items-center gap-3 pl-[15px] text-muted max-sm:gap-2 max-sm:pl-2"
    >
      <AppIcon name="search" /><InputText
        v-model="search"
        placeholder="Serviço, empresa ou código"
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
      <AppIcon name="map-pin" :size="19" /><Select
        v-model="city"
        aria-label="Localização"
        class="max-w-[190px] min-h-[34px] outline-none focus:outline-none focus:ring-1 focus:ring-primary border-0 p-[5px] text-caption lg:max-w-[150px] xl:max-w-[190px]"
        :options="[
          { label: 'Todas as localizações', value: 'Todas as localizações' },
          ...cities.map((location) => ({ label: location, value: location })),
        ]"
        option-label="label"
        option-value="value"
        append-to="self"
      />
    </div>
    <button
      class="btn rounded-4xl btn-primary min-w-[115px] text-caption max-sm:min-w-[42px] max-sm:p-2.5"
      type="submit"
    >
      <AppIcon name="search" :size="18" /><span class="max-sm:hidden"
        >Pesquisar</span
      >
    </button>
  </form>
</template>
