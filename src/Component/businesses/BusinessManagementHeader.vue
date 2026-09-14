<script setup>
import PageHeader from "@/Component/ui/PageHeader.vue";
import AppIcon from "@/Component/ui/AppIcon.vue";
import { useBusinessManagementContext } from "@/Composable/businesses/businessContext.js";
const {
  state,
  company,
  services,
  team,
  resources,
  clients,
  promotions,
  blocks,
  page,
  openEditor,
  openBooking,
  exportCsv,
} = useBusinessManagementContext();
</script>
<template>
  <PageHeader>
    <div>
      <span class="eyebrow">{{ company?.name }}</span>
      <h1>{{ page[0] }}</h1>
      <p>{{ page[1] }}</p>
    </div>
    <template #actions>
      <button
        v-if="['overview', 'agenda'].includes(state.view)"
        class="btn btn-primary"
        @click="openBooking()"
      >
        <AppIcon name="plus" :size="18" /> Nova reserva
      </button>
      <button
        v-if="state.view === 'services'"
        class="btn btn-primary"
        @click="openEditor('services')"
      >
        <AppIcon name="plus" :size="18" /> Novo serviço
      </button>
      <button
        v-if="state.view === 'team'"
        class="btn btn-primary"
        @click="openEditor('staff')"
      >
        <AppIcon name="user-plus" :size="18" /> Adicionar membro
      </button>
      <button
        v-if="state.view === 'resources'"
        class="btn btn-primary"
        @click="openEditor('resources')"
      >
        <AppIcon name="plus" :size="18" /> Novo recurso
      </button>
      <button
        v-if="state.view === 'clients'"
        class="btn btn-primary"
        @click="openEditor('clients')"
      >
        <AppIcon name="user-plus" :size="18" /> Novo cliente
      </button>
      <button
        v-if="state.view === 'promotions'"
        class="btn btn-primary"
        @click="openEditor('promotions')"
      >
        <AppIcon name="plus" :size="18" /> Nova promoção
      </button>
      <button
        v-if="state.view === 'schedule'"
        class="btn btn-secondary"
        @click="openEditor('blocks')"
      >
        <AppIcon name="calendar-off" :size="18" /> Bloquear período
      </button>
      <button
        v-if="['payments', 'reports'].includes(state.view)"
        class="btn btn-secondary"
        @click="exportCsv(state.view)"
      >
        <AppIcon name="download" :size="18" /> Exportar
      </button>
    </template>
  </PageHeader>
</template>
