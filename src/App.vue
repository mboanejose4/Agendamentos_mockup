<script setup>
import { computed, ref, watch } from 'vue'
import { state, go, switchRole, logout, business } from '@/core/state'
import AppIcon from '@/components/AppIcon.vue'
import AppModal from '@/components/AppModal.vue'
import DiscoverWorkspace from '@/views/DiscoverWorkspace.vue'
import BookingWorkspace from '@/views/BookingWorkspace.vue'
import AuthWorkspace from '@/views/AuthWorkspace.vue'
import BusinessWorkspace from '@/views/BusinessWorkspace.vue'
import PersonalWorkspace from '@/views/PersonalWorkspace.vue'
import PlatformWorkspace from '@/views/PlatformWorkspace.vue'
const mobileMenu = ref(false)
const workspaceOpen = ref(false)
const roles = [{id:'guest',name:'Explorar',description:'Descobrir empresas e serviços',icon:'compass'},{id:'client',name:'Cliente',description:'Marcações e conta pessoal',icon:'user-round'},{id:'professional',name:'Profissional',description:'Agenda e disponibilidade',icon:'calendar-check'},{id:'manager',name:'Gestor da empresa',description:'Equipa, operação e resultados',icon:'briefcase-business'},{id:'platform',name:'Administrador',description:'Empresas e gestão da plataforma',icon:'shield-check'}]
const currentRole = computed(() => roles.find(r => r.id === state.role))
const user = computed(() => state.db.users.find(u => u.id === state.userId))
const unread = computed(() => state.db.notifications.filter(n => n.userId === state.userId && !n.read).length)
const navigation = computed(() => {
  if (state.role === 'manager') return [{label:'PRINCIPAL',items:[['overview','Visão geral','layout-dashboard'],['agenda','Agenda','calendar-days'],['clients','Clientes','users']]},{label:'EMPRESA',items:[['services','Serviços','scissors'],['team','Equipa','users'],['resources','Recursos','armchair'],['schedule','Horários','clock']]},{label:'GESTÃO',items:[['payments','Pagamentos','wallet'],['reports','Relatórios','bar-chart-3'],['promotions','Promoções','tag'],['settings','Definições','settings'],['support','Suporte','message-square']]}]
  if (state.role === 'platform') return [{label:'PLATAFORMA',items:[['platform-overview','Visão geral','layout-dashboard'],['companies','Empresas','building-2'],['users','Utilizadores','users'],['monitoring','Actividade','activity'],['support','Suporte','message-square'],['platform-settings','Definições','settings']]}]
  if (state.role === 'professional') return [{label:'O SEU TRABALHO',items:[['professional-agenda','A minha agenda','calendar-days'],['professional-services','Serviços','briefcase-business'],['professional-schedule','Disponibilidade','clock'],['professional-history','Histórico','receipt']]},{label:'PESSOAL',items:[['notifications','Notificações','bell'],['profile','O meu perfil','user-round']]}]
  return [{label:'DESCOBRIR',items:[['explore','Explorar','grid-2x2'],['favorites','Favoritos','heart']]},{label:'O SEU ESPAÇO',items:[['appointments','As minhas marcações','calendar-days'],['notifications','Notificações','bell'],['profile','O meu perfil','user-round']]}]
})
const currentLabel = computed(() => navigation.value.flatMap(g=>g.items).find(i=>i[0]===state.view)?.[1] || ({business:'Estabelecimento',booking:'Nova marcação',auth:'A sua conta'}[state.view]) || 'Explorar')
const professionalList = computed(() => state.db.staff.filter(p=>p.businessId===state.businessId && p.active))
const isPersonal = computed(() => ['appointments','notifications','profile'].includes(state.view) || state.view.startsWith('professional-'))
const isPlatform = computed(() => state.role==='platform' || state.view==='support')
function navigate(view) { mobileMenu.value=false; if (state.role==='guest' && ['appointments','profile','notifications'].includes(view)) { state.returnView=view; go('auth') } else go(view) }
function chooseRole(role) { switchRole(role); workspaceOpen.value=false; mobileMenu.value=false }
watch(() => state.view, () => { document.title = `${currentLabel.value} · Elo`; window.scrollTo({top:0,behavior:'instant'}) })
</script>
<template>
  <div class="application" :class="{'menu-open':mobileMenu}">
    <a class="skip-link" href="#main-content">Saltar para o conteúdo</a>
    <button v-if="mobileMenu" class="sidebar-scrim" aria-label="Fechar navegação" @click="mobileMenu=false"></button>
    <aside class="sidebar" aria-label="Navegação principal">
      <button class="brand" aria-label="Elo, início" @click="navigate(state.role==='manager'?'overview':state.role==='platform'?'platform-overview':state.role==='professional'?'professional-agenda':'explore')"><span class="brand-symbol"><AppIcon name="calendar-check" :size="24" /></span><span>elo<span class="brand-dot">.</span></span></button>
      <div class="brand-subtitle">Tempo para o que importa.</div>
      <div v-if="['manager','professional'].includes(state.role)" class="tenant-picker"><label for="company">ESTABELECIMENTO</label><select id="company" v-model="state.businessId" @change="state.staffId=professionalList[0]?.id"><option v-for="company in state.db.businesses" :value="company.id" :key="company.id">{{ company.name }}</option></select><select v-if="state.role==='professional'" v-model="state.staffId" aria-label="Profissional"><option v-for="person in professionalList" :key="person.id" :value="person.id">{{ person.name }}</option></select></div>
      <nav class="main-navigation"><div v-for="group in navigation" :key="group.label" class="nav-group"><span class="nav-label">{{group.label}}</span><button v-for="[view,label,icon] in group.items" :key="view" :class="['nav-item',{active:state.view===view || (view==='explore' && ['business','booking'].includes(state.view))}]" :aria-current="state.view===view ? 'page' : undefined" @click="navigate(view)"><AppIcon :name="icon" :size="19"/><span>{{label}}</span><span v-if="view==='notifications' && unread && state.role!=='guest'" class="count">{{unread}}</span><AppIcon v-else-if="state.view===view" name="chevron-right" :size="15" class="nav-arrow"/></button></div></nav>
      <div class="sidebar-bottom"><div v-if="['guest','client'].includes(state.role)" class="business-invite"><span class="invite-icon"><AppIcon name="building-2" :size="20"/></span><strong>A sua empresa, no Elo.</strong><p>Mais perto dos seus clientes.</p><button @click="state.returnView='onboard';go('auth')">Registar empresa <AppIcon name="arrow-up-right" :size="16"/></button></div><button class="workspace-button" @click="workspaceOpen=true"><span class="avatar small">{{state.role==='guest'?'E':user?.name?.slice(0,1) || 'E'}}</span><span><strong>{{currentRole?.name}}</strong><small>Mudar espaço de trabalho</small></span><AppIcon name="chevron-down" :size="16"/></button></div>
    </aside>
    <div class="app-body">
      <header class="topbar"><div class="topbar-left"><button class="icon-btn mobile-menu-button" aria-label="Abrir navegação" title="Menu" @click="mobileMenu=true"><AppIcon name="menu"/></button><button class="mobile-brand" @click="navigate('explore')">elo.</button><span class="breadcrumb">{{['manager','professional'].includes(state.role)?business()?.name:state.role==='platform'?'Administração':'O seu dia, com mais possibilidades'}}<AppIcon name="chevron-right" :size="14"/><strong>{{currentLabel}}</strong></span></div><div class="topbar-actions"><span class="topbar-location" v-if="['guest','client'].includes(state.role)"><AppIcon name="map-pin" :size="16"/> Maputo, Moçambique</span><button class="icon-btn notification-button" title="Notificações" aria-label="Notificações" @click="navigate('notifications')"><AppIcon name="bell"/><i v-if="unread && state.role!=='guest'"></i></button><button v-if="state.role==='guest'" class="btn secondary compact" @click="go('auth')">Entrar <AppIcon name="arrow-up-right" :size="16"/></button><button v-else class="avatar small profile-button" title="O meu perfil" aria-label="O meu perfil" @click="go('profile')">{{user?.name?.slice(0,1)||'E'}}</button></div></header>
      <main id="main-content" class="main-content" tabindex="-1">
        <AuthWorkspace v-if="['auth','onboard'].includes(state.view)" />
        <BookingWorkspace v-else-if="state.view==='booking'" />
        <DiscoverWorkspace v-else-if="['explore','business','favorites'].includes(state.view)" />
        <PersonalWorkspace v-else-if="isPersonal" />
        <PlatformWorkspace v-else-if="isPlatform" />
        <BusinessWorkspace v-else-if="state.role==='manager'" />
        <DiscoverWorkspace v-else />
      </main>
      <footer class="app-footer"><span>© {{new Date().getFullYear()}} Elo</span><span>Feito para ligar pessoas e serviços.</span><button @click="workspaceOpen=true">{{currentRole?.name}} <AppIcon name="chevron-down" :size="12"/></button></footer>
    </div>
    <nav class="mobile-bottom-nav" aria-label="Acesso rápido"><button v-for="[view,label,icon] in navigation[0].items.slice(0,3)" :key="view" :class="{active:state.view===view}" @click="navigate(view)"><AppIcon :name="icon" :size="21"/><span>{{label}}</span></button><button @click="mobileMenu=true"><AppIcon name="menu" :size="21"/><span>Mais</span></button></nav>
    <AppModal v-model="workspaceOpen" title="Espaços de trabalho"><div class="workspace-options"><button v-for="role in roles" :key="role.id" :class="['workspace-option',{selected:state.role===role.id}]" @click="chooseRole(role.id)"><span class="category-icon mint"><AppIcon :name="role.icon"/></span><span><strong>{{role.name}}</strong><small>{{role.description}}</small></span><AppIcon :name="state.role===role.id?'circle-check':'chevron-right'" :size="20"/></button></div><p class="local-note">Ambiente local de avaliação. Os perfis de exemplo permitem percorrer cada área.</p><button v-if="state.role!=='guest'" class="btn secondary full" @click="logout();workspaceOpen=false"><AppIcon name="log-out" :size="17"/> Terminar sessão</button></AppModal>
    <Transition name="toast"><div v-if="state.toast" class="toast-message" role="status"><AppIcon name="circle-check" :size="20"/>{{state.toast}}</div></Transition>
  </div>
</template>
