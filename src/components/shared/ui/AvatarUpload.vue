<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import AppModal from "@/components/shared/ui/AppModal.vue";
import {
  readAvatarImage,
  captureAvatarFrame,
} from "@/services/imageService.ts";
import { initials } from "@/utils/formatters.ts";

/* Fotografia de perfil: carregar um ficheiro, tirar uma fotografia com a
   câmara, substituir ou remover. Sem fotografia, o avatar são as iniciais. */
const props = withDefaults(
  defineProps<{ modelValue?: string; name?: string; fallback?: string }>(),
  { modelValue: "", name: "", fallback: "EU" },
);
const emit = defineEmits<{ "update:modelValue": [value: string] }>();

const error = ref("");
const busy = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const letters = computed(() => initials(props.name, props.fallback));

function pickFile() {
  error.value = "";
  fileInput.value?.click();
}

async function upload(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = "";
  if (!file) return;
  error.value = "";
  busy.value = true;
  try {
    emit("update:modelValue", await readAvatarImage(file));
  } catch (problem) {
    error.value =
      problem instanceof Error
        ? problem.message
        : "Não foi possível ler a imagem.";
  } finally {
    busy.value = false;
  }
}

function removePhoto() {
  error.value = "";
  emit("update:modelValue", "");
}

/* --- Câmara --------------------------------------------------------------- */

const cameraOpen = ref(false);
const cameraError = ref("");
const cameraReady = ref(false);
const shot = ref("");
const video = ref<HTMLVideoElement | null>(null);
let stream: MediaStream | null = null;

function stopCamera() {
  stream?.getTracks().forEach((track) => track.stop());
  stream = null;
  cameraReady.value = false;
}

async function openCamera() {
  error.value = "";
  cameraError.value = "";
  shot.value = "";
  cameraReady.value = false;
  cameraOpen.value = true;
  if (!navigator.mediaDevices?.getUserMedia) {
    cameraError.value =
      "Este navegador não permite usar a câmara nesta página. Carregue uma fotografia guardada no dispositivo.";
    return;
  }
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
        width: { ideal: 1280 },
        height: { ideal: 1280 },
      },
      audio: false,
    });
    for (let attempt = 0; attempt < 10 && !video.value; attempt++)
      await nextTick();
    if (!cameraOpen.value || !video.value) {
      stopCamera();
      return;
    }
    video.value.srcObject = stream;
    await video.value.play();
    cameraReady.value = true;
  } catch (problem) {
    stopCamera();
    const name = problem instanceof Error ? problem.name : "";
    cameraError.value =
      name === "NotAllowedError" || name === "SecurityError"
        ? "Acesso à câmara recusado. Autorize a câmara no navegador ou carregue uma fotografia."
        : name === "NotFoundError" || name === "OverconstrainedError"
          ? "Não encontrámos nenhuma câmara neste dispositivo."
          : "Não foi possível abrir a câmara. Tente novamente ou carregue uma fotografia.";
  }
}

function capture() {
  try {
    if (video.value) shot.value = captureAvatarFrame(video.value);
  } catch (problem) {
    cameraError.value =
      problem instanceof Error
        ? problem.message
        : "Não foi possível capturar a fotografia.";
  }
}

function retake() {
  shot.value = "";
}

function useShot() {
  emit("update:modelValue", shot.value);
  cameraOpen.value = false;
}

watch(cameraOpen, (open) => {
  if (open) return;
  stopCamera();
  shot.value = "";
});
onBeforeUnmount(stopCamera);
</script>

<template>
  <div class="flex flex-col items-center gap-4">
    <img
      v-if="modelValue"
      :src="modelValue"
      :alt="`Fotografia de perfil de ${name || 'utilizador'}`"
      class="size-24 rounded-full border border-line object-cover"
    />
    <span v-else class="avatar size-24 text-h2">{{ letters }}</span>

    <p v-if="busy" class="text-caption text-muted" role="status">
      A preparar a fotografia…
    </p>

    <div class="flex flex-wrap justify-center gap-2">
      <button
        class="btn btn-secondary btn-compact"
        type="button"
        :disabled="busy"
        @click="pickFile"
      >
        <AppIcon :name="modelValue ? 'image-plus' : 'upload'" :size="16" />
        {{ modelValue ? "Substituir" : "Carregar foto" }}
      </button>

      <button
        class="btn btn-secondary btn-compact"
        type="button"
        :disabled="busy"
        @click="openCamera"
      >
        <AppIcon name="camera" :size="16" /> Tirar foto
      </button>

      <button
        v-if="modelValue"
        class="btn btn-secondary btn-compact"
        type="button"
        :disabled="busy"
        @click="removePhoto"
      >
        <AppIcon name="trash-2" :size="16" /> Remover
      </button>
    </div>

    <input
      ref="fileInput"
      class="sr-only"
      type="file"
      accept="image/jpeg,image/png,image/webp"
      tabindex="-1"
      aria-label="Carregar fotografia de perfil"
      @change="upload"
    />

    <small class="text-center text-caption text-muted">
      JPG, PNG ou WebP, até 8 MB. A fotografia é recortada em quadrado.
    </small>

    <p v-if="error" class="error-message" role="alert">{{ error }}</p>
  </div>

  <AppModal v-model="cameraOpen" title="Tirar fotografia" :width="460">
    <p v-if="cameraError" class="error-message" role="alert">
      {{ cameraError }}
    </p>

    <div
      v-else
      class="relative aspect-square w-full overflow-hidden rounded-xl border border-line bg-surface-muted"
    >
      <img
        v-if="shot"
        :src="shot"
        alt="Pré-visualização da fotografia"
        class="size-full object-cover"
      />
      <video
        v-show="!shot"
        ref="video"
        class="size-full -scale-x-100 object-cover"
        playsinline
        muted
      ></video>
      <p
        v-if="!cameraReady && !shot"
        class="absolute inset-0 grid place-items-center text-caption text-muted"
      >
        A ligar a câmara…
      </p>
    </div>

    <div class="form-actions">
      <template v-if="shot">
        <button class="btn btn-secondary" type="button" @click="retake">
          <AppIcon name="rotate-ccw" :size="17" /> Repetir
        </button>
        <button class="btn btn-primary" type="button" @click="useShot">
          <AppIcon name="check" :size="17" /> Usar esta fotografia
        </button>
      </template>
      <template v-else>
        <button
          class="btn btn-secondary"
          type="button"
          @click="cameraOpen = false"
        >
          Cancelar
        </button>
        <button
          class="btn btn-primary"
          type="button"
          :disabled="!cameraReady"
          @click="capture"
        >
          <AppIcon name="camera" :size="17" /> Capturar
        </button>
      </template>
    </div>
  </AppModal>
</template>
