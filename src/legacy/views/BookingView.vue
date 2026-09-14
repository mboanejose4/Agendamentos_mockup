<template>
  <main class="page-main booking-page" v-if="salon">
    <div class="shell narrow-shell">
      <div class="page-topline">
        <button class="back-link" @click="back">← Voltar</button
        ><span class="secure-chip">🔒 Marcação segura</span>
      </div>
      <div class="booking-head">
        <span class="eyebrow">Nova marcação</span>
        <h1>{{ salon.name }}</h1>
        <p>{{ salon.area }}, {{ salon.city }}</p>
      </div>
      <div class="stepper" aria-label="Progresso da marcação">
        <div
          v-for="item in steps"
          :key="item.n"
          :class="['step', { active: step === item.n, done: step > item.n }]"
        >
          <span>{{ step > item.n ? "✓" : item.n }}</span
          ><small>{{ item.label }}</small>
        </div>
      </div>

      <section v-if="step === 1" class="booking-panel">
        <div class="section-heading compact-heading">
          <span class="eyebrow">Passo 1 de 4</span>
          <h2>Escolha o serviço</h2>
          <p>
            Os horários disponíveis serão calculados a partir desta escolha.
          </p>
        </div>
        <div class="service-list selection-list">
          <button
            v-for="service in salonServices"
            :key="service.id"
            :class="[
              'service-row selectable',
              { selected: store.booking.serviceId === service.id },
            ]"
            @click="selectService(service.id)"
          >
            <span class="service-icon">{{ service.icon }}</span
            ><span class="service-copy"
              ><strong>{{ service.name }}</strong
              ><small>{{ service.description }}</small
              ><span>{{ service.duration }} min</span></span
            ><span class="service-price"
              ><strong>{{ money(service.price) }}</strong
              ><i>{{
                store.booking.serviceId === service.id ? "✓" : "›"
              }}</i></span
            >
          </button>
        </div>
        <div class="booking-actions">
          <span></span
          ><button
            class="btn btn-primary"
            :disabled="!store.booking.serviceId"
            @click="step = 2"
          >
            Continuar
          </button>
        </div>
      </section>

      <section v-if="step === 2" class="booking-panel">
        <div class="section-heading compact-heading">
          <span class="eyebrow">Passo 2 de 4</span>
          <h2>Escolha o profissional</h2>
          <p>
            Veja apenas profissionais autorizados para
            {{ selectedService?.name }}.
          </p>
        </div>
        <div class="professional-grid">
          <button
            v-for="pro in eligibleProfessionals"
            :key="pro.id"
            :class="[
              'professional-card',
              { selected: store.booking.professionalId === pro.id },
            ]"
            @click="store.booking.professionalId = pro.id"
          >
            <span class="avatar pro-avatar">{{ pro.initials }}</span
            ><span
              ><strong>{{ pro.name }}</strong
              ><small>{{ pro.role }}</small
              ><b>★ {{ pro.rating }}</b></span
            ><i>{{ store.booking.professionalId === pro.id ? "✓" : "" }}</i>
          </button>
          <button
            :class="[
              'professional-card',
              { selected: store.booking.professionalId === 0 },
            ]"
            @click="store.booking.professionalId = 0"
          >
            <span class="avatar pro-avatar">↻</span
            ><span
              ><strong>Qualquer profissional</strong
              ><small>Primeiro horário disponível</small
              ><b>Recomendado para rapidez</b></span
            ><i>{{ store.booking.professionalId === 0 ? "✓" : "" }}</i>
          </button>
        </div>
        <div class="booking-actions">
          <button class="btn btn-outline" @click="step = 1">Anterior</button
          ><button
            class="btn btn-primary"
            :disabled="store.booking.professionalId === null"
            @click="step = 3"
          >
            Ver horários
          </button>
        </div>
      </section>

      <section v-if="step === 3" class="booking-panel">
        <div class="section-heading compact-heading">
          <span class="eyebrow">Passo 3 de 4</span>
          <h2>Escolha data e horário</h2>
          <p>A disponibilidade considera serviço, profissional e agenda.</p>
        </div>
        <div class="date-scroller">
          <button
            v-for="day in days"
            :key="day.date"
            :class="[
              'date-card',
              { selected: store.booking.date === day.date },
            ]"
            @click="
              store.booking.date = day.date;
              store.booking.time = null;
            "
          >
            <small>{{ day.week }}</small
            ><strong>{{ day.day }}</strong
            ><span>{{ day.month }}</span>
          </button>
        </div>
        <div class="availability-note">
          <span class="live-dot"></span>
          <div>
            <strong>Horários disponíveis</strong
            ><small
              >{{ selectedProfessionalName }} ·
              {{ selectedService?.duration }} min</small
            >
          </div>
        </div>
        <div class="slot-grid">
          <button
            v-for="slot in slots"
            :key="slot"
            :class="{
              selected: store.booking.time === slot,
              disabled: blocked.includes(slot),
            }"
            :disabled="blocked.includes(slot)"
            @click="store.booking.time = slot"
          >
            {{ slot }}
          </button>
        </div>
        <div class="booking-actions">
          <button class="btn btn-outline" @click="step = 2">Anterior</button
          ><button
            class="btn btn-primary"
            :disabled="!store.booking.time"
            @click="step = 4"
          >
            Rever marcação
          </button>
        </div>
      </section>

      <section v-if="step === 4" class="booking-panel review-panel">
        <div class="section-heading compact-heading">
          <span class="eyebrow">Passo 4 de 4</span>
          <h2>Confirmar marcação</h2>
          <p>Revise os detalhes antes de confirmar.</p>
        </div>
        <div class="summary-card">
          <div class="summary-salon">
            <span class="salon-monogram small">{{ salon.accent }}</span>
            <div>
              <strong>{{ salon.name }}</strong
              ><small>{{ salon.area }}, {{ salon.city }}</small>
            </div>
          </div>
          <dl>
            <div>
              <dt>Serviço</dt>
              <dd>{{ selectedService?.name }}</dd>
            </div>
            <div>
              <dt>Profissional</dt>
              <dd>{{ selectedProfessionalName }}</dd>
            </div>
            <div>
              <dt>Data</dt>
              <dd>{{ store.booking.date }}</dd>
            </div>
            <div>
              <dt>Hora</dt>
              <dd>{{ store.booking.time }}</dd>
            </div>
            <div>
              <dt>Duração</dt>
              <dd>{{ selectedService?.duration }} min</dd>
            </div>
          </dl>
        </div>

        <div class="review-block">
          <div class="block-head">
            <h3>Cupão ou promoção</h3>
            <small>Opcional</small>
          </div>
          <div class="coupon-row">
            <input
              v-model="store.booking.coupon"
              placeholder="Ex.: BELEZA10"
            /><button class="btn btn-outline" @click="applyCoupon">
              Aplicar
            </button>
          </div>
          <small v-if="couponApplied" class="success-text"
            >✓ Cupão demonstrativo aplicado: -10%</small
          >
        </div>
        <div class="review-block">
          <div class="block-head">
            <h3>Pagamento</h3>
            <small>Escolha uma opção</small>
          </div>
          <label
            class="payment-option"
            :class="{ selected: store.booking.paymentMethod === 'onsite' }"
            ><input
              type="radio"
              value="onsite"
              v-model="store.booking.paymentMethod"
            /><span
              ><strong>Pagar no salão</strong
              ><small>Liquidação no momento do atendimento</small></span
            ><b>Sem custo agora</b></label
          ><label
            class="payment-option"
            :class="{ selected: store.booking.paymentMethod === 'online' }"
            ><input
              type="radio"
              value="online"
              v-model="store.booking.paymentMethod"
            /><span
              ><strong>Pagamento online</strong
              ><small>Gateway externo — simulação</small></span
            ><b>{{ money(total) }}</b></label
          >
          <div
            v-if="store.booking.paymentMethod === 'online'"
            class="gateway-box"
          >
            <div class="gateway-head">
              <span>▣</span>
              <div>
                <strong>Gateway de pagamento</strong
                ><small>Ambiente demonstrativo</small>
              </div>
            </div>
            <div class="gateway-methods">
              <button
                :class="{ selected: gateway === 'mpesa' }"
                @click="gateway = 'mpesa'"
              >
                M-Pesa</button
              ><button
                :class="{ selected: gateway === 'card' }"
                @click="gateway = 'card'"
              >
                Cartão</button
              ><button
                :class="{ selected: gateway === 'reference' }"
                @click="gateway = 'reference'"
              >
                Referência
              </button>
            </div>
          </div>
        </div>

        <div class="total-row">
          <span>Total</span><strong>{{ money(total) }}</strong>
        </div>
        <div v-if="store.role === 'guest'" class="auth-required">
          <span>!</span>
          <div>
            <strong>Autenticação necessária</strong
            ><small
              >Para confirmar a marcação, crie uma conta ou inicie
              sessão.</small
            >
          </div>
        </div>
        <div class="booking-actions">
          <button class="btn btn-outline" @click="step = 3">Anterior</button
          ><button class="btn btn-primary" @click="confirm">
            {{
              store.role === "guest"
                ? "Entrar para confirmar"
                : store.booking.paymentMethod === "online"
                  ? "Pagar e confirmar"
                  : "Confirmar marcação"
            }}
          </button>
        </div>
      </section>

      <section v-if="step === 5" class="booking-panel success-panel">
        <div class="success-mark">✓</div>
        <span class="eyebrow">Marcação confirmada</span>
        <h1>Está tudo marcado.</h1>
        <p>
          Guardámos a marcação na sua área pessoal. O mockup também simula uma
          notificação de confirmação.
        </p>
        <div class="confirmation-code">
          <small>Código da marcação</small
          ><strong>{{ createdBooking?.id }}</strong>
        </div>
        <div class="summary-card compact-summary">
          <dl>
            <div>
              <dt>Serviço</dt>
              <dd>{{ selectedService?.name }}</dd>
            </div>
            <div>
              <dt>Data e hora</dt>
              <dd>{{ store.booking.date }} · {{ store.booking.time }}</dd>
            </div>
            <div>
              <dt>Pagamento</dt>
              <dd>
                {{
                  store.booking.paymentMethod === "online"
                    ? "Pago online"
                    : "No salão"
                }}
              </dd>
            </div>
          </dl>
        </div>
        <div class="success-actions">
          <button class="btn btn-primary" @click="go('client-dashboard')">
            Ver minhas marcações</button
          ><button class="btn btn-outline" @click="go('home')">
            Voltar ao início
          </button>
        </div>
      </section>
    </div>
  </main>
</template>

<script>
import {
  appStore as store,
  go,
  helpers,
  addBooking,
  showToast,
} from "../store.js";
import { timeSlots } from "../data/mockData.js";

export default {
  name: "BookingView",
  data: () => ({
    store,
    step: 1,
    days: [
      { week: "TER", day: "15", month: "Set", date: "15 Set 2026" },
      { week: "QUA", day: "16", month: "Set", date: "16 Set 2026" },
      { week: "QUI", day: "17", month: "Set", date: "17 Set 2026" },
      { week: "SEX", day: "18", month: "Set", date: "18 Set 2026" },
      { week: "SÁB", day: "19", month: "Set", date: "19 Set 2026" },
    ],
    slots: timeSlots,
    blocked: ["08:45", "11:00", "15:15"],
    gateway: "mpesa",
    couponApplied: false,
    createdBooking: null,
  }),
  computed: {
    salon() {
      return helpers.salonById(store.booking.salonId);
    },
    salonServices() {
      return (
        this.salon?.serviceIds.map(helpers.serviceById).filter(Boolean) || []
      );
    },
    selectedService() {
      return helpers.serviceById(store.booking.serviceId);
    },
    eligibleProfessionals() {
      return helpers.professionals.filter(
        (p) =>
          p.services.includes(store.booking.serviceId) &&
          this.salon.professionalIds.includes(p.id),
      );
    },
    selectedProfessionalName() {
      return store.booking.professionalId === 0
        ? "Qualquer profissional"
        : helpers.professionalById(store.booking.professionalId)?.name ||
            "Por seleccionar";
    },
    total() {
      const base = this.selectedService?.price || 0;
      return this.couponApplied ? Math.round(base * 0.9) : base;
    },
    steps() {
      return [
        { n: 1, label: "Serviço" },
        { n: 2, label: "Profissional" },
        { n: 3, label: "Horário" },
        { n: 4, label: "Confirmar" },
      ];
    },
  },
  mounted() {
    if (store.booking.serviceId) this.step = 2;
  },
  methods: {
    go,
    money(v) {
      return `${new Intl.NumberFormat("pt-MZ").format(v)} MT`;
    },
    selectService(id) {
      store.booking.serviceId = id;
      store.booking.professionalId = null;
      store.booking.time = null;
    },
    back() {
      if (this.step > 1 && this.step < 5) this.step--;
      else go("salon");
    },
    applyCoupon() {
      this.couponApplied =
        store.booking.coupon.trim().toUpperCase() === "BELEZA10";
      showToast(
        this.couponApplied
          ? "Cupão aplicado."
          : "Cupão não reconhecido no mockup.",
      );
    },
    confirm() {
      if (store.role === "guest") {
        store.authMode = "login";
        store.previousView = "booking";
        go("auth");
        return;
      }
      if (store.booking.paymentMethod === "online") {
        showToast("Pagamento aprovado no gateway simulado.");
      }
      this.createdBooking = addBooking();
      store.notifications.unshift({
        id: Date.now(),
        title: "Marcação confirmada",
        body: `${this.selectedService?.name} em ${this.salon.name}, ${store.booking.date} às ${store.booking.time}.`,
        time: "Agora",
        read: false,
      });
      this.step = 5;
    },
  },
};
</script>
