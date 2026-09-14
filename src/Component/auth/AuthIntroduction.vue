<script setup>
import AppIcon from "@/Component/ui/AppIcon.vue";
</script>

<template>
  <!-- Em ecrãs pequenos fica só a saudação: o título, a frase e a fotografia
       empurravam o formulário para fora do ecrã sem acrescentar nada a quem
       vem entrar na conta. -->
  <section class="flex flex-col">
    <span
      class="mb-4 inline-grid size-10 shrink-0 place-items-center rounded-[10px] bg-soft text-primary-text sm:mb-[27px] sm:size-[46px] sm:rounded-xl"
    >
      <AppIcon name="calendar-check" :size="30" />
    </span>

    <span class="eyebrow mb-0 sm:mb-3">BEM-VINDA À MARCAFÁCIL</span>

    <h1 class="mt-3 hidden text-h1 leading-[1.2] font-medium sm:block lg:text-display">
      O seu tempo.<br />Os seus planos.<br />Tudo ligado.
    </h1>

    <p class="hidden text-small text-muted sm:block">
      Há sempre um bom momento para cuidar de si.
    </p>

    <img
      src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=85"
      alt="Espaço acolhedor de um restaurante"
      class="mt-[25px] hidden h-[185px] w-full rounded-[7px] object-cover sm:block"
    />
  </section>
</template>
