<script setup>
import PageHeader from "@/Component/ui/PageHeader.vue";
import AppIcon from "@/Component/ui/AppIcon.vue";
import { usePlatformManagementContext } from "@/Composable/platform/platformContext.js";
const {
  state,
  openCompany,
  openUser,
  filteredLogs,
  exportLogs,
  openNewTicket,
  titles,
} = usePlatformManagementContext();
</script>
<template>
  <PageHeader
    ><div>
      <h1>{{ titles[state.view]?.[0] }}</h1>
      <p>{{ titles[state.view]?.[1] }}</p>
    </div>
    <template #actions>
      <button
        v-if="state.view === 'companies' || state.view === 'platform-overview'"
        class="btn btn-primary"
        @click="openCompany()"
      >
        <AppIcon name="plus" /> Novo estabelecimento</button
      ><button
        v-if="state.view === 'users'"
        class="btn btn-primary"
        @click="openUser()"
      >
        <AppIcon name="user-plus" /> Novo utilizador</button
      ><button
        v-if="state.view === 'support'"
        class="btn btn-primary"
        @click="openNewTicket"
      >
        <AppIcon name="plus" /> Novo pedido</button
      ><button
        v-if="state.view === 'monitoring'"
        class="btn btn-secondary"
        :disabled="!filteredLogs.length"
        @click="exportLogs"
      >
        <AppIcon name="download" /> Exportar registo
      </button>
    </template></PageHeader
  >
</template>
