<script setup lang="ts">
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import { plural } from "@/utils/formatters.ts";
import { useBusinessManagementContext } from "@/composables/businesses/businessContext.ts";
const {
  state,
  today,
  promotions,
  query,
  serviceName,
  formatDate,
  filteredPromotions,
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
          placeholder="Pesquisar promoções"
          aria-label="Pesquisar promoções"
          class="w-full border-0 bg-transparent pl-0 text-caption"
        />
      </label>
      <span class="text-caption text-muted">{{
        plural(promotions.length, "promoção", "promoções")
      }}</span>
    </div>
    <div v-if="!filteredPromotions.length" class="empty-state">
      <AppIcon name="ticket-percent" :size="34" />
      <h3>A próxima visita pode começar com uma oferta</h3>
      <p>Crie códigos de desconto para os seus serviços.</p>
    </div>
    <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="item in filteredPromotions"
        :key="item.id"
        class="card flex flex-col p-5"
      >
        <div class="mb-3 flex items-center justify-between gap-3">
          <span
            class="flex items-baseline gap-0.5 text-[clamp(24px,7vw,28px)] font-semibold text-primary-text"
            >{{ item.discount }}<small class="text-body">%</small></span
          >
          <span
            :class="[
              'badge',
              item.expires < today()
                ? 'badge-warning'
                : item.active
                  ? 'badge-success'
                  : 'badge-neutral',
            ]"
            >{{
              item.expires < today()
                ? "Expirada"
                : item.active
                  ? "Activa"
                  : "Inactiva"
            }}</span
          >
        </div>
        <h3>{{ item.code }}</h3>
        <p class="text-small text-muted">
          {{
            item.serviceId ? serviceName(item.serviceId) : "Todos os serviços"
          }}
        </p>
        <small class="text-caption text-muted"
          >Válida até {{ formatDate(item.expires) }}</small
        >
        <footer
          class="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4"
        >
          <button
            class="btn btn-secondary"
            @click="openEditor('promotions', item)"
          >
            <AppIcon name="pencil" :size="15" /> Editar
          </button>
          <button
            class="icon-btn"
            :title="item.active ? 'Desactivar promoção' : 'Activar promoção'"
            @click="toggleActive('promotions', item)"
          >
            <AppIcon :name="item.active ? 'pause' : 'play'" :size="17" />
          </button>
          <button
            class="icon-btn icon-btn-danger"
            title="Eliminar promoção"
            @click="requestRemoval('promotions', item)"
          >
            <AppIcon name="trash-2" :size="17" />
          </button>
        </footer>
      </article>
    </div>
  </div>
</template>
