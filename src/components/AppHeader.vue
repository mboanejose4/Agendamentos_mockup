<template>
  <header class="app-header">
    <div class="top-strip">
      <div class="shell top-strip-inner">
        <span>Plataforma de Agendamento e Gestão de Serviços</span>
        <span class="secure-text">Sessão segura</span>
      </div>
    </div>
    <div class="shell header-main">
      <button class="brand" @click="go('home')" aria-label="Ir para o início">
        <span class="brand-mark" aria-hidden="true">A</span>
        <span class="brand-copy"><strong>Agenda Serviços</strong><small>Marque. Gerencie. Cresça.</small></span>
      </button>
      <nav class="desktop-nav" v-if="store.role === 'guest' || store.role === 'client'">
        <button :class="{ active: store.view === 'home' }" @click="go('home')">Início</button>
        <button :class="{ active: store.view === 'explore' }" @click="go('explore')">Explorar</button>
        <button v-if="store.role === 'client'" :class="{ active: store.view === 'client-dashboard' }" @click="go('client-dashboard')">Minha conta</button>
      </nav>
      <div class="header-actions">
        <button class="icon-button" v-if="store.role === 'client'" @click="go('notifications')" aria-label="Notificações">
          <span aria-hidden="true">◉</span><span v-if="unread" class="notification-dot">{{ unread }}</span>
        </button>
        <button class="btn btn-ghost compact" v-if="store.role === 'guest'" @click="openAuth('login')">Entrar</button>
        <button class="btn btn-primary compact desktop-only" v-if="store.role === 'guest'" @click="openAuth('register')">Criar conta</button>
        <button class="profile-chip" v-else @click="store.roleSwitcherOpen = true">
          <span class="avatar mini">{{ initials }}</span>
          <span class="profile-copy"><strong>{{ roleLabel }}</strong><small>Alterar perfil</small></span>
        </button>
      </div>
    </div>
  </header>
</template>

<script>
import { appStore as store, go } from '../store'

export default {
  name: 'AppHeader',
  data: () => ({ store }),
  computed: {
    unread() { return store.notifications.filter(n => !n.read).length },
    initials() {
      return ({ client: 'JM', professional: 'CM', salonAdmin: 'AS', platformAdmin: 'AP' })[store.role] || 'U'
    },
    roleLabel() {
      return ({ client: 'Cliente', professional: 'Profissional', salonAdmin: 'Admin. Salão', platformAdmin: 'Admin. Plataforma' })[store.role]
    },
  },
  methods: {
    go,
    openAuth(mode) {
      store.authMode = mode
      go('auth')
    },
  },
}
</script>
