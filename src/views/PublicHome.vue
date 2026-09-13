<template>
  <main>
    <section class="hero-section">
      <div class="shell hero-grid">
        <div class="hero-copy">
          <span class="eyebrow light">Agendamento digital simples</span>
          <h1>Encontre o serviço certo.<br><span>Marque em poucos minutos.</span></h1>
          <p>Pesquise salões, compare serviços, escolha o profissional e reserve um horário disponível — tudo num só lugar.</p>
          <form class="hero-search" @submit.prevent="search">
            <label class="search-control"><span>⌕</span><input v-model="query" placeholder="Serviço, salão ou localização" aria-label="Pesquisar" /></label>
            <button class="btn btn-accent" type="submit">Pesquisar</button>
          </form>
          <div class="hero-trust"><span>✓ Confirmação imediata</span><span>✓ Agenda em tempo real</span><span>✓ Pagamento opcional</span></div>
        </div>
        <div class="hero-card" aria-label="Exemplo de marcação">
          <div class="hero-card-top"><span class="live-dot"></span><strong>Disponibilidade de hoje</strong><small>Actualizada agora</small></div>
          <div class="mini-service"><span class="service-icon">✂</span><div><strong>Corte de cabelo</strong><small>Beleza & Estilo · 45 min</small></div><b>650 MT</b></div>
          <div class="mini-calendar">
            <button class="day active"><small>TER</small><strong>15</strong></button><button class="day"><small>QUA</small><strong>16</strong></button><button class="day"><small>QUI</small><strong>17</strong></button><button class="day"><small>SEX</small><strong>18</strong></button>
          </div>
          <div class="slot-grid compact-slots"><span>09:30</span><span class="selected">10:00</span><span>10:45</span><span>11:30</span></div>
          <button class="btn btn-primary full" @click="startBooking(1, 1)">Marcar agora</button>
        </div>
      </div>
    </section>

    <section class="section shell">
      <div class="section-heading split"><div><span class="eyebrow">Como funciona</span><h2>Três passos para cuidar de si</h2></div><button class="text-link desktop-only" @click="go('explore')">Explorar todos os serviços →</button></div>
      <div class="steps-grid">
        <article><span class="step-number">01</span><h3>Escolha</h3><p>Pesquise salões e serviços por nome, localização ou categoria.</p></article>
        <article><span class="step-number">02</span><h3>Reserve</h3><p>Seleccione profissional, data e horário disponíveis.</p></article>
        <article><span class="step-number">03</span><h3>Acompanhe</h3><p>Receba confirmação e faça a gestão da marcação na sua área.</p></article>
      </div>
    </section>

    <section class="section soft-section">
      <div class="shell">
        <div class="section-heading"><span class="eyebrow">Serviços</span><h2>O que procura hoje?</h2><p>Explore os principais serviços disponíveis na plataforma.</p></div>
        <div class="service-category-grid">
          <button v-for="service in topServices" :key="service.id" class="service-category" @click="openService(service)">
            <span class="large-icon">{{ service.icon }}</span><strong>{{ service.name }}</strong><small>A partir de {{ money(service.price) }}</small><span class="arrow">›</span>
          </button>
        </div>
      </div>
    </section>

    <section class="section shell">
      <div class="section-heading split"><div><span class="eyebrow">Em destaque</span><h2>Salões perto de si</h2><p>Disponibilidade e serviços num único cartão.</p></div><button class="text-link" @click="go('explore')">Ver todos →</button></div>
      <div class="salon-grid">
        <article v-for="salon in salons.slice(0, 3)" :key="salon.id" class="salon-card" @click="openSalon(salon.id)">
          <div class="salon-visual"><span class="salon-monogram">{{ salon.accent }}</span><span class="open-pill" :class="{ closed: !salon.open }">{{ salon.open ? 'Aberto' : 'Fechado' }}</span></div>
          <div class="salon-body"><div class="rating">★ {{ salon.rating }} <span>({{ salon.reviews }})</span></div><h3>{{ salon.name }}</h3><p>{{ salon.area }}, {{ salon.city }} · {{ salon.distance }}</p><div class="salon-meta"><span>◷ {{ salon.hours }}</span><span>›</span></div></div>
        </article>
      </div>
    </section>

    <section class="section trust-section">
      <div class="shell trust-grid">
        <div><span class="eyebrow light">Experiência segura</span><h2>Da pesquisa à confirmação, com clareza.</h2><p>O mockup respeita o fluxo de autenticação, marcação, pagamento opcional, histórico e notificações previsto nos requisitos.</p><button class="btn btn-light" @click="store.roleSwitcherOpen = true">Testar perfis do sistema</button></div>
        <div class="trust-list"><div><span>✓</span><div><strong>Agenda consistente</strong><small>Evita sobreposição do mesmo profissional no mesmo horário.</small></div></div><div><span>✓</span><div><strong>Dados protegidos</strong><small>Interfaces pensadas para tratamento responsável de dados pessoais.</small></div></div><div><span>✓</span><div><strong>Preparado para crescer</strong><small>Estrutura visual reutilizável para outros tipos de negócio.</small></div></div></div>
      </div>
    </section>

    <section class="section shell faq-section">
      <div class="section-heading"><span class="eyebrow">Perguntas frequentes</span><h2>Precisa de ajuda?</h2></div>
      <div class="faq-list">
        <details open><summary>Preciso de conta para pesquisar serviços?</summary><p>Não. A pesquisa e consulta de detalhes são públicas; a autenticação é solicitada antes de confirmar uma marcação.</p></details>
        <details><summary>Posso cancelar ou reagendar?</summary><p>Sim, de acordo com as regras definidas pelo salão. O mockup inclui ambas as acções na área do cliente.</p></details>
        <details><summary>O pagamento online é obrigatório?</summary><p>Não. O fluxo permite pagamento online quando configurado pelo salão ou pagamento no local.</p></details>
      </div>
    </section>
  </main>
</template>

<script>
import { appStore as store, go, startBooking } from '../store'
import { salons, services } from '../data/mockData'

export default {
  name: 'PublicHome',
  data: () => ({ store, salons, query: '' }),
  computed: { topServices() { return services.slice(0, 6) } },
  methods: {
    go, startBooking,
    money(v) { return `${new Intl.NumberFormat('pt-MZ').format(v)} MT` },
    search() { go('explore', { searchQuery: this.query }) },
    openSalon(id) { store.selectedSalonId = id; go('salon') },
    openService(service) { store.searchQuery = service.name; go('explore') },
  },
}
</script>
