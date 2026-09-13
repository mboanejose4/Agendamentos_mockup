<template>
  <main class="page-main"><div class="shell narrow-shell"><div class="page-title-row"><div><span class="eyebrow">Área do cliente</span><h1>Notificações</h1><p>Confirmações, lembretes e comunicações da plataforma.</p></div><button class="text-link" @click="markNotificationsRead">Marcar todas como lidas</button></div><div class="notification-list"><article v-for="item in store.notifications" :key="item.id" :class="['notification-item',{unread:!item.read}]" @click="item.read=true"><span class="notification-symbol">{{ item.title.includes('Promoção') ? '%' : '✓' }}</span><div><div class="notification-title"><strong>{{ item.title }}</strong><small>{{ item.time }}</small></div><p>{{ item.body }}</p></div></article></div></div></main>
</template>
<script>
import { appStore as store, markNotificationsRead } from '../store'
export default { name:'NotificationsView', data:()=>({store}), methods:{markNotificationsRead} }
</script>
