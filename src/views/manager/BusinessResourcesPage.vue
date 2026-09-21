<script setup lang="ts">
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import { resourceTypeName } from "@/utils/resourceTypes.ts";
import { plural } from "@/utils/formatters.ts";
import { useBusinessManagementContext } from "@/composables/businesses/businessContext.ts";
import InputText from "primevue/inputtext";
const {
  state,
  resources,
  query,
  filteredResources,
  openEditor,
  requestRemoval,
} = useBusinessManagementContext();
</script>
<template>
  <div>
    <div
      class="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
    >
      <label
        class="flex w-full items-center gap-2.5 rounded-4xl border border-line bg-surface px-3 text-muted sm:max-w-[390px] sm:flex-1"
      >
        <AppIcon name="search" :size="18" />
        <InputText
          v-model="query"
          placeholder="Pesquisar espaços e recursos"
          aria-label="Pesquisar espaços e recursos"
          class="w-full border-0 bg-transparent pl-0 text-caption"
        />
      </label>
      <span class="text-caption text-muted">{{
        plural(resources.length, "recurso", "recursos")
      }}</span>
    </div>
    <div v-if="!filteredResources.length" class="empty-state">
      <AppIcon name="layout-grid" :size="34" />
      <h3>Espaço para o seu negócio</h3>
      <p>Adicione salas, mesas ou equipamentos e a sua capacidade.</p>
    </div>
    <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="item in filteredResources"
        :key="item.id"
        class="card flex items-start gap-4 p-5"
      >
        <div
          class="inline-grid size-12 shrink-0 place-items-center rounded-xl bg-soft text-primary-text"
        >
          <AppIcon
            :name="item.type === 'table' ? 'utensils' : 'door-open'"
            :size="25"
          />
        </div>
        <div class="min-w-0 flex-1">
          <h3>{{ item.name }}</h3>
          <p class="text-caption text-muted">
            {{ resourceTypeName(item.type) }} ·
            {{ plural(item.capacity, "pessoa", "pessoas") }}
          </p>
          <span
            :class="['badge', item.active ? 'badge-success' : 'badge-neutral']"
            >{{ item.active ? "Disponível" : "Indisponível" }}</span
          >
        </div>
        <div class="flex shrink-0 items-center gap-1">
          <button
            class="icon-btn"
            title="Editar recurso"
            @click="openEditor('resources', item)"
          >
            <AppIcon name="pencil" :size="17" />
          </button>
          <button
            class="icon-btn icon-btn-danger"
            title="Eliminar recurso"
            @click="requestRemoval('resources', item)"
          >
            <AppIcon name="trash-2" :size="17" />
          </button>
        </div>
      </article>
    </div>
  </div>
</template>
