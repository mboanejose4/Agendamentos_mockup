<script setup>
import PageHeader from "@/Component/ui/PageHeader.vue";
import AppIcon from "@/Component/ui/AppIcon.vue";
import { useAccountManagementContext } from "@/Composable/account/accountContext.js";
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
        @click="go('explore')"
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
</template>
