<script setup lang="ts">
import { computed, ref } from "vue";
import type { Branding } from "@/types/domain.ts";
import { normalizeBrand, textOn, isHexColor } from "@/utils/theme.ts";
import BusinessIcon from "@/components/shared/ui/BusinessIcon.vue";
const props = withDefaults(
  defineProps<{ modelValue?: Partial<Branding>; businessName?: string }>(),
  { businessName: "A sua empresa" },
);
const emit = defineEmits<{ "update:modelValue": [value: Branding] }>();
const brand = computed(() => normalizeBrand(props.modelValue));
const uploadError = ref("");
function update(field: keyof Branding, value: string) {
  if (field !== "icon" && !isHexColor(value)) return;
  emit("update:modelValue", { ...brand.value, [field]: value });
}
async function upload(event: Event) {
  uploadError.value = "";
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  try {
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type))
      throw Error("Escolha uma imagem PNG, JPG ou WebP.");
    if (file.size > 2 * 1024 * 1024) throw Error("A imagem deve ter até 2 MB.");
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      const canvas = document.createElement("canvas");
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw Error("Não foi possível preparar a imagem.");
      const scale = Math.min(128 / img.width, 128 / img.height);
      ctx.drawImage(
        img,
        (128 - img.width * scale) / 2,
        (128 - img.height * scale) / 2,
        img.width * scale,
        img.height * scale,
      );
      update("icon", canvas.toDataURL("image/png"));
    } finally {
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    uploadError.value =
      error instanceof Error && error.message
        ? error.message
        : "Não foi possível ler esta imagem.";
  } finally {
    input.value = "";
  }
}
</script>
<template>
  <fieldset
    class="my-6 min-w-0 rounded-4xl border border-line bg-surface p-4 sm:p-6"
  >
    <legend class="px-2 text-h3 font-semibold">Identidade visual</legend>
    <p class="mb-5 text-small text-muted">
      Personalize as cores e o ícone da sua empresa. Pode alterar estas opções
      nas definições.
    </p>
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5">
      <label class="field"
        >Cor primária
        <div class="flex items-center gap-2.5">
          <input
            aria-label="Cor primária"
            type="color"
            class="h-11 w-[52px] shrink-0 cursor-pointer p-1"
            :value="brand.primaryColor"
            @input="
              update('primaryColor', ($event.target as HTMLInputElement).value)
            "
          /><input
            aria-label="Código da cor primária"
            class="min-w-0 flex-1"
            pattern="#[0-9a-fA-F]{6}"
            maxlength="7"
            :value="brand.primaryColor"
            @change="
              update('primaryColor', ($event.target as HTMLInputElement).value)
            "
            required
          /></div></label
      ><label class="field"
        >Cor secundária
        <div class="flex items-center gap-2.5">
          <input
            aria-label="Cor secundária"
            type="color"
            class="h-11 w-[52px] shrink-0 cursor-pointer p-1"
            :value="brand.secondaryColor"
            @input="
              update(
                'secondaryColor',
                ($event.target as HTMLInputElement).value,
              )
            "
          /><input
            aria-label="Código da cor secundária"
            class="min-w-0 flex-1"
            pattern="#[0-9a-fA-F]{6}"
            maxlength="7"
            :value="brand.secondaryColor"
            @change="
              update(
                'secondaryColor',
                ($event.target as HTMLInputElement).value,
              )
            "
            required
          /></div
      ></label>
    </div>
    <label class="field"
      >Ícone da empresa<input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        @change="upload"
      /><small>PNG, JPG ou WebP, até 2 MB.</small></label
    >
    <p v-if="uploadError" class="error-message mb-[18px]" role="alert">
      {{ uploadError }}
    </p>
    <button
      v-if="brand.icon"
      type="button"
      class="text-button"
      @click="update('icon', '')"
    >
      Remover ícone
    </button>
    <div
      class="mt-5 flex flex-wrap items-center gap-3 border-t border-line pt-5"
    >
      <BusinessIcon :branding="brand" :name="businessName" :size="48" /><strong
        class="min-w-[100px] flex-1 break-words"
        >{{ businessName || "A sua empresa" }}</strong
      ><span
        class="inline-flex rounded-4xl px-4 py-2.5 font-semibold"
        :style="{
          background: brand.primaryColor,
          color: textOn(brand.primaryColor),
        }"
        >Reservar</span
      ><span
        class="inline-flex rounded-4xl px-4 py-2.5 font-semibold"
        :style="{
          background: brand.secondaryColor,
          color: textOn(brand.secondaryColor),
        }"
        >Destaque</span
      >
    </div>
  </fieldset>
</template>
