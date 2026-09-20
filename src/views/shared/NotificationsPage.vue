<script setup lang="ts">
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import { useAccountManagementContext } from "@/composables/account/accountContext.ts";
const {
  state,
  notificationTab,
  myNotifications,
  unreadCount,
  visibleNotifications,
  readNotification,
} = useAccountManagementContext();
</script>
<template>
  <div>
    <div class="tabs">
      <button
        :class="{ active: notificationTab === 'all' }"
        @click="notificationTab = 'all'"
      >
        Todas <span>{{ myNotifications.length }}</span></button
      ><button
        :class="{ active: notificationTab === 'unread' }"
        @click="notificationTab = 'unread'"
      >
        Por ler <span>{{ unreadCount }}</span>
      </button>
    </div>
    <div v-if="visibleNotifications.length" class="flex flex-col">
      <article
        v-for="item in visibleNotifications"
        :key="item.id"
        class="flex items-start gap-3 border-b border-line rounded-4xl py-4 last:border-b-0"
        :class="{ 'bg-soft/40': !item.read }"
      >
        <span class="mt-0.5 shrink-0 text-muted"
          ><AppIcon :name="item.read ? 'mail-open' : 'bell'"
        /></span>
        <div class="min-w-0 flex-1">
          <h2 class="mb-0.5 text-body">{{ item.title }}</h2>
          <p class="text-caption text-muted">{{ item.body }}</p>
          <time class="mt-1 block text-caption text-muted">{{
            item.createdAt
              ? new Date(item.createdAt).toLocaleString("pt-PT", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })
              : "Agora"
          }}</time>
        </div>
        <button
          v-if="!item.read"
          class="icon-btn shrink-0"
          title="Marcar como lida"
          aria-label="Marcar como lida"
          @click="readNotification(item)"
        >
          <AppIcon name="check" /></button
        ><span v-else class="shrink-0 text-muted"
          ><AppIcon name="check-check"
        /></span>
      </article>
    </div>
    <div v-else class="empty-state">
      <AppIcon name="bell-off" />
      <h2>
        {{
          notificationTab === "unread"
            ? "Está tudo em dia"
            : "Ainda não há notificações"
        }}
      </h2>
      <p>As actualizações da sua conta aparecem aqui.</p>
    </div>
  </div>
</template>
