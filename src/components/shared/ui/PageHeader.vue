<script setup lang="ts">
import BrandBanner from "@/components/shared/ui/BrandBanner.vue";
</script>
<template>
  <!-- O cabeçalho de todas as secções da barra lateral vive na faixa da
       marca. Dentro dela, o texto e os botões trocam de cor por CSS, nas
       regras `.directory-banner` do app.css. -->
  <BrandBanner compact>
    <div
      class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
    >
      <div class="min-w-0">
        <slot />
      </div>

      <div
        v-if="$slots.actions"
        class="flex w-full flex-wrap items-center gap-2.5 sm:w-auto"
      >
        <slot name="actions" />
      </div>
    </div>
  </BrandBanner>
</template>
