<script setup>
import ThemeToggle from "@/Component/ui/ThemeToggle.vue";
</script>

<template>
  <div
    class="relative grid min-h-dvh items-center bg-background px-5 py-20 sm:px-8 sm:py-16 lg:px-10 lg:py-12"
  >
    <div class="absolute top-4 right-5 sm:top-6 sm:right-8">
      <ThemeToggle />
    </div>

    <a class="skip-link" href="#main-content">Saltar para o conteúdo</a>

    <main
      id="main-content"
      class="w-full min-w-0 focus:outline-none"
      tabindex="-1"
    >
      <slot />
    </main>
  </div>
</template>
