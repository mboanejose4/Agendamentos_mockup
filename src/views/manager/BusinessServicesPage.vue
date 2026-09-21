<script setup lang="ts">
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import ViewModeToggle from "@/components/shared/ui/ViewModeToggle.vue";
import { useListMode } from "@/composables/useListMode.ts";
import { resourceTypeName } from "@/utils/resourceTypes.ts";
import { plural } from "@/utils/formatters.ts";
import { useBusinessManagementContext } from "@/composables/businesses/businessContext.ts";
import InputText from "primevue/inputtext";
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
const mode = useListMode("services");
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
          placeholder="Pesquisar serviços"
          aria-label="Pesquisar serviços"
          class="w-full border-0 bg-transparent pl-0 text-caption"
        />
      </label>
      <span class="text-caption text-muted"
        >{{
          plural(
            services.filter((item) => item.active).length,
            "activo",
            "activos",
          )
        }}
        · {{ services.length }} no total</span
      >
      <ViewModeToggle v-model="mode" />
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
    <div v-else-if="mode === 'table'" class="table-scroll">
      <table class="data-table">
        <thead>
          <tr>
            <th scope="col">Serviço</th>
            <th scope="col">Duração</th>
            <th scope="col">Preço</th>
            <th scope="col">Recurso</th>
            <th scope="col">Estado</th>
            <th scope="col"><span class="sr-only">Acções</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredServices" :key="item.id">
            <th scope="row">
              <span class="block text-ink">{{ item.name }}</span>
              <small class="block text-caption text-muted">{{
                item.description || "Sem descrição."
              }}</small>
            </th>
            <td class="tabular">{{ item.duration }} min</td>
            <td class="tabular">{{ money(item.price) }}</td>
            <td>
              {{
                item.resourceType ? resourceTypeName(item.resourceType) : "—"
              }}
            </td>
            <td>
              <span
                :class="[
                  'badge',
                  item.active ? 'badge-success' : 'badge-neutral',
                ]"
                >{{ item.active ? "Activo" : "Inactivo" }}</span
              >
            </td>
            <td>
              <div class="flex items-center gap-1">
                <button
                  class="icon-btn"
                  :aria-label="'Editar ' + item.name"
                  @click="openEditor('services', item)"
                >
                  <AppIcon name="pencil" :size="16" />
                </button>
                <button
                  class="icon-btn"
                  :aria-label="
                    (item.active ? 'Desactivar ' : 'Activar ') + item.name
                  "
                  @click="toggleActive('services', item)"
                >
                  <AppIcon :name="item.active ? 'pause' : 'play'" :size="16" />
                </button>
                <button
                  class="icon-btn icon-btn-danger"
                  :aria-label="'Eliminar ' + item.name"
                  @click="requestRemoval('services', item)"
                >
                  <AppIcon name="trash-2" :size="16" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
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
          <span
            :class="['badge', item.active ? 'badge-success' : 'badge-neutral']"
            >{{ item.active ? "Activo" : "Inactivo" }}</span
          >
        </div>
        <h3>{{ item.name }}</h3>
        <p class="text-caption text-muted">
          {{ item.description || "Sem descrição." }}
        </p>
        <div
          class="mt-3 flex items-center justify-between gap-3 text-caption text-muted"
        >
          <span class="flex items-center gap-1.5"
            ><AppIcon name="clock-3" :size="15" /> {{ item.duration }} min</span
          >
          <strong class="text-body text-ink">{{ money(item.price) }}</strong>
        </div>
        <div
          v-if="item.resourceType"
          class="mt-2 flex items-center gap-1.5 text-caption text-muted"
        >
          <AppIcon name="layout-grid" :size="14" />
          {{ resourceTypeName(item.resourceType) }}
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
