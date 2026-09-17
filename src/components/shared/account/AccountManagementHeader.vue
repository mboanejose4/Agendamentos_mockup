<script setup lang="ts">
import PageHeader from "@/components/shared/ui/PageHeader.vue";
import { ref } from "vue";
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import DiscoveryDialog from "@/components/client/DiscoveryDialog.vue";

/* Marcar de novo faz-se aqui mesmo, sem sair das marcações. */
const discoveryOpen = ref(false);
import { useAccountManagementContext } from "@/composables/account/accountContext.ts";
const {
  state,
  go,
  professional,
  unreadCount,
  readAllNotifications,
  schedule,
  openBlock,
  history,
  exportHistory,
  headings,
} = useAccountManagementContext();
</script>
<template>
  <PageHeader>
    <div>
      <h1>{{ headings[state.view]?.[0] || "A minha conta" }}</h1>
      <p>{{ headings[state.view]?.[1] }}</p>
    </div>
    <template #actions>
      <button
        v-if="state.view === 'appointments'"
        class="btn btn-primary"
        @click="discoveryOpen = true"
      >
        <AppIcon name="plus" /> Nova marcação
      </button>
      <button
        v-if="state.view === 'notifications'"
        class="btn btn-secondary"
        :disabled="!unreadCount"
        @click="readAllNotifications"
      >
        <AppIcon name="check-check" /> Marcar todas como lidas
      </button>
      <button
        v-if="state.view === 'professional-schedule'"
        class="btn btn-primary"
        @click="openBlock()"
      >
        <AppIcon name="calendar-off" /> Bloquear período
      </button>
      <button
        v-if="state.view === 'professional-history'"
        class="btn btn-secondary"
        :disabled="!history.length"
        @click="exportHistory"
      >
        <AppIcon name="download" /> Exportar
      </button>
    </template>
  </PageHeader>

  <DiscoveryDialog v-model="discoveryOpen" />
</template>
