<script setup lang="ts">
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import InsightCard from "@/components/shared/analytics/InsightCard.vue";
import { plural } from "@/utils/formatters.ts";
import { usePlatformManagementContext } from "@/composables/platform/platformContext.ts";

import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import InputText from "primevue/inputtext";
import Select from "primevue/select";

const {
  state,
  business,
  activeUsers,
  suspendedUsers,
  usersByRole,
  engagedClients,
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
    <div class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <InsightCard
        label="Contas activas"
        :value="String(activeUsers.length)"
        icon="users"
        :detail="`de ${plural(state.db.users.length, 'conta registada', 'contas registadas')}`"
        tone="primary"
      />
      <InsightCard
        label="Clientes"
        :value="String(usersByRole.client || 0)"
        icon="user-round"
        :detail="
          engagedClients
            ? `${engagedClients} já com marcações`
            : 'ainda sem marcações'
        "
        tone="blue"
      />
      <InsightCard
        label="Equipa dos estabelecimentos"
        :value="
          String((usersByRole.professional || 0) + (usersByRole.manager || 0))
        "
        icon="briefcase-business"
        :detail="`${plural(usersByRole.professional || 0, 'profissional', 'profissionais')} · ${plural(usersByRole.manager || 0, 'gestor', 'gestores')}`"
        tone="amber"
      />
      <InsightCard
        label="Contas suspensas"
        :value="String(suspendedUsers)"
        icon="user-x"
        :detail="
          suspendedUsers ? 'sem acesso à plataforma' : 'nenhuma conta suspensa'
        "
        tone="violet"
      />
    </div>

    <div
      class="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
    >
      <!-- Pesquisa à esquerda -->
      <IconField class="w-full sm:min-w-[170px] sm:max-w-[390px] sm:flex-1">
        <InputIcon class="pi pi-search" />

        <InputText
          v-model="userSearch"
          placeholder="Pesquisar nome ou email"
          aria-label="Pesquisar utilizadores"
          class="w-full text-caption"
        />
      </IconField>

      <!-- Filtros alinhados à direita no desktop -->
      <div
        class="flex w-full flex-col gap-3 sm:ml-auto sm:w-auto sm:flex-row sm:items-center"
      >
        <Select
          v-model="userRole"
          aria-label="Perfil"
          class="w-full text-caption sm:min-w-[180px] sm:w-auto"
          :options="[
            { label: 'Todos os perfis', value: 'all' },
            ...Object.entries(roleNames).map(([role, name]) => ({
              label: name,
              value: role,
            })),
          ]"
          option-label="label"
          option-value="value"
          append-to="self"
        />

        <Select
          v-model="userStatus"
          aria-label="Estado da conta"
          class="w-full text-caption sm:min-w-[170px] sm:w-auto"
          :options="[
            { label: 'Todos os estados', value: 'all' },
            { label: 'Activos', value: 'active' },
            { label: 'Suspensos', value: 'inactive' },
          ]"
          option-label="label"
          option-value="value"
          append-to="self"
        />
      </div>
    </div>

    <div class="mb-4 text-caption text-muted">
      {{ plural(filteredUsers.length, "utilizador", "utilizadores") }}
    </div>

    <div v-if="filteredUsers.length" class="table-scroll">
      <table class="data-table">
        <thead>
          <tr>
            <th>Utilizador</th>
            <th>Perfil</th>
            <th>Estabelecimento</th>
            <th>Estado</th>
            <th>
              <span class="sr-only">Acções</span>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="item in filteredUsers" :key="item.id">
            <td>
              <div class="flex items-center gap-3">
                <span class="avatar">
                  {{ initials(item.name) }}
                </span>

                <div>
                  <strong class="block text-small text-ink">
                    {{ item.name }}

                    <span
                      v-if="item.id === state.userId"
                      class="ml-1.5 rounded-4xl bg-surface-muted px-1.5 py-0.5 text-caption font-semibold text-muted"
                    >
                      Eu
                    </span>
                  </strong>

                  <small class="mt-0.5 block text-caption text-muted">
                    {{ item.email }}
                  </small>
                </div>
              </div>
            </td>

            <td>{{ roleNames[item.role] }}</td>

            <td>{{ business(item.businessId)?.name || "—" }}</td>

            <td>
              <span
                :class="[
                  'badge rounded-4xl',
                  item.active ? 'badge-success' : 'badge-neutral',
                ]"
              >
                {{ item.active ? "Activo" : "Suspenso" }}
              </span>
            </td>

            <td>
              <div class="flex items-center justify-end gap-1.5">
                <button
                  class="icon-btn"
                  title="Editar utilizador"
                  aria-label="Editar utilizador"
                  @click="openUser(item)"
                >
                  <AppIcon name="pencil" />
                </button>

                <button
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
                  />
                </button>

                <button
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
