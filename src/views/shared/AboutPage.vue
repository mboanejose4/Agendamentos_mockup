<script setup lang="ts">
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import { go, state } from "@/stores/applicationStore.ts";

const principles = [
  {
    icon: "sparkles",
    title: "Simplicidade primeiro",
    body: "Menos passos, informação clara e uma experiência que qualquer pessoa consegue usar sem precisar de explicações.",
  },
  {
    icon: "map-pin",
    title: "Pensado para Moçambique",
    body: "Negócios locais, hábitos locais e formas de pagamento que fazem parte do dia-a-dia de quem está aqui.",
  },
  {
    icon: "users",
    title: "Bom para os dois lados",
    body: "Mais autonomia para quem marca e mais organização para as equipas que recebem cada cliente.",
  },
];

const journey = [
  {
    number: "01",
    title: "Uma dificuldade comum",
    body: "Marcar um serviço ainda depende, muitas vezes, de chamadas, mensagens sem resposta e agendas que não mostram a disponibilidade real.",
  },
  {
    number: "02",
    title: "Uma ideia simples",
    body: "Reunir descoberta, disponibilidade, marcação, pagamento e acompanhamento num só lugar — acessível a qualquer hora.",
  },
  {
    number: "03",
    title: "Uma plataforma para crescer",
    body: "Criar uma ligação útil entre pessoas e negócios, ajudando cada estabelecimento a trabalhar melhor e a chegar mais longe.",
  },
];

function registerBusiness(): void {
  if (state.role === "guest") {
    state.returnView = "onboard";
    go("auth");
  } else go("onboard");
}
</script>

<template>
  <article class="about-page">
    <section class="about-hero" aria-labelledby="about-title">
      <div class="about-hero__content">
        <span class="about-hero__eyebrow">SOBRE O MARCAFÁCIL</span>
        <h1 id="about-title" class="about-hero__title">
          Mais tempo para o que realmente importa.
        </h1>
        <p class="about-hero__lead">
          O MarcaFácil nasceu de uma ideia simples: aproximar pessoas e
          serviços, tornando cada marcação mais rápida, clara e conveniente.
        </p>
        <div class="mt-7 flex flex-wrap gap-3">
          <button
            class="btn rounded-4xl about-hero__primary"
            @click="go('explore')"
          >
            Explorar estabelecimentos <AppIcon name="arrow-right" :size="18" />
          </button>
          <button
            class="btn rounded-4xl about-hero__secondary"
            @click="registerBusiness"
          >
            Tenho um negócio
          </button>
        </div>
      </div>
      <div class="about-hero__visual" aria-hidden="true">
        <span class="about-hero__orbit orbit-one"></span
        ><span class="about-hero__orbit orbit-two"></span>
        <div class="about-hero__mark">
          <AppIcon name="calendar-check" :size="42" />
        </div>
        <div class="about-hero__note note-top">
          <AppIcon name="clock" :size="18" /><span
            ><strong>Disponível</strong><small>Quando precisar</small></span
          >
        </div>
        <div class="about-hero__note note-bottom">
          <AppIcon name="circle-check" :size="18" /><span
            ><strong>Marcação feita</strong
            ><small>Sem complicações</small></span
          >
        </div>
      </div>
    </section>

    <section class="about-intro" aria-labelledby="origem-title">
      <div>
        <span class="eyebrow">A NOSSA ORIGEM</span>
        <h2 id="origem-title" class="text-h2">
          Uma experiência quotidiana transformada numa solução.
        </h2>
      </div>
      <div class="about-copy">
        <p>
          Encontrar um bom serviço pode ser fácil. Conseguir falar com alguém,
          confirmar um horário e acompanhar a marcação é que nem sempre é. Foi
          desse contraste que nasceu o MarcaFácil.
        </p>
        <p>
          Concebemos uma plataforma onde o cliente vê opções reais e decide no
          seu tempo, enquanto o negócio mantém a agenda, a equipa e os recursos
          organizados. Tudo num fluxo simples, do primeiro toque à confirmação.
        </p>
      </div>
    </section>

    <section aria-labelledby="caminho-title">
      <span class="eyebrow">DA IDEIA À PLATAFORMA</span>
      <h2 id="caminho-title" class="text-h2">
        O caminho que nos trouxe até aqui.
      </h2>
      <div class="mt-7 grid gap-4 md:grid-cols-3">
        <article
          v-for="step in journey"
          :key="step.number"
          class="card rounded-4xl p-6"
        >
          <span class="step-number">{{ step.number }}</span>
          <h3 class="mt-8 text-h3">{{ step.title }}</h3>
          <p class="mt-3 text-caption text-muted">{{ step.body }}</p>
        </article>
      </div>
    </section>

    <section class="about-purpose" aria-labelledby="proposito-title">
      <div>
        <span class="about-hero__eyebrow">O NOSSO PROPÓSITO</span>
        <h2 id="proposito-title">
          Fazer da marcação a parte mais simples do seu dia.
        </h2>
      </div>
      <p>
        Queremos que as pessoas encontrem e reservem bons serviços com confiança
        — e que os negócios tenham ferramentas simples para oferecer um
        atendimento cada vez melhor.
      </p>
    </section>

    <section aria-labelledby="principios-title">
      <span class="eyebrow">O QUE NOS ORIENTA</span>
      <h2 id="principios-title" class="text-h2">
        Princípios que cabem em cada marcação.
      </h2>
      <div class="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="item in principles"
          :key="item.title"
          class="card rounded-4xl p-6"
        >
          <span class="principle-icon"
            ><AppIcon :name="item.icon" :size="23"
          /></span>
          <h3 class="mt-5 text-h3">{{ item.title }}</h3>
          <p class="mt-2.5 text-caption text-muted">{{ item.body }}</p>
        </article>
      </div>
    </section>

    <section class="about-cta" aria-labelledby="cta-title">
      <div>
        <span class="eyebrow">VAMOS COMEÇAR?</span>
        <h2 id="cta-title" class="text-h2">
          O próximo momento pode começar aqui.
        </h2>
        <p class="mt-2 max-w-[590px] text-caption text-muted">
          Encontre o serviço certo para si ou leve uma forma mais simples de
          trabalhar ao seu negócio.
        </p>
      </div>
      <div class="flex flex-wrap gap-3">
        <button class="btn btn-primary rounded-4xl" @click="go('explore')">
          Encontrar um serviço <AppIcon name="arrow-right" :size="18" /></button
        ><button
          class="btn btn-secondary rounded-4xl"
          @click="registerBusiness"
        >
          Registar o meu negócio
        </button>
      </div>
    </section>
  </article>
</template>

<style scoped>
.about-page {
  display: flex;
  flex-direction: column;
  gap: clamp(52px, 7vw, 88px);
  padding-bottom: 28px;
}
.about-hero {
  position: relative;
  display: grid;
  min-height: 500px;
  grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
  align-items: center;
  gap: 48px;
  overflow: hidden;
  border-radius: 32px;
  background:
    radial-gradient(
      circle at 88% 16%,
      rgba(74, 190, 116, 0.26),
      transparent 28%
    ),
    linear-gradient(135deg, var(--brand-950), var(--brand-700));
  padding: clamp(36px, 6vw, 76px);
  color: #fff;
}
.about-hero__content {
  position: relative;
  z-index: 2;
  max-width: 690px;
}
.about-hero__eyebrow {
  display: block;
  margin-bottom: 16px;
  color: rgba(255, 255, 255, 0.72);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
}
.about-hero__title {
  max-width: 650px;
  color: #fff;
  font-size: clamp(42px, 6vw, 72px);
  font-weight: 700;
  letter-spacing: -0.045em;
  line-height: 1.02;
}
.about-hero__lead {
  max-width: 620px;
  margin-top: 22px;
  color: rgba(255, 255, 255, 0.78);
  font-size: clamp(16px, 2vw, 19px);
  line-height: 1.65;
}
.about-hero__primary {
  border-color: var(--brand-500);
  background: var(--brand-600);
  color: #fff;
}
.about-hero__primary:hover {
  background: var(--brand-500);
}
.about-hero__secondary {
  border-color: rgba(255, 255, 255, 0.34);
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}
.about-hero__secondary:hover {
  background: rgba(255, 255, 255, 0.16);
}
.about-hero__visual {
  position: relative;
  min-height: 330px;
}
.about-hero__mark {
  position: absolute;
  inset: 50% auto auto 50%;
  display: grid;
  width: 132px;
  height: 132px;
  transform: translate(-50%, -50%);
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 38px;
  background: rgba(255, 255, 255, 0.14);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(12px);
}
.about-hero__orbit {
  position: absolute;
  inset: 50% auto auto 50%;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 50%;
  transform: translate(-50%, -50%);
}
.orbit-one {
  width: 250px;
  height: 250px;
}
.orbit-two {
  width: 370px;
  height: 370px;
}
.about-hero__note {
  position: absolute;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 174px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.13);
  padding: 13px 15px;
  box-shadow: 0 14px 38px rgba(0, 0, 0, 0.16);
  backdrop-filter: blur(14px);
}
.about-hero__note strong,
.about-hero__note small {
  display: block;
}
.about-hero__note strong {
  color: #fff;
  font-size: 13px;
}
.about-hero__note small {
  margin-top: 2px;
  color: rgba(255, 255, 255, 0.65);
  font-size: 11px;
}
.note-top {
  top: 15%;
  right: 0;
}
.note-bottom {
  bottom: 12%;
  left: 0;
}
.about-intro {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  gap: clamp(32px, 7vw, 96px);
  align-items: start;
}
.about-copy {
  display: grid;
  gap: 20px;
  color: var(--muted);
  font-size: 16px;
  line-height: 1.75;
}
.step-number {
  display: inline-grid;
  min-width: 45px;
  height: 34px;
  place-items: center;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
}
.about-purpose {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(280px, 0.85fr);
  align-items: end;
  gap: 42px;
  border-radius: 32px;
  background: var(--brand-800);
  padding: clamp(30px, 5vw, 58px);
  color: #fff;
}
.about-purpose h2 {
  max-width: 700px;
  color: #fff;
  font-size: clamp(32px, 5vw, 54px);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1.08;
}
.about-purpose p {
  color: rgba(255, 255, 255, 0.74);
  font-size: 16px;
  line-height: 1.7;
}
.principle-icon {
  display: inline-grid;
  width: 46px;
  height: 46px;
  place-items: center;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}
.about-page .card {
  border-color: rgba(255, 255, 255, 0.12);
  background: linear-gradient(145deg, var(--brand-800), var(--brand-900));
  color: #fff;
}
.about-page .card .text-h3,
.about-page .card .text-muted {
  color: #fff;
}
.about-page .card .text-muted {
  opacity: 0.72;
}
.about-cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 32px;
  background: linear-gradient(135deg, var(--brand-900), var(--brand-700));
  padding: clamp(28px, 5vw, 48px);
  color: #fff;
}
.about-cta .eyebrow,
.about-cta .text-h2,
.about-cta .text-muted {
  color: #fff;
}
.about-cta .eyebrow,
.about-cta .text-muted {
  opacity: 0.72;
}
.about-cta .btn-secondary {
  border-color: rgba(255, 255, 255, 0.42);
  background: transparent;
  color: #fff;
}
.about-cta .btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}
@media (max-width: 900px) {
  .about-hero {
    grid-template-columns: 1fr;
  }
  .about-hero__visual {
    display: none;
  }
  .about-intro,
  .about-purpose {
    grid-template-columns: 1fr;
  }
  .about-purpose {
    align-items: start;
  }
}
@media (max-width: 639px) {
  .about-page {
    gap: 48px;
  }
  .about-hero {
    min-height: auto;
    border-radius: 24px;
    padding: 34px 24px 38px;
  }
  .about-hero__title {
    font-size: 40px;
  }
  .about-cta {
    align-items: flex-start;
    flex-direction: column;
    border-radius: 24px;
  }
}
</style>
