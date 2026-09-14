<script setup>
import AppIcon from "@/Component/ui/AppIcon.vue";
import { usePlatformManagementContext } from "@/Composable/platform/platformContext.js";
const {
  state,
  business,
  roleNames,
  initials,
  requestRemoval,
  userSearch,
  userRole,
  userStatus,
  filteredUsers,
  openUser,
  toggleUser,
} = usePlatformManagementContext();
</script>
<template>
  <div>
    <div
      class="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
    >
      <label
        class="flex min-h-11 flex-1 items-center gap-2 rounded-md border border-line bg-surface px-3 text-muted sm:min-w-[170px] sm:max-w-[390px]"
        ><AppIcon name="search" /><input
          v-model="userSearch"
          placeholder="Pesquisar nome ou email"
          aria-label="Pesquisar utilizadores"
          class="w-full border-0 bg-transparent pl-0 text-caption outline-offset-0"
      /></label>
      <select
        v-model="userRole"
        aria-label="Perfil"
        class="w-full text-caption sm:w-auto"
      >
        <option value="all">Todos os perfis</option>
        <option v-for="(name, role) in roleNames" :key="role" :value="role">
          {{ name }}
        </option></select
      ><select
        v-model="userStatus"
        aria-label="Estado da conta"
        class="w-full text-caption sm:w-auto"
      >
        <option value="all">Todos os estados</option>
        <option value="active">Activos</option>
        <option value="inactive">Suspensos</option>
      </select>
    </div>
    <div class="mb-4 text-caption text-muted">
      {{ filteredUsers.length }} utilizadores
    </div>
    <div v-if="filteredUsers.length" class="table-scroll">
      <table class="data-table">
        <thead>
          <tr>
            <th>Utilizador</th>
            <th>Perfil</th>
            <th>Estabelecimento</th>
            <th>Estado</th>
            <th><span class="sr-only">Acções</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredUsers" :key="item.id">
            <td>
              <div class="flex items-center gap-3">
                <span class="avatar">{{ initials(item.name) }}</span>
                <div>
                  <strong class="block text-small text-ink"
                    >{{ item.name }}
                    <span
                      v-if="item.id === state.userId"
                      class="ml-1.5 rounded bg-surface-muted px-1.5 py-0.5 text-caption font-semibold text-muted"
                      >Eu</span
                    ></strong
                  ><small class="mt-0.5 block text-caption text-muted">{{
                    item.email
                  }}</small>
                </div>
              </div>
            </td>
            <td>{{ roleNames[item.role] }}</td>
            <td>{{ business(item.businessId)?.name || "—" }}</td>
            <td>
              <span :class="['badge', item.active ? 'badge-success' : 'badge-neutral']">{{
                item.active ? "Activo" : "Suspenso"
              }}</span>
            </td>
            <td>
              <div class="flex items-center justify-end gap-1.5">
                <button
                  class="icon-btn"
                  title="Editar utilizador"
                  aria-label="Editar utilizador"
                  @click="openUser(item)"
                >
                  <AppIcon name="pencil" /></button
                ><button
                  class="icon-btn"
                  :disabled="item.id === state.userId"
                  :title="
                    item.active
                      ? 'Suspender utilizador'
                      : 'Reactivar utilizador'
                  "
                  :aria-label="
                    item.active
                      ? 'Suspender utilizador'
                      : 'Reactivar utilizador'
                  "
                  @click="toggleUser(item)"
                >
                  <AppIcon
                    :name="item.active ? 'user-round-x' : 'user-round-check'"
                  /></button
                ><button
                  class="icon-btn"
                  :disabled="item.id === state.userId"
                  title="Eliminar utilizador"
                  aria-label="Eliminar utilizador"
                  @click="requestRemoval('users', item)"
                >
                  <AppIcon name="trash-2" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="empty-state">
      <AppIcon name="users-round" />
      <h2>Nenhum utilizador encontrado</h2>
      <p>Experimente outro nome, email ou perfil.</p>
    </div>
  </div>
</template>
