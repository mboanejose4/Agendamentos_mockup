const localDate = (value) => `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`

export function shiftDate(offset = 0) {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  return localDate(date)
}

export function makeSeed() {
  const businesses = [
    { id: 'b1', name: 'Studio Lume', category: 'Beleza', description: 'Um espaço dedicado a cuidar de si. Cabelo, estética e pequenos momentos de renovação no coração de Maputo.', city: 'Maputo', address: 'Av. Julius Nyerere, 420 · Polana', phone: '+258 84 320 4100', email: 'ola@studiolume.co.mz', image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1200&q=85', rating: 4.9, reviewCount: 128, active: true, onlinePayment: true, opens: '08:00', closes: '19:00', days: [0, 1, 2, 3, 4, 5, 6], cancelHours: 2 },
    { id: 'b2', name: 'Soma Wellness', category: 'Bem-estar', description: 'Massagens, rituais de relaxamento e terapias de bem-estar num ambiente tranquilo, pensado para desacelerar.', city: 'Maputo', address: 'Rua da Argélia, 85 · Sommerschield', phone: '+258 84 500 1200', email: 'reservas@somawellness.co.mz', image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=85', rating: 4.8, reviewCount: 86, active: true, onlinePayment: true, opens: '09:00', closes: '19:00', days: [0, 1, 2, 3, 4, 5, 6], cancelHours: 4 },
    { id: 'b3', name: 'Clínica Vida', category: 'Saúde', description: 'Cuidados de saúde próximos de si, com consultas de clínica geral, nutrição e fisioterapia por marcação.', city: 'Matola', address: 'Av. da União Africana, 210 · Matola A', phone: '+258 82 710 2020', email: 'atendimento@clinicavida.co.mz', image: 'https://images.unsplash.com/photo-1504439468489-c8920d796a29?auto=format&fit=crop&w=1200&q=85', rating: 4.9, reviewCount: 204, active: true, onlinePayment: true, opens: '08:00', closes: '18:00', days: [0, 1, 2, 3, 4, 5, 6], cancelHours: 4 },
    { id: 'b4', name: 'Mesa & Mar', category: 'Restauração', description: 'Sabores frescos, boa companhia e uma mesa à sua espera. Reserve o almoço, jantar ou uma experiência especial.', city: 'Maputo', address: 'Av. Marginal, 78 · Costa do Sol', phone: '+258 84 920 3030', email: 'reservas@mesaemar.co.mz', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=85', rating: 4.7, reviewCount: 312, active: true, onlinePayment: false, opens: '12:00', closes: '22:00', days: [0, 1, 2, 3, 4, 5, 6], cancelHours: 2 },
  ]
  const services = [
    { id: 's1', businessId: 'b1', name: 'Corte & styling', description: 'Consulta de estilo, lavagem, corte e finalização.', duration: 60, price: 1200, active: true },
    { id: 's2', businessId: 'b1', name: 'Manicure completa', description: 'Cuidado das unhas, cutículas e aplicação de verniz.', duration: 45, price: 650, active: true },
    { id: 's3', businessId: 'b1', name: 'Coloração personalizada', description: 'Diagnóstico, coloração e tratamento de brilho.', duration: 120, price: 3500, active: true },
    { id: 's4', businessId: 'b1', name: 'Tratamento facial', description: 'Limpeza, hidratação e cuidado adequado à sua pele.', duration: 60, price: 1800, active: true, resourceType: 'room' },
    { id: 's5', businessId: 'b2', name: 'Massagem relaxante', description: 'Uma pausa para aliviar tensões e recuperar energia.', duration: 60, price: 2500, active: true, resourceType: 'room' },
    { id: 's6', businessId: 'b2', name: 'Ritual de bem-estar', description: 'Massagem de corpo inteiro com aromaterapia.', duration: 90, price: 3800, active: true, resourceType: 'room' },
    { id: 's7', businessId: 'b3', name: 'Consulta de clínica geral', description: 'Avaliação e acompanhamento com médico de família.', duration: 30, price: 2000, active: true, resourceType: 'room' },
    { id: 's8', businessId: 'b3', name: 'Consulta de nutrição', description: 'Avaliação nutricional e plano de acompanhamento.', duration: 60, price: 2500, active: true, resourceType: 'room' },
    { id: 's9', businessId: 'b3', name: 'Sessão de fisioterapia', description: 'Avaliação funcional e tratamento individual.', duration: 60, price: 1800, active: true, resourceType: 'room' },
    { id: 's10', businessId: 'b4', name: 'Reserva de mesa', description: 'Almoço ou jantar à carta. Consumo pago no local.', duration: 90, price: 0, active: true, resourceType: 'table' },
    { id: 's11', businessId: 'b4', name: 'Menu de degustação', description: 'Uma experiência de cinco momentos. Valor por pessoa.', duration: 120, price: 2800, active: true, resourceType: 'table', pricePerPerson: true },
  ]
  const staff = [
    { id: 'p1', businessId: 'b1', name: 'Ana Matavele', title: 'Hair stylist', email: 'ana@studiolume.co.mz', phone: '+258 84 100 1001', serviceIds: ['s1', 's3'], active: true, start: '08:00', end: '19:00', days: [0, 1, 2, 3, 4, 5, 6] },
    { id: 'p2', businessId: 'b1', name: 'Sara Chissano', title: 'Especialista em estética', email: 'sara@studiolume.co.mz', phone: '+258 84 100 1002', serviceIds: ['s2', 's4'], active: true, start: '08:00', end: '18:00', days: [0, 1, 2, 3, 4, 5, 6] },
    { id: 'p3', businessId: 'b1', name: 'David Machava', title: 'Hair stylist', email: 'david@studiolume.co.mz', phone: '+258 84 100 1003', serviceIds: ['s1', 's3'], active: true, start: '09:00', end: '19:00', days: [0, 1, 2, 3, 4, 5, 6] },
    { id: 'p4', businessId: 'b2', name: 'Lúcia Machel', title: 'Terapeuta de bem-estar', email: 'lucia@somawellness.co.mz', phone: '+258 84 100 1004', serviceIds: ['s5', 's6'], active: true, start: '09:00', end: '19:00', days: [0, 1, 2, 3, 4, 5, 6] },
    { id: 'p5', businessId: 'b3', name: 'Dr. Paulo Simango', title: 'Médico de clínica geral', email: 'paulo@clinicavida.co.mz', phone: '+258 84 100 1005', serviceIds: ['s7'], active: true, start: '08:00', end: '17:00', days: [0, 1, 2, 3, 4, 5, 6] },
    { id: 'p6', businessId: 'b3', name: 'Dra. Elisa Sitoe', title: 'Nutricionista e fisioterapeuta', email: 'elisa@clinicavida.co.mz', phone: '+258 84 100 1006', serviceIds: ['s8', 's9'], active: true, start: '08:00', end: '18:00', days: [0, 1, 2, 3, 4, 5, 6] },
    { id: 'p7', businessId: 'b4', name: 'Rui Nhantumbo', title: 'Responsável de reservas', email: 'rui@mesaemar.co.mz', phone: '+258 84 100 1007', serviceIds: ['s10', 's11'], active: true, start: '12:00', end: '22:00', days: [0, 1, 2, 3, 4, 5, 6] },
  ]
  const resources = [
    { id: 'r1', businessId: 'b1', name: 'Sala de estética', type: 'room', capacity: 1, active: true },
    { id: 'r2', businessId: 'b2', name: 'Sala Serenidade', type: 'room', capacity: 1, active: true },
    { id: 'r3', businessId: 'b2', name: 'Sala Equilíbrio', type: 'room', capacity: 2, active: true },
    { id: 'r4', businessId: 'b3', name: 'Consultório 1', type: 'room', capacity: 1, active: true },
    { id: 'r5', businessId: 'b3', name: 'Consultório 2', type: 'room', capacity: 1, active: true },
    { id: 'r6', businessId: 'b4', name: 'Mesa 01 · Janela', type: 'table', capacity: 2, active: true },
    { id: 'r7', businessId: 'b4', name: 'Mesa 02 · Esplanada', type: 'table', capacity: 4, active: true },
    { id: 'r8', businessId: 'b4', name: 'Mesa 03 · Jardim', type: 'table', capacity: 6, active: true },
    { id: 'r9', businessId: 'b4', name: 'Mesa 04 · Grupo', type: 'table', capacity: 12, active: true },
  ]
  const clients = [
    { id: 'u1', businessId: 'b1', name: 'José Mboane', email: 'jose@example.com', phone: '+258 84 000 0000' },
    { id: 'c2', businessId: 'b1', name: 'Mariana Costa', email: 'mariana@example.com', phone: '+258 84 220 3100' },
    { id: 'c3', businessId: 'b1', name: 'Celina Manjate', email: 'celina@example.com', phone: '+258 82 350 2100' },
    { id: 'c4', businessId: 'b1', name: 'Joaquim Bila', email: 'joaquim@example.com', phone: '+258 84 650 1800' },
    { id: 'c5', businessId: 'b2', name: 'Amélia Cossa', email: 'amelia@example.com', phone: '+258 84 720 1300' },
    { id: 'c6', businessId: 'b3', name: 'Tomás Dhlakama', email: 'tomas@example.com', phone: '+258 82 120 5400' },
    { id: 'c7', businessId: 'b4', name: 'Isabel Mondlane', email: 'isabel@example.com', phone: '+258 84 810 0900' },
  ]
  const rows = [
    ['a1', 'b1', 's1', 'p1', '', 'c2', 0, '09:00', 'confirmed'],
    ['a2', 'b1', 's2', 'p2', '', 'c3', 0, '10:00', 'confirmed'],
    ['a3', 'b1', 's3', 'p1', '', 'c4', 0, '11:00', 'confirmed'],
    ['a4', 'b1', 's1', 'p3', '', 'u1', 1, '14:00', 'confirmed'],
    ['a5', 'b1', 's4', 'p2', 'r1', 'c2', 0, '14:00', 'confirmed'],
    ['a6', 'b1', 's1', 'p1', '', 'u1', 3, '10:00', 'confirmed'],
    ['a7', 'b2', 's5', 'p4', 'r2', 'u1', 2, '15:00', 'confirmed'],
    ['a8', 'b2', 's6', 'p4', 'r2', 'c5', 0, '10:00', 'confirmed'],
    ['a9', 'b3', 's7', 'p5', 'r4', 'c6', 0, '09:00', 'confirmed'],
    ['a10', 'b4', 's10', '', 'r7', 'c7', 0, '19:00', 'confirmed'],
    ['a11', 'b1', 's1', 'p1', '', 'u1', -7, '10:00', 'completed'],
    ['a12', 'b1', 's3', 'p3', '', 'c2', -3, '11:00', 'completed'],
    ['a13', 'b1', 's2', 'p2', '', 'c3', -1, '15:00', 'completed'],
    ['a14', 'b1', 's4', 'p2', 'r1', 'c4', -2, '14:00', 'cancelled'],
    ['a15', 'b3', 's8', 'p6', 'r5', 'u1', -12, '10:00', 'completed'],
  ]
  const bookings = rows.map(([id, businessId, serviceId, staffId, resourceId, clientId, offset, time, status]) => {
    const item = services.find((entry) => entry.id === serviceId)
    return { id, businessId, serviceId, staffId, resourceId, clientId, clientName: clients.find((entry) => entry.id === clientId).name, date: shiftDate(offset), time, duration: item.duration, total: item.price, discount: 0, paymentMethod: 'onsite', paymentStatus: status === 'completed' ? 'paid' : 'pending', status, partySize: businessId === 'b4' ? 4 : 1, notes: '', createdAt: new Date().toISOString() }
  })
  return {
    businesses, services, staff, resources, clients, bookings,
    promotions: [
      { id: 'promo1', businessId: 'b1', code: 'BEMVINDO10', discount: 10, serviceId: '', active: true, expires: shiftDate(45) },
      { id: 'promo2', businessId: 'b2', code: 'SOMA15', discount: 15, serviceId: '', active: true, expires: shiftDate(30) },
    ],
    blocks: [{ id: 'block1', businessId: 'b1', staffId: 'p1', date: shiftDate(1), start: '12:00', end: '13:00', reason: 'Pausa de almoço' }],
    notifications: [
      { id: 'n1', userId: 'u1', title: 'A sua próxima visita está confirmada', body: `Corte & styling no Studio Lume, ${shiftDate(1)}, às 14:00.`, read: false, createdAt: new Date().toISOString() },
      { id: 'n2', userId: 'u1', title: 'Um cuidado extra na primeira visita', body: 'Use BEMVINDO10 e receba 10% de desconto no Studio Lume.', read: false, createdAt: new Date().toISOString() },
      { id: 'n3', userId: 'u3', title: 'Agenda actualizada', body: 'Consulte os atendimentos de hoje e prepare a sua equipa.', read: false, createdAt: new Date().toISOString() },
    ],
    tickets: [{ id: 't1', businessId: 'b1', subject: 'Configuração dos pagamentos online', status: 'open', priority: 'normal', messages: [{ author: 'Studio Lume', body: 'Gostaria de confirmar como activar pagamentos online no estabelecimento.', createdAt: new Date().toISOString() }] }],
    users: [
      { id: 'u1', name: 'José Mboane', email: 'jose@example.com', phone: '+258 84 000 0000', role: 'client', businessId: '', active: true },
      { id: 'u2', name: 'Ana Matavele', email: 'ana@studiolume.co.mz', phone: '+258 84 100 1001', role: 'professional', businessId: 'b1', staffId: 'p1', active: true },
      { id: 'u3', name: 'Beatriz Cossa', email: 'beatriz@studiolume.co.mz', phone: '+258 84 320 4100', role: 'manager', businessId: 'b1', active: true },
      { id: 'u4', name: 'Admin Elo', email: 'admin@elo.co.mz', phone: '+258 84 111 1111', role: 'platform', businessId: '', active: true },
    ],
    settings: { slotMinutes: 30, advanceDays: 60, onlinePayments: true, promotions: true, notifications: true },
    favorites: [],
    logs: [{ id: 'log1', action: 'Ambiente de demonstração preparado', userId: 'u4', businessId: '', createdAt: new Date().toISOString() }],
  }
}
