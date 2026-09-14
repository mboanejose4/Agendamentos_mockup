<script setup>
import ThemeToggle from "@/Component/ui/ThemeToggle.vue";
import AppIcon from "@/Component/ui/AppIcon.vue";

defineProps({
  role: { type: String, required: true },
  currentLabel: { type: String, required: true },
  unread: { type: Number, default: 0 },
  userName: { type: String, default: "" },
  companyName: { type: String, default: "" },
});

const emit = defineEmits(["navigate", "open-menu"]);
</script>

<template>
  <!-- Barra fixa: acompanha o deslocamento da página em qualquer dispositivo.
       O logótipo não aparece aqui — vive na barra lateral, que no telefone é a
       gaveta. Assim a marca mostra-se uma vez só, e a barra fica para o que a
       pessoa precisa de tocar. -->
  <header
    class="sticky top-0 z-40 flex min-h-topbar items-center justify-between gap-3 border-b border-line bg-surface/95 px-3 py-2.5 backdrop-blur-md sm:px-5 lg:px-8"
  >
    <div class="flex min-w-0 items-center gap-1.5 sm:gap-2.5">
      <button
        class="icon-btn desk:hidden"
        type="button"
        aria-label="Abrir navegação"
        title="Menu"
        @click="emit('open-menu')"
      >
        <AppIcon name="menu" />
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
        <strong class="truncate font-semibold text-ink lg:font-medium lg:text-muted">
          {{ currentLabel }}
        </strong>
      </span>
    </div>

    <div class="flex shrink-0 items-center gap-1 sm:gap-2">
      <ThemeToggle />

      <span
        v-if="['guest', 'client'].includes(role)"
        class="hidden items-center gap-1.5 text-caption text-muted xl:flex"
      >
        <AppIcon name="map-pin" :size="16" /> Maputo, Moçambique
      </span>

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
        class="btn btn-secondary btn-compact"
        @click="emit('navigate', 'auth')"
      >
        Entrar <AppIcon name="arrow-up-right" :size="16" />
      </button>

      <button
        v-else
        class="avatar avatar-sm"
        type="button"
        title="O meu perfil"
        aria-label="O meu perfil"
        @click="emit('navigate', 'profile')"
      >
        {{ userName?.slice(0, 1) || "M" }}
      </button>
    </div>
  </header>
</template>
