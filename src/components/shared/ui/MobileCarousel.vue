<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";

/* Grelha no ecrã grande, carrossel no telemóvel. O deslizar é o do próprio
   browser — scroll horizontal com pontos de paragem —, por isso continua a
   funcionar com o dedo, com a roda do rato e com o teclado. O JavaScript aqui
   serve para o indicador seguir o cartão e para a rotação automática. */
const props = withDefaults(
  defineProps<{
    /** Descrição do conjunto, para quem usa leitor de ecrã. */
    label: string;
    /** Grelha aplicada a partir de sm. */
    gridClass?: string;
    /** Elemento do carril, quando a ordem dos cartões importa. */
    tag?: string;
    /** Sangria lateral: tem de anular a margem interna de quem o contém,
        para o cartão nascer alinhado com o texto acima. */
    bleedClass?: string;
    /** Segundos entre avanços automáticos; zero desliga a rotação. */
    interval?: number;
  }>(),
  {
    gridClass: "sm:grid-cols-2 xl:grid-cols-4",
    tag: "div",
    bleedClass: "-mx-4 px-4",
    interval: 6,
  },
);

const track = ref<HTMLElement | null>(null);
/* Zero enquanto tudo couber de uma vez: aí não há carrossel nem pontos. */
const slides = ref(0);
const active = ref(0);

function update(): void {
  const element = track.value;
  if (!element || !slides.value) return;
  const box = element.getBoundingClientRect();
  const middle = box.left + box.width / 2;
  let nearest = 0;
  let shortest = Infinity;
  Array.from(element.children).forEach((child, index) => {
    const rect = child.getBoundingClientRect();
    const distance = Math.abs(rect.left + rect.width / 2 - middle);
    if (distance < shortest) {
      shortest = distance;
      nearest = index;
    }
  });
  active.value = nearest;
}

function goTo(index: number): void {
  const element = track.value;
  const item = element?.children[index];
  if (!element || !item) return;
  element.scrollBy({
    left:
      item.getBoundingClientRect().left - element.getBoundingClientRect().left,
    behavior: "smooth",
  });
}

/* --- Rotação automática ---------------------------------------------------
   Pára assim que a pessoa toca no carrossel: a partir daí é ela que manda.
   Também não arranca de todo para quem pediu menos animação no sistema. */
let timer: number | undefined;
let abandoned = false;

function halt(): void {
  window.clearInterval(timer);
  timer = undefined;
}

function resume(): void {
  if (abandoned || timer !== undefined || !slides.value || props.interval <= 0)
    return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  timer = window.setInterval(() => {
    if (document.hidden) return;
    goTo((active.value + 1) % slides.value);
  }, props.interval * 1000);
}

function takeOver(): void {
  abandoned = true;
  halt();
}

function measure(): void {
  const element = track.value;
  if (!element) return;
  slides.value =
    element.scrollWidth > element.clientWidth + 4 ? element.children.length : 0;
  update();
  if (slides.value) resume();
  else halt();
}

function pick(index: number): void {
  takeOver();
  goTo(index);
}

let observer: ResizeObserver | null = null;
onMounted(() => {
  const element = track.value;
  if (!element) return;
  /* Ouvinte passivo: o indicador segue o scroll sem travar o deslizar. */
  element.addEventListener("scroll", update, { passive: true });
  /* Sinais de que a pessoa assumiu o comando — o scroll não serve, porque a
     rotação automática também o provoca. */
  element.addEventListener("pointerdown", takeOver);
  element.addEventListener("wheel", takeOver, { passive: true });
  element.addEventListener("keydown", takeOver);
  element.addEventListener("mouseenter", halt);
  element.addEventListener("mouseleave", resume);
  element.addEventListener("focusin", halt);
  element.addEventListener("focusout", resume);
  measure();
  observer = new ResizeObserver(measure);
  observer.observe(element);
});

onBeforeUnmount(() => {
  halt();
  const element = track.value;
  element?.removeEventListener("scroll", update);
  element?.removeEventListener("pointerdown", takeOver);
  element?.removeEventListener("wheel", takeOver);
  element?.removeEventListener("keydown", takeOver);
  element?.removeEventListener("mouseenter", halt);
  element?.removeEventListener("mouseleave", resume);
  element?.removeEventListener("focusin", halt);
  element?.removeEventListener("focusout", resume);
  observer?.disconnect();
});
</script>
<template>
  <div>
    <component
      :is="tag"
      ref="track"
      role="group"
      :aria-label="label"
      :tabindex="slides ? 0 : undefined"
      :class="[
        'flex snap-x snap-mandatory gap-4 overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        '[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        bleedClass,
        /* Um cartão de cada vez, a ocupar a largura útil inteira: fica
           centrado entre as margens, do primeiro ao último. */
        '[&>*]:w-full [&>*]:shrink-0 [&>*]:snap-center',
        'sm:mx-0 sm:grid sm:gap-4 sm:overflow-visible sm:px-0',
        'sm:[&>*]:w-auto sm:[&>*]:shrink',
        gridClass,
      ]"
    >
      <slot />
    </component>
    <div v-if="slides" class="mt-[18px] flex justify-center gap-1 sm:hidden">
      <button
        v-for="index in slides"
        :key="index"
        type="button"
        class="grid size-6 place-items-center"
        :aria-label="`Ir para o cartão ${index} de ${slides}`"
        :aria-current="active === index - 1 ? 'true' : undefined"
        @click="pick(index - 1)"
      >
        <span
          :class="[
            'block h-[6px] rounded-full transition-all',
            active === index - 1 ? 'w-[18px] bg-primary' : 'w-[6px] bg-line',
          ]"
        ></span>
      </button>
    </div>
  </div>
</template>
