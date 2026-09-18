<script setup lang="ts">
import ThemeToggle from "@/components/shared/ui/ThemeToggle.vue";
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import { contentWidth } from "@/utils/layout.ts";
import { initials } from "@/utils/formatters.ts";
import type { Role, ViewName } from "@/types/domain.ts";
import marcaFacilLogo from "@/assets/img/marcafacil-logo.png";

withDefaults(
  defineProps<{
    role: Role;
    currentLabel: string;
    unread?: number;
    userName?: string;
    userAvatar?: string;
    companyName?: string;
  }>(),
  { unread: 0, userName: "", userAvatar: "", companyName: "" },
);

const emit = defineEmits<{
  navigate: [view: ViewName];
  "open-menu": [];
}>();
</script>

<template>
  <!-- Barra fixa: acompanha o deslocamento da página em qualquer dispositivo.
       O logótipo não aparece aqui — vive na barra lateral, que no telefone é a
       gaveta. Assim a marca mostra-se uma vez só, e a barra fica para o que a
       pessoa precisa de tocar. -->
  <header
    class="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur-md"
  >
    <div
      :class="[
        'mx-auto flex min-h-topbar w-full items-center justify-between gap-3 px-3 py-2.5 sm:px-5',
        contentWidth(role),
      ]"
    >
      <div class="flex min-w-0 items-center gap-1.5 sm:gap-2.5">
        <button
          v-if="role !== 'guest'"
          class="icon-btn desk:hidden"
          type="button"
          aria-label="Abrir navegação"
          title="Menu"
          @click="emit('open-menu')"
        >
          <AppIcon name="menu" />
        </button>

        <button
          v-else
          class="icon-btn desk:hidden"
          type="button"
          aria-label="MarcaFácil, início"
          title="Início"
          @click="emit('navigate', 'explore')"
        >
          <img :src="marcaFacilLogo" alt="" class="size-7 object-contain" />
        </button>

        <!-- No telefone fica só o nome do ecrã; o caminho completo aparece
           quando há espaço para ele. -->
        <span class="flex min-w-0 items-center gap-2.5 text-caption text-muted">
          <span class="hidden truncate lg:inline">
            {{
              ["manager", "professional"].includes(role)
                ? companyName
                : role === "platform"
                  ? "Administração"
                  : "O seu dia, com mais possibilidades"
            }}
          </span>
          <AppIcon name="chevron-right" :size="14" class="hidden lg:block" />
          <strong
            class="truncate font-semibold text-ink lg:font-medium lg:text-muted"
          >
            {{ currentLabel }}
          </strong>
        </span>
      </div>

      <div class="flex shrink-0 items-center gap-1 sm:gap-2">
        <ThemeToggle class="!border-0 !shadow-none bg-none" />

        <button
          class="icon-btn relative hidden sm:inline-flex"
          type="button"
          title="Notificações"
          aria-label="Notificações"
          @click="emit('navigate', 'notifications')"
        >
          <AppIcon name="bell" />
          <i
            v-if="unread && role !== 'guest'"
            class="absolute top-2 right-2.5 size-1.5 rounded-full border border-line bg-primary"
          ></i>
        </button>

        <button
          v-if="role === 'guest'"
          class="btn rounded-4xl btn-primary btn-compact"
          @click="emit('navigate', 'auth')"
        >
          Entrar <AppIcon name="arrow-up-right" :size="16" />
        </button>

        <button
          v-else
          class="avatar avatar-sm overflow-hidden"
          type="button"
          title="O meu perfil"
          aria-label="O meu perfil"
          @click="emit('navigate', 'profile')"
        >
          <img
            v-if="userAvatar"
            :src="userAvatar"
            alt=""
            class="size-full object-cover"
          />
          <template v-else>{{ initials(userName, "M") }}</template>
        </button>
      </div>
    </div>
  </header>
</template>
