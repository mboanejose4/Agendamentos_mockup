export const roleOptions = [
  { id: 'guest', label: 'Visitante', description: 'Pesquisa e consulta sem autenticação' },
  { id: 'client', label: 'Cliente', description: 'Marcações, pagamentos e histórico' },
  { id: 'professional', label: 'Profissional', description: 'Agenda, disponibilidade e atendimentos' },
  { id: 'salonAdmin', label: 'Administrador do Salão', description: 'Operação completa do salão' },
  { id: 'platformAdmin', label: 'Administrador da Plataforma', description: 'Gestão global, monitoria e suporte' },
]

export const services = [
  { id: 1, name: 'Corte de cabelo', category: 'Cabelo', duration: 45, price: 650, icon: '✂', description: 'Corte personalizado com acabamento e finalização.' },
  { id: 2, name: 'Corte infantil', category: 'Cabelo', duration: 35, price: 450, icon: '◌', description: 'Atendimento confortável e rápido para crianças.' },
  { id: 3, name: 'Barba', category: 'Barbearia', duration: 30, price: 350, icon: '⌁', description: 'Aparar, desenho e acabamento da barba.' },
  { id: 4, name: 'Lavagem', category: 'Cabelo', duration: 25, price: 300, icon: '◒', description: 'Lavagem e hidratação leve.' },
  { id: 5, name: 'Tratamento capilar', category: 'Tratamento', duration: 60, price: 1200, icon: '✦', description: 'Tratamento ajustado às necessidades do cabelo.' },
  { id: 6, name: 'Coloração', category: 'Cabelo', duration: 90, price: 1800, icon: '◆', description: 'Aplicação de cor e finalização profissional.' },
  { id: 7, name: 'Penteado', category: 'Cabelo', duration: 60, price: 1000, icon: '≈', description: 'Penteado para eventos ou ocasião especial.' },
  { id: 8, name: 'Manicure e pedicure', category: 'Estética', duration: 75, price: 900, icon: '◇', description: 'Cuidado completo das mãos e pés.' },
]

export const professionals = [
  { id: 1, name: 'Amina Juma', role: 'Cabeleireira', rating: 4.9, initials: 'AJ', services: [1, 4, 5, 6, 7], next: '09:30' },
  { id: 2, name: 'Celso Mucavele', role: 'Barbeiro', rating: 4.8, initials: 'CM', services: [1, 2, 3, 4], next: '10:00' },
  { id: 3, name: 'Marta Chongo', role: 'Cabeleireira', rating: 4.7, initials: 'MC', services: [1, 4, 6, 7], next: '11:30' },
  { id: 4, name: 'Dina Bila', role: 'Esteticista', rating: 4.9, initials: 'DB', services: [5, 8], next: '12:00' },
]

export const salons = [
  {
    id: 1,
    name: 'Beleza & Estilo',
    city: 'Maputo',
    area: 'Polana Cimento',
    rating: 4.8,
    reviews: 126,
    open: true,
    hours: '08:00 — 18:00',
    distance: '2,4 km',
    featured: true,
    serviceIds: [1, 2, 3, 4, 5, 6, 7, 8],
    professionalIds: [1, 2, 3, 4],
    accent: 'BE',
    tagline: 'Cuidado profissional, agenda simples.'
  },
  {
    id: 2,
    name: 'Studio Matola',
    city: 'Matola',
    area: 'Matola A',
    rating: 4.6,
    reviews: 84,
    open: true,
    hours: '08:30 — 17:30',
    distance: '8,2 km',
    featured: false,
    serviceIds: [1, 2, 4, 5, 6, 7],
    professionalIds: [1, 3],
    accent: 'SM',
    tagline: 'Serviços modernos para toda a família.'
  },
  {
    id: 3,
    name: 'Linha Fina',
    city: 'Maputo',
    area: 'Sommerschield',
    rating: 4.7,
    reviews: 73,
    open: false,
    hours: '09:00 — 19:00',
    distance: '4,1 km',
    featured: false,
    serviceIds: [1, 3, 4, 5, 7],
    professionalIds: [2, 4],
    accent: 'LF',
    tagline: 'Precisão, estilo e atendimento cuidado.'
  },
  {
    id: 4,
    name: 'Casa do Penteado',
    city: 'Maputo',
    area: 'Baixa',
    rating: 4.5,
    reviews: 52,
    open: true,
    hours: '07:30 — 17:00',
    distance: '5,7 km',
    featured: false,
    serviceIds: [1, 4, 6, 7, 8],
    professionalIds: [1, 3, 4],
    accent: 'CP',
    tagline: 'Beleza prática no centro da cidade.'
  },
]

export const timeSlots = ['08:00', '08:45', '09:30', '10:15', '11:00', '11:45', '13:00', '13:45', '14:30', '15:15', '16:00', '16:45']

export const initialBookings = [
  {
    id: 'AG-24091', salonId: 1, serviceId: 1, professionalId: 2,
    date: '15 Set 2026', time: '10:00', status: 'Confirmada', payment: 'Pago online', total: 650
  },
  {
    id: 'AG-23984', salonId: 1, serviceId: 4, professionalId: 1,
    date: '04 Set 2026', time: '14:30', status: 'Concluída', payment: 'Pago no salão', total: 300
  },
  {
    id: 'AG-23872', salonId: 2, serviceId: 6, professionalId: 3,
    date: '23 Ago 2026', time: '11:00', status: 'Concluída', payment: 'Pago online', total: 1800
  },
]

export const notifications = [
  { id: 1, title: 'Marcação confirmada', body: 'Corte de cabelo confirmado para 15 Set às 10:00.', time: 'Há 8 min', read: false },
  { id: 2, title: 'Lembrete', body: 'A sua marcação é amanhã. Chegue 10 minutos antes.', time: 'Ontem', read: false },
  { id: 3, title: 'Promoção disponível', body: 'BELEZA10 dá 10% em serviços seleccionados esta semana.', time: '2 dias', read: true },
]

export const professionalAgenda = [
  { id: 1, time: '08:00', client: 'Sara M.', service: 'Corte de cabelo', status: 'Confirmada' },
  { id: 2, time: '09:00', client: 'Paulo C.', service: 'Barba', status: 'Confirmada' },
  { id: 3, time: '10:00', client: 'José M.', service: 'Corte de cabelo', status: 'Aguardando' },
  { id: 4, time: '11:30', client: 'Nelma S.', service: 'Corte infantil', status: 'Confirmada' },
  { id: 5, time: '14:00', client: 'Armando P.', service: 'Barba', status: 'Confirmada' },
]

export const adminPayments = [
  { id: 'PG-10492', client: 'Sara M.', booking: 'AG-24082', amount: 650, method: 'Online', status: 'Aprovado' },
  { id: 'PG-10491', client: 'Nelma S.', booking: 'AG-24079', amount: 450, method: 'No salão', status: 'Liquidado' },
  { id: 'PG-10490', client: 'Armando P.', booking: 'AG-24077', amount: 350, method: 'Online', status: 'Pendente' },
  { id: 'PG-10489', client: 'Rita A.', booking: 'AG-24075', amount: 1200, method: 'Online', status: 'Aprovado' },
]

export const platformSalons = [
  { id: 1, name: 'Beleza & Estilo', owner: 'Lídia Nhantumbo', city: 'Maputo', professionals: 8, status: 'Activo', joined: '12 Jun 2026' },
  { id: 2, name: 'Studio Matola', owner: 'Carlos Macamo', city: 'Matola', professionals: 5, status: 'Activo', joined: '01 Jul 2026' },
  { id: 3, name: 'Linha Fina', owner: 'Marta Uamusse', city: 'Maputo', professionals: 4, status: 'Activo', joined: '17 Jul 2026' },
  { id: 4, name: 'Casa do Penteado', owner: 'Dina Bila', city: 'Maputo', professionals: 6, status: 'Inactivo', joined: '03 Ago 2026' },
]
