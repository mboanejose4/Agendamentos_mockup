<script setup>
import { computed, reactive, ref, watch } from 'vue'
import AppIcon from '../components/AppIcon.vue'
import AppModal from '../components/AppModal.vue'
import { state, go, notify, money, today, dateLabel, saveRecord, removeRecord, availableSlots, bookingTotal, createBooking, updateBooking, cancelBooking, markPaid } from '../core/state'

const company = computed(() => state.db.businesses.find(item => item.id === state.businessId) || state.db.businesses[0])
const companyId = computed(() => company.value?.id)
const localRecords = collection => computed(() => (state.db[collection] || []).filter(item => item.businessId === companyId.value))
const services = localRecords('services')
const team = localRecords('staff')
const resources = localRecords('resources')
const bookings = localRecords('bookings')
const clients = computed(() => state.db.clients.filter(item => item.businessId === companyId.value || bookings.value.some(booking => booking.clientId === item.id)))
const promotions = localRecords('promotions')
const blocks = localRecords('blocks')
const query = ref('')
const selectedDate = ref(today())
const staffFilter = ref('')
const statusFilter = ref('')
const paymentFilter = ref('pending')
const reportFrom = ref(today().slice(0, 7) + '-01')
const reportTo = ref(today())
const editorOpen = ref(false)
const editorType = ref('')
const form = reactive({})
const formError = ref('')
const bookingOpen = ref(false)
const bookingError = ref('')
const bookingForm = reactive({})
const detailOpen = ref(false)
const detailId = ref('')
const removeOpen = ref(false)
const removal = ref(null)
const settings = reactive({})
const weekdays = [{ id: 1, label: 'Seg' }, { id: 2, label: 'Ter' }, { id: 3, label: 'Qua' }, { id: 4, label: 'Qui' }, { id: 5, label: 'Sex' }, { id: 6, label: 'Sáb' }, { id: 0, label: 'Dom' }]
const statusNames = { confirmed: 'Confirmado', in_progress: 'Em atendimento', completed: 'Concluído', cancelled: 'Cancelado', no_show: 'Não compareceu' }
const paymentNames = { pending: 'Por receber', paid: 'Pago', refunded: 'Reembolsado' }
const activeBooking = booking => !['cancelled', 'no_show'].includes(booking.status)
const serviceName = id => services.value.find(item => item.id === id)?.name || 'Serviço removido'
const staffName = id => team.value.find(item => item.id === id)?.name || 'Sem profissional'
const clientName = booking => booking.clientName || state.db.clients.find(item => item.id === booking.clientId)?.name || 'Cliente'
const resourceName = id => resources.value.find(item => item.id === id)?.name || 'Sem recurso'
const initials = name => (name || '').split(' ').filter(Boolean).slice(0, 2).map(part => part[0]).join('')
const searchable = (...values) => values.join(' ').toLocaleLowerCase('pt').includes(query.value.toLocaleLowerCase('pt').trim())
const statusClass = status => ['completed', 'paid', 'confirmed'].includes(status) ? 'success' : ['cancelled', 'no_show'].includes(status) ? 'danger' : status === 'in_progress' ? 'neutral' : 'warning'
const formatDate = value => value ? dateLabel(value) : '—'
const titles = {
  overview: ['Visão geral', 'O seu negócio, num relance.'],
  agenda: ['Agenda', 'Organize cada reserva e acompanhe os atendimentos.'],
  services: ['Serviços', 'O que o seu estabelecimento oferece.'],
  team: ['Equipa', 'Pessoas, especialidades e disponibilidade.'],
  resources: ['Espaços e recursos', 'Salas, mesas e equipamentos para os seus serviços.'],
  schedule: ['Horários', 'Funcionamento, turnos e períodos indisponíveis.'],
  clients: ['Clientes', 'Uma relação mais próxima em cada atendimento.'],
  payments: ['Pagamentos', 'Acompanhe os valores recebidos e por receber.'],
  reports: ['Relatórios', 'Dados que ajudam a tomar melhores decisões.'],
  promotions: ['Promoções', 'Ofertas para quem já conhece e quem vai descobrir.'],
  settings: ['Definições', 'O perfil e as preferências do estabelecimento.'],
}
const page = computed(() => titles[state.view] || titles.overview)
const todayBookings = computed(() => bookings.value.filter(item => item.date === today() && activeBooking(item)).sort((a, b) => a.time.localeCompare(b.time)))
const todayRevenue = computed(() => bookings.value.filter(item => item.date === today() && item.paymentStatus === 'paid').reduce((sum, item) => sum + Number(item.total), 0))
const outstanding = computed(() => bookings.value.filter(item => activeBooking(item) && item.paymentStatus === 'pending'))
const agendaBookings = computed(() => bookings.value.filter(item => item.date === selectedDate.value && (!staffFilter.value || item.staffId === staffFilter.value) && (!statusFilter.value || item.status === statusFilter.value) && searchable(clientName(item), serviceName(item.serviceId), item.time)).sort((a, b) => a.time.localeCompare(b.time)))
const filteredServices = computed(() => services.value.filter(item => searchable(item.name, item.description)))
const filteredTeam = computed(() => team.value.filter(item => searchable(item.name, item.title, item.email)))
const filteredResources = computed(() => resources.value.filter(item => searchable(item.name, item.type)))
const filteredClients = computed(() => clients.value.filter(item => searchable(item.name, item.email, item.phone)))
const filteredPromotions = computed(() => promotions.value.filter(item => searchable(item.code, serviceName(item.serviceId))))
const paymentBookings = computed(() => bookings.value.filter(item => (!paymentFilter.value || item.paymentStatus === paymentFilter.value) && (paymentFilter.value === 'refunded' || activeBooking(item)) && searchable(clientName(item), serviceName(item.serviceId), item.id)).sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`)))
const reportBookings = computed(() => bookings.value.filter(item => item.date >= reportFrom.value && item.date <= reportTo.value))
const reportRevenue = computed(() => reportBookings.value.filter(item => item.paymentStatus === 'paid').reduce((sum, item) => sum + Number(item.total), 0))
const reportCompleted = computed(() => reportBookings.value.filter(item => item.status === 'completed').length)
const reportCancelled = computed(() => reportBookings.value.filter(item => item.status === 'cancelled').length)
const reportByService = computed(() => services.value.map(item => {
  const rows = reportBookings.value.filter(booking => booking.serviceId === item.id && activeBooking(booking))
  return { ...item, count: rows.length, revenue: rows.filter(booking => booking.paymentStatus === 'paid').reduce((sum, booking) => sum + Number(booking.total), 0) }
}).filter(item => item.count).sort((a, b) => b.count - a.count))
const reportByStaff = computed(() => team.value.map(item => {
  const rows = reportBookings.value.filter(booking => booking.staffId === item.id && activeBooking(booking))
  return { ...item, count: rows.length, completed: rows.filter(booking => booking.status === 'completed').length, revenue: rows.filter(booking => booking.paymentStatus === 'paid').reduce((sum, booking) => sum + Number(booking.total), 0) }
}).sort((a, b) => b.count - a.count))
const maxServiceCount = computed(() => Math.max(1, ...reportByService.value.map(item => item.count)))
const weekDays = computed(() => Array.from({ length: 7 }, (_, offset) => {
  const date = new Date(`${today()}T12:00:00`)
  date.setDate(date.getDate() + offset)
  const key = date.toISOString().slice(0, 10)
  return { date: key, label: new Intl.DateTimeFormat('pt-MZ', { weekday: 'short' }).format(date).replace('.', ''), day: date.getDate(), count: bookings.value.filter(item => item.date === key && activeBooking(item)).length }
}))
const selectedBooking = computed(() => bookings.value.find(item => item.id === detailId.value))
const bookingService = computed(() => services.value.find(item => item.id === bookingForm.serviceId))
const reservationTotal = computed(() => {
  const original = bookings.value.find(item => item.id === bookingForm.id)
  if (original && original.serviceId === bookingForm.serviceId && Number(original.partySize || 1) === Number(bookingForm.partySize || 1)) return Number(original.total)
  return bookingTotal({ serviceId: bookingForm.serviceId, partySize: Number(bookingForm.partySize) || 1, coupon: bookingForm.coupon || '' }).total || 0
})
const bookingStaff = computed(() => team.value.filter(item => item.active && (!bookingForm.serviceId || item.serviceIds?.includes(bookingForm.serviceId))))
const bookingResources = computed(() => resources.value.filter(item => item.active && (!bookingService.value?.resourceType || item.type === bookingService.value.resourceType)))
const slots = computed(() => {
  if (!bookingForm.serviceId || !bookingForm.staffId || !bookingForm.date) return []
  return availableSlots({ businessId: companyId.value, serviceId: bookingForm.serviceId, staffId: bookingForm.staffId, resourceId: bookingForm.resourceId || '', partySize: Number(bookingForm.partySize) || 1, date: bookingForm.date, excludeBookingId: bookingForm.id })
})
const currentTimeUnavailable = computed(() => bookingForm.id && bookingForm.time && !slots.value.includes(bookingForm.time))
const editorLabels = { services: 'serviço', staff: 'membro da equipa', resources: 'recurso', clients: 'cliente', promotions: 'promoção', blocks: 'bloqueio' }
const editorTitle = computed(() => `${form.id ? 'Editar' : 'Adicionar'} ${editorLabels[editorType.value] || ''}`)

watch(() => state.view, () => { query.value = ''; formError.value = ''; resetSettings() })
watch(companyId, () => resetSettings(), { immediate: true })
watch(() => bookingForm.serviceId, () => {
  if (!bookingStaff.value.some(item => item.id === bookingForm.staffId)) bookingForm.staffId = bookingStaff.value[0]?.id || ''
  if (!bookingResources.value.some(item => item.id === bookingForm.resourceId)) bookingForm.resourceId = ''
})

function resetSettings() {
  Object.keys(settings).forEach(key => delete settings[key])
  Object.assign(settings, JSON.parse(JSON.stringify(company.value || {})))
}
function navigate(view) { go(view) }
function changeDay(amount) {
  const date = new Date(`${selectedDate.value}T12:00:00`)
  date.setDate(date.getDate() + amount)
  selectedDate.value = date.toISOString().slice(0, 10)
}
function openEditor(type, record = null) {
  editorType.value = type
  formError.value = ''
  Object.keys(form).forEach(key => delete form[key])
  const defaults = {
    services: { name: '', description: '', duration: 30, price: 0, active: true, resourceType: '' },
    staff: { name: '', title: '', email: '', phone: '', active: true, serviceIds: [], start: company.value.opens || '08:00', end: company.value.closes || '18:00', days: [...(company.value.days || [1, 2, 3, 4, 5, 6])] },
    resources: { name: '', type: 'Sala', capacity: 1, active: true },
    clients: { name: '', email: '', phone: '' },
    promotions: { code: '', discount: 10, serviceId: '', active: true, expires: '' },
    blocks: { date: selectedDate.value, start: '12:00', end: '13:00', staffId: '', reason: '' },
  }
  Object.assign(form, JSON.parse(JSON.stringify(record || defaults[type])))
  editorOpen.value = true
}
function saveEditor() {
  formError.value = ''
  const type = editorType.value
  if (['services', 'staff', 'resources', 'clients'].includes(type) && !form.name?.trim()) return void (formError.value = 'Indique um nome.')
  if (type === 'services' && (Number(form.duration) < 5 || Number(form.price) < 0)) return void (formError.value = 'Verifique a duração e o preço do serviço.')
  if (type === 'staff' && (!form.serviceIds?.length || !form.days?.length || form.start >= form.end)) return void (formError.value = 'Seleccione pelo menos um serviço, um dia e um turno válido.')
  if (type === 'resources' && Number(form.capacity) < 1) return void (formError.value = 'A capacidade deve ser de pelo menos uma pessoa.')
  if (type === 'clients' && !form.phone?.trim() && !form.email?.trim()) return void (formError.value = 'Indique pelo menos um contacto do cliente.')
  if (type === 'promotions') {
    form.code = form.code.trim().toUpperCase()
    if (!form.code || Number(form.discount) < 1 || Number(form.discount) > 100 || !form.expires) return void (formError.value = 'Indique o código, um desconto entre 1% e 100% e a validade.')
    if (promotions.value.some(item => item.id !== form.id && item.code.toUpperCase() === form.code)) return void (formError.value = 'Já existe uma promoção com este código.')
  }
  if (type === 'blocks' && (!form.date || !form.reason?.trim() || form.start >= form.end)) return void (formError.value = 'Indique a data, o motivo e um período válido.')
  if (type === 'blocks') {
    const minutes = time => Number(time.slice(0, 2)) * 60 + Number(time.slice(3))
    const affected = bookings.value.filter(item => item.date === form.date && ['confirmed', 'in_progress'].includes(item.status) && (!form.staffId || item.staffId === form.staffId) && minutes(item.time) < minutes(form.end) && minutes(item.time) + Number(item.duration) > minutes(form.start))
    if (affected.length) return void (formError.value = `Existem ${affected.length} reservas neste período. Reagende-as antes de bloquear o horário.`)
  }
  const record = { ...JSON.parse(JSON.stringify(form)), businessId: companyId.value }
  for (const field of ['duration', 'price', 'capacity', 'discount']) if (field in record) record[field] = Number(record[field])
  const result = saveRecord(type, record)
  if (result?.ok === false || result?.error) return void (formError.value = result.error || 'Não foi possível guardar.')
  editorOpen.value = false
  notify('Alterações guardadas com sucesso.')
}
function requestRemoval(collection, record) {
  removal.value = { collection, record }
  removeOpen.value = true
}
function confirmRemoval() {
  if (!removal.value) return
  const { collection, record } = removal.value
  const hasBookings = ['services', 'staff', 'resources', 'clients'].includes(collection) && bookings.value.some(item => item[{ services: 'serviceId', staff: 'staffId', resources: 'resourceId', clients: 'clientId' }[collection]] === record.id)
  if (hasBookings) {
    if (collection === 'clients') { notify('Este cliente tem reservas associadas. Preserve o seu histórico ou edite os contactos.', 'error'); removeOpen.value = false; return }
    const result = saveRecord(collection, { ...record, active: false })
    if (result?.ok === false) { notify(result.error, 'error'); return }
    notify('Registo desactivado. O histórico de reservas foi preservado.')
  } else {
    const result = removeRecord(collection, record.id)
    if (result?.ok === false || result?.error) { notify(result.error || 'Não foi possível eliminar.', 'error'); return }
    notify('Registo eliminado.')
  }
  removeOpen.value = false
}
function toggleActive(collection, record) {
  const result = saveRecord(collection, { ...record, active: !record.active })
  if (result?.ok === false) return notify(result.error, 'error')
  notify(record.active ? 'Registo desactivado.' : 'Registo activado.')
}
function openBooking(record = null) {
  bookingError.value = ''
  Object.keys(bookingForm).forEach(key => delete bookingForm[key])
  Object.assign(bookingForm, record ? JSON.parse(JSON.stringify(record)) : { serviceId: services.value.find(item => item.active)?.id || '', staffId: '', resourceId: '', clientId: '', date: selectedDate.value < today() ? today() : selectedDate.value, time: '', partySize: 1, notes: '', paymentMethod: 'onsite' })
  if (!bookingForm.staffId) bookingForm.staffId = bookingStaff.value[0]?.id || ''
  detailOpen.value = false
  bookingOpen.value = true
}
function saveBooking() {
  bookingError.value = ''
  if (!bookingForm.clientId || !bookingForm.serviceId || !bookingForm.staffId || !bookingForm.time) return void (bookingError.value = 'Seleccione o cliente, serviço, profissional e horário.')
  if (bookingService.value?.resourceType && !bookingForm.resourceId) return void (bookingError.value = 'Seleccione um espaço ou recurso para este serviço.')
  const client = clients.value.find(item => item.id === bookingForm.clientId)
  const payload = { ...bookingForm, businessId: companyId.value, clientName: client?.name || bookingForm.clientName, partySize: Number(bookingForm.partySize), duration: bookingService.value?.duration }
  const result = bookingForm.id ? updateBooking(bookingForm.id, payload) : createBooking(payload)
  if (!result?.ok) return void (bookingError.value = result?.error || 'Não foi possível guardar a reserva.')
  bookingOpen.value = false
  selectedDate.value = payload.date
  notify(bookingForm.id ? 'Reserva actualizada.' : 'Reserva criada com sucesso.')
}
function inspectBooking(booking) { detailId.value = booking.id; detailOpen.value = true }
function changeStatus(booking, status) {
  const result = status === 'cancelled' ? cancelBooking(booking.id) : updateBooking(booking.id, { status })
  if (!result?.ok) return notify(result?.error || 'Não foi possível actualizar a reserva.', 'error')
  notify(`Reserva: ${statusNames[status].toLowerCase()}.`)
}
function collectPayment(booking) {
  const result = markPaid(booking.id)
  if (!result?.ok) return notify(result?.error || 'Não foi possível registar o pagamento.', 'error')
  notify('Pagamento registado com sucesso.')
}
function saveSettings(scheduleOnly = false) {
  if (!settings.name?.trim() || !settings.city?.trim() || !settings.address?.trim()) return notify('Preencha o nome, a cidade e a morada.', 'error')
  if (!settings.days?.length || settings.opens >= settings.closes) return notify('Verifique os dias e o horário de funcionamento.', 'error')
  if (Number(settings.cancelHours) < 0) return notify('O prazo de cancelamento não pode ser negativo.', 'error')
  const result = saveRecord('businesses', { ...JSON.parse(JSON.stringify(settings)), cancelHours: Number(settings.cancelHours) })
  if (result?.ok === false) return notify(result.error, 'error')
  notify(scheduleOnly ? 'Horário de funcionamento actualizado.' : 'Definições guardadas.')
}
function exportCsv(kind) {
  let headers, rows
  if (kind === 'clients') {
    headers = ['Nome', 'Email', 'Telefone', 'Reservas']
    rows = filteredClients.value.map(item => [item.name, item.email, item.phone, bookings.value.filter(booking => booking.clientId === item.id).length])
  } else {
    headers = ['Reserva', 'Data', 'Hora', 'Cliente', 'Serviço', 'Profissional', 'Estado', 'Pagamento', 'Total (MZN)']
    const source = kind === 'reports' ? reportBookings.value : kind === 'agenda' ? agendaBookings.value : paymentBookings.value
    rows = source.map(item => [item.id, item.date, item.time, clientName(item), serviceName(item.serviceId), staffName(item.staffId), statusNames[item.status], paymentNames[item.paymentStatus], item.total])
  }
  const cell = value => `"${String(value ?? '').replace(/^[=+@-]/, "'$&").replaceAll('"', '""')}"`
  const csv = '\uFEFF' + [headers, ...rows].map(row => row.map(cell).join(';')).join('\r\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `${kind}-${today()}.csv`
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  notify('Ficheiro exportado.')
}
const clientBookings = id => bookings.value.filter(item => item.clientId === id)
const clientLastVisit = id => clientBookings(id).filter(item => item.status === 'completed').sort((a, b) => b.date.localeCompare(a.date))[0]?.date
</script>

<template>
  <div class="business-workspace">
    <header class="page-header">
      <div><div class="business-context">{{ company?.name }}</div><h1>{{ page[0] }}</h1><p>{{ page[1] }}</p></div>
      <div class="workspace-actions">
        <button v-if="['overview', 'agenda'].includes(state.view)" class="btn primary" @click="openBooking()"><AppIcon name="plus" :size="18" /> Nova reserva</button>
        <button v-if="state.view === 'services'" class="btn primary" @click="openEditor('services')"><AppIcon name="plus" :size="18" /> Novo serviço</button>
        <button v-if="state.view === 'team'" class="btn primary" @click="openEditor('staff')"><AppIcon name="user-plus" :size="18" /> Adicionar membro</button>
        <button v-if="state.view === 'resources'" class="btn primary" @click="openEditor('resources')"><AppIcon name="plus" :size="18" /> Novo recurso</button>
        <button v-if="state.view === 'clients'" class="btn primary" @click="openEditor('clients')"><AppIcon name="user-plus" :size="18" /> Novo cliente</button>
        <button v-if="state.view === 'promotions'" class="btn primary" @click="openEditor('promotions')"><AppIcon name="plus" :size="18" /> Nova promoção</button>
        <button v-if="state.view === 'schedule'" class="btn secondary" @click="openEditor('blocks')"><AppIcon name="calendar-off" :size="18" /> Bloquear período</button>
        <button v-if="['payments', 'reports'].includes(state.view)" class="btn secondary" @click="exportCsv(state.view)"><AppIcon name="download" :size="18" /> Exportar</button>
      </div>
    </header>

    <template v-if="state.view === 'overview'">
      <div class="stats-grid manager-stats">
        <div class="stat"><span class="stat-caption"><AppIcon name="calendar-days" :size="18" /> Reservas de hoje</span><strong>{{ todayBookings.length }}</strong><small>{{ todayBookings.filter(item => item.status === 'completed').length }} atendimentos concluídos</small></div>
        <div class="stat"><span class="stat-caption"><AppIcon name="wallet" :size="18" /> Recebido hoje</span><strong>{{ money(todayRevenue) }}</strong><small>Pagamentos confirmados</small></div>
        <div class="stat"><span class="stat-caption"><AppIcon name="users" :size="18" /> Clientes</span><strong>{{ clients.length }}</strong><small>Na sua base de contactos</small></div>
        <div class="stat"><span class="stat-caption"><AppIcon name="clock-3" :size="18" /> Por receber</span><strong>{{ money(outstanding.reduce((sum, item) => sum + Number(item.total), 0)) }}</strong><small>{{ outstanding.length }} reservas com pagamento pendente</small></div>
      </div>
      <section class="manager-section">
        <div class="section-title"><div><h2>Os próximos 7 dias</h2><p class="muted">Reservas confirmadas e atendimentos</p></div><button class="btn secondary" @click="navigate('agenda')">Abrir agenda <AppIcon name="arrow-up-right" :size="16" /></button></div>
        <div class="week-strip"><button v-for="day in weekDays" :key="day.date" class="week-day" :class="{ current: day.date === today() }" @click="selectedDate = day.date; navigate('agenda')"><span>{{ day.label }}</span><strong>{{ day.day }}</strong><small>{{ day.count }} {{ day.count === 1 ? 'reserva' : 'reservas' }}</small></button></div>
      </section>
      <div class="manager-two-col">
        <section class="manager-section">
          <div class="section-title"><h2>Agenda de hoje</h2><span class="badge neutral">{{ todayBookings.length }}</span></div>
          <div v-if="!todayBookings.length" class="empty-state"><AppIcon name="calendar-check" :size="32" /><h3>Um dia por preencher</h3><p>As novas reservas de hoje aparecem aqui.</p><button class="btn secondary" @click="openBooking()">Criar reserva</button></div>
          <button v-for="item in todayBookings.slice(0, 6)" :key="item.id" class="appointment-row" @click="inspectBooking(item)"><span class="appointment-time">{{ item.time }}</span><span class="appointment-person"><strong>{{ clientName(item) }}</strong><small>{{ serviceName(item.serviceId) }} · {{ staffName(item.staffId) }}</small></span><span class="badge" :class="statusClass(item.status)">{{ statusNames[item.status] }}</span><AppIcon name="chevron-right" :size="16" /></button>
        </section>
        <section class="manager-section business-summary">
          <div class="section-title"><h2>O estabelecimento</h2><button class="icon-btn" title="Editar estabelecimento" @click="navigate('settings')"><AppIcon name="pencil" :size="17" /></button></div>
          <img v-if="company?.image" class="business-cover" :src="company.image" :alt="company.name" />
          <h3>{{ company?.name }}</h3><p class="muted">{{ company?.category }} · {{ company?.city }}</p>
          <div class="summary-metrics"><div><strong>{{ services.filter(item => item.active).length }}</strong><span>Serviços activos</span></div><div><strong>{{ team.filter(item => item.active).length }}</strong><span>Na equipa</span></div><div><strong>{{ resources.filter(item => item.active).length }}</strong><span>Recursos</span></div></div>
          <div class="summary-hours"><AppIcon name="clock-3" :size="17" /><span>{{ company?.opens }} – {{ company?.closes }}</span><span class="badge" :class="company?.active ? 'success' : 'neutral'">{{ company?.active ? 'A receber reservas' : 'Reservas suspensas' }}</span></div>
        </section>
      </div>
    </template>

    <template v-else-if="state.view === 'agenda'">
      <div class="toolbar agenda-toolbar">
        <div class="date-stepper"><button class="icon-btn" title="Dia anterior" @click="changeDay(-1)"><AppIcon name="chevron-left" :size="18" /></button><input v-model="selectedDate" type="date" aria-label="Dia da agenda" /><button class="icon-btn" title="Dia seguinte" @click="changeDay(1)"><AppIcon name="chevron-right" :size="18" /></button><button class="btn secondary" @click="selectedDate = today()">Hoje</button></div>
        <select v-model="staffFilter" aria-label="Filtrar profissional"><option value="">Toda a equipa</option><option v-for="person in team" :key="person.id" :value="person.id">{{ person.name }}</option></select>
        <select v-model="statusFilter" aria-label="Filtrar estado"><option value="">Todos os estados</option><option v-for="(label, value) in statusNames" :key="value" :value="value">{{ label }}</option></select>
        <button class="icon-btn" title="Exportar agenda" @click="exportCsv('agenda')"><AppIcon name="download" :size="18" /></button>
      </div>
      <div class="section-title"><h2>{{ formatDate(selectedDate) }}</h2><span class="muted">{{ agendaBookings.length }} {{ agendaBookings.length === 1 ? 'reserva' : 'reservas' }}</span></div>
      <div v-if="!agendaBookings.length" class="empty-state"><AppIcon name="calendar-days" :size="36" /><h3>Nenhuma reserva para este dia</h3><p>Escolha outra data ou adicione uma nova reserva.</p><button class="btn primary" @click="openBooking()"><AppIcon name="plus" :size="17" /> Criar reserva</button></div>
      <div v-else class="agenda-list">
        <article v-for="item in agendaBookings" :key="item.id" class="agenda-entry" :class="{ cancelled: item.status === 'cancelled' }">
          <div class="agenda-time"><strong>{{ item.time }}</strong><span>{{ item.duration }} min</span></div>
          <button class="agenda-main" @click="inspectBooking(item)"><strong>{{ serviceName(item.serviceId) }}</strong><span>{{ clientName(item) }}</span><small><AppIcon name="user-round" :size="13" /> {{ staffName(item.staffId) }}<template v-if="item.resourceId"> · {{ resourceName(item.resourceId) }}</template></small></button>
          <div class="agenda-state"><span class="badge" :class="statusClass(item.status)">{{ statusNames[item.status] }}</span><span class="agenda-price">{{ money(item.total) }} <small :class="item.paymentStatus === 'paid' ? 'paid-label' : 'muted'">{{ paymentNames[item.paymentStatus] }}</small></span></div>
          <button class="icon-btn" title="Ver detalhes da reserva" @click="inspectBooking(item)"><AppIcon name="chevron-right" :size="19" /></button>
        </article>
      </div>
    </template>

    <template v-else-if="state.view === 'services'">
      <div class="toolbar"><label class="search-input"><AppIcon name="search" :size="18" /><input v-model="query" placeholder="Pesquisar serviços" aria-label="Pesquisar serviços" /></label><span class="muted">{{ services.filter(item => item.active).length }} activos · {{ services.length }} no total</span></div>
      <div v-if="!filteredServices.length" class="empty-state"><AppIcon name="sparkles" :size="34" /><h3>{{ query ? 'Nenhum serviço encontrado' : 'O seu catálogo começa aqui' }}</h3><p>{{ query ? 'Experimente pesquisar outro nome.' : 'Adicione os serviços disponíveis para reserva.' }}</p></div>
      <div v-else class="service-grid">
        <article v-for="item in filteredServices" :key="item.id" class="service-card">
          <div class="service-card-top"><span class="service-symbol"><AppIcon name="sparkles" :size="22" /></span><span class="badge" :class="item.active ? 'success' : 'neutral'">{{ item.active ? 'Activo' : 'Inactivo' }}</span></div>
          <h3>{{ item.name }}</h3><p>{{ item.description || 'Sem descrição.' }}</p>
          <div class="service-meta"><span><AppIcon name="clock-3" :size="15" /> {{ item.duration }} min</span><strong>{{ money(item.price) }}</strong></div>
          <div v-if="item.resourceType" class="muted service-resource"><AppIcon name="layout-grid" :size="14" /> {{ item.resourceType }}</div>
          <footer><button class="btn secondary" @click="openEditor('services', item)"><AppIcon name="pencil" :size="15" /> Editar</button><button class="icon-btn" :title="item.active ? 'Desactivar serviço' : 'Activar serviço'" @click="toggleActive('services', item)"><AppIcon :name="item.active ? 'pause' : 'play'" :size="17" /></button><button class="icon-btn danger" title="Eliminar serviço" @click="requestRemoval('services', item)"><AppIcon name="trash-2" :size="17" /></button></footer>
        </article>
      </div>
    </template>

    <template v-else-if="state.view === 'team'">
      <div class="toolbar"><label class="search-input"><AppIcon name="search" :size="18" /><input v-model="query" placeholder="Pesquisar na equipa" aria-label="Pesquisar na equipa" /></label><span class="muted">{{ team.length }} membros</span></div>
      <div v-if="!filteredTeam.length" class="empty-state"><AppIcon name="users" :size="34" /><h3>Nenhum membro encontrado</h3><p>Adicione profissionais e associe os seus serviços.</p></div>
      <div v-else class="team-grid"><article v-for="person in filteredTeam" :key="person.id" class="team-card"><div class="team-card-head"><span class="avatar">{{ initials(person.name) }}</span><span class="badge" :class="person.active ? 'success' : 'neutral'">{{ person.active ? 'Activo' : 'Inactivo' }}</span></div><h3>{{ person.name }}</h3><p class="muted">{{ person.title || 'Profissional' }}</p><div class="contact-line"><AppIcon name="mail" :size="15" /><span>{{ person.email || 'Sem email' }}</span></div><div class="contact-line"><AppIcon name="phone" :size="15" /><span>{{ person.phone || 'Sem telefone' }}</span></div><div class="team-services"><span v-for="id in person.serviceIds" :key="id" class="badge neutral">{{ serviceName(id) }}</span><span v-if="!person.serviceIds?.length" class="muted">Sem serviços atribuídos</span></div><div class="team-shift"><AppIcon name="clock-3" :size="15" /><span>{{ person.start }} – {{ person.end }}</span></div><footer><button class="btn secondary" @click="openEditor('staff', person)"><AppIcon name="pencil" :size="15" /> Editar</button><button class="icon-btn" title="Ver agenda do profissional" @click="staffFilter = person.id; navigate('agenda')"><AppIcon name="calendar-days" :size="17" /></button><button class="icon-btn danger" title="Eliminar membro" @click="requestRemoval('staff', person)"><AppIcon name="trash-2" :size="17" /></button></footer></article></div>
    </template>

    <template v-else-if="state.view === 'resources'">
      <div class="toolbar"><label class="search-input"><AppIcon name="search" :size="18" /><input v-model="query" placeholder="Pesquisar espaços e recursos" aria-label="Pesquisar espaços e recursos" /></label><span class="muted">{{ resources.length }} recursos</span></div>
      <div v-if="!filteredResources.length" class="empty-state"><AppIcon name="layout-grid" :size="34" /><h3>Espaço para o seu negócio</h3><p>Adicione salas, mesas ou equipamentos e a sua capacidade.</p></div>
      <div v-else class="resource-grid"><article v-for="item in filteredResources" :key="item.id" class="resource-card"><div class="resource-icon"><AppIcon :name="item.type.toLowerCase().includes('mesa') ? 'utensils' : 'door-open'" :size="25" /></div><div><h3>{{ item.name }}</h3><p class="muted">{{ item.type }} · {{ item.capacity }} {{ item.capacity === 1 ? 'pessoa' : 'pessoas' }}</p><span class="badge" :class="item.active ? 'success' : 'neutral'">{{ item.active ? 'Disponível' : 'Indisponível' }}</span></div><div class="row-actions"><button class="icon-btn" title="Editar recurso" @click="openEditor('resources', item)"><AppIcon name="pencil" :size="17" /></button><button class="icon-btn danger" title="Eliminar recurso" @click="requestRemoval('resources', item)"><AppIcon name="trash-2" :size="17" /></button></div></article></div>
    </template>

    <template v-else-if="state.view === 'schedule'">
      <section class="manager-section"><div class="section-title"><div><h2>Funcionamento do estabelecimento</h2><p class="muted">Dias e horários em que aceita reservas</p></div></div><form @submit.prevent="saveSettings(true)"><div class="weekday-options"><label v-for="day in weekdays" :key="day.id" :class="{ selected: settings.days?.includes(day.id) }"><input v-model="settings.days" type="checkbox" :value="day.id" /><span>{{ day.label }}</span></label></div><div class="form-grid hours-form"><label class="field"><span>Abertura</span><input v-model="settings.opens" type="time" required /></label><label class="field"><span>Encerramento</span><input v-model="settings.closes" type="time" required /></label><button class="btn primary" type="submit"><AppIcon name="check" :size="17" /> Guardar horário</button></div></form></section>
      <section class="manager-section"><div class="section-title"><h2>Turnos da equipa</h2><span class="muted">{{ team.length }} membros</span></div><div v-if="!team.length" class="empty-state"><h3>Ainda não há profissionais</h3><button class="btn secondary" @click="navigate('team')">Gerir equipa</button></div><div v-for="person in team" :key="person.id" class="shift-row"><span class="avatar">{{ initials(person.name) }}</span><div class="shift-person"><strong>{{ person.name }}</strong><small>{{ person.title }}</small></div><div class="shift-days"><span v-for="day in weekdays" :key="day.id" :class="{ working: person.days?.includes(day.id) }">{{ day.label }}</span></div><span class="shift-hours">{{ person.start }} – {{ person.end }}</span><button class="icon-btn" title="Editar turno" @click="openEditor('staff', person)"><AppIcon name="pencil" :size="17" /></button></div></section>
      <section class="manager-section"><div class="section-title"><h2>Períodos indisponíveis</h2><button class="btn secondary" @click="openEditor('blocks')"><AppIcon name="plus" :size="17" /> Adicionar</button></div><div v-if="!blocks.length" class="empty-state compact"><AppIcon name="calendar-check" :size="30" /><h3>Sem bloqueios de horário</h3><p>Registe férias, pausas e outros períodos indisponíveis.</p></div><div v-for="item in [...blocks].sort((a, b) => a.date.localeCompare(b.date))" :key="item.id" class="block-row"><span class="block-symbol"><AppIcon name="calendar-off" :size="20" /></span><div><strong>{{ item.reason }}</strong><small>{{ formatDate(item.date) }} · {{ item.start }} – {{ item.end }}</small><small>{{ item.staffId ? staffName(item.staffId) : 'Toda a equipa' }}</small></div><div class="row-actions"><button class="icon-btn" title="Editar bloqueio" @click="openEditor('blocks', item)"><AppIcon name="pencil" :size="17" /></button><button class="icon-btn danger" title="Eliminar bloqueio" @click="requestRemoval('blocks', item)"><AppIcon name="trash-2" :size="17" /></button></div></div></section>
    </template>

    <template v-else-if="state.view === 'clients'">
      <div class="toolbar"><label class="search-input"><AppIcon name="search" :size="18" /><input v-model="query" placeholder="Pesquisar nome, telefone ou email" aria-label="Pesquisar clientes" /></label><button class="btn secondary" @click="exportCsv('clients')"><AppIcon name="download" :size="17" /> Exportar</button></div>
      <div v-if="!filteredClients.length" class="empty-state"><AppIcon name="contact-round" :size="34" /><h3>Nenhum cliente encontrado</h3><p>Adicione um cliente ou experimente outra pesquisa.</p></div>
      <div v-else class="table-scroll"><table class="data-table"><thead><tr><th>Cliente</th><th>Contacto</th><th>Reservas</th><th>Última visita</th><th><span class="sr-only">Acções</span></th></tr></thead><tbody><tr v-for="item in filteredClients" :key="item.id"><td><div class="table-person"><span class="avatar">{{ initials(item.name) }}</span><strong>{{ item.name }}</strong></div></td><td><div class="cell-stack"><span>{{ item.phone || '—' }}</span><small>{{ item.email || '—' }}</small></div></td><td>{{ clientBookings(item.id).length }}</td><td>{{ formatDate(clientLastVisit(item.id)) }}</td><td><div class="row-actions"><button class="icon-btn" title="Reservar para este cliente" @click="openBooking(); bookingForm.clientId = item.id"><AppIcon name="calendar-plus" :size="17" /></button><button class="icon-btn" title="Editar cliente" @click="openEditor('clients', item)"><AppIcon name="pencil" :size="17" /></button><button class="icon-btn danger" title="Eliminar cliente" @click="requestRemoval('clients', item)"><AppIcon name="trash-2" :size="17" /></button></div></td></tr></tbody></table></div>
    </template>

    <template v-else-if="state.view === 'payments'">
      <div class="stats-grid manager-stats payment-stats"><div class="stat"><span class="stat-caption">Total recebido</span><strong>{{ money(bookings.filter(item => item.paymentStatus === 'paid').reduce((sum, item) => sum + Number(item.total), 0)) }}</strong><small>Todos os pagamentos confirmados</small></div><div class="stat"><span class="stat-caption">Por receber</span><strong>{{ money(outstanding.reduce((sum, item) => sum + Number(item.total), 0)) }}</strong><small>{{ outstanding.length }} reservas pendentes</small></div><div class="stat"><span class="stat-caption">Reembolsado</span><strong>{{ money(bookings.filter(item => item.paymentStatus === 'refunded').reduce((sum, item) => sum + Number(item.total), 0)) }}</strong><small>Reservas canceladas e reembolsadas</small></div></div>
      <div class="toolbar"><div class="tabs payment-tabs"><button :class="{ active: paymentFilter === 'pending' }" @click="paymentFilter = 'pending'">Por receber</button><button :class="{ active: paymentFilter === 'paid' }" @click="paymentFilter = 'paid'">Recebidos</button><button :class="{ active: paymentFilter === 'refunded' }" @click="paymentFilter = 'refunded'">Reembolsos</button></div><label class="search-input"><AppIcon name="search" :size="18" /><input v-model="query" placeholder="Pesquisar pagamentos" aria-label="Pesquisar pagamentos" /></label></div>
      <div v-if="!paymentBookings.length" class="empty-state"><AppIcon name="receipt" :size="34" /><h3>Nenhum pagamento nesta lista</h3><p>Os pagamentos das reservas aparecem aqui.</p></div>
      <div v-else class="table-scroll"><table class="data-table"><thead><tr><th>Cliente e serviço</th><th>Data</th><th>Método</th><th>Valor</th><th>Estado</th><th><span class="sr-only">Acções</span></th></tr></thead><tbody><tr v-for="item in paymentBookings" :key="item.id"><td><button class="cell-link" @click="inspectBooking(item)"><strong>{{ clientName(item) }}</strong><small>{{ serviceName(item.serviceId) }}</small></button></td><td>{{ formatDate(item.date) }}</td><td>{{ item.paymentMethod === 'online' ? 'Online' : 'No estabelecimento' }}</td><td><strong>{{ money(item.total) }}</strong></td><td><span class="badge" :class="statusClass(item.paymentStatus)">{{ paymentNames[item.paymentStatus] }}</span></td><td><button v-if="item.paymentStatus === 'pending'" class="btn secondary" @click="collectPayment(item)"><AppIcon name="check" :size="16" /> Receber</button><button v-else class="icon-btn" title="Ver recibo e reserva" @click="inspectBooking(item)"><AppIcon name="receipt-text" :size="18" /></button></td></tr></tbody></table></div>
    </template>

    <template v-else-if="state.view === 'reports'">
      <div class="toolbar report-toolbar"><label class="field"><span>De</span><input v-model="reportFrom" type="date" :max="reportTo" /></label><label class="field"><span>Até</span><input v-model="reportTo" type="date" :min="reportFrom" /></label><span class="muted">{{ reportBookings.length }} reservas no período</span></div>
      <div class="stats-grid manager-stats"><div class="stat"><span class="stat-caption">Receita recebida</span><strong>{{ money(reportRevenue) }}</strong><small>No período seleccionado</small></div><div class="stat"><span class="stat-caption">Atendimentos</span><strong>{{ reportCompleted }}</strong><small>Reservas concluídas</small></div><div class="stat"><span class="stat-caption">Valor médio pago</span><strong>{{ money(reportRevenue / Math.max(1, reportBookings.filter(item => item.paymentStatus === 'paid').length)) }}</strong><small>Por reserva paga</small></div><div class="stat"><span class="stat-caption">Cancelamentos</span><strong>{{ reportCancelled }}</strong><small>{{ reportBookings.length ? Math.round(reportCancelled / reportBookings.length * 100) : 0 }}% das reservas do período</small></div></div>
      <section class="manager-section"><div class="section-title"><h2>Serviços mais procurados</h2><span class="muted">Reservas válidas</span></div><div v-if="!reportByService.length" class="empty-state compact"><AppIcon name="chart-no-axes-combined" :size="32" /><h3>Sem reservas neste período</h3><p>Altere as datas para consultar outro período.</p></div><div v-for="item in reportByService" :key="item.id" class="report-bar-row"><div><strong>{{ item.name }}</strong><small>{{ money(item.revenue) }} recebidos</small></div><div class="report-bar-track"><span :style="{ width: `${item.count / maxServiceCount * 100}%` }"></span></div><strong>{{ item.count }}</strong></div></section>
      <section class="manager-section"><div class="section-title"><h2>Desempenho da equipa</h2></div><div class="table-scroll"><table class="data-table"><thead><tr><th>Profissional</th><th>Reservas</th><th>Concluídas</th><th>Receita recebida</th></tr></thead><tbody><tr v-for="person in reportByStaff" :key="person.id"><td><div class="table-person"><span class="avatar">{{ initials(person.name) }}</span><strong>{{ person.name }}</strong></div></td><td>{{ person.count }}</td><td>{{ person.completed }}</td><td>{{ money(person.revenue) }}</td></tr><tr v-if="!reportByStaff.length"><td colspan="4" class="muted">Ainda não há membros na equipa.</td></tr></tbody></table></div></section>
    </template>

    <template v-else-if="state.view === 'promotions'">
      <div class="toolbar"><label class="search-input"><AppIcon name="search" :size="18" /><input v-model="query" placeholder="Pesquisar promoções" aria-label="Pesquisar promoções" /></label><span class="muted">{{ promotions.length }} promoções</span></div>
      <div v-if="!filteredPromotions.length" class="empty-state"><AppIcon name="ticket-percent" :size="34" /><h3>A próxima visita pode começar com uma oferta</h3><p>Crie códigos de desconto para os seus serviços.</p></div>
      <div v-else class="promotion-grid"><article v-for="item in filteredPromotions" :key="item.id" class="promotion-card"><div class="promotion-head"><span class="promotion-discount">{{ item.discount }}<small>%</small></span><span class="badge" :class="item.expires < today() ? 'warning' : item.active ? 'success' : 'neutral'">{{ item.expires < today() ? 'Expirada' : item.active ? 'Activa' : 'Inactiva' }}</span></div><h3>{{ item.code }}</h3><p>{{ item.serviceId ? serviceName(item.serviceId) : 'Todos os serviços' }}</p><small class="muted">Válida até {{ formatDate(item.expires) }}</small><footer><button class="btn secondary" @click="openEditor('promotions', item)"><AppIcon name="pencil" :size="15" /> Editar</button><button class="icon-btn" :title="item.active ? 'Desactivar promoção' : 'Activar promoção'" @click="toggleActive('promotions', item)"><AppIcon :name="item.active ? 'pause' : 'play'" :size="17" /></button><button class="icon-btn danger" title="Eliminar promoção" @click="requestRemoval('promotions', item)"><AppIcon name="trash-2" :size="17" /></button></footer></article></div>
    </template>

    <template v-else-if="state.view === 'settings'">
      <form class="settings-form" @submit.prevent="saveSettings()">
        <section class="manager-section"><div class="section-title"><h2>Perfil do estabelecimento</h2></div><div class="form-grid"><label class="field"><span>Nome do estabelecimento</span><input v-model="settings.name" required maxlength="80" /></label><label class="field"><span>Categoria</span><select v-model="settings.category"><option>Beleza</option><option>Bem-estar</option><option>Saúde</option><option>Restauração</option><option>Consultoria</option><option>Desporto</option><option>Outros serviços</option></select></label><label class="field full-width"><span>Descrição</span><textarea v-model="settings.description" rows="3" maxlength="600"></textarea></label><label class="field"><span>Cidade</span><input v-model="settings.city" required /></label><label class="field"><span>Morada</span><input v-model="settings.address" required /></label><label class="field"><span>Telefone</span><input v-model="settings.phone" type="tel" placeholder="+258" /></label><label class="field"><span>Email</span><input v-model="settings.email" type="email" /></label><label class="field full-width"><span>Imagem de capa (URL)</span><input v-model="settings.image" type="url" placeholder="https://" /></label></div><img v-if="settings.image" class="settings-preview" :src="settings.image" :alt="settings.name" /></section>
        <section class="manager-section"><div class="section-title"><h2>Preferências de reserva</h2></div><div class="settings-switch"><div><strong>Aceitar novas reservas</strong><p class="muted">Disponibilidade do estabelecimento na plataforma.</p></div><label class="switch"><input v-model="settings.active" type="checkbox" aria-label="Aceitar novas reservas" /><span></span></label></div><div class="settings-switch"><div><strong>Pagamento online</strong><p class="muted">Disponibilizar o pagamento no momento da reserva.</p></div><label class="switch"><input v-model="settings.onlinePayment" type="checkbox" aria-label="Activar pagamento online" /><span></span></label></div><label class="field cancellation-field"><span>Antecedência mínima para cancelamento (horas)</span><input v-model.number="settings.cancelHours" type="number" min="0" max="168" required /></label></section>
        <div class="form-actions"><button class="btn secondary" type="button" @click="resetSettings">Descartar alterações</button><button class="btn primary" type="submit"><AppIcon name="check" :size="17" /> Guardar alterações</button></div>
      </form>
    </template>

    <AppModal v-model="editorOpen" :title="editorTitle">
      <form class="manager-editor" @submit.prevent="saveEditor">
        <div v-if="formError" class="form-error" role="alert"><AppIcon name="circle-alert" :size="17" /> {{ formError }}</div>
        <template v-if="editorType === 'services'"><div class="form-grid"><label class="field full-width"><span>Nome do serviço</span><input v-model="form.name" required autofocus maxlength="80" /></label><label class="field full-width"><span>Descrição</span><textarea v-model="form.description" rows="3" maxlength="400"></textarea></label><label class="field"><span>Duração (minutos)</span><input v-model.number="form.duration" type="number" min="5" max="720" step="5" required /></label><label class="field"><span>Preço (MZN)</span><input v-model.number="form.price" type="number" min="0" step="0.01" required /></label><label class="field full-width"><span>Tipo de recurso necessário</span><select v-model="form.resourceType"><option value="">Sem recurso obrigatório</option><option v-for="type in [...new Set(resources.map(item => item.type))]" :key="type" :value="type">{{ type }}</option></select></label></div><label class="checkbox-line"><input v-model="form.active" type="checkbox" /> Disponível para reserva</label></template>
        <template v-else-if="editorType === 'staff'"><div class="form-grid"><label class="field"><span>Nome completo</span><input v-model="form.name" required autofocus /></label><label class="field"><span>Especialidade ou função</span><input v-model="form.title" required placeholder="Ex.: Terapeuta, médico, anfitrião" /></label><label class="field"><span>Email</span><input v-model="form.email" type="email" /></label><label class="field"><span>Telefone</span><input v-model="form.phone" type="tel" /></label></div><fieldset class="choice-fieldset"><legend>Serviços que realiza</legend><div class="checkbox-grid"><label v-for="item in services" :key="item.id" class="checkbox-line"><input v-model="form.serviceIds" type="checkbox" :value="item.id" /> {{ item.name }}</label></div><p v-if="!services.length" class="muted">Adicione primeiro um serviço ao catálogo.</p></fieldset><fieldset class="choice-fieldset"><legend>Dias de trabalho</legend><div class="weekday-options"><label v-for="day in weekdays" :key="day.id" :class="{ selected: form.days?.includes(day.id) }"><input v-model="form.days" type="checkbox" :value="day.id" /><span>{{ day.label }}</span></label></div></fieldset><div class="form-grid"><label class="field"><span>Início do turno</span><input v-model="form.start" type="time" required /></label><label class="field"><span>Fim do turno</span><input v-model="form.end" type="time" required /></label></div><label class="checkbox-line"><input v-model="form.active" type="checkbox" /> Profissional activo</label></template>
        <template v-else-if="editorType === 'resources'"><div class="form-grid"><label class="field full-width"><span>Nome do recurso</span><input v-model="form.name" required autofocus placeholder="Ex.: Sala 2, Mesa da esplanada" /></label><label class="field"><span>Tipo</span><input v-model="form.type" list="resource-types" required /><datalist id="resource-types"><option>Sala</option><option>Mesa</option><option>Consultório</option><option>Equipamento</option><option>Cadeira</option></datalist></label><label class="field"><span>Capacidade (pessoas)</span><input v-model.number="form.capacity" type="number" min="1" max="500" required /></label></div><label class="checkbox-line"><input v-model="form.active" type="checkbox" /> Disponível para reserva</label></template>
        <template v-else-if="editorType === 'clients'"><div class="form-grid"><label class="field full-width"><span>Nome completo</span><input v-model="form.name" required autofocus /></label><label class="field"><span>Telefone</span><input v-model="form.phone" type="tel" placeholder="+258" /></label><label class="field"><span>Email</span><input v-model="form.email" type="email" /></label></div><template v-if="form.id"><div class="section-title client-history-title"><h3>Histórico de reservas</h3><span class="badge neutral">{{ clientBookings(form.id).length }}</span></div><div v-if="!clientBookings(form.id).length" class="muted">Este cliente ainda não tem reservas.</div><div v-for="item in clientBookings(form.id).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8)" :key="item.id" class="client-history-row"><div><strong>{{ serviceName(item.serviceId) }}</strong><small>{{ formatDate(item.date) }} · {{ item.time }}</small></div><span class="badge" :class="statusClass(item.status)">{{ statusNames[item.status] }}</span></div></template></template>
        <template v-else-if="editorType === 'promotions'"><div class="form-grid"><label class="field"><span>Código do cupão</span><input v-model="form.code" required autofocus maxlength="24" class="uppercase-input" placeholder="BEMVINDO10" /></label><label class="field"><span>Desconto (%)</span><input v-model.number="form.discount" type="number" min="1" max="100" required /></label><label class="field"><span>Serviço</span><select v-model="form.serviceId"><option value="">Todos os serviços</option><option v-for="item in services" :key="item.id" :value="item.id">{{ item.name }}</option></select></label><label class="field"><span>Válida até</span><input v-model="form.expires" type="date" required /></label></div><label class="checkbox-line"><input v-model="form.active" type="checkbox" /> Promoção activa</label></template>
        <template v-else-if="editorType === 'blocks'"><div class="form-grid"><label class="field full-width"><span>Motivo</span><input v-model="form.reason" required autofocus placeholder="Ex.: Reunião da equipa, férias" /></label><label class="field"><span>Data</span><input v-model="form.date" type="date" required /></label><label class="field"><span>Profissional</span><select v-model="form.staffId"><option value="">Toda a equipa</option><option v-for="person in team" :key="person.id" :value="person.id">{{ person.name }}</option></select></label><label class="field"><span>Início</span><input v-model="form.start" type="time" required /></label><label class="field"><span>Fim</span><input v-model="form.end" type="time" required /></label></div></template>
        <div class="form-actions"><button class="btn secondary" type="button" @click="editorOpen = false">Cancelar</button><button class="btn primary" type="submit"><AppIcon name="check" :size="17" /> Guardar</button></div>
      </form>
    </AppModal>

    <AppModal v-model="bookingOpen" :title="bookingForm.id ? 'Editar reserva' : 'Nova reserva'">
      <form class="manager-editor" @submit.prevent="saveBooking"><div v-if="bookingError" class="form-error" role="alert"><AppIcon name="circle-alert" :size="17" /> {{ bookingError }}</div><div class="form-grid"><label class="field full-width"><span>Cliente</span><select v-model="bookingForm.clientId" required><option disabled value="">Seleccionar cliente</option><option v-for="item in clients" :key="item.id" :value="item.id">{{ item.name }}{{ item.phone ? ' · ' + item.phone : '' }}</option></select></label><p v-if="!clients.length" class="muted full-width">Cadastre um cliente no menu Clientes antes de criar a reserva.</p><label class="field full-width"><span>Serviço</span><select v-model="bookingForm.serviceId" required><option disabled value="">Seleccionar serviço</option><option v-for="item in services.filter(item => item.active || item.id === bookingForm.serviceId)" :key="item.id" :value="item.id">{{ item.name }} · {{ money(item.price) }} · {{ item.duration }} min</option></select></label><label class="field"><span>Profissional</span><select v-model="bookingForm.staffId" required><option disabled value="">Seleccionar profissional</option><option v-for="person in bookingStaff" :key="person.id" :value="person.id">{{ person.name }}</option></select></label><label class="field"><span>Data</span><input v-model="bookingForm.date" type="date" :min="today()" required /></label><label v-if="bookingResources.length || bookingService?.resourceType" class="field"><span>Espaço ou recurso {{ bookingService?.resourceType ? '' : '(opcional)' }}</span><select v-model="bookingForm.resourceId" :required="!!bookingService?.resourceType"><option value="">Seleccionar recurso</option><option v-for="item in bookingResources" :key="item.id" :value="item.id">{{ item.name }} · {{ item.capacity }} pessoas</option></select></label><label v-if="bookingResources.length || company?.category === 'Restauração'" class="field"><span>Número de pessoas</span><input v-model.number="bookingForm.partySize" type="number" min="1" max="500" required /></label></div><fieldset class="choice-fieldset"><legend>Horários disponíveis</legend><div v-if="slots.length" class="time-slot-grid"><button v-for="slot in slots" :key="slot" type="button" :class="{ selected: bookingForm.time === slot }" @click="bookingForm.time = slot">{{ slot }}</button></div><p v-else class="muted">Não existem horários disponíveis. Experimente outra data ou profissional.</p><p v-if="currentTimeUnavailable" class="form-hint">Horário actual: {{ bookingForm.time }}. Seleccione um horário disponível para reagendar.</p></fieldset><label class="field"><span>Observações (opcional)</span><textarea v-model="bookingForm.notes" rows="2" maxlength="500" placeholder="Preferências ou informações para a equipa"></textarea></label><div class="booking-form-total"><span>{{ bookingForm.id ? 'Valor da reserva' : 'Total' }}</span><strong>{{ money(bookingForm.id && bookingForm.total != null ? bookingForm.total : bookingService?.price || 0) }}</strong></div><div class="form-actions"><button class="btn secondary" type="button" @click="bookingOpen = false">Cancelar</button><button class="btn primary" type="submit" :disabled="!clients.length || !bookingForm.time || !slots.includes(bookingForm.time)"><AppIcon name="check" :size="17" /> {{ bookingForm.id ? 'Guardar alterações' : 'Confirmar reserva' }}</button></div></form>
    </AppModal>

    <AppModal v-model="detailOpen" title="Detalhes da reserva">
      <template v-if="selectedBooking"><div class="reservation-detail"><div class="reservation-heading"><span class="avatar">{{ initials(clientName(selectedBooking)) }}</span><div><h3>{{ clientName(selectedBooking) }}</h3><p>{{ serviceName(selectedBooking.serviceId) }}</p></div><span class="badge" :class="statusClass(selectedBooking.status)">{{ statusNames[selectedBooking.status] }}</span></div><dl class="detail-grid"><div><dt>Data</dt><dd>{{ formatDate(selectedBooking.date) }}</dd></div><div><dt>Horário</dt><dd>{{ selectedBooking.time }} · {{ selectedBooking.duration }} min</dd></div><div><dt>Profissional</dt><dd>{{ staffName(selectedBooking.staffId) }}</dd></div><div><dt>Referência</dt><dd class="booking-reference">{{ selectedBooking.id }}</dd></div><div v-if="selectedBooking.resourceId"><dt>Recurso</dt><dd>{{ resourceName(selectedBooking.resourceId) }}</dd></div><div v-if="selectedBooking.partySize > 1"><dt>Pessoas</dt><dd>{{ selectedBooking.partySize }}</dd></div></dl><div v-if="selectedBooking.notes" class="reservation-notes"><strong>Observações</strong><p>{{ selectedBooking.notes }}</p></div><div class="reservation-payment"><div><strong>{{ money(selectedBooking.total) }}</strong><span>{{ selectedBooking.paymentMethod === 'online' ? 'Pagamento online' : 'Pagamento no estabelecimento' }}</span></div><span class="badge" :class="statusClass(selectedBooking.paymentStatus)">{{ paymentNames[selectedBooking.paymentStatus] }}</span></div><div class="detail-actions"><button v-if="selectedBooking.status === 'confirmed'" class="btn primary" @click="changeStatus(selectedBooking, 'in_progress')"><AppIcon name="play" :size="16" /> Iniciar atendimento</button><button v-if="['confirmed', 'in_progress'].includes(selectedBooking.status)" class="btn primary" @click="changeStatus(selectedBooking, 'completed')"><AppIcon name="check-check" :size="17" /> Concluir</button><button v-if="selectedBooking.paymentStatus === 'pending' && activeBooking(selectedBooking)" class="btn secondary" @click="collectPayment(selectedBooking)"><AppIcon name="wallet" :size="17" /> Registar pagamento</button><button v-if="['confirmed', 'in_progress'].includes(selectedBooking.status)" class="btn secondary" @click="openBooking(selectedBooking)"><AppIcon name="calendar-clock" :size="17" /> Reagendar / editar</button><button v-if="selectedBooking.status === 'confirmed'" class="btn secondary" @click="changeStatus(selectedBooking, 'no_show')"><AppIcon name="user-x" :size="16" /> Não compareceu</button><button v-if="['confirmed', 'in_progress'].includes(selectedBooking.status)" class="btn danger" @click="changeStatus(selectedBooking, 'cancelled')"><AppIcon name="x" :size="17" /> Cancelar reserva</button></div></div></template>
    </AppModal>

    <AppModal v-model="removeOpen" title="Eliminar registo"><div class="removal-content"><p>Deseja eliminar <strong>{{ removal?.record.name || removal?.record.code || removal?.record.reason }}</strong>?</p><p class="muted">Os registos associados a reservas serão desactivados para preservar o histórico. Clientes com reservas não podem ser eliminados.</p><div class="form-actions"><button class="btn secondary" @click="removeOpen = false">Voltar</button><button class="btn danger" @click="confirmRemoval"><AppIcon name="trash-2" :size="17" /> Eliminar</button></div></div></AppModal>
  </div>
</template>

<style scoped>
.business-workspace{min-width:0}.business-context{font-size:12px;font-weight:600;color:var(--muted,#6a7776);margin-bottom:7px}.workspace-actions,.row-actions{display:flex;align-items:center;gap:8px}.workspace-actions{flex-wrap:wrap}.manager-section{padding:26px 0;border-top:1px solid var(--border,#e4e9e7)}.manager-section h2{font-size:18px;margin:0}.manager-section h3{font-size:16px}.manager-section .section-title p{font-size:13px;margin:5px 0 0}.manager-stats{margin:8px 0 28px}.stat-caption{display:flex;align-items:center;gap:8px}.stat small{display:block;color:var(--muted,#697772);font-size:12px;margin-top:6px}.manager-two-col{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(260px,1fr);gap:32px}.week-strip{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:10px}.week-day{display:flex;flex-direction:column;gap:10px;align-items:center;background:var(--surface,#fff);border:1px solid var(--border,#e3e8e5);border-radius:7px;padding:15px 6px;color:inherit;cursor:pointer}.week-day:hover{border-color:var(--primary,#267a68)}.week-day.current{background:#e8f4ee;border-color:#92c3ad;color:#205d48}.week-day>span{font-size:12px;text-transform:capitalize}.week-day>strong{font-size:23px}.week-day>small{font-size:11px;color:var(--muted,#64746b)}.appointment-row{display:flex;width:100%;align-items:center;gap:13px;background:transparent;border:0;border-bottom:1px solid var(--border,#e4e9e7);padding:17px 0;text-align:left;color:inherit;cursor:pointer}.appointment-row:hover{background:#f2f7f4}.appointment-time{font-size:13px;font-weight:700}.appointment-person{display:flex;flex-direction:column;gap:5px;flex:1;min-width:0}.appointment-person strong{font-size:14px}.appointment-person small{font-size:12px;color:var(--muted,#68766e)}.business-cover{width:100%;height:140px;object-fit:cover;border-radius:6px;display:block;margin-bottom:15px}.business-summary h3{margin:0 0 5px}.business-summary>p{font-size:13px;margin:0}.summary-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));padding:20px 0;gap:8px}.summary-metrics>div{display:flex;flex-direction:column;gap:5px}.summary-metrics strong{font-size:21px}.summary-metrics span{font-size:11px;color:var(--muted,#697772)}.summary-hours{display:flex;gap:8px;align-items:center;flex-wrap:wrap;font-size:12px;padding-top:15px;border-top:1px solid var(--border,#e4e9e7)}.summary-hours .badge{margin-left:auto}.agenda-toolbar{flex-wrap:wrap}.date-stepper{display:flex;align-items:center;gap:5px}.date-stepper input{max-width:155px}.agenda-list{border-top:1px solid var(--border,#e4e9e7)}.agenda-entry{display:flex;align-items:center;gap:22px;padding:22px 6px;border-bottom:1px solid var(--border,#e4e9e7)}.agenda-entry.cancelled{opacity:.68}.agenda-time{display:flex;flex-direction:column;gap:6px;min-width:54px}.agenda-time strong{font-size:16px}.agenda-time span{font-size:12px;color:var(--muted,#697772)}.agenda-main{display:flex;flex-direction:column;gap:5px;flex:1;text-align:left;min-width:0;border:0;background:transparent;color:inherit;cursor:pointer;padding:0}.agenda-main>strong{font-size:15px}.agenda-main>span{font-size:14px}.agenda-main>small{display:flex;align-items:center;gap:5px;font-size:12px;color:var(--muted,#697772);flex-wrap:wrap}.agenda-state{display:flex;flex-direction:column;align-items:flex-end;gap:9px}.agenda-price{font-size:13px;font-weight:600;display:flex;gap:8px;align-items:center}.agenda-price small{font-size:11px;font-weight:400}.paid-label{color:#267456}.service-grid,.team-grid,.promotion-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}.service-card,.team-card,.promotion-card{border:1px solid var(--border,#dfe6e2);border-radius:7px;padding:20px;background:var(--surface,#fff);min-width:0;display:flex;flex-direction:column}.service-card-top,.team-card-head,.promotion-head{display:flex;align-items:center;justify-content:space-between;gap:10px}.service-symbol,.resource-icon{width:43px;height:43px;flex-shrink:0;background:#edf3ed;color:#457957;display:grid;place-items:center;border-radius:7px}.service-card h3,.team-card h3,.promotion-card h3{font-size:16px;margin:18px 0 6px;overflow-wrap:anywhere}.service-card>p{font-size:13px;line-height:1.65;color:var(--muted,#697772);margin:0 0 18px;flex:1}.service-meta{display:flex;align-items:center;justify-content:space-between;gap:10px}.service-meta>span{display:flex;gap:5px;align-items:center;font-size:12px;color:var(--muted,#697772)}.service-meta>strong{font-size:15px}.service-resource{font-size:12px;display:flex;align-items:center;gap:6px;margin-top:12px}.service-card footer,.team-card footer,.promotion-card footer{display:flex;align-items:center;gap:6px;border-top:1px solid var(--border,#e4e9e7);padding-top:16px;margin-top:18px}.service-card footer>.btn,.team-card footer>.btn,.promotion-card footer>.btn{margin-right:auto}.team-card-head .avatar{width:46px;height:46px;font-size:15px}.team-card>p{font-size:13px;margin:0 0 18px}.contact-line{display:flex;gap:8px;align-items:center;font-size:12px;color:var(--muted,#697772);margin:6px 0;min-width:0}.contact-line span{overflow-wrap:anywhere;min-width:0}.team-services{display:flex;gap:5px;flex-wrap:wrap;margin:14px 0;flex:1}.team-services .badge{font-size:10px;white-space:normal}.team-shift{display:flex;align-items:center;gap:7px;font-size:12px}.resource-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:15px}.resource-card{border:1px solid var(--border,#e4e9e7);border-radius:7px;padding:20px;display:flex;gap:15px;align-items:center;min-width:0;background:var(--surface,#fff)}.resource-card>div:nth-child(2){min-width:0;flex:1}.resource-card h3{font-size:15px;margin:0 0 6px;overflow-wrap:anywhere}.resource-card p{font-size:12px;margin:0 0 10px}.resource-card>.row-actions{flex-direction:column}.resource-icon{background:#f2edf6;color:#8a6799}.weekday-options{display:flex;flex-wrap:wrap;gap:8px;margin:15px 0 20px}.weekday-options label{display:flex;align-items:center;justify-content:center;gap:5px;border:1px solid var(--border,#dfe6e2);border-radius:5px;padding:10px 12px;font-size:12px;cursor:pointer;min-width:58px}.weekday-options label.selected{background:#e9f3ef;border-color:#80b79f;color:#24634d}.weekday-options input{accent-color:#26745c;width:13px;height:13px;margin:0}.hours-form{max-width:630px;align-items:end;grid-template-columns:1fr 1fr auto}.shift-row{display:flex;align-items:center;gap:14px;padding:18px 0;border-bottom:1px solid var(--border,#e4e9e7)}.shift-person{display:flex;flex-direction:column;gap:5px;min-width:130px;flex:1}.shift-person strong{font-size:14px}.shift-person small{font-size:12px;color:var(--muted,#697772)}.shift-days{display:flex;gap:5px}.shift-days span{font-size:10px;color:#a2aba6;padding:6px 5px;border-radius:4px}.shift-days span.working{color:#3b6a55;background:#edf4f0}.shift-hours{font-size:12px;white-space:nowrap}.block-row{display:flex;align-items:center;gap:14px;border-bottom:1px solid var(--border,#e4e9e7);padding:17px 0}.block-symbol{display:grid;place-items:center;background:#fff2e7;color:#a47639;width:40px;height:40px;border-radius:6px;flex-shrink:0}.block-row>div:nth-child(2){display:flex;flex-direction:column;gap:5px;flex:1;min-width:0}.block-row strong{font-size:14px}.block-row small{font-size:12px;color:var(--muted,#697772)}.table-person{display:flex;align-items:center;gap:11px}.table-person strong{font-size:13px}.table-person .avatar{width:34px;height:34px;font-size:11px;flex-shrink:0}.cell-stack,.cell-link{display:flex;flex-direction:column;gap:5px}.cell-stack small,.cell-link small{font-size:12px;color:var(--muted,#697772)}.cell-link{border:0;padding:0;background:transparent;cursor:pointer;text-align:left;color:inherit;font-size:13px}.payment-stats{grid-template-columns:repeat(3,minmax(0,1fr))}.payment-tabs{display:flex;flex-wrap:wrap}.report-toolbar{align-items:end;flex-wrap:wrap}.report-toolbar .field{max-width:200px;min-width:140px}.report-toolbar>.muted{font-size:12px;padding-bottom:13px}.report-bar-row{display:grid;grid-template-columns:minmax(140px,1fr) minmax(100px,2fr) 30px;gap:20px;align-items:center;padding:16px 0}.report-bar-row>div:first-child{display:flex;flex-direction:column;gap:5px}.report-bar-row strong{font-size:13px}.report-bar-row small{font-size:11px;color:var(--muted,#697772)}.report-bar-track{height:13px;border-radius:3px;background:#eef1ee;overflow:hidden}.report-bar-track>span{display:block;height:100%;border-radius:3px;background:#72a98e;min-width:4px}.promotion-discount{font-size:35px;color:#487966;font-weight:700}.promotion-discount small{font-size:19px}.promotion-card>p{font-size:13px;flex:1;margin:0 0 18px}.promotion-card>small{font-size:12px}.settings-form{max-width:920px}.settings-form .manager-section:first-child{border-top:0;padding-top:0}.full-width{grid-column:1/-1}.settings-preview{width:100%;max-width:360px;height:150px;object-fit:cover;border-radius:6px;margin-top:18px}.settings-switch{display:flex;align-items:center;justify-content:space-between;gap:25px;padding:18px 0;border-bottom:1px solid var(--border,#e4e9e7)}.settings-switch strong{font-size:14px}.settings-switch p{font-size:12px;margin:5px 0 0}.switch{position:relative;display:block;width:40px;height:24px;flex-shrink:0}.switch input{position:absolute;inset:0;opacity:0;z-index:1;cursor:pointer}.switch>span{position:absolute;inset:0;border-radius:20px;background:#c8d3cd;transition:background .15s}.switch>span:before{content:'';position:absolute;width:18px;height:18px;background:white;border-radius:50%;top:3px;left:3px;box-shadow:0 1px 3px #0002;transition:transform .15s}.switch input:checked+span{background:#427f66}.switch input:checked+span:before{transform:translateX(16px)}.switch input:focus-visible+span{outline:2px solid #417e65;outline-offset:3px}.cancellation-field{margin-top:24px;max-width:380px}.manager-editor{display:flex;flex-direction:column;gap:18px}.manager-editor .form-actions{margin-top:7px}.form-error{display:flex;gap:8px;align-items:flex-start;font-size:13px;line-height:1.6;background:#fff0ed;border:1px solid #f0cdc5;color:#a24538;border-radius:6px;padding:12px}.form-error svg{flex-shrink:0;margin-top:3px}.choice-fieldset{border:0;padding:0;margin:0;min-width:0}.choice-fieldset legend{font-size:13px;font-weight:600;margin-bottom:10px}.choice-fieldset .weekday-options{margin:0}.checkbox-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.checkbox-line{display:flex;align-items:center;gap:9px;font-size:13px;line-height:1.5}.checkbox-line input{width:16px;height:16px;accent-color:#417e65;flex-shrink:0}.uppercase-input{text-transform:uppercase}.client-history-title{margin-top:14px}.client-history-title h3{font-size:15px;margin:0}.client-history-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 0;border-bottom:1px solid var(--border,#e4e9e7)}.client-history-row>div{display:flex;flex-direction:column;gap:5px}.client-history-row strong{font-size:13px}.client-history-row small{font-size:11px;color:var(--muted,#697772)}.time-slot-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;max-height:225px;overflow:auto;padding:2px}.time-slot-grid button{border:1px solid var(--border,#dfe6e2);background:white;color:#42534a;padding:11px 4px;border-radius:5px;font-size:13px;cursor:pointer}.time-slot-grid button.selected{background:#e5f2e9;border-color:#438d66;color:#285c41;font-weight:600}.form-hint{font-size:12px;color:#9b6f26;line-height:1.6;margin:10px 0 0}.booking-form-total{display:flex;align-items:center;justify-content:space-between;padding:17px 0;border-top:1px solid var(--border,#e4e9e7);font-size:14px}.booking-form-total strong{font-size:19px}.reservation-heading{display:flex;align-items:center;gap:13px;flex-wrap:wrap}.reservation-heading>.avatar{width:44px;height:44px;flex-shrink:0}.reservation-heading>div{flex:1;min-width:120px}.reservation-heading h3{font-size:17px;margin:0 0 6px}.reservation-heading p{font-size:13px;color:var(--muted,#697772);margin:0}.detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:22px;margin:28px 0}.detail-grid>div{min-width:0}.detail-grid dt{font-size:12px;color:var(--muted,#697772);margin-bottom:7px}.detail-grid dd{font-size:14px;margin:0;overflow-wrap:anywhere}.booking-reference{font-size:11px!important}.reservation-notes{padding:15px;background:#f3f6f3;border-radius:6px;margin-bottom:20px}.reservation-notes strong{font-size:12px}.reservation-notes p{font-size:13px;margin:7px 0 0;line-height:1.7}.reservation-payment{display:flex;align-items:center;justify-content:space-between;gap:15px;border-top:1px solid var(--border,#e4e9e7);border-bottom:1px solid var(--border,#e4e9e7);padding:20px 0}.reservation-payment>div{display:flex;flex-direction:column;gap:6px}.reservation-payment strong{font-size:21px}.reservation-payment span:not(.badge){font-size:12px;color:var(--muted,#697772)}.detail-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:23px}.detail-actions .btn{flex:1 1 180px;font-size:12px}.removal-content>p{font-size:14px;line-height:1.7}.removal-content>p.muted{font-size:12px}.empty-state.compact{padding:30px 12px}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
@media(max-width:1180px){.service-grid,.team-grid,.promotion-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.manager-two-col{grid-template-columns:minmax(0,1fr)}.business-cover{height:190px}.shift-row{flex-wrap:wrap}.shift-days{order:4;width:100%;padding-left:49px}.resource-grid{grid-template-columns:minmax(0,1fr)}}
@media(max-width:650px){.workspace-actions{width:100%;margin-top:12px}.workspace-actions>.btn{flex:1}.manager-stats{margin-bottom:20px}.week-strip{gap:5px}.week-day{padding:12px 2px;gap:8px}.week-day>strong{font-size:19px}.week-day>span{font-size:10px}.week-day>small{font-size:9px}.manager-section{padding:22px 0}.manager-two-col{gap:0}.appointment-row{gap:9px;flex-wrap:wrap}.appointment-person strong{font-size:13px}.appointment-person small{font-size:11px}.appointment-row>.badge{font-size:9px}.appointment-row>svg{display:none}.summary-metrics span{font-size:10px}.agenda-toolbar{gap:10px}.date-stepper{width:100%;justify-content:space-between}.date-stepper input{max-width:none;flex:1;min-width:0}.agenda-toolbar>select{flex:1;min-width:0;max-width:calc(50% - 28px)}.agenda-entry{display:grid;grid-template-columns:46px minmax(0,1fr) 28px;gap:12px;padding:17px 0}.agenda-time{grid-column:1;grid-row:1;min-width:0;align-self:start}.agenda-time strong{font-size:14px}.agenda-time span{font-size:10px}.agenda-main{grid-column:2;grid-row:1}.agenda-main>strong{font-size:14px}.agenda-main>span{font-size:13px}.agenda-main>small{font-size:11px;line-height:1.7}.agenda-state{grid-column:2/4;grid-row:2;flex-direction:row;align-items:center;justify-content:space-between}.agenda-state .badge{font-size:10px}.agenda-entry>.icon-btn{grid-column:3;grid-row:1;align-self:center;width:28px}.agenda-price{font-size:12px;gap:5px}.agenda-price small{font-size:10px}.service-grid,.team-grid,.promotion-grid{grid-template-columns:minmax(0,1fr);gap:13px}.service-card,.team-card,.promotion-card{padding:18px}.resource-card{padding:16px;gap:12px}.resource-card h3{font-size:14px}.resource-card p{font-size:11px}.resource-icon{width:37px;height:37px}.hours-form{grid-template-columns:1fr 1fr}.hours-form>.btn{grid-column:1/-1;justify-self:start}.weekday-options{gap:5px}.weekday-options label{min-width:40px;padding:9px 6px;font-size:11px;gap:4px}.weekday-options input{width:11px;height:11px}.shift-row{gap:10px}.shift-person{min-width:100px}.shift-person strong{font-size:13px}.shift-hours{font-size:11px}.shift-days{padding-left:0;justify-content:space-between}.block-row{gap:10px}.block-row strong{font-size:13px}.block-row small{font-size:11px;line-height:1.5}.block-symbol{width:32px;height:36px}.block-row .row-actions{gap:1px}.payment-stats{grid-template-columns:minmax(0,1fr)}.payment-tabs{width:100%;justify-content:space-between}.payment-tabs>button{font-size:12px;padding-left:10px;padding-right:10px}.report-toolbar .field{flex:1;max-width:none;min-width:110px}.report-toolbar>.muted{width:100%;padding-bottom:0}.report-bar-row{grid-template-columns:minmax(100px,1.2fr) minmax(60px,1fr) 20px;gap:12px}.report-bar-row strong{font-size:12px}.report-bar-row small{font-size:10px}.settings-form .form-actions{flex-wrap:wrap}.settings-form .form-actions>.btn{width:100%}.settings-switch strong{font-size:13px}.settings-switch p{font-size:11px;line-height:1.6}.checkbox-grid{grid-template-columns:minmax(0,1fr)}.time-slot-grid{grid-template-columns:repeat(4,minmax(0,1fr))}.detail-grid{gap:20px 14px}.detail-grid dd{font-size:13px}.reservation-heading h3{font-size:16px}.reservation-heading>.badge{margin-left:57px}.client-history-row{align-items:flex-start}.client-history-row .badge{font-size:9px}.manager-editor .form-actions>.btn{flex:1}.resource-grid{grid-template-columns:minmax(0,1fr)}}
</style>
