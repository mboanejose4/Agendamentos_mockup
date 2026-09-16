<script setup lang="ts">
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import type { WorkspaceRole } from "@/utils/navigation/workspaceRoles.ts";

defineProps<{ currentRole?: WorkspaceRole }>();
const emit = defineEmits<{ "open-workspace": [] }>();
</script>

<template>
  <footer
    class="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line px-5 py-4 text-caption text-muted sm:px-7 lg:px-10"
  >
    <span>© {{ new Date().getFullYear() }} MarcaFácil</span>
    <span class="hidden flex-1 sm:block">
      Feito para ligar pessoas e serviços.
    </span>
    <button
      class="ml-auto inline-flex items-center gap-1.5 border-0 bg-transparent p-0 text-caption text-muted hover:text-primary-text"
      @click="emit('open-workspace')"
    >
      {{ currentRole?.name }} <AppIcon name="chevron-down" :size="12" />
    </button>
  </footer>
</template>
