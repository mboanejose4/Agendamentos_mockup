<script setup lang="ts">
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import MobileCarousel from "@/components/shared/ui/MobileCarousel.vue";

/* O painel de apresentação da plataforma: explica o agendamento em três passos
   a quem chega pela primeira vez. Só é mostrado a visitantes, na exploração. */
const emit = defineEmits<{
  (event: "register"): void;
}>();

const steps: { icon: string; title: string; body: string }[] = [
  {
    icon: "search",
    title: "Encontre o lugar",
    body: "Pesquise por serviço, categoria ou localização e compare preços e avaliações.",
  },
  {
    icon: "calendar-clock",
    title: "Escolha o horário",
    body: "Vê apenas os horários mesmo livres, já com a duração do serviço e o profissional.",
  },
  {
    icon: "check-check",
    title: "Confirme",
    body: "Pague no local ou online. Recebe a confirmação na hora e um lembrete na véspera.",
  },
];

/* Leva à lista de estabelecimentos sem obrigar a percorrer a página à mão. */
function scrollToResults(): void {
  document
    .getElementById("estabelecimentos")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}
</script>
<template>
  <section
    class="mb-6 overflow-hidden rounded-panel border border-line bg-soft sm:mb-[30px]"
    aria-labelledby="hero-titulo"
  >
    <div class="px-[26px] pt-[30px] pb-[26px] sm:px-9 sm:pt-11 sm:pb-9">
      <span class="eyebrow">MARCAÇÕES ONLINE EM MOÇAMBIQUE</span>
      <h1 id="hero-titulo" class="max-w-[620px]">
        Marque em três passos, a qualquer hora.
      </h1>
      <p class="mt-3 max-w-[560px] text-body text-muted max-sm:text-caption">
        Sem telefonemas, sem esperar que abram. Escolha o estabelecimento, veja
        os horários realmente livres e confirme — tudo em menos de um minuto.
      </p>
      <div class="mt-6 flex flex-wrap gap-3">
        <button class="btn btn-primary" @click="scrollToResults">
          <AppIcon name="search" :size="18" /> Ver estabelecimentos</button
        ><button class="btn btn-secondary" @click="emit('register')">
          <AppIcon name="building-2" :size="18" /> Tenho um negócio
        </button>
      </div>
    </div>
    <div class="border-t border-line bg-surface px-[26px] py-[22px] sm:px-0">
      <MobileCarousel
        tag="ol"
        label="Como funciona o agendamento"
        grid-class="sm:grid-cols-3 sm:gap-px sm:bg-line"
        bleed-class="-mx-[26px] px-[26px]"
      >
        <li
          v-for="(step, index) in steps"
          :key="step.title"
          class="flex gap-[14px] rounded-card border border-line p-[18px] sm:rounded-none sm:border-0 sm:bg-surface sm:px-7 sm:py-[22px]"
        >
          <span
            class="inline-grid size-[38px] shrink-0 place-items-center rounded-xl bg-soft text-primary-text"
            ><AppIcon :name="step.icon" :size="19"
          /></span>
          <div>
            <h2 class="mb-1 text-body font-medium">
              <span class="text-muted tabular-nums">{{ index + 1 }}.</span>
              {{ step.title }}
            </h2>
            <p class="text-caption text-muted">{{ step.body }}</p>
          </div>
        </li>
      </MobileCarousel>
    </div>
  </section>
</template>
