<script setup>
import BusinessIcon from "@/Component/ui/BusinessIcon.vue";
import ThemeToggle from "@/Component/ui/ThemeToggle.vue";
import AppIcon from "@/Component/ui/AppIcon.vue";
import marcaFacilLogo from "@/assets/img/logo.png";
import marcaFacilLogoDark from "@/assets/img/logo-dark.png";

defineProps({
  branding: Object,
  role: { type: String, required: true },
  currentLabel: { type: String, required: true },
  unread: { type: Number, default: 0 },
  userName: { type: String, default: "" },
  companyName: { type: String, default: "" },
});

const emit = defineEmits(["navigate", "open-menu"]);
</script>

<template>
  <!-- Barra fixa: acompanha o deslocamento da página em qualquer dispositivo. -->
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

      <button
        class="inline-flex shrink-0 items-center rounded-lg border-0 bg-transparent p-0 desk:hidden"
        :aria-label="
          branding?.icon ? `${companyName}, início` : 'MarcaFácil, início'
        "
        @click="emit('navigate', 'explore')"
      >
        <BusinessIcon
          v-if="branding?.icon"
          :branding="branding"
          :name="companyName"
          :size="32"
        />
        <template v-else>
          <img
            :src="marcaFacilLogo"
            alt="MarcaFácil"
            class="brand-logo-light block h-6 w-auto max-w-[42vw] object-contain object-left sm:h-8"
          />
          <img
            :src="marcaFacilLogoDark"
            alt=""
            aria-hidden="true"
            class="brand-logo-dark block h-6 w-auto max-w-[42vw] object-contain object-left sm:h-8"
          />
        </template>
      </button>

      <!-- Migalhas: só há espaço a partir de ecrãs médios. -->
      <span
        class="hidden min-w-0 items-center gap-2.5 text-caption text-muted lg:flex"
      >
        <span class="truncate">
          {{
            ["manager", "professional"].includes(role)
              ? companyName
              : role === "platform"
                ? "Administração"
                : "O seu dia, com mais possibilidades"
          }}
        </span>
        <AppIcon name="chevron-right" :size="14" />
        <strong class="truncate font-medium">{{ currentLabel }}</strong>
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
