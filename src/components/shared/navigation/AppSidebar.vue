<script setup lang="ts">
import BusinessIcon from "@/components/shared/ui/BusinessIcon.vue";
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import { initials } from "@/utils/formatters.ts";
import type { NavigationGroup } from "@/utils/navigation/navigationGroups.ts";
import type { WorkspaceRole } from "@/utils/navigation/workspaceRoles.ts";
import type { Business, Role, StaffMember, ViewName } from "@/types/domain.ts";
import marcaFacilLogo from "@/assets/img/logo.png";
import marcaFacilLogoDark from "@/assets/img/logo-dark.png";
import Select from "primevue/select";

withDefaults(
  defineProps<{
    open?: boolean;
    role: Role;
    activeView: ViewName;
    businessId?: string;
    staffId?: string;
    businesses: Business[];
    professionalList: StaffMember[];
    navigation: readonly NavigationGroup[];
    unread?: number;
    userName?: string;
    userAvatar?: string;
    currentRole?: WorkspaceRole;
  }>(),
  { open: false, unread: 0, userName: "", userAvatar: "" },
);

const emit = defineEmits<{
  navigate: [view: ViewName];
  "select-business": [id: string];
  "select-staff": [id: string];
  "open-workspace": [];
  close: [];
}>();

const homeView = (role: Role): ViewName =>
  role === "manager"
    ? "overview"
    : role === "platform"
      ? "platform-overview"
      : role === "professional"
        ? "professional-agenda"
        : "explore";
</script>

<template>
  <!--
    Gaveta em telefones e tablets, coluna fixa em ecrãs largos não tácteis.
    A largura acompanha o ecrã para nunca tapar o conteúdo por completo.
  -->
  <aside
    class="fixed top-3 bottom-3 left-3 z-70 flex w-[270px] max-w-[calc(86vw-24px)] flex-col overflow-y-auto overscroll-contain rounded-4xl border border-line bg-surface px-4 pt-5 pb-4 elevated-edge transition-transform duration-200 ease-out desk:w-sidebar desk:max-w-none desk:translate-x-0 desk:px-3.5 desk:pt-6"
    :class="open ? 'translate-x-0' : '-translate-x-[calc(100%+12px)]'"
    aria-label="Navegação principal"
  >
    <!-- Logótipo e fecho da gaveta -->
    <div class="mb-5 flex items-center justify-between gap-2 px-1">
      <button
        class="flex min-w-0 flex-1 items-center rounded-4xl border-0 bg-transparent p-0 text-left"
        aria-label="MarcaFácil, início"
        @click="emit('navigate', homeView(role))"
      >
        <img
          :src="marcaFacilLogo"
          alt="MarcaFácil"
          class="brand-logo-light block h-auto w-full max-w-[186px] object-contain object-left"
        />
        <img
          :src="marcaFacilLogoDark"
          alt=""
          aria-hidden="true"
          class="brand-logo-dark block h-auto w-full max-w-[186px] object-contain object-left"
        />
      </button>

      <button
        class="icon-btn -mr-1.5 desk:hidden"
        type="button"
        aria-label="Fechar navegação"
        title="Fechar navegação"
        @click="emit('close')"
      >
        <AppIcon name="x" :size="20" />
      </button>
    </div>

    <!-- Estabelecimento activo -->
    <div
      v-if="['manager', 'professional'].includes(role)"
      class="mb-5 flex flex-col gap-2 rounded-4xl border border-line bg-surface-muted/60 p-3"
    >
      <div class="flex items-center gap-2.5">
        <BusinessIcon
          :branding="businesses.find((b) => b.id === businessId)?.branding"
          :name="businesses.find((b) => b.id === businessId)?.name"
          :size="34"
        />
        <label
          for="company"
          class="text-overline font-semibold tracking-[0.08em] text-muted uppercase"
        >
          Estabelecimento
        </label>
      </div>

      <Select
        id="company"
        class="min-h-10 w-full px-2.5 py-2 text-caption"
        :model-value="businessId"
        @update:model-value="emit('select-business', $event)"
        :options="[
          ...businesses.map((company) => ({
            label: company.name,
            value: company.id,
          })),
        ]"
        option-label="label"
        option-value="value"
        append-to="self"
      />

      <Select
        v-if="role === 'professional'"
        class="min-h-10 w-full px-2.5 py-2 text-caption"
        aria-label="Profissional"
        :model-value="staffId"
        @update:model-value="emit('select-staff', $event)"
        :options="[
          ...professionalList.map((person) => ({
            label: person.name,
            value: person.id,
          })),
        ]"
        option-label="label"
        option-value="value"
        append-to="self"
      />
    </div>

    <!-- Navegação -->
    <nav class="flex-1">
      <div v-for="group in navigation" :key="group.label" class="mb-6">
        <span
          class="mb-2 block px-3 text-overline font-semibold tracking-[0.08em] text-muted uppercase"
        >
          {{ group.label }}
        </span>

        <button
          v-for="[view, label, icon] in group.items"
          :key="view"
          class="my-0.5 flex min-h-11 w-full items-center gap-2.5 rounded-4xl border-0 px-3 py-2.5 text-left text-small"
          :class="
            activeView === view ||
            (view === 'explore' && ['business', 'booking'].includes(activeView))
              ? 'bg-soft font-semibold text-primary-text'
              : 'bg-transparent text-muted hover:bg-surface-muted hover:text-ink'
          "
          :aria-current="activeView === view ? 'page' : undefined"
          @click="emit('navigate', view)"
        >
          <AppIcon :name="icon" :size="19" />

          <span class="min-w-0 flex-1 truncate">{{ label }}</span>

          <span
            v-if="view === 'notifications' && unread && role !== 'guest'"
            class="rounded-4xl bg-surface-muted px-1.5 py-0.5 text-caption font-semibold text-ink"
          >
            {{ unread }}
          </span>

          <AppIcon
            v-else-if="activeView === view"
            name="chevron-right"
            :size="15"
          />
        </button>
      </div>
    </nav>

    <!-- Rodapé da barra lateral -->
    <div class="mt-auto pt-4">
      <div
        v-if="['guest', 'client'].includes(role)"
        class="mb-3 rounded-4xl bg-soft p-4"
      >
        <span class="mb-2.5 block text-primary-text">
          <AppIcon name="building-2" :size="20" />
        </span>

        <strong class="block text-small text-ink">
          A sua empresa, na MarcaFácil.
        </strong>

        <button
          class="text-button mt-3 text-caption"
          @click="emit('navigate', 'onboard')"
        >
          Registar empresa
          <AppIcon name="arrow-up-right" :size="15" />
        </button>
      </div>

      <button
        class="flex min-h-11 w-full items-center gap-2.5 rounded-4xl border-0 border-t border-line bg-transparent px-2 pt-3.5 pb-2 text-left hover:bg-surface-muted"
        @click="emit('open-workspace')"
      >
        <span class="avatar avatar-sm overflow-hidden">
          <img
            v-if="userAvatar && role !== 'guest'"
            :src="userAvatar"
            alt=""
            class="size-full object-cover"
          />
          <template v-else>{{
            role === "guest" ? "M" : initials(userName, "M")
          }}</template>
        </span>

        <span class="flex min-w-0 flex-1 flex-col">
          <strong class="truncate text-caption text-ink">
            {{ currentRole?.name }}
          </strong>
          <small class="mt-0.5 truncate text-caption text-muted">
            Mudar espaço de trabalho
          </small>
        </span>

        <AppIcon name="chevron-down" :size="16" />
      </button>
    </div>
  </aside>
</template>
