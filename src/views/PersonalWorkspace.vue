<script setup>
import { computed, reactive, ref, watch } from 'vue'
import AppIcon from '../components/AppIcon.vue'
import AppModal from '../components/AppModal.vue'
import { state, go, notify, money, today, dateLabel, business, service, staffMember, saveRecord, removeRecord, updateBooking, cancelBooking, setAccountPassword } from '../core/state'

const currentUser = computed(() => state.db.users.find(item => item.id === state.userId) || {})
const professional = computed(() => staffMember(state.staffId) || {})
const currentClientIds = computed(() => [state.userId, ...(state.db.clients || []).filter(item => item.email === currentUser.value.email).map(item => item.id)])
const myBookings = computed(() => state.db.bookings.filter(item => currentClientIds.value.includes(item.clientId)))
const staffBookings = computed(() => state.db.bookings.filter(item => item.staffId === state.staffId && item.businessId === state.businessId))
const isProfessional = computed(() => state.role === 'professional')
const statusNames = { confirmed: 'Confirmado', in_progress: 'Em atendimento', completed: 'Concluído', cancelled: 'Cancelado', no_show: 'Não compareceu' }
const statusClass = status => ({ confirmed: 'success', in_progress: 'warning', completed: 'neutral', cancelled: 'danger', no_show: 'danger' }[status] || 'neutral')
const paymentNames = { paid: 'Pago', pending: 'Por pagar', refunded: 'Reembolsado' }
const dayOptions = [{ id: 1, name: 'Seg' }, { id: 2, name: 'Ter' }, { id: 3, name: 'Qua' }, { id: 4, name: 'Qui' }, { id: 5, name: 'Sex' }, { id: 6, name: 'Sáb' }, { id: 0, name: 'Dom' }]
const activeStatus = item => ['confirmed', 'in_progress'].includes(item.status)
const upcoming = computed(() => myBookings.value.filter(item => activeStatus(item) && new Date(`${item.date}T${item.time}`).getTime() >= Date.now()))
const totalCompleted = computed(() => myBookings.value.filter(item => item.status === 'completed').length)
const appointmentTab = ref('upcoming')
const search = ref('')
const selectedId = ref('')
const detailOpen = ref(false)
const confirmCancel = ref(false)
const detailError = ref('')
const selected = computed(() => state.db.bookings.find(item => item.id === selectedId.value))
const filteredAppointments = computed(() => myBookings.value.filter(item => {
  const future = activeStatus(item) && new Date(`${item.date}T${item.time}`).getTime() >= Date.now()
  const matchesTab = appointmentTab.value === 'all' || (appointmentTab.value === 'upcoming' ? future : !future)
  const terms = `${business(item.businessId)?.name} ${service(item.serviceId)?.name} ${statusNames[item.status]}`.toLowerCase()
  return matchesTab && terms.includes(search.value.toLowerCase())
}).sort((a, b) => appointmentTab.value === 'upcoming' ? `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`) : `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`)))

function openBooking(item) {
  selectedId.value = item.id
  confirmCancel.value = false
  detailError.value = ''
  detailOpen.value = true
}
function reschedule(item) {
  state.selectedBusinessId = item.businessId
  state.bookingDraft = { ...item, excludeBookingId: item.id }
  detailOpen.value = false
  go('booking')
}
function handleCancel() {
  const result = cancelBooking(selected.value.id)
  if (!result.ok) { detailError.value = result.error; return }
  confirmCancel.value = false
  notify('Agendamento cancelado. A agenda foi actualizada.')
}
function changeStatus(item, status) {
  const result = updateBooking(item.id, { status })
  if (!result.ok) { detailError.value = result.error; notify(result.error, 'error'); return }
  notify(status === 'in_progress' ? 'Atendimento iniciado.' : status === 'completed' ? 'Atendimento concluído.' : 'Falta registada.')
}

const notificationTab = ref('all')
const myNotifications = computed(() => (state.db.notifications || []).filter(item => !item.userId || item.userId === state.userId).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))))
const unreadCount = computed(() => myNotifications.value.filter(item => !item.read).length)
const visibleNotifications = computed(() => myNotifications.value.filter(item => notificationTab.value !== 'unread' || !item.read))
function readNotification(item) { saveRecord('notifications', { ...item, read: true }) }
function readAllNotifications() {
  myNotifications.value.filter(item => !item.read).forEach(readNotification)
  notify('Todas as notificações foram marcadas como lidas.')
}

const profileForm = reactive({ name: '', email: '', phone: '', password: '', confirmPassword: '', notificationEmail: true, notificationSms: false })
const profileError = ref('')
watch([() => state.userId, () => state.view], () => {
  if (state.view !== 'profile') return
  Object.assign(profileForm, { name: currentUser.value.name || professional.value.name || '', email: currentUser.value.email || professional.value.email || '', phone: currentUser.value.phone || professional.value.phone || '', password: '', confirmPassword: '', notificationEmail: currentUser.value.notificationEmail !== false, notificationSms: Boolean(currentUser.value.notificationSms) })
  profileError.value = ''
}, { immediate: true })
async function saveProfile() {
  profileError.value = ''
  if (profileForm.password && profileForm.password.length < 8) { profileError.value = 'A palavra-passe deve ter pelo menos 8 caracteres.'; return }
  if (profileForm.password !== profileForm.confirmPassword) { profileError.value = 'As palavras-passe não coincidem.'; return }
  if (state.db.users.some(item => item.id !== state.userId && item.email.toLowerCase() === profileForm.email.trim().toLowerCase())) { profileError.value = 'Este email já está associado a outra conta.'; return }
  if (profileForm.password) {
    const result = await setAccountPassword(state.userId, profileForm.password)
    if (!result.ok) { profileError.value = result.error; return }
  }
  const linkedClients = (state.db.clients || []).filter(item => currentClientIds.value.includes(item.id))
  const next = { ...currentUser.value, name: profileForm.name.trim(), email: profileForm.email.trim().toLowerCase(), phone: profileForm.phone.trim(), notificationEmail: profileForm.notificationEmail, notificationSms: profileForm.notificationSms }
  saveRecord('users', next)
  for (const client of linkedClients) saveRecord('clients', { ...client, name: next.name, email: next.email, phone: next.phone })
  if (isProfessional.value && professional.value.id) saveRecord('staff', { ...professional.value, name: next.name, email: next.email, phone: next.phone })
  profileForm.password = ''
  profileForm.confirmPassword = ''
  notify('Perfil actualizado.')
}

const agendaDate = ref(today())
const agendaFilter = ref('all')
const dayBookings = computed(() => staffBookings.value.filter(item => item.date === agendaDate.value && (agendaFilter.value === 'all' || item.status === agendaFilter.value)).sort((a, b) => a.time.localeCompare(b.time)))
const agendaStats = computed(() => {
  const items = staffBookings.value.filter(item => item.date === agendaDate.value)
  return { total: items.filter(item => item.status !== 'cancelled').length, completed: items.filter(item => item.status === 'completed').length, pending: items.filter(activeStatus).length, minutes: items.filter(item => item.status !== 'cancelled').reduce((sum, item) => sum + Number(item.duration || 0), 0) }
})
function shiftDate(amount) {
  const value = new Date(`${agendaDate.value}T12:00:00`)
  value.setDate(value.getDate() + amount)
  agendaDate.value = `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
}
const assignedServices = computed(() => (state.db.services || []).filter(item => item.businessId === state.businessId && (professional.value.serviceIds || []).includes(item.id)))
const schedule = reactive({ start: '08:00', end: '18:00', days: [] })
const scheduleError = ref('')
watch([() => state.staffId, () => state.view], () => {
  if (state.view !== 'professional-schedule') return
  Object.assign(schedule, { start: professional.value.start || '08:00', end: professional.value.end || '18:00', days: [...(professional.value.days || [1, 2, 3, 4, 5, 6])] })
  scheduleError.value = ''
}, { immediate: true })
function saveSchedule() {
  if (schedule.end <= schedule.start) { scheduleError.value = 'O fim do turno deve ser posterior ao início.'; return }
  if (!schedule.days.length) { scheduleError.value = 'Seleccione pelo menos um dia de trabalho.'; return }
  saveRecord('staff', { ...professional.value, start: schedule.start, end: schedule.end, days: [...schedule.days] })
  scheduleError.value = ''
  notify('Disponibilidade actualizada para novas marcações.')
}
const myBlocks = computed(() => (state.db.blocks || []).filter(item => item.businessId === state.businessId && (!item.staffId || item.staffId === state.staffId)).sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`)))
const blockOpen = ref(false)
const blockForm = reactive({ id: '', date: today(), start: '12:00', end: '13:00', reason: '' })
const blockError = ref('')
const deleteBlock = ref(null)
const deleteBlockOpen = ref(false)
function openBlock(item = null) {
  Object.assign(blockForm, item ? { ...item } : { id: '', date: today(), start: '12:00', end: '13:00', reason: '' })
  blockError.value = ''
  blockOpen.value = true
}
function saveBlock() {
  blockError.value = ''
  if (blockForm.end <= blockForm.start) { blockError.value = 'A hora de fim deve ser posterior à hora de início.'; return }
  const overlap = staffBookings.value.find(item => {
    if (item.date !== blockForm.date || !activeStatus(item)) return false
    const [hours, minutes] = item.time.split(':').map(Number)
    const end = hours * 60 + minutes + Number(item.duration)
    const [startHours, startMinutes] = blockForm.start.split(':').map(Number)
    const [endHours, endMinutes] = blockForm.end.split(':').map(Number)
    return hours * 60 + minutes < endHours * 60 + endMinutes && end > startHours * 60 + startMinutes
  })
  if (overlap) { blockError.value = `Existe um agendamento às ${overlap.time}. Reagende-o antes de bloquear este período.`; return }
  saveRecord('blocks', { ...blockForm, businessId: state.businessId, staffId: state.staffId, reason: blockForm.reason.trim() })
  blockOpen.value = false
  notify('Período indisponível registado.')
}
function confirmRemoveBlock(item) { deleteBlock.value = item; deleteBlockOpen.value = true }
function removeBlock() { removeRecord('blocks', deleteBlock.value.id); deleteBlockOpen.value = false; notify('Período novamente disponível.') }

const historySearch = ref('')
const historyStatus = ref('all')
const historyFrom = ref('')
const historyTo = ref('')
const history = computed(() => staffBookings.value.filter(item => {
  return ['completed', 'cancelled', 'no_show'].includes(item.status) && (historyStatus.value === 'all' || item.status === historyStatus.value) && (!historyFrom.value || item.date >= historyFrom.value) && (!historyTo.value || item.date <= historyTo.value) && `${item.clientName} ${service(item.serviceId)?.name}`.toLowerCase().includes(historySearch.value.toLowerCase())
}).sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`)))
function exportHistory() {
  const escape = value => `"${String(value ?? '').replaceAll('"', '""')}"`
  const rows = [['Data', 'Hora', 'Cliente', 'Serviço', 'Estado', 'Valor (MZN)'], ...history.value.map(item => [item.date, item.time, item.clientName, service(item.serviceId)?.name, statusNames[item.status], item.total])]
  const url = URL.createObjectURL(new Blob(['\uFEFF' + rows.map(row => row.map(escape).join(';')).join('\r\n')], { type: 'text/csv;charset=utf-8;' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'historico-atendimentos.csv'
  link.click()
  URL.revokeObjectURL(url)
}
const headings = {
  appointments: ['Os meus agendamentos', 'O seu tempo, bem organizado.'], notifications: ['Notificações', 'As novidades da sua conta e dos seus agendamentos.'], profile: ['O meu perfil', 'Dados pessoais e preferências da sua conta.'],
  'professional-agenda': ['A minha agenda', 'Os seus atendimentos, num só lugar.'], 'professional-services': ['Os meus serviços', 'Serviços associados à sua actividade.'], 'professional-schedule': ['Disponibilidade', 'Organize o seu horário de trabalho e as suas pausas.'], 'professional-history': ['Histórico de atendimentos', 'Consulte os atendimentos e acompanhe a sua actividade.']
}
</script>

<template>
  <div class="personal-workspace">
    <header class="page-header">
      <div><h1>{{ headings[state.view]?.[0] || 'A minha conta' }}</h1><p>{{ headings[state.view]?.[1] }}</p></div>
      <div class="actions">
        <button v-if="state.view === 'appointments'" class="btn primary" @click="go('explore')"><AppIcon name="plus" /> Nova marcação</button>
        <button v-if="state.view === 'notifications'" class="btn secondary" :disabled="!unreadCount" @click="readAllNotifications"><AppIcon name="check-check" /> Marcar todas como lidas</button>
        <button v-if="state.view === 'professional-schedule'" class="btn primary" @click="openBlock()"><AppIcon name="calendar-off" /> Bloquear período</button>
        <button v-if="state.view === 'professional-history'" class="btn secondary" :disabled="!history.length" @click="exportHistory"><AppIcon name="download" /> Exportar</button>
      </div>
    </header>

    <template v-if="state.view === 'appointments'">
      <div class="stats-grid personal-stats">
        <div class="stat"><span class="stat-label">Próximas marcações</span><strong>{{ upcoming.length }}</strong><span class="muted">na sua agenda</span></div>
        <div class="stat"><span class="stat-label">Atendimentos concluídos</span><strong>{{ totalCompleted }}</strong><span class="muted">até ao momento</span></div>
        <div class="stat"><span class="stat-label">Estabelecimentos visitados</span><strong>{{ new Set(myBookings.filter(item => item.status === 'completed').map(item => item.businessId)).size }}</strong><span class="muted">experiências diferentes</span></div>
      </div>
      <div class="toolbar">
        <div class="tabs" aria-label="Filtrar agendamentos"><button :class="{ active: appointmentTab === 'upcoming' }" @click="appointmentTab = 'upcoming'">Próximos <span>{{ upcoming.length }}</span></button><button :class="{ active: appointmentTab === 'history' }" @click="appointmentTab = 'history'">Histórico</button><button :class="{ active: appointmentTab === 'all' }" @click="appointmentTab = 'all'">Todos</button></div>
        <label class="search-input"><AppIcon name="search" /><input v-model="search" placeholder="Pesquisar agendamentos" aria-label="Pesquisar agendamentos" /></label>
      </div>
      <div v-if="filteredAppointments.length" class="personal-appointments">
        <article v-for="item in filteredAppointments" :key="item.id" class="personal-appointment">
          <img v-if="business(item.businessId)?.image" :src="business(item.businessId).image" :alt="business(item.businessId).name" class="appointment-cover" />
          <div v-else class="appointment-cover cover-fallback"><AppIcon name="store" /></div>
          <div class="appointment-body">
            <div class="appointment-top"><span class="muted">{{ business(item.businessId)?.name || 'Estabelecimento' }}</span><span :class="['badge', statusClass(item.status)]">{{ statusNames[item.status] }}</span></div>
            <h2>{{ service(item.serviceId)?.name || 'Serviço' }}</h2>
            <div class="appointment-meta"><span><AppIcon name="calendar-days" /> {{ dateLabel(item.date) }}</span><span><AppIcon name="clock-3" /> {{ item.time }} · {{ item.duration }} min</span><span><AppIcon name="user-round" /> {{ staffMember(item.staffId)?.name || 'Equipa do estabelecimento' }}</span></div>
            <div class="appointment-bottom"><strong>{{ money(item.total) }}</strong><button class="btn secondary" @click="openBooking(item)">Ver detalhes <AppIcon name="arrow-up-right" /></button></div>
          </div>
        </article>
      </div>
      <div v-else class="empty-state"><AppIcon name="calendar-days" /><h2>{{ search ? 'Nenhum resultado encontrado' : 'A sua agenda tem espaço' }}</h2><p>{{ search ? 'Experimente outro serviço ou estabelecimento.' : 'Encontre um estabelecimento e escolha o melhor horário para si.' }}</p><button v-if="!search" class="btn primary" @click="go('explore')">Explorar estabelecimentos <AppIcon name="arrow-right" /></button></div>
    </template>

    <template v-else-if="state.view === 'notifications'">
      <div class="tabs personal-tabs"><button :class="{ active: notificationTab === 'all' }" @click="notificationTab = 'all'">Todas <span>{{ myNotifications.length }}</span></button><button :class="{ active: notificationTab === 'unread' }" @click="notificationTab = 'unread'">Por ler <span>{{ unreadCount }}</span></button></div>
      <div v-if="visibleNotifications.length" class="notification-list">
        <article v-for="item in visibleNotifications" :key="item.id" class="notification-item" :class="{ unread: !item.read }">
          <span class="notification-icon"><AppIcon :name="item.read ? 'mail-open' : 'bell'" /></span>
          <div class="notification-copy"><h2>{{ item.title }}</h2><p>{{ item.body }}</p><time>{{ item.createdAt ? new Date(item.createdAt).toLocaleString('pt-PT', { dateStyle: 'medium', timeStyle: 'short' }) : 'Agora' }}</time></div>
          <button v-if="!item.read" class="icon-btn" title="Marcar como lida" aria-label="Marcar como lida" @click="readNotification(item)"><AppIcon name="check" /></button><span v-else class="muted notification-read"><AppIcon name="check-check" /></span>
        </article>
      </div>
      <div v-else class="empty-state"><AppIcon name="bell-off" /><h2>{{ notificationTab === 'unread' ? 'Está tudo em dia' : 'Ainda não há notificações' }}</h2><p>As actualizações da sua conta aparecem aqui.</p></div>
    </template>

    <template v-else-if="state.view === 'profile'">
      <div class="personal-profile-layout">
        <aside class="personal-profile-summary"><div class="avatar profile-avatar">{{ profileForm.name.split(' ').filter(Boolean).slice(0, 2).map(word => word[0]).join('') || 'EU' }}</div><h2>{{ currentUser.name || professional.name }}</h2><p>{{ currentUser.email }}</p><span class="badge success">{{ { client: 'Cliente', professional: 'Profissional', manager: 'Gestor', platform: 'Administrador da plataforma' }[state.role] }}</span><div v-if="isProfessional" class="profile-business"><AppIcon name="building-2" /><span>{{ business(state.businessId)?.name }}<small>{{ professional.title }}</small></span></div></aside>
        <form class="personal-profile-form" @submit.prevent="saveProfile">
          <section class="profile-section"><h2 class="section-title">Informações pessoais</h2><div class="form-grid"><label class="field full-width">Nome completo<input v-model="profileForm.name" autocomplete="name" required maxlength="100" /></label><label class="field">Email<input v-model="profileForm.email" type="email" autocomplete="email" required /></label><label class="field">Telemóvel<input v-model="profileForm.phone" type="tel" autocomplete="tel" placeholder="+258 84 000 0000" required /></label></div></section>
          <section class="profile-section"><h2 class="section-title">Segurança</h2><div class="form-grid"><label class="field">Nova palavra-passe<input v-model="profileForm.password" type="password" autocomplete="new-password" minlength="8" placeholder="Pelo menos 8 caracteres" /></label><label class="field">Confirmar palavra-passe<input v-model="profileForm.confirmPassword" type="password" autocomplete="new-password" :required="Boolean(profileForm.password)" placeholder="Repita a nova palavra-passe" /></label></div></section>
          <section class="profile-section"><h2 class="section-title">Preferências de comunicação</h2><label class="preference-row"><span><strong>Email</strong><small>Confirmações e alterações de agendamentos.</small></span><input v-model="profileForm.notificationEmail" type="checkbox" role="switch" /></label><label class="preference-row"><span><strong>SMS</strong><small>Lembretes no número associado à sua conta.</small></span><input v-model="profileForm.notificationSms" type="checkbox" role="switch" /></label></section>
          <p v-if="profileError" class="form-error" role="alert">{{ profileError }}</p><div class="form-actions"><button class="btn primary" type="submit"><AppIcon name="check" /> Guardar alterações</button></div>
        </form>
      </div>
    </template>

    <template v-else-if="state.view === 'professional-agenda'">
      <div class="stats-grid personal-stats"><div class="stat"><span class="stat-label">Atendimentos</span><strong>{{ agendaStats.total }}</strong><span class="muted">no dia seleccionado</span></div><div class="stat"><span class="stat-label">Concluídos</span><strong>{{ agendaStats.completed }}</strong><span class="muted">{{ agendaStats.pending }} por atender</span></div><div class="stat"><span class="stat-label">Tempo reservado</span><strong>{{ Math.floor(agendaStats.minutes / 60) }}<small>h</small> {{ agendaStats.minutes % 60 }}<small>min</small></strong><span class="muted">na sua agenda</span></div></div>
      <div class="toolbar"><div class="date-navigator"><button class="icon-btn" title="Dia anterior" aria-label="Dia anterior" @click="shiftDate(-1)"><AppIcon name="chevron-left" /></button><input v-model="agendaDate" type="date" aria-label="Dia da agenda" required /><button class="icon-btn" title="Dia seguinte" aria-label="Dia seguinte" @click="shiftDate(1)"><AppIcon name="chevron-right" /></button><button class="btn secondary" @click="agendaDate = today()">Hoje</button></div><select v-model="agendaFilter" aria-label="Estado do agendamento"><option value="all">Todos os estados</option><option value="confirmed">Confirmados</option><option value="in_progress">Em atendimento</option><option value="completed">Concluídos</option><option value="cancelled">Cancelados</option><option value="no_show">Não compareceu</option></select></div>
      <div class="professional-agenda-list" v-if="dayBookings.length">
        <article v-for="item in dayBookings" :key="item.id" class="agenda-appointment"><div class="agenda-time"><strong>{{ item.time }}</strong><span>{{ item.duration }} min</span></div><div class="agenda-appointment-info"><div class="appointment-top"><h2>{{ item.clientName }}</h2><span :class="['badge', statusClass(item.status)]">{{ statusNames[item.status] }}</span></div><p>{{ service(item.serviceId)?.name || 'Serviço' }}</p><small v-if="item.partySize > 1">{{ item.partySize }} pessoas</small><p v-if="item.notes" class="agenda-note"><AppIcon name="message-square" /> {{ item.notes }}</p><div class="agenda-actions"><button class="btn secondary" @click="openBooking(item)">Detalhes</button><button v-if="item.status === 'confirmed'" class="btn primary" @click="changeStatus(item, 'in_progress')"><AppIcon name="play" /> Iniciar atendimento</button><button v-if="item.status === 'in_progress'" class="btn primary" @click="changeStatus(item, 'completed')"><AppIcon name="check" /> Concluir atendimento</button></div></div></article>
      </div>
      <div v-else class="empty-state"><AppIcon name="calendar-check-2" /><h2>Sem atendimentos neste dia</h2><p>As novas marcações aparecem automaticamente na sua agenda.</p><button class="btn secondary" @click="go('professional-schedule')">Gerir disponibilidade</button></div>
      <section v-if="myBlocks.some(item => item.date === agendaDate)" class="agenda-block-summary"><h2 class="section-title">Períodos indisponíveis</h2><div v-for="item in myBlocks.filter(item => item.date === agendaDate)" :key="item.id" class="list-item"><AppIcon name="calendar-off" /><div><strong>{{ item.start }} – {{ item.end }}</strong><p>{{ item.reason || 'Indisponível' }}</p></div></div></section>
    </template>

    <template v-else-if="state.view === 'professional-services'">
      <div class="personal-services-heading"><span class="badge neutral">{{ assignedServices.length }} serviços atribuídos</span><span class="muted">{{ business(state.businessId)?.name }}</span></div>
      <div class="professional-service-list" v-if="assignedServices.length"><article v-for="item in assignedServices" :key="item.id" class="professional-service"><span class="service-icon"><AppIcon name="sparkles" /></span><div class="professional-service-copy"><div class="appointment-top"><h2>{{ item.name }}</h2><span :class="['badge', item.active === false ? 'neutral' : 'success']">{{ item.active === false ? 'Inactivo' : 'Disponível' }}</span></div><p>{{ item.description || 'Atendimento com marcação no estabelecimento.' }}</p><div class="appointment-meta"><span><AppIcon name="clock-3" /> {{ item.duration }} min</span><strong>{{ money(item.price) }}</strong></div></div></article></div>
      <div v-else class="empty-state"><AppIcon name="briefcase-business" /><h2>Ainda não tem serviços atribuídos</h2><p>O gestor do estabelecimento pode associar serviços ao seu perfil.</p></div>
    </template>

    <template v-else-if="state.view === 'professional-schedule'">
      <div class="personal-schedule-layout"><form class="schedule-form" @submit.prevent="saveSchedule"><h2 class="section-title">Horário regular</h2><p class="muted">{{ business(state.businessId)?.name }}</p><fieldset class="days-fieldset"><legend>Dias de trabalho</legend><div class="week-days"><label v-for="day in dayOptions" :key="day.id" :class="{ selected: schedule.days.includes(day.id) }"><input v-model="schedule.days" type="checkbox" :value="day.id" /><span>{{ day.name }}</span></label></div></fieldset><div class="form-grid"><label class="field">Início do turno<input v-model="schedule.start" type="time" required /></label><label class="field">Fim do turno<input v-model="schedule.end" type="time" required /></label></div><p v-if="scheduleError" class="form-error" role="alert">{{ scheduleError }}</p><div class="form-actions"><button class="btn primary" type="submit"><AppIcon name="check" /> Guardar horário</button></div></form><section class="schedule-blocks"><div class="section-heading"><h2 class="section-title">Pausas e ausências</h2><span class="badge neutral">{{ myBlocks.length }}</span></div><div v-if="myBlocks.length" class="block-list"><article v-for="item in myBlocks" :key="item.id" class="block-row"><span class="block-icon"><AppIcon name="calendar-off" /></span><div class="block-copy"><strong>{{ item.reason || 'Indisponível' }}</strong><p>{{ dateLabel(item.date) }} · {{ item.start }} – {{ item.end }}</p><small v-if="!item.staffId" class="muted">Todo o estabelecimento</small></div><div v-if="item.staffId === state.staffId" class="row-actions"><button class="icon-btn" title="Editar período" aria-label="Editar período" @click="openBlock(item)"><AppIcon name="pencil" /></button><button class="icon-btn" title="Remover período" aria-label="Remover período" @click="confirmRemoveBlock(item)"><AppIcon name="trash-2" /></button></div></article></div><div v-else class="empty-state compact"><AppIcon name="coffee" /><h3>Nenhuma ausência registada</h3><p>O seu horário regular está disponível para marcações.</p></div></section></div>
    </template>

    <template v-else-if="state.view === 'professional-history'">
      <div class="toolbar history-toolbar"><label class="search-input"><AppIcon name="search" /><input v-model="historySearch" placeholder="Pesquisar cliente ou serviço" aria-label="Pesquisar histórico" /></label><label class="field compact-field">Desde<input v-model="historyFrom" type="date" :max="historyTo || undefined" /></label><label class="field compact-field">Até<input v-model="historyTo" type="date" :min="historyFrom || undefined" /></label><select v-model="historyStatus" aria-label="Estado"><option value="all">Todos os estados</option><option value="completed">Concluídos</option><option value="cancelled">Cancelados</option><option value="no_show">Não compareceu</option></select></div>
      <div v-if="history.length" class="table-scroll"><table class="data-table"><thead><tr><th>Cliente</th><th>Serviço</th><th>Data e hora</th><th>Estado</th><th>Valor</th><th><span class="sr-only">Acções</span></th></tr></thead><tbody><tr v-for="item in history" :key="item.id"><td><strong>{{ item.clientName }}</strong></td><td>{{ service(item.serviceId)?.name }}</td><td>{{ dateLabel(item.date) }}<small class="table-subline">{{ item.time }}</small></td><td><span :class="['badge', statusClass(item.status)]">{{ statusNames[item.status] }}</span></td><td>{{ money(item.total) }}</td><td><button class="icon-btn" title="Ver atendimento" aria-label="Ver atendimento" @click="openBooking(item)"><AppIcon name="arrow-up-right" /></button></td></tr></tbody></table></div>
      <div v-else class="empty-state"><AppIcon name="history" /><h2>Nenhum atendimento encontrado</h2><p>Os atendimentos concluídos, cancelados e as faltas ficam disponíveis aqui.</p></div>
    </template>

    <AppModal v-model="detailOpen" title="Detalhes do agendamento">
      <template v-if="selected"><div class="booking-detail-heading"><span :class="['badge', statusClass(selected.status)]">{{ statusNames[selected.status] }}</span><span class="muted">#{{ selected.id.slice(-7).toUpperCase() }}</span></div><h2 class="detail-service-title">{{ service(selected.serviceId)?.name }}</h2><p class="muted">{{ business(selected.businessId)?.name }}</p><dl class="booking-details"><div><dt><AppIcon name="calendar-days" /> Data</dt><dd>{{ dateLabel(selected.date) }}</dd></div><div><dt><AppIcon name="clock-3" /> Horário</dt><dd>{{ selected.time }} · {{ selected.duration }} min</dd></div><div><dt><AppIcon name="user-round" /> {{ isProfessional ? 'Cliente' : 'Profissional' }}</dt><dd>{{ isProfessional ? selected.clientName : staffMember(selected.staffId)?.name || 'Equipa' }}</dd></div><div v-if="selected.partySize > 1"><dt><AppIcon name="users-round" /> Pessoas</dt><dd>{{ selected.partySize }}</dd></div><div><dt><AppIcon name="map-pin" /> Local</dt><dd>{{ business(selected.businessId)?.address }}, {{ business(selected.businessId)?.city }}</dd></div><div><dt><AppIcon name="wallet" /> Pagamento</dt><dd>{{ paymentNames[selected.paymentStatus] }} · {{ selected.paymentMethod === 'online' ? 'Online' : 'No local' }}</dd></div><div class="detail-total"><dt>Total</dt><dd>{{ money(selected.total) }}</dd></div></dl><div v-if="selected.notes" class="detail-notes"><strong>Observações</strong><p>{{ selected.notes }}</p></div><div v-if="!isProfessional && activeStatus(selected)" class="cancellation-policy"><AppIcon name="info" /><p>Cancelamento e reagendamento até {{ business(selected.businessId)?.cancelHours ?? 2 }} horas antes do atendimento.</p></div><p v-if="detailError" class="form-error" role="alert">{{ detailError }}</p><div v-if="confirmCancel" class="confirmation-panel"><h3>Cancelar este agendamento?</h3><p>O horário será disponibilizado para outras marcações.</p><div class="form-actions"><button class="btn secondary" @click="confirmCancel = false">Manter agendamento</button><button class="btn danger" @click="handleCancel">Confirmar cancelamento</button></div></div><div v-else class="form-actions detail-actions"><template v-if="!isProfessional && selected.status === 'confirmed'"><button class="btn danger" @click="confirmCancel = true">Cancelar</button><button class="btn primary" @click="reschedule(selected)"><AppIcon name="calendar-clock" /> Reagendar</button></template><template v-if="isProfessional"><button v-if="selected.status === 'confirmed'" class="btn danger" @click="changeStatus(selected, 'no_show')">Registar falta</button><button v-if="selected.status === 'confirmed'" class="btn primary" @click="changeStatus(selected, 'in_progress')"><AppIcon name="play" /> Iniciar atendimento</button><button v-if="selected.status === 'in_progress'" class="btn primary" @click="changeStatus(selected, 'completed')"><AppIcon name="check" /> Concluir atendimento</button></template><button v-if="!activeStatus(selected)" class="btn secondary" @click="detailOpen = false">Fechar</button></div></template>
    </AppModal>
    <AppModal v-model="blockOpen" :title="blockForm.id ? 'Editar período indisponível' : 'Bloquear período'"><form @submit.prevent="saveBlock"><div class="form-grid"><label class="field full-width">Data<input v-model="blockForm.date" type="date" :min="today()" required /></label><label class="field">Desde<input v-model="blockForm.start" type="time" required /></label><label class="field">Até<input v-model="blockForm.end" type="time" required /></label><label class="field full-width">Motivo<input v-model="blockForm.reason" required placeholder="Ex.: Pausa, consulta, férias" maxlength="150" /></label></div><p v-if="blockError" class="form-error" role="alert">{{ blockError }}</p><div class="form-actions"><button type="button" class="btn secondary" @click="blockOpen = false">Cancelar</button><button type="submit" class="btn primary">Guardar período</button></div></form></AppModal>
    <AppModal v-model="deleteBlockOpen" title="Remover indisponibilidade"><p>O período de {{ deleteBlock?.start }} a {{ deleteBlock?.end }} ficará novamente disponível para marcações.</p><div class="form-actions"><button class="btn secondary" @click="deleteBlockOpen = false">Manter período</button><button class="btn danger" @click="removeBlock">Remover período</button></div></AppModal>
  </div>
</template>

<style scoped>
.personal-workspace { min-width: 0; }
.personal-stats { margin-bottom: 28px; }
.personal-stats .stat small { font-size: 16px; font-weight: 500; }
.personal-appointments { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
.personal-appointment { border: 1px solid var(--border, #e2e7e6); background: #fff; border-radius: 8px; overflow: hidden; display: flex; min-width: 0; }
.appointment-cover { width: 126px; flex: 0 0 126px; object-fit: cover; background: #edf3f1; }
.cover-fallback { display: grid; place-items: center; color: #527a6d; }
.appointment-body { padding: 18px; min-width: 0; flex: 1; }
.appointment-top, .appointment-bottom { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
.appointment-top > .muted { font-size: 12px; }
.appointment-body h2, .agenda-appointment h2, .professional-service h2 { font-size: 16px; line-height: 1.4; margin: 10px 0; }
.appointment-meta { display: flex; flex-wrap: wrap; gap: 8px 16px; margin: 10px 0; font-size: 12px; color: #626f6c; }
.appointment-meta > span { display: inline-flex; align-items: center; gap: 6px; }
.appointment-meta svg { width: 14px; height: 14px; flex-shrink: 0; }
.appointment-bottom { border-top: 1px solid #edf0ef; padding-top: 12px; margin-top: 14px; }
.appointment-bottom > strong { font-size: 15px; }
.personal-tabs { margin-bottom: 20px; }
.notification-list { border-top: 1px solid #e2e7e6; }
.notification-item { display: flex; gap: 16px; padding: 24px 16px; border-bottom: 1px solid #e2e7e6; }
.notification-item.unread { background: #f1f8f5; }
.notification-icon { width: 42px; height: 42px; display: grid; place-items: center; flex-shrink: 0; color: #377764; background: #e6f0eb; border-radius: 50%; }
.notification-copy { min-width: 0; flex: 1; }
.notification-copy h2 { font-size: 15px; margin: 0 0 6px; }
.notification-copy p { margin: 0 0 8px; line-height: 1.5; color: #626f6c; font-size: 14px; }
.notification-copy time { font-size: 12px; color: #788580; }
.notification-read { align-self: center; }
.personal-profile-layout { display: grid; grid-template-columns: 240px minmax(0, 1fr); gap: 40px; max-width: 1040px; }
.personal-profile-summary { padding: 28px 0; text-align: center; }
.profile-avatar { width: 88px; height: 88px; font-size: 28px; margin: 0 auto 18px; }
.personal-profile-summary h2 { margin: 0 0 6px; font-size: 20px; }
.personal-profile-summary > p { font-size: 13px; color: #626f6c; overflow-wrap: anywhere; margin: 0 0 16px; }
.profile-business { display: flex; gap: 10px; text-align: left; padding-top: 24px; margin-top: 24px; border-top: 1px solid #e2e7e6; font-size: 13px; }
.profile-business svg { flex: 0 0 18px; }
.profile-business small { display: block; margin-top: 5px; color: #788580; }
.profile-section { border-top: 1px solid #e2e7e6; padding: 24px 0; }
.profile-section .section-title { margin-bottom: 22px; }
.full-width { grid-column: 1 / -1; }
.preference-row { display: flex; justify-content: space-between; align-items: center; gap: 20px; padding: 12px 0; }
.preference-row strong { font-size: 14px; }
.preference-row small { display: block; color: #788580; margin-top: 5px; line-height: 1.5; }
.preference-row input { accent-color: #307963; width: 19px; height: 19px; flex: 0 0 19px; }
.date-navigator { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.date-navigator input { width: 160px; }
.professional-agenda-list { border-top: 1px solid #e2e7e6; }
.agenda-appointment { display: flex; gap: 28px; padding: 22px 0; border-bottom: 1px solid #e2e7e6; }
.agenda-time { flex: 0 0 76px; padding-top: 3px; }
.agenda-time strong { display: block; font-size: 20px; }
.agenda-time span { color: #788580; font-size: 12px; display: block; margin-top: 6px; }
.agenda-appointment-info { padding-left: 22px; border-left: 3px solid #85b3a1; flex: 1; min-width: 0; }
.agenda-appointment-info h2 { margin: 0; }
.agenda-appointment-info > p { margin: 7px 0; color: #626f6c; font-size: 14px; }
.agenda-note { display: flex; gap: 8px; background: #f5f7f6; padding: 10px 12px; border-radius: 5px; }
.agenda-note svg { width: 16px; flex-shrink: 0; }
.agenda-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
.agenda-block-summary { margin-top: 30px; }
.agenda-block-summary .list-item { justify-content: flex-start; gap: 14px; }
.agenda-block-summary p { color: #626f6c; font-size: 13px; margin: 5px 0 0; }
.personal-services-heading { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 10px; margin-bottom: 20px; }
.professional-service-list { border-top: 1px solid #e2e7e6; }
.professional-service { display: flex; gap: 18px; padding: 22px 0; border-bottom: 1px solid #e2e7e6; }
.service-icon { display: grid; place-items: center; width: 52px; height: 52px; flex: 0 0 52px; background: #eef3f0; border-radius: 8px; color: #43836e; }
.professional-service-copy { flex: 1; min-width: 0; }
.professional-service-copy h2 { margin: 0; }
.professional-service-copy p { color: #626f6c; font-size: 14px; line-height: 1.5; }
.personal-schedule-layout { display: grid; grid-template-columns: minmax(0, .95fr) minmax(0, 1.15fr); gap: 34px; }
.schedule-form { border-top: 1px solid #e2e7e6; padding-top: 24px; }
.schedule-form > .muted { font-size: 13px; }
.days-fieldset { border: 0; padding: 0; margin: 26px 0; min-width: 0; }
.days-fieldset legend { font-size: 13px; font-weight: 600; margin-bottom: 12px; }
.week-days { display: flex; gap: 7px; flex-wrap: wrap; }
.week-days label { position: relative; border: 1px solid #dbe3df; border-radius: 6px; width: 44px; height: 42px; display: grid; place-items: center; font-size: 12px; font-weight: 600; cursor: pointer; }
.week-days label.selected { border-color: #42856f; color: #256d55; background: #edf6f1; }
.week-days label:has(input:focus-visible) { outline: 2px solid #42856f; outline-offset: 2px; }
.week-days input { position: absolute; opacity: 0; width: 100%; height: 100%; cursor: pointer; }
.section-heading { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.schedule-blocks { border-top: 1px solid #e2e7e6; padding-top: 24px; }
.block-row { display: flex; align-items: flex-start; gap: 12px; padding: 20px 0; border-bottom: 1px solid #e2e7e6; }
.block-icon { color: #986849; background: #f7eee7; border-radius: 6px; width: 34px; height: 34px; flex: 0 0 34px; display: grid; place-items: center; }
.block-icon svg { width: 17px; }
.block-copy { flex: 1; min-width: 0; }
.block-copy > strong { font-size: 14px; }
.block-copy p { font-size: 12px; color: #626f6c; line-height: 1.6; margin: 6px 0 0; }
.row-actions { display: flex; gap: 2px; }
.compact-field { font-size: 12px; min-width: 140px; }
.history-toolbar { align-items: end; }
.history-toolbar .search-input { align-self: end; }
.table-subline { display: block; margin-top: 5px; color: #788580; }
.booking-detail-heading { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 12px; }
.detail-service-title { font-size: 23px; margin: 22px 0 6px; }
.booking-details { margin: 24px 0; }
.booking-details > div { display: flex; justify-content: space-between; gap: 18px; padding: 13px 0; border-bottom: 1px solid #edf0ef; }
.booking-details dt { display: flex; align-items: center; gap: 8px; flex-shrink: 0; color: #626f6c; font-size: 13px; }
.booking-details dt svg { width: 15px; height: 15px; }
.booking-details dd { margin: 0; text-align: right; font-size: 13px; line-height: 1.5; }
.booking-details .detail-total dt, .booking-details .detail-total dd { font-weight: 700; color: #213e34; font-size: 17px; }
.detail-notes { background: #f5f7f6; padding: 14px; border-radius: 6px; font-size: 13px; }
.detail-notes p { color: #626f6c; margin: 8px 0 0; line-height: 1.5; }
.cancellation-policy { display: flex; align-items: flex-start; gap: 9px; margin-top: 18px; color: #626f6c; }
.cancellation-policy svg { width: 17px; flex: 0 0 17px; }
.cancellation-policy p { margin: 0; font-size: 12px; line-height: 1.6; }
.confirmation-panel { margin-top: 24px; background: #fcf1ef; border: 1px solid #edd8d3; padding: 16px; border-radius: 6px; }
.confirmation-panel h3 { font-size: 15px; margin: 0 0 8px; }
.confirmation-panel p { font-size: 13px; line-height: 1.5; }
.form-error { background: #fff0ed; color: #a53929; padding: 11px 13px; border-radius: 5px; font-size: 13px; line-height: 1.5; margin-top: 16px; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; }
@media (max-width: 1100px) { .personal-appointments { grid-template-columns: 1fr; } .personal-profile-layout { grid-template-columns: 200px minmax(0, 1fr); gap: 26px; } }
@media (max-width: 760px) { .personal-profile-layout, .personal-schedule-layout { grid-template-columns: 1fr; gap: 20px; } .personal-profile-summary { padding: 4px 0 20px; } .profile-avatar { width: 72px; height: 72px; font-size: 23px; } .profile-business { max-width: 300px; margin-left: auto; margin-right: auto; } .agenda-appointment { gap: 12px; } .agenda-time { flex-basis: 56px; } .agenda-time strong { font-size: 17px; } .agenda-appointment-info { padding-left: 12px; } .history-toolbar .field { flex: 1; } .notification-item { padding: 20px 8px; gap: 12px; } .notification-icon { width: 34px; height: 34px; } .notification-copy h2 { font-size: 14px; } .personal-stats { margin-bottom: 22px; } }
@media (max-width: 480px) { .appointment-cover { width: 78px; flex-basis: 78px; } .appointment-body { padding: 13px; } .appointment-body h2 { font-size: 15px; } .appointment-meta { font-size: 11px; gap: 7px; } .appointment-top .badge { font-size: 10px; } .appointment-bottom { align-items: flex-start; gap: 10px; } .appointment-bottom .btn { width: 100%; justify-content: center; } .appointment-bottom > strong { font-size: 14px; } .notification-item { gap: 9px; } .notification-icon { display: none; } .booking-details > div { gap: 12px; } .booking-details dd { font-size: 12px; } .block-row { gap: 9px; flex-wrap: wrap; } .block-copy { flex-basis: calc(100% - 45px); } .block-row .row-actions { margin-left: 43px; } .detail-actions .btn { flex: 1; } .professional-service { gap: 12px; } .service-icon { width: 38px; height: 38px; flex-basis: 38px; } }
</style>
