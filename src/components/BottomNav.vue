<template>
  <nav class="mobile-bottom-nav" v-if="items.length">
    <button v-for="item in items" :key="item.view" :class="{ active: store.view === item.view }" @click="go(item.view)">
      <span class="nav-icon" aria-hidden="true">{{ item.icon }}</span>
      <span>{{ item.label }}</span>
    </button>
  </nav>
</template>

<script>
import { appStore as store, go } from '../store'

export default {
  name: 'BottomNav',
  data: () => ({ store }),
  computed: {
    items() {
      if (store.role === 'guest') return [
        { view: 'home', label: 'Início', icon: '⌂' },
        { view: 'explore', label: 'Explorar', icon: '⌕' },
        { view: 'auth', label: 'Entrar', icon: '◎' },
      ]
      if (store.role === 'client') return [
        { view: 'home', label: 'Início', icon: '⌂' },
        { view: 'explore', label: 'Explorar', icon: '⌕' },
        { view: 'client-dashboard', label: 'Marcações', icon: '▣' },
        { view: 'profile', label: 'Perfil', icon: '◎' },
      ]
      if (store.role === 'professional') return [
        { view: 'professional-dashboard', label: 'Agenda', icon: '▣' },
        { view: 'professional-services', label: 'Serviços', icon: '✂' },
        { view: 'professional-availability', label: 'Horários', icon: '◷' },
        { view: 'profile', label: 'Perfil', icon: '◎' },
      ]
      if (store.role === 'salonAdmin') return [
        { view: 'salon-admin', label: 'Painel', icon: '▦' },
        { view: 'admin-agenda', label: 'Agenda', icon: '▣' },
        { view: 'admin-team', label: 'Equipa', icon: '◉' },
        { view: 'admin-more', label: 'Mais', icon: '•••' },
      ]
      return [
        { view: 'platform-admin', label: 'Painel', icon: '▦' },
        { view: 'platform-salons', label: 'Salões', icon: '◇' },
        { view: 'platform-monitoring', label: 'Monitoria', icon: '◌' },
        { view: 'platform-support', label: 'Suporte', icon: '?' },
      ]
    },
  },
  methods: { go },
}
</script>
