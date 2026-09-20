<script setup lang="ts">
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import type { Role } from "@/types/domain.ts";
import type { WorkspaceRole } from "@/utils/navigation/workspaceRoles.ts";
import AppModal from "@/components/shared/ui/AppModal.vue";

defineProps<{
  currentRoleId: Role;
  roles: readonly WorkspaceRole[];
}>();

const emit = defineEmits<{
  "select-role": [role: Role];
  "sign-out": [];
}>();
const open = defineModel<boolean>({ default: false });
</script>

<template>
  <AppModal v-model="open" title="Espaços de trabalho">
    <div class="grid gap-2">
      <button
        v-for="role in roles"
        :key="role.id"
        class="rounded-4xl choice"
        :class="{ 'choice-selected': currentRoleId === role.id }"
        @click="emit('select-role', role.id)"
      >
        <span
          class="inline-grid size-11 shrink-0 place-items-center rounded-4xl bg-soft text-primary-text"
        >
          <AppIcon :name="role.icon" />
        </span>

        <span class="min-w-0 flex-1">
          <strong class="block text-small text-ink">{{ role.name }}</strong>
          <small class="mt-1 block text-caption text-muted">
            {{ role.description }}
          </small>
        </span>

        <AppIcon
          :name="currentRoleId === role.id ? 'circle-check' : 'chevron-right'"
          :size="20"
        />
      </button>
    </div>

    
    <button
      v-if="currentRoleId !== 'guest'"
      class="mt-4 btn btn-secondary w-full"
      @click="
        emit('sign-out');
        open = false;
      "
    >
      <AppIcon name="log-out" :size="17" /> Terminar sessão
    </button>
  </AppModal>
</template>
