<script setup>
import AppIcon from "@/Component/ui/AppIcon.vue";
import AppModal from "@/Component/ui/AppModal.vue";

defineProps({
  currentRoleId: { type: String, required: true },
  roles: { type: Array, required: true },
});

const emit = defineEmits(["select-role", "sign-out"]);
const open = defineModel({ type: Boolean, default: false });
</script>

<template>
  <AppModal v-model="open" title="Espaços de trabalho">
    <div class="grid gap-2">
      <button
        v-for="role in roles"
        :key="role.id"
        class="choice"
        :class="{ 'choice-selected': currentRoleId === role.id }"
        @click="emit('select-role', role.id)"
      >
        <span
          class="inline-grid size-11 shrink-0 place-items-center rounded-xl bg-soft text-primary-text"
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

    <p class="my-5 rounded-md bg-surface-muted px-3.5 py-3 text-caption text-muted">
      Ambiente local de avaliação. Os perfis de exemplo permitem percorrer cada
      área.
    </p>

    <button
      v-if="currentRoleId !== 'guest'"
      class="btn btn-secondary w-full"
      @click="
        emit('sign-out');
        open = false;
      "
    >
      <AppIcon name="log-out" :size="17" /> Terminar sessão
    </button>
  </AppModal>
</template>
