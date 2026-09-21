<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import MobileCarousel from "@/components/shared/ui/MobileCarousel.vue";
import heroSalao from "@/assets/img/hero-salao-maputo.png";
import heroSalaoMobile from "@/assets/img/hero-salao-maputo-mobile.png";
import heroClinica from "@/assets/img/hero-clinica-maputo.png";
import heroClinicaMobile from "@/assets/img/hero-clinica-maputo-mobile.png";
import heroHotel from "@/assets/img/hero-hotel-maputo.png";
import heroHotelMobile from "@/assets/img/hero-hotel-maputo-mobile.png";
import heroRestaurante from "@/assets/img/hero-restaurante-maputo.png";
import heroRestauranteMobile from "@/assets/img/hero-restaurante-maputo-mobile.png";
import heroGinasio from "@/assets/img/hero-ginasio-maputo.png";
import heroGinasioMobile from "@/assets/img/hero-ginasio-maputo-mobile.png";

/* O painel de apresentação da plataforma: explica o agendamento em três passos
   a quem chega pela primeira vez. Só é mostrado a visitantes, na exploração. */
const emit = defineEmits<{
  (event: "register"): void;
}>();

const hero = ref<HTMLElement | null>(null);
const backgroundScale = ref(1.12);
const activeImage = ref(0);
const heroImages = [
  {
    src: heroHotel,
    mobileSrc: heroHotelMobile,
    alt: "Receção de um hotel em Maputo",
  },
  {
    src: heroRestaurante,
    mobileSrc: heroRestauranteMobile,
    alt: "Clientes recebidos num restaurante em Maputo",
  },
  {
    src: heroClinica,
    mobileSrc: heroClinicaMobile,
    alt: "Atendimento numa clínica em Maputo",
  },
  {
    src: heroGinasio,
    mobileSrc: heroGinasioMobile,
    alt: "Treino acompanhado num ginásio em Maputo",
  },
  {
    src: heroSalao,
    mobileSrc: heroSalaoMobile,
    alt: "Atendimento num salão de beleza em Maputo",
  },
];

let carouselTimer: number | undefined;
let scrollFrame: number | undefined;

function startCarousel(): void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  carouselTimer = window.setInterval(() => {
    if (!document.hidden)
      activeImage.value = (activeImage.value + 1) % heroImages.length;
  }, 6500);
}

/* No telemóvel, a escala acompanha a saída da Hero do ecrã. Como deriva
   sempre da posição atual, o movimento inverte naturalmente ao voltar. */
function updateMobileZoom(): void {
  scrollFrame = undefined;
  if (!hero.value || window.innerWidth >= 640) {
    backgroundScale.value = 1;
    return;
  }
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    backgroundScale.value = 1;
    return;
  }
  const rect = hero.value.getBoundingClientRect();
  const progress = Math.min(
    1,
    Math.max(0, -rect.top / Math.max(window.innerHeight * 0.72, 1)),
  );
  /* Começa ampliada e termina exatamente em cover (1). Nunca fica abaixo de
     1, evitando margens vazias durante o zoom-out. */
  backgroundScale.value = 1.12 - progress * 0.12;
}

function requestZoomUpdate(): void {
  if (scrollFrame === undefined)
    scrollFrame = window.requestAnimationFrame(updateMobileZoom);
}

onMounted(() => {
  startCarousel();
  updateMobileZoom();
  window.addEventListener("scroll", requestZoomUpdate, { passive: true });
  window.addEventListener("resize", requestZoomUpdate, { passive: true });
});

onBeforeUnmount(() => {
  window.clearInterval(carouselTimer);
  if (scrollFrame !== undefined) window.cancelAnimationFrame(scrollFrame);
  window.removeEventListener("scroll", requestZoomUpdate);
  window.removeEventListener("resize", requestZoomUpdate);
});

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
    id="inicio"
    ref="hero"
    class="relative left-1/2 -mt-6 mb-6 flex min-h-[760px] w-[100dvw] -translate-x-1/2 flex-col overflow-hidden border-b border-white/15 bg-[#15221d] sm:-mt-[30px] sm:mb-[30px] sm:min-h-[680px] lg:min-h-[760px] xl:min-h-[820px]"
    aria-labelledby="hero-titulo"
  >
    <div
      class="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <picture
        v-for="(image, index) in heroImages"
        :key="image.src"
        :class="[
          'absolute inset-0 size-full transition-opacity duration-1000 motion-reduce:transition-none',
          activeImage === index ? 'opacity-100' : 'opacity-0',
        ]"
      >
        <source media="(max-width: 639px)" :srcset="image.mobileSrc" />
        <img
          :src="image.src"
          alt=""
          class="size-full object-cover object-center will-change-transform sm:object-[center_45%]"
          :style="{ transform: `scale(${backgroundScale})` }"
        />
      </picture>
      <div
        class="absolute inset-0 bg-gradient-to-r from-[#07130f]/95 via-[#07130f]/75 to-[#07130f]/20 sm:via-[#07130f]/62 sm:to-transparent"
      ></div>
      <div
        class="absolute inset-0 bg-gradient-to-t from-[#07130f]/85 via-[#07130f]/10 to-[#07130f]/15"
      ></div>
    </div>

    <div
      class="relative mx-auto flex w-full max-w-[1080px] flex-1 flex-col justify-center px-[26px] pt-[30px] pb-[26px] sm:min-h-[450px] sm:px-9 sm:pt-14 sm:pb-12 lg:min-h-[530px] lg:pt-16 lg:pb-14 xl:min-h-[580px]"
    >
      <span class="eyebrow !text-white/75">MARCAÇÕES ONLINE EM MOÇAMBIQUE</span>
      <h1 id="hero-titulo" class="max-w-[620px] text-white">
        Marque em três passos, a qualquer hora.
      </h1>
      <p class="mt-3 max-w-[560px] text-body text-white/80 max-sm:text-caption">
        Sem telefonemas, sem esperar que abram. Escolha o estabelecimento, veja
        os horários disponíveis e confirme a sua marcação.
      </p>
      <div class="mt-6 flex flex-wrap gap-3">
        <button class="btn rounded-4xl btn-primary" @click="scrollToResults">
          <AppIcon name="search" :size="18" /> Ver estabelecimentos</button
        ><button
          class="btn rounded-4xl border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
          @click="emit('register')"
        >
          <AppIcon name="building-2" :size="18" /> Tenho um negócio
        </button>
      </div>
      <div class="mt-7 flex gap-2" aria-label="Imagens da apresentação">
        <button
          v-for="(_, index) in heroImages"
          :key="index"
          type="button"
          class="grid h-8 place-items-center"
          :aria-label="`Mostrar imagem ${index + 1} de ${heroImages.length}`"
          :aria-current="activeImage === index ? 'true' : undefined"
          @click="activeImage = index"
        >
          <span
            :class="[
              'block h-1 rounded-full transition-all',
              activeImage === index ? 'w-8 bg-white' : 'w-3 bg-white/45',
            ]"
          ></span>
        </button>
      </div>
    </div>
    <div id="como-funciona" class="relative scroll-mt-28">
      <div
        class="mx-auto w-full max-w-[1080px] px-[26px] py-[22px] sm:px-9 sm:py-6"
      >
        <h2 class="mb-2 text-body font-semibold text-white">Como funciona</h2>
        <p class="mb-4 max-w-[680px] text-caption text-white/80">
          Encontre um estabelecimento, escolha um serviço e um horário
          disponível. Antes de confirmar, veja o preço e as formas de pagamento
          aceites.
        </p>
        <MobileCarousel
          tag="ol"
          label="Como funciona o agendamento"
          grid-class="sm:grid-cols-3 sm:gap-3"
          bleed-class="-mx-[26px] px-[26px]"
        >
          <li
            v-for="(step, index) in steps"
            :key="step.title"
            class="hero-step-card flex gap-3 rounded-4xl border p-4 shadow-sm sm:px-5 sm:py-[18px]"
          >
            <span
              class="hero-step-card__icon inline-grid size-[38px] shrink-0 place-items-center rounded-full"
            >
              <AppIcon :name="step.icon" :size="19" />
            </span>

            <div>
              <h3 class="hero-step-card__title mb-1 text-body font-medium">
                <span class="hero-step-card__number tabular-nums">
                  {{ index + 1 }}.
                </span>

                {{ step.title }}
              </h3>

              <p class="hero-step-card__description text-caption">
                {{ step.body }}
              </p>
            </div>
          </li>
        </MobileCarousel>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-step-card {
  background-color: var(--brand-700);
  border-color: rgb(255 255 255 / 20%);
  color: #ffffff;
}

.hero-step-card__icon {
  background-color: rgb(255 255 255 / 15%);
  color: #ffffff;
}

.hero-step-card__number,
.hero-step-card__title,
.hero-step-card__description {
  color: #ffffff;
}

/* Garante que o SVG do AppIcon também fique branco. */
.hero-step-card__icon :deep(svg) {
  color: #ffffff;
  stroke: currentColor;
}
</style>
