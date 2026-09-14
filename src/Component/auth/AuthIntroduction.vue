<script setup>
import AppIcon from "@/Component/ui/AppIcon.vue";
</script>
<template>
  <section class="flex flex-col">
    <span
      class="mb-[27px] inline-grid size-[46px] shrink-0 place-items-center rounded-xl bg-soft text-primary-text max-sm:size-10 max-sm:rounded-[10px] max-[480px]:size-[38px]"
      ><AppIcon name="calendar-check" :size="30" /></span
    ><span class="eyebrow">BEM-VINDA À MARCAFÁCIL</span>
    <h1 class="text-h1 leading-[1.2] font-medium lg:text-display">
      O seu tempo.<br />Os seus planos.<br />Tudo ligado.
    </h1>
    <p class="text-small text-muted">Há sempre um bom momento para cuidar de si.</p>
    <img
      src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=85"
      alt="Espaço acolhedor de um restaurante"
      class="mt-[25px] h-[185px] w-full rounded-[7px] object-cover"
    />
  </section>
</template>
