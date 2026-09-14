<script setup>
import { ref, watch, nextTick, onBeforeUnmount } from "vue";
import AppIcon from "@/Component/ui/AppIcon.vue";
const props = defineProps({
  modelValue: Boolean,
  title: String,
  width: [String, Number],
});
const emit = defineEmits(["update:modelValue"]);
const dialog = ref(null);
const titleId = `dialog-${Math.random().toString(36).slice(2)}`;
let previousFocus;
function close() {
  emit("update:modelValue", false);
}
watch(
  () => props.modelValue,
  async (open) => {
    await nextTick();
    if (open && !dialog.value.open) {
      previousFocus = document.activeElement;
      dialog.value.showModal();
    } else if (!open && dialog.value.open) {
      dialog.value.close();
      previousFocus?.focus?.();
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
        (event) => {
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
