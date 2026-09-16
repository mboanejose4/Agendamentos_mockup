<script setup lang="ts">
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import { isDark, setTheme } from "@/stores/themeStore.ts";
</script>

<template>
  <button
    class="icon-btn border-line bg-surface text-primary-text"
    type="button"
    :aria-label="isDark ? 'Activar modo claro' : 'Activar modo escuro'"
    :title="isDark ? 'Activar modo claro' : 'Activar modo escuro'"
    :aria-pressed="isDark"
    @click="setTheme(isDark ? 'light' : 'dark')"
  >
    <AppIcon :name="isDark ? 'sun' : 'moon'" :size="21" />
  </button>
</template>
