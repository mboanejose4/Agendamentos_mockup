<template>
  <main class="dashboard-page admin-page">
    <section class="dashboard-welcome admin-welcome">
      <div class="shell">
        <span class="eyebrow light">Administração do Salão</span>
        <h1>{{ pageTitle }}</h1>
        <p>{{ pageSubtitle }}</p>
      </div>
    </section>
    <div class="shell admin-layout">
      <aside class="admin-sidebar desktop-only">
        <div class="admin-context">
          <span class="salon-monogram small">BE</span>
          <div><strong>Beleza & Estilo</strong><small>Salão activo</small></div>
        </div>
        <nav>
          <button
            v-for="item in adminNav"
            :key="item.view"
            :class="{ active: store.view === item.view }"
            @click="go(item.view)"
          >
            <span>{{ item.icon }}</span
            >{{ item.label }}
          </button>
        </nav>
      </aside>
      <section class="admin-content">
        <template v-if="store.view === 'salon-admin'">
          <div class="metric-grid four">
            <article>
              <small>Marcações hoje</small><strong>18</strong
              ><span>+3 vs. ontem</span>
            </article>
            <article>
              <small>Ocupação</small><strong>74%</strong
              ><span>agenda da equipa</span>
            </article>
            <article>
              <small>Receita hoje</small><strong>12.850</strong><span>MT</span>
            </article>
            <article>
              <small>Pendentes</small><strong>3</strong><span>pagamentos</span>
            </article>
          </div>
          <div class="dashboard-grid two-col">
            <section class="dashboard-section">
              <div class="section-heading split compact-heading">
                <div>
                  <span class="eyebrow">Operação</span>
                  <h2>Agenda de hoje</h2>
                </div>
                <button class="text-link" @click="go('admin-agenda')">
                  Ver agenda →
                </button>
              </div>
              <div class="mini-agenda">
                <div v-for="(row, i) in todayAgenda" :key="i">
                  <span>{{ row.time }}</span>
                  <div>
                    <strong>{{ row.client }}</strong
                    ><small>{{ row.service }} · {{ row.pro }}</small>
                  </div>
                  <StatusBadge :status="row.status" />
                </div>
              </div>
            </section>
            <section class="dashboard-section">
              <div class="section-heading compact-heading">
                <span class="eyebrow">Desempenho</span>
                <h2>Serviços mais marcados</h2>
              </div>
              <div class="bar-list">
                <div v-for="item in bars" :key="item.name">
                  <div>
                    <strong>{{ item.name }}</strong
                    ><span>{{ item.value }}%</span>
                  </div>
                  <i><b :style="{ width: item.value + '%' }"></b></i>
                </div>
              </div>
              <button class="text-link" @click="go('admin-reports')">
                Abrir relatórios →
              </button>
            </section>
          </div>
          <section class="dashboard-section">
            <div class="section-heading split compact-heading">
              <div>
                <span class="eyebrow">Acções rápidas</span>
                <h2>Gerir o salão</h2>
              </div>
            </div>
            <div class="quick-actions admin-actions">
              <button
                v-for="item in quickAdmin"
                :key="item.view"
                @click="go(item.view)"
              >
                <span>{{ item.icon }}</span
                ><strong>{{ item.label }}</strong
                ><small>{{ item.desc }}</small>
              </button>
            </div>
          </section>
        </template>

        <template v-else-if="store.view === 'admin-services'">
          <div class="toolbar">
            <div>
              <strong>{{ editableServices.length }} serviços</strong
              ><small>Cadastro, edição, preços e duração.</small>
            </div>
            <button class="btn btn-primary" @click="openModal('add-service')">
              + Novo serviço
            </button>
          </div>
          <div class="data-table-card">
            <div class="table-head desktop-only">
              <span>Serviço</span><span>Categoria</span><span>Duração</span
              ><span>Preço</span><span>Estado</span><span></span>
            </div>
            <div
              v-for="service in editableServices"
              :key="service.id"
              class="table-row service-table-row"
            >
              <div class="table-primary">
                <span class="service-icon small">{{ service.icon }}</span>
                <div>
                  <strong>{{ service.name }}</strong
                  ><small>{{ service.description }}</small>
                </div>
              </div>
              <span>{{ service.category }}</span
              ><span>{{ service.duration }} min</span
              ><strong>{{ money(service.price) }}</strong
              ><StatusBadge
                :status="service.active === false ? 'Inactivo' : 'Activo'"
              /><button class="icon-button" @click="toggleService(service)">
                •••
              </button>
            </div>
          </div>
        </template>

        <template v-else-if="store.view === 'admin-team'">
          <div class="toolbar">
            <div>
              <strong>Equipa e autorizações</strong
              ><small>Profissionais e serviços que podem executar.</small>
            </div>
            <button
              class="btn btn-primary"
              @click="openModal('add-professional')"
            >
              + Profissional
            </button>
          </div>
          <div class="team-grid">
            <article
              v-for="pro in professionals"
              :key="pro.id"
              class="team-card"
            >
              <div class="team-head">
                <span class="avatar pro-avatar">{{ pro.initials }}</span>
                <div>
                  <h3>{{ pro.name }}</h3>
                  <p>{{ pro.role }}</p>
                </div>
                <StatusBadge status="Activo" />
              </div>
              <div class="tag-row">
                <span v-for="sid in pro.services" :key="sid">{{
                  service(sid)?.name
                }}</span>
              </div>
              <div class="card-actions">
                <button
                  class="btn btn-outline compact"
                  @click="openAssociation(pro)"
                >
                  Associar serviços</button
                ><button class="btn btn-ghost compact">Editar</button>
              </div>
            </article>
          </div>
        </template>

        <template v-else-if="store.view === 'admin-schedule'">
          <section class="dashboard-section">
            <div class="section-heading split compact-heading">
              <div>
                <span class="eyebrow">Horários</span>
                <h2>Funcionamento do salão</h2>
              </div>
              <button class="btn btn-primary compact" @click="save">
                Guardar
              </button>
            </div>
            <div class="availability-card">
              <div
                v-for="day in openingHours"
                :key="day.name"
                class="availability-row"
              >
                <div>
                  <strong>{{ day.name }}</strong
                  ><small>{{
                    day.enabled ? day.start + " — " + day.end : "Fechado"
                  }}</small>
                </div>
                <label class="switch"
                  ><input type="checkbox" v-model="day.enabled" /><span></span
                ></label>
                <div class="time-inputs" v-if="day.enabled">
                  <input type="time" v-model="day.start" /><span>—</span
                  ><input type="time" v-model="day.end" />
                </div>
              </div>
            </div>
          </section>
          <section class="dashboard-section">
            <div class="section-heading compact-heading">
              <span class="eyebrow">Equipa</span>
              <h2>Turnos e indisponibilidades</h2>
            </div>
            <div class="data-list">
              <div v-for="pro in professionals" :key="pro.id" class="data-row">
                <span class="avatar mini">{{ pro.initials }}</span>
                <div class="data-main">
                  <strong>{{ pro.name }}</strong
                  ><small>Seg–Sex · 08:00–17:00</small>
                </div>
                <button
                  class="btn btn-outline compact"
                  @click="showToast('Editor de turno aberto no mockup.')"
                >
                  Ajustar
                </button>
              </div>
            </div>
          </section>
        </template>

        <template v-else-if="store.view === 'admin-agenda'">
          <div class="toolbar sticky-toolbar">
            <div>
              <strong>Agenda geral</strong
              ><small>15 Setembro 2026 · 18 marcações</small>
            </div>
            <div class="toolbar-actions">
              <input type="date" value="2026-09-15" /><button
                class="btn btn-primary"
              >
                + Marcação
              </button>
            </div>
          </div>
          <div class="calendar-board">
            <div class="calendar-head">
              <span>Hora</span
              ><span v-for="pro in professionals" :key="pro.id">{{
                pro.name.split(" ")[0]
              }}</span>
            </div>
            <div
              v-for="time in [
                '08:00',
                '09:00',
                '10:00',
                '11:00',
                '12:00',
                '13:00',
                '14:00',
                '15:00',
                '16:00',
              ]"
              :key="time"
              class="calendar-row"
            >
              <span>{{ time }}</span
              ><button
                v-for="(pro, pidx) in professionals"
                :key="pro.id"
                :class="[
                  'calendar-slot',
                  { occupied: (parseInt(time) + pidx) % 3 === 0 },
                ]"
                @click="slotClick(time, pro)"
              >
                <template v-if="(parseInt(time) + pidx) % 3 === 0"
                  ><strong>{{
                    ["Corte", "Barba", "Penteado"][pidx % 3]
                  }}</strong
                  ><small>Cliente #{{ 240 + pidx }}</small></template
                ><template v-else><small>Disponível</small></template>
              </button>
            </div>
          </div>
        </template>

        <template v-else-if="store.view === 'admin-clients'">
          <div class="toolbar">
            <div>
              <strong>Clientes</strong
              ><small>Histórico de marcações e atendimentos.</small>
            </div>
            <label class="search-control mini-search"
              ><span>⌕</span
              ><input v-model="clientSearch" placeholder="Pesquisar cliente"
            /></label>
          </div>
          <div class="data-table-card">
            <div class="table-head clients-head desktop-only">
              <span>Cliente</span><span>Contacto</span
              ><span>Último atendimento</span><span>Total</span><span></span>
            </div>
            <div
              v-for="c in filteredClients"
              :key="c.name"
              class="table-row clients-row"
            >
              <div class="table-primary">
                <span class="avatar mini">{{ c.initials }}</span>
                <div>
                  <strong>{{ c.name }}</strong
                  ><small>{{ c.email }}</small>
                </div>
              </div>
              <span>{{ c.phone }}</span
              ><span>{{ c.last }}</span
              ><strong>{{ c.total }} marcações</strong
              ><button
                class="btn btn-outline compact"
                @click="showToast('Histórico do cliente aberto.')"
              >
                Histórico
              </button>
            </div>
          </div>
        </template>

        <template v-else-if="store.view === 'admin-payments'">
          <div class="toolbar">
            <div>
              <strong>Pagamentos</strong
              ><small>Registo e acompanhamento por marcação.</small>
            </div>
            <button class="btn btn-outline">Exportar</button>
          </div>
          <div class="metric-grid">
            <article>
              <small>Aprovado hoje</small><strong>12.850</strong><span>MT</span>
            </article>
            <article>
              <small>Pendente</small><strong>1.050</strong><span>MT</span>
            </article>
            <article>
              <small>Transacções</small><strong>14</strong><span>hoje</span>
            </article>
          </div>
          <div class="data-table-card">
            <div class="table-head payments-head desktop-only">
              <span>Pagamento</span><span>Cliente / Marcação</span
              ><span>Método</span><span>Valor</span><span>Estado</span>
            </div>
            <div
              v-for="p in payments"
              :key="p.id"
              class="table-row payments-row"
            >
              <strong>{{ p.id }}</strong>
              <div class="data-main">
                <strong>{{ p.client }}</strong
                ><small>{{ p.booking }}</small>
              </div>
              <span>{{ p.method }}</span
              ><strong>{{ money(p.amount) }}</strong
              ><StatusBadge :status="p.status" />
            </div>
          </div>
        </template>

        <template v-else-if="store.view === 'admin-reports'">
          <div class="toolbar">
            <div>
              <strong>Relatórios e indicadores</strong
              ><small>Visão operacional do salão.</small>
            </div>
            <select>
              <option>Últimos 30 dias</option>
              <option>Esta semana</option>
              <option>Este mês</option>
            </select>
          </div>
          <div class="metric-grid four">
            <article>
              <small>Marcações</small><strong>284</strong><span>+12%</span>
            </article>
            <article>
              <small>Conclusão</small><strong>91%</strong><span>+4 pp</span>
            </article>
            <article>
              <small>Receita</small><strong>198k</strong><span>MT</span>
            </article>
            <article>
              <small>Ticket médio</small><strong>697</strong><span>MT</span>
            </article>
          </div>
          <div class="dashboard-grid two-col">
            <section class="dashboard-section">
              <div class="section-heading compact-heading">
                <h2>Marcações por serviço</h2>
              </div>
              <div class="bar-list large-bars">
                <div v-for="item in reportBars" :key="item.name">
                  <div>
                    <strong>{{ item.name }}</strong
                    ><span>{{ item.count }}</span>
                  </div>
                  <i><b :style="{ width: item.value + '%' }"></b></i>
                </div>
              </div>
            </section>
            <section class="dashboard-section">
              <div class="section-heading compact-heading">
                <h2>Desempenho da equipa</h2>
              </div>
              <div class="data-list">
                <div
                  v-for="(pro, i) in professionals"
                  :key="pro.id"
                  class="data-row"
                >
                  <span class="avatar mini">{{ pro.initials }}</span>
                  <div class="data-main">
                    <strong>{{ pro.name }}</strong
                    ><small
                      >{{ 46 - i * 5 }} atendimentos · ★ {{ pro.rating }}</small
                    >
                  </div>
                  <strong>{{ 78 - i * 6 }}%</strong>
                </div>
              </div>
            </section>
          </div>
        </template>

        <template v-else-if="store.view === 'admin-promotions'">
          <div class="toolbar">
            <div>
              <strong>Promoções e cupões</strong
              ><small>Funcionalidade complementar do salão.</small>
            </div>
            <button
              class="btn btn-primary"
              @click="showToast('Criador de promoção aberto.')"
            >
              + Criar promoção
            </button>
          </div>
          <div class="promo-grid">
            <article
              v-for="promo in promos"
              :key="promo.code"
              class="promo-card"
            >
              <div class="promo-badge">{{ promo.discount }}</div>
              <div>
                <StatusBadge :status="promo.active ? 'Activo' : 'Inactivo'" />
                <h3>{{ promo.title }}</h3>
                <p>{{ promo.description }}</p>
                <div class="coupon-code">{{ promo.code }}</div>
                <small>Válido até {{ promo.until }}</small>
              </div>
            </article>
          </div>
        </template>

        <template v-else-if="store.view === 'admin-profile'">
          <section class="dashboard-section">
            <div class="section-heading compact-heading">
              <span class="eyebrow">Perfil do salão</span>
              <h2>Dados gerais e políticas</h2>
              <p>Informação apresentada aos clientes antes da marcação.</p>
            </div>
            <form @submit.prevent="save">
              <div class="form-grid two">
                <label>Nome do salão<input value="Beleza & Estilo" /></label
                ><label>Contacto<input value="+258 84 555 0199" /></label>
              </div>
              <label>Localização<input value="Polana Cimento, Maputo" /></label
              ><label
                >Descrição<textarea rows="4">
Cuidado profissional, agenda simples.</textarea>
              </label>
              <div class="form-grid two">
                <label
                  >Cancelamento<select>
                    <option>Até 4 horas antes</option>
                    <option>Até 12 horas antes</option>
                    <option>Até 24 horas antes</option>
                  </select></label
                ><label
                  >Pagamento online<select>
                    <option>Disponível e opcional</option>
                    <option>Desactivado</option>
                    <option>Obrigatório para alguns serviços</option>
                  </select></label
                >
              </div>
              <button class="btn btn-primary">Guardar perfil</button>
            </form>
          </section>
        </template>

        <template v-else>
          <section class="dashboard-section">
            <div class="section-heading compact-heading">
              <span class="eyebrow">Gestão</span>
              <h2>Todos os módulos</h2>
              <p>Acesso rápido às funções do administrador do salão.</p>
            </div>
            <div class="quick-actions admin-actions large-grid">
              <button
                v-for="item in adminNav.filter((x) => x.view !== 'salon-admin')"
                :key="item.view"
                @click="go(item.view)"
              >
                <span>{{ item.icon }}</span
                ><strong>{{ item.label }}</strong
                ><small>{{ navDescription(item.view) }}</small>
              </button>
            </div>
          </section>
        </template>
      </section>
    </div>

    <ModalSheet>
      <div v-if="store.modal === 'add-service'">
        <div class="sheet-head">
          <div>
            <span class="eyebrow">Serviços</span>
            <h2>Novo serviço</h2>
          </div>
          <button class="icon-button" @click="closeModal">×</button>
        </div>
        <div class="form-grid two">
          <label
            >Nome<input
              v-model="newService.name"
              placeholder="Nome do serviço" /></label
          ><label
            >Categoria<select v-model="newService.category">
              <option>Cabelo</option>
              <option>Barbearia</option>
              <option>Tratamento</option>
              <option>Estética</option>
            </select></label
          ><label
            >Duração (min)<input
              type="number"
              v-model.number="newService.duration" /></label
          ><label
            >Preço (MT)<input type="number" v-model.number="newService.price"
          /></label>
        </div>
        <label
          >Descrição<textarea
            v-model="newService.description"
            rows="3"
          ></textarea></label
        ><button class="btn btn-primary full" @click="addService">
          Guardar serviço
        </button>
      </div>
      <div v-else-if="store.modal === 'associate-services'">
        <div class="sheet-head">
          <div>
            <span class="eyebrow">Equipa</span>
            <h2>Associar serviços</h2>
          </div>
          <button class="icon-button" @click="closeModal">×</button>
        </div>
        <p class="muted">{{ store.modalPayload?.name }}</p>
        <div class="check-list">
          <label v-for="s in editableServices" :key="s.id"
            ><input
              type="checkbox"
              :checked="store.modalPayload?.services.includes(s.id)"
            /><span>{{ s.name }}</span></label
          >
        </div>
        <button
          class="btn btn-primary full"
          @click="
            closeModal();
            showToast('Associações actualizadas no mockup.');
          "
        >
          Guardar associações
        </button>
      </div>
      <div v-else-if="store.modal === 'add-professional'">
        <div class="sheet-head">
          <div>
            <span class="eyebrow">Equipa</span>
            <h2>Novo profissional</h2>
          </div>
          <button class="icon-button" @click="closeModal">×</button>
        </div>
        <label>Nome completo<input placeholder="Nome do profissional" /></label
        ><label>Função<input placeholder="Ex.: Cabeleireiro" /></label
        ><label>Contacto<input placeholder="+258 ..." /></label
        ><button
          class="btn btn-primary full"
          @click="
            closeModal();
            showToast('Profissional adicionado no mockup.');
          "
        >
          Adicionar profissional
        </button>
      </div>
    </ModalSheet>
  </main>
</template>
<script>
import {
  appStore as store,
  go,
  openModal,
  closeModal,
  showToast,
  helpers,
} from "../store.js";
import { services, professionals, adminPayments } from "../data/mockData.js";
import StatusBadge from "../components/StatusBadge.vue";
import ModalSheet from "../components/ModalSheet.vue";
export default {
  name: "SalonAdminModule",
  components: { StatusBadge, ModalSheet },
  data: () => ({
    store,
    professionals,
    editableServices: services.map((s) => ({ ...s, active: true })),
    payments: adminPayments,
    clientSearch: "",
    newService: {
      name: "",
      category: "Cabelo",
      duration: 45,
      price: 500,
      description: "",
    },
    openingHours: [
      { name: "Segunda", enabled: true, start: "08:00", end: "18:00" },
      { name: "Terça", enabled: true, start: "08:00", end: "18:00" },
      { name: "Quarta", enabled: true, start: "08:00", end: "18:00" },
      { name: "Quinta", enabled: true, start: "08:00", end: "18:00" },
      { name: "Sexta", enabled: true, start: "08:00", end: "18:00" },
      { name: "Sábado", enabled: true, start: "08:00", end: "16:00" },
      { name: "Domingo", enabled: false, start: "08:00", end: "13:00" },
    ],
    clients: [
      {
        name: "Sara Mucavele",
        initials: "SM",
        email: "sara@example.com",
        phone: "+258 84 111 2211",
        last: "14 Set 2026",
        total: 9,
      },
      {
        name: "Paulo Chissano",
        initials: "PC",
        email: "paulo@example.com",
        phone: "+258 82 302 1190",
        last: "13 Set 2026",
        total: 4,
      },
      {
        name: "Nelma Simango",
        initials: "NS",
        email: "nelma@example.com",
        phone: "+258 86 118 9000",
        last: "12 Set 2026",
        total: 6,
      },
      {
        name: "Armando Pita",
        initials: "AP",
        email: "armando@example.com",
        phone: "+258 85 440 2388",
        last: "11 Set 2026",
        total: 3,
      },
    ],
    promos: [
      {
        code: "BELEZA10",
        discount: "-10%",
        title: "Semana da Beleza",
        description: "Desconto em serviços seleccionados.",
        until: "20 Set 2026",
        active: true,
      },
      {
        code: "NOVO15",
        discount: "-15%",
        title: "Primeira marcação",
        description: "Benefício para novos clientes.",
        until: "30 Set 2026",
        active: true,
      },
      {
        code: "COR20",
        discount: "-20%",
        title: "Coloração especial",
        description: "Campanha encerrada de coloração.",
        until: "31 Ago 2026",
        active: false,
      },
    ],
  }),
  computed: {
    adminNav() {
      return [
        { view: "salon-admin", label: "Visão geral", icon: "▦" },
        { view: "admin-services", label: "Serviços", icon: "✂" },
        { view: "admin-team", label: "Profissionais", icon: "◉" },
        { view: "admin-schedule", label: "Horários e turnos", icon: "◷" },
        { view: "admin-agenda", label: "Agenda geral", icon: "▣" },
        { view: "admin-clients", label: "Clientes", icon: "◎" },
        { view: "admin-payments", label: "Pagamentos", icon: "¤" },
        { view: "admin-reports", label: "Relatórios", icon: "↗" },
        { view: "admin-promotions", label: "Promoções", icon: "%" },
        { view: "admin-profile", label: "Perfil do salão", icon: "◇" },
      ];
    },
    pageTitle() {
      return (
        this.adminNav.find((x) => x.view === store.view)?.label ||
        (store.view === "admin-more" ? "Gestão do salão" : "Painel do salão")
      );
    },
    pageSubtitle() {
      return (
        {
          "salon-admin":
            "Acompanhe a operação, a equipa e os principais indicadores.",
          "admin-services": "Cadastre e mantenha o catálogo de serviços.",
          "admin-team": "Gerencie profissionais e autorizações.",
          "admin-schedule":
            "Defina funcionamento, turnos e indisponibilidades.",
          "admin-agenda": "Visualize e gira as marcações de toda a equipa.",
          "admin-clients": "Consulte clientes e históricos de atendimento.",
          "admin-payments": "Acompanhe pagamentos associados às marcações.",
          "admin-reports": "Consulte indicadores básicos da operação.",
          "admin-promotions": "Crie e acompanhe campanhas e cupões.",
          "admin-profile":
            "Configure os dados e políticas apresentados aos clientes.",
          "admin-more": "Aceda a todos os módulos administrativos.",
        }[store.view] || "Gestão da operação."
      );
    },
    quickAdmin() {
      return this.adminNav
        .slice(1, 7)
        .map((x) => ({ ...x, desc: this.navDescription(x.view) }));
    },
    todayAgenda() {
      return [
        {
          time: "08:00",
          client: "Sara M.",
          service: "Corte",
          pro: "Celso",
          status: "Confirmada",
        },
        {
          time: "09:00",
          client: "Paulo C.",
          service: "Barba",
          pro: "Celso",
          status: "Em atendimento",
        },
        {
          time: "09:30",
          client: "Rita A.",
          service: "Coloração",
          pro: "Amina",
          status: "Confirmada",
        },
        {
          time: "10:15",
          client: "Nelma S.",
          service: "Penteado",
          pro: "Marta",
          status: "Aguardando",
        },
      ];
    },
    bars() {
      return [
        { name: "Corte de cabelo", value: 82 },
        { name: "Barba", value: 61 },
        { name: "Penteado", value: 49 },
        { name: "Coloração", value: 37 },
      ];
    },
    reportBars() {
      return [
        { name: "Corte de cabelo", count: 86, value: 100 },
        { name: "Barba", count: 64, value: 74 },
        { name: "Penteado", count: 51, value: 59 },
        { name: "Coloração", count: 42, value: 49 },
        { name: "Tratamento capilar", count: 31, value: 36 },
      ];
    },
    filteredClients() {
      const q = this.clientSearch.toLowerCase();
      return this.clients.filter((c) =>
        `${c.name} ${c.phone} ${c.email}`.toLowerCase().includes(q),
      );
    },
  },
  methods: {
    go,
    openModal,
    closeModal,
    showToast,
    service: helpers.serviceById,
    money(v) {
      return `${new Intl.NumberFormat("pt-MZ").format(v)} MT`;
    },
    navDescription(v) {
      return (
        {
          "admin-services": "Catálogo e preços",
          "admin-team": "Equipa e autorizações",
          "admin-schedule": "Turnos e disponibilidade",
          "admin-agenda": "Marcações da equipa",
          "admin-clients": "Cadastro e histórico",
          "admin-payments": "Estados e registos",
          "admin-reports": "Indicadores da operação",
          "admin-promotions": "Campanhas e cupões",
          "admin-profile": "Dados e políticas",
        }[v] || ""
      );
    },
    toggleService(s) {
      s.active = !s.active;
      showToast(`Serviço ${s.active ? "activado" : "desactivado"}.`);
    },
    openAssociation(p) {
      openModal("associate-services", p);
    },
    save() {
      showToast("Alterações guardadas no mockup.");
    },
    slotClick(t, p) {
      showToast(`${p.name} · ${t}: detalhe de agenda aberto.`);
    },
    addService() {
      if (!this.newService.name) return;
      this.editableServices.push({
        id: Date.now(),
        icon: "✦",
        ...this.newService,
        active: true,
      });
      this.newService = {
        name: "",
        category: "Cabelo",
        duration: 45,
        price: 500,
        description: "",
      };
      closeModal();
      showToast("Serviço adicionado.");
    },
  },
};
</script>
