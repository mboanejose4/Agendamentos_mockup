<script setup>
import AppIcon from "@/Component/ui/AppIcon.vue";

defineProps(["state", "navigation", "navigate"]);
const emit = defineEmits(["open-menu", "open-workspace"]);
</script>
<template>
  <nav class="mobile-bottom-nav" aria-label="Acesso rápido">
    <button
      v-for="[view, label, icon] in navigation[0].items.slice(0, 3)"
      :key="view"
      :class="{ active: state.view === view }"
      @click="navigate(view)"
    >
      <AppIcon :name="icon" :size="21" /><span>{{ label }}</span></button
    ><button @click="emit('open-menu')">
      <AppIcon name="menu" :size="21" /><span>Mais</span>
    </button>
  </nav>
</template>
