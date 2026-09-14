<script setup>
import { ref, watch, nextTick, onBeforeUnmount } from "vue";
import AppIcon from "./AppIcon.vue";
import { readCoverImage } from "@/API/service/imageService.js";
const props = defineProps({
  modelValue: { type: String, default: "" },
  name: { type: String, default: "Estabelecimento" },
});
const emit = defineEmits(["update:modelValue", "busy-change"]);
const error = ref(""),
  busy = ref(false),
  preview = ref(null),
  trigger = ref(null);
watch(busy, (value) => emit("busy-change", value), { flush: "sync" });
let generation = 0;
async function upload(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const current = ++generation;
  error.value = "";
  busy.value = true;
  try {
    const data = await readCoverImage(file);
    if (current === generation) emit("update:modelValue", data);
  } catch (e) {
    if (current === generation) error.value = e.message;
  } finally {
    if (current === generation) busy.value = false;
    event.target.value = "";
  }
}
async function open() {
  await nextTick();
  preview.value.showModal();
}
function close() {
  preview.value?.close();
  trigger.value?.focus();
}
watch(
  () => props.modelValue,
  (value) => {
    if (!value) preview.value?.close();
  },
);
onBeforeUnmount(() => {
  generation++;
  preview.value?.close();
});
</script>
<template>
  <div class="form-grid-full my-5 min-w-0">
    <label class="field"
      ><span>Imagem de capa</span
      ><input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        :disabled="busy"
        @change="upload"
      /><small
        >JPG, PNG ou WebP, até 8 MB. A imagem será optimizada para guardar no
        mockup.</small
      ></label
    >
    <p v-if="busy" role="status" class="text-caption text-muted">
      A preparar a imagem…
    </p>
    <p v-if="error" class="error-message" role="alert">{{ error }}</p>
    <template v-if="modelValue"
      ><button
        ref="trigger"
        class="relative block w-full overflow-hidden rounded-xl border border-line bg-surface p-0"
        type="button"
        @click="open"
        aria-label="Ver imagem de capa em ecrã inteiro"
      >
        <img
          :src="modelValue"
          :alt="'Imagem de capa de ' + name"
          class="h-[180px] w-full object-cover sm:h-[220px]"
        /><span
          class="absolute right-3 bottom-3 flex items-center gap-2 rounded-lg bg-scrim px-3.5 py-2.5 text-muted"
          ><AppIcon name="eye" :size="18" />Ver em ecrã inteiro</span
        ></button
      ><button
        type="button"
        class="text-button mt-2"
        :disabled="busy"
        @click="emit('update:modelValue', '')"
      >
        Remover imagem de capa
      </button></template
    ><Teleport to="body"
      ><dialog
        ref="preview"
        class="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none gap-4 border-0 bg-background p-4 text-ink [&::backdrop]:bg-scrim open:flex open:flex-col sm:p-5"
        aria-label="Imagem de capa em ecrã inteiro"
        @cancel.prevent="close"
      >
        <header class="flex items-center justify-between gap-4">
          <strong class="text-small font-semibold"
            >{{ name }} · Imagem de capa</strong
          ><button class="btn btn-secondary" type="button" @click="close">
            <AppIcon name="x" />Fechar
          </button>
        </header>
        <img
          v-if="modelValue"
          :src="modelValue"
          :alt="'Imagem de capa de ' + name"
          class="w-full min-h-0 flex-1 object-contain"
        /></dialog
    ></Teleport>
  </div>
</template>
