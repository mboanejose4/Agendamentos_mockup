<template>
  <main class="page-main">
    <section class="search-banner">
      <div class="shell"><span class="eyebrow light">Descobrir</span><h1>Salões e serviços</h1><p>Encontre opções disponíveis e marque sem telefonemas.</p><label class="search-control white"><span>⌕</span><input v-model="query" placeholder="Pesquisar salão, serviço ou zona" /></label></div>
    </section>
    <div class="shell content-layout">
      <aside class="filters-card desktop-only"><h3>Filtros</h3><label>Localização<select v-model="city"><option value="">Todas</option><option>Maputo</option><option>Matola</option></select></label><label>Serviço<select v-model="serviceName"><option value="">Todos</option><option v-for="s in services" :key="s.id">{{ s.name }}</option></select></label><label class="check-row"><input type="checkbox" v-model="openOnly" /> Aberto agora</label><button class="btn btn-outline full" @click="reset">Limpar filtros</button></aside>
      <section class="results-panel">
        <div class="mobile-filter-row mobile-only"><button class="btn btn-outline compact" @click="mobileFilters = !mobileFilters">☰ Filtros</button><select v-model="sort"><option value="rating">Melhor avaliação</option><option value="distance">Mais próximos</option></select></div>
        <div v-if="mobileFilters" class="mobile-filter-box mobile-only"><select v-model="city"><option value="">Todas as localizações</option><option>Maputo</option><option>Matola</option></select><select v-model="serviceName"><option value="">Todos os serviços</option><option v-for="s in services" :key="s.id">{{ s.name }}</option></select><label class="check-row"><input type="checkbox" v-model="openOnly" /> Aberto agora</label></div>
        <div class="results-head"><div><strong>{{ filtered.length }} resultados</strong><small>Dados demonstrativos para o mockup</small></div><select class="desktop-only" v-model="sort"><option value="rating">Melhor avaliação</option><option value="distance">Mais próximos</option></select></div>
        <div class="result-list">
          <article v-for="salon in filtered" :key="salon.id" class="result-card">
            <button class="result-visual" @click="openSalon(salon.id)"><span class="salon-monogram">{{ salon.accent }}</span><span class="open-pill" :class="{ closed: !salon.open }">{{ salon.open ? 'Aberto' : 'Fechado' }}</span></button>
            <div class="result-content"><div class="rating">★ {{ salon.rating }} <span>({{ salon.reviews }})</span></div><h2>{{ salon.name }}</h2><p>{{ salon.tagline }}</p><div class="result-meta"><span>⌖ {{ salon.area }}, {{ salon.city }}</span><span>◷ {{ salon.hours }}</span></div><div class="tag-row"><span v-for="sid in salon.serviceIds.slice(0, 3)" :key="sid">{{ serviceById(sid)?.name }}</span><span v-if="salon.serviceIds.length > 3">+{{ salon.serviceIds.length - 3 }}</span></div><div class="card-actions"><button class="btn btn-outline" @click="openSalon(salon.id)">Ver detalhes</button><button class="btn btn-primary" @click="startBooking(salon.id)">Marcar</button></div></div>
          </article>
        </div>
      </section>
    </div>
  </main>
</template>

<script>
import { appStore as store, go, startBooking, helpers } from '../store'
import { salons, services } from '../data/mockData'
export default {
  name: 'ExploreView',
  data: () => ({ store, salons, services, query: store.searchQuery || '', city: '', serviceName: '', openOnly: false, mobileFilters: false, sort: 'rating' }),
  computed: {
    filtered() {
      const q = this.query.toLowerCase().trim()
      let rows = salons.filter(s => {
        const names = s.serviceIds.map(id => helpers.serviceById(id)?.name || '').join(' ')
        return (!q || `${s.name} ${s.area} ${s.city} ${names}`.toLowerCase().includes(q)) && (!this.city || s.city === this.city) && (!this.openOnly || s.open) && (!this.serviceName || names.includes(this.serviceName))
      })
      return rows.sort((a,b) => this.sort === 'rating' ? b.rating - a.rating : parseFloat(a.distance) - parseFloat(b.distance))
    },
  },
  methods: { go, startBooking, serviceById: helpers.serviceById, openSalon(id) { store.selectedSalonId = id; go('salon') }, reset() { this.city=''; this.serviceName=''; this.openOnly=false; this.query='' } },
}
</script>
