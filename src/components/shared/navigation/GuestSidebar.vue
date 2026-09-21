<script setup lang="ts">
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import { landingLinks } from "@/utils/navigation/landingLinks.ts";
import marcaFacilLogo from "@/assets/img/logo.png";

defineProps<{ open: boolean }>();
const emit = defineEmits<{
  close: [];
  home: [];
  "navigate-section": [section: string];
}>();
</script>

<template>
  <aside
    id="guest-navigation"
    class="fixed inset-y-0 left-0 z-70 flex w-[280px] max-w-[86vw] flex-col border-r border-line bg-surface px-5 py-5 transition-transform duration-200 xl:hidden"
    :class="open ? 'translate-x-0' : '-translate-x-full'"
    :aria-hidden="!open"
    :inert="!open"
    aria-label="Navegação da landing page"
  >
    <div class="mb-8 flex items-center justify-between gap-3">
      <button
        class="min-w-0 border-0 bg-transparent p-0"
        type="button"
        aria-label="MarcaFácil, início"
        @click="emit('home')"
      >
        <img
          :src="marcaFacilLogo"
          alt="MarcaFácil"
          class="h-auto w-full max-w-[175px] object-contain object-left"
        />
      </button>
      <button
        class="icon-btn"
        type="button"
        aria-label="Fechar navegação"
        @click="emit('close')"
      >
        <AppIcon name="x" :size="20" />
      </button>
    </div>
    <nav class="flex flex-col gap-1" aria-label="Secções da landing page">
      <a
        v-for="link in landingLinks"
        :key="link.section"
        :href="`#${link.section}`"
        class="flex min-h-12 items-center rounded-4xl px-3 text-small font-medium text-ink hover:bg-surface-muted hover:text-primary-text"
        @click.prevent="emit('navigate-section', link.section)"
      >
        {{ link.label }}
      </a>
    </nav>
  </aside>
</template>
