<script setup>
import AppIcon from "@/Component/ui/AppIcon.vue";
import { useBusinessManagementContext } from "@/Composable/businesses/businessContext.js";
const {
  state,
  money,
  services,
  query,
  filteredServices,
  openEditor,
  requestRemoval,
  toggleActive,
} = useBusinessManagementContext();
</script>
<template>
  <div>
    <div
      class="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
    >
      <label
        class="flex w-full items-center gap-2.5 rounded-md border border-line bg-surface px-3 text-muted sm:max-w-[390px] sm:flex-1"
      >
        <AppIcon name="search" :size="18" />
        <input
          v-model="query"
          placeholder="Pesquisar serviços"
          aria-label="Pesquisar serviços"
          class="w-full border-0 bg-transparent pl-0 text-caption focus-visible:outline-offset-0"
        />
      </label>
      <span class="text-caption text-muted"
        >{{ services.filter((item) => item.active).length }} activos ·
        {{ services.length }} no total</span
      >
    </div>
    <div v-if="!filteredServices.length" class="empty-state">
      <AppIcon name="sparkles" :size="34" />
      <h3>
        {{ query ? "Nenhum serviço encontrado" : "O seu catálogo começa aqui" }}
      </h3>
      <p>
        {{
          query
            ? "Experimente pesquisar outro nome."
            : "Adicione os serviços disponíveis para reserva."
        }}
      </p>
    </div>
    <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="item in filteredServices"
        :key="item.id"
        class="card flex flex-col p-5"
      >
        <div class="mb-3 flex items-center justify-between gap-3">
          <span
            class="inline-grid size-11 shrink-0 place-items-center rounded-xl bg-soft text-primary-text"
          >
            <AppIcon name="sparkles" :size="22" />
          </span>
          <span :class="['badge', item.active ? 'badge-success' : 'badge-neutral']">{{
            item.active ? "Activo" : "Inactivo"
          }}</span>
        </div>
        <h3>{{ item.name }}</h3>
        <p class="text-caption text-muted">
          {{ item.description || "Sem descrição." }}
        </p>
        <div class="mt-3 flex items-center justify-between gap-3 text-caption text-muted">
          <span class="flex items-center gap-1.5"
            ><AppIcon name="clock-3" :size="15" /> {{ item.duration }} min</span
          >
          <strong class="text-body text-ink">{{ money(item.price) }}</strong>
        </div>
        <div
          v-if="item.resourceType"
          class="mt-2 flex items-center gap-1.5 text-caption text-muted"
        >
          <AppIcon name="layout-grid" :size="14" /> {{ item.resourceType }}
        </div>
        <footer
          class="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4"
        >
          <button
            class="btn btn-secondary"
            @click="openEditor('services', item)"
          >
            <AppIcon name="pencil" :size="15" /> Editar
          </button>
          <button
            class="icon-btn"
            :title="item.active ? 'Desactivar serviço' : 'Activar serviço'"
            @click="toggleActive('services', item)"
          >
            <AppIcon :name="item.active ? 'pause' : 'play'" :size="17" />
          </button>
          <button
            class="icon-btn icon-btn-danger"
            title="Eliminar serviço"
            @click="requestRemoval('services', item)"
          >
            <AppIcon name="trash-2" :size="17" />
          </button>
        </footer>
      </article>
    </div>
  </div>
</template>
