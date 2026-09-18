<script setup lang="ts">
import { computed } from "vue";
import { state } from "@/stores/applicationStore.ts";

/* A faixa verde da marca. O aspecto vive nas classes `.directory-banner*` do
   app.css; aqui fica a forma e a largura. */
const props = withDefaults(
  defineProps<{
    /** id do título que a faixa anuncia. */
    labelledby?: string;
    /** Cabeçalho de secção, com menos altura do que a faixa de entrada. */
    compact?: boolean;
    /** Forçar (ou proibir) a sangria de ponta a ponta. */
    bleed?: boolean | null;
  }>(),
  { labelledby: "", compact: false, bleed: null },
);

/* Sem barra lateral — o visitante — a faixa ocupa a página inteira. Com barra
   lateral fica dentro da coluna, com as mesmas margens laterais dos cartões e
   das tabelas, para não destoar do resto do conteúdo. */
const full = computed(() => props.bleed ?? state.role === "guest");
</script>
<template>
  <section
    :class="[
      'directory-banner relative mb-6 overflow-hidden sm:mb-[30px]',
      full ? 'left-1/2 w-[100dvw] -translate-x-1/2' : 'rounded-4xl',
    ]"
    :aria-labelledby="labelledby || undefined"
  >
    <!-- Elementos decorativos -->
    <div
      class="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <div
        class="absolute -top-36 -right-20 size-[380px] rounded-full bg-white/10 blur-3xl"
      ></div>

      <div
        class="absolute -bottom-40 -left-24 size-[340px] rounded-full bg-black/20 blur-3xl"
      ></div>

      <div
        class="absolute inset-0 bg-gradient-to-r from-black/15 via-transparent to-white/5"
      ></div>
    </div>

    <div
      :class="[
        'relative z-10 w-full',
        full
          ? 'mx-auto max-w-[1080px] px-5 sm:px-9 lg:px-10'
          : 'px-[22px] sm:px-8 lg:px-10',
        compact ? 'py-7 sm:py-9' : 'py-12 sm:py-16 lg:py-[72px]',
      ]"
    >
      <slot />
    </div>
  </section>
</template>
