<template>
  <div
    v-if="store.roleSwitcherOpen"
    class="modal-backdrop"
    @click.self="store.roleSwitcherOpen = false"
  >
    <section class="bottom-sheet role-sheet" aria-modal="true" role="dialog">
      <div class="sheet-handle"></div>
      <div class="sheet-head">
        <div>
          <span class="eyebrow">Modo de demonstração</span>
          <h2>Escolher perfil</h2>
        </div>
        <button class="icon-button" @click="store.roleSwitcherOpen = false">
          ×
        </button>
      </div>
      <p class="muted">
        Alterne entre os papéis previstos para testar todos os fluxos do mockup.
      </p>
      <div class="role-list">
        <button
          v-for="role in roles"
          :key="role.id"
          class="role-option"
          :class="{ selected: store.role === role.id }"
          @click="setRole(role.id)"
        >
          <span class="avatar">{{ abbreviate(role.label) }}</span>
          <span
            ><strong>{{ role.label }}</strong
            ><small>{{ role.description }}</small></span
          >
          <span class="role-check">{{
            store.role === role.id ? "✓" : "›"
          }}</span>
        </button>
      </div>
    </section>
  </div>
</template>

<script>
import { appStore as store, setRole } from "../store.js";
import { roleOptions } from "../data/mockData.js";

export default {
  name: "RoleSwitcher",
  data: () => ({ store, roles: roleOptions }),
  methods: {
    setRole,
    abbreviate(label) {
      return label
        .split(" ")
        .slice(0, 2)
        .map((x) => x[0])
        .join("");
    },
  },
};
</script>
