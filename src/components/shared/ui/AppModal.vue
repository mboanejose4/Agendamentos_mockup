<script setup lang="ts">
import { ref, watch, nextTick, onBeforeUnmount } from "vue";
import AppIcon from "@/components/shared/ui/AppIcon.vue";
const props = defineProps<{
  modelValue?: boolean;
  title?: string;
  width?: string | number;
}>();
const emit = defineEmits<{ "update:modelValue": [value: boolean] }>();
const dialog = ref<HTMLDialogElement | null>(null);
const titleId = `dialog-${Math.random().toString(36).slice(2)}`;
let previousFocus: Element | null = null;
function close() {
  emit("update:modelValue", false);
}
watch(
  () => props.modelValue,
  async (open) => {
    await nextTick();
    if (!dialog.value) return;
    if (open && !dialog.value.open) {
      previousFocus = document.activeElement;
      dialog.value.showModal();
    } else if (!open && dialog.value.open) {
      dialog.value.close();
      (previousFocus as HTMLElement | null)?.focus?.();
    }
  },
  { immediate: true },
);
onBeforeUnmount(() => {
  dialog.value?.close();
});
</script>
<template>
  <Teleport to="body"
    ><dialog
      ref="dialog"
      class="dialog"
      :style="
        width
          ? { maxWidth: typeof width === 'number' ? `${width}px` : width }
          : {}
      "
      :aria-labelledby="titleId"
      @cancel.prevent="close"
      @click="
        (event: MouseEvent) => {
          if (event.target === dialog) close();
        }
      "
    >
      <div class="dialog-inner">
        <header class="dialog-header">
          <h2 :id="titleId">{{ title }}</h2>
          <button
            class="icon-btn -mr-2"
            type="button"
            title="Fechar"
            aria-label="Fechar"
            @click="close"
          >
            <AppIcon name="x" />
          </button>
        </header>
        <slot />
      </div></dialog
  ></Teleport>
</template>
