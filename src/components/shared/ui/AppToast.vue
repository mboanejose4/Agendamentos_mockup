<script setup lang="ts">
import AppIcon from "@/components/shared/ui/AppIcon.vue";

defineProps<{ message?: string }>();
</script>

<template>
  <Transition name="toast">
    <div
      v-if="message"
      class="fixed bottom-6 left-1/2 z-100 flex max-w-[min(600px,calc(100vw-32px))] -translate-x-1/2 items-center gap-2.5 rounded-lg border border-line bg-surface px-5 py-3.5 text-small text-ink shadow-float desk:left-[calc(50%+var(--sidebar-width)/2)]"
      role="status"
    >
      <AppIcon name="circle-check" :size="20" />{{ message }}
    </div>
  </Transition>
</template>
