<script setup lang="ts">
import { ref } from "vue";
import { plural } from "@/utils/formatters.ts";
import BusinessHistoryDialog from "@/components/manager/BusinessHistoryDialog.vue";
import type { StaffMember } from "@/types/domain.ts";
import InputText from "primevue/inputtext";
const historyOpen = ref(false),
  historySubject = ref<{
    type: "client" | "staff";
    id: string;
    name: string;
  } | null>(null);
function showHistory(item: StaffMember) {
  historySubject.value = { type: "staff", id: item.id, name: item.name };
  historyOpen.value = true;
}
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import ViewModeToggle from "@/components/shared/ui/ViewModeToggle.vue";
import { useListMode } from "@/composables/useListMode.ts";
import ManagerTeamPerformance from "@/components/manager/ManagerTeamPerformance.vue";
import { useBusinessManagementContext } from "@/composables/businesses/businessContext.ts";
const {
  state,
  services,
  team,
  query,
  staffFilter,
  serviceName,
  initials,
  filteredTeam,
  navigate,
  openEditor,
  requestRemoval,
} = useBusinessManagementContext();
const mode = useListMode("team");
</script>
<template>
  <div>
    <ManagerTeamPerformance />

    <h2 class="mb-5 text-h3">Todos os profissionais</h2>
    <div
      class="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
    >
      <label
        class="flex w-full items-center gap-2.5 rounded-4xl border border-line bg-surface px-3 text-muted sm:max-w-[390px] sm:flex-1"
      >
        <AppIcon name="search" :size="18" />
        <InputText
          v-model="query"
          placeholder="Pesquisar na equipa"
          aria-label="Pesquisar na equipa"
          class="w-full border-0 bg-transparent pl-0 text-caption"
        />
      </label>
      <span class="text-caption text-muted">{{
        plural(team.length, "membro", "membros")
      }}</span>
      <ViewModeToggle v-model="mode" />
    </div>
    <div v-if="!filteredTeam.length" class="empty-state">
      <AppIcon name="users" :size="34" />
      <h3>Nenhum membro encontrado</h3>
      <p>Adicione profissionais e associe os seus serviços.</p>
    </div>
    <div v-else-if="mode === 'table'" class="table-scroll">
      <table class="data-table">
        <thead>
          <tr>
            <th scope="col">Profissional</th>
            <th scope="col">Contactos</th>
            <th scope="col">Serviços</th>
            <th scope="col">Turno</th>
            <th scope="col">Estado</th>
            <th scope="col"><span class="sr-only">Acções</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="person in filteredTeam" :key="person.id">
            <th scope="row">
              <span class="block text-ink">{{ person.name }}</span>
              <small class="block text-caption text-muted">{{
                person.title || "Profissional"
              }}</small>
            </th>
            <td>
              <span class="block text-caption">{{ person.email || "Sem email" }}</span>
              <span class="block text-caption text-muted">{{
                person.phone || "Sem telefone"
              }}</span>
            </td>
            <td>
              {{
                person.serviceIds?.length
                  ? person.serviceIds.map(serviceName).join(", ")
                  : "Sem serviços atribuídos"
              }}
            </td>
            <td class="tabular">{{ person.start }} – {{ person.end }}</td>
            <td>
              <span
                :class="['badge', person.active ? 'badge-success' : 'badge-neutral']"
                >{{ person.active ? "Activo" : "Inactivo" }}</span
              >
            </td>
            <td>
              <div class="flex items-center gap-1">
                <button
                  class="icon-btn"
                  :aria-label="'Ver histórico de ' + person.name"
                  @click="showHistory(person)"
                >
                  <AppIcon name="history" :size="16" />
                </button>
                <button
                  class="icon-btn"
                  :aria-label="'Editar ' + person.name"
                  @click="openEditor('staff', person)"
                >
                  <AppIcon name="pencil" :size="16" />
                </button>
                <button
                  class="icon-btn"
                  :aria-label="'Ver agenda de ' + person.name"
                  @click="
                    state.businessAgendaStaffId = person.id;
                    navigate('agenda');
                  "
                >
                  <AppIcon name="calendar-days" :size="16" />
                </button>
                <button
                  class="icon-btn icon-btn-danger"
                  :aria-label="'Remover ' + person.name"
                  @click="requestRemoval('staff', person)"
                >
                  <AppIcon name="trash-2" :size="16" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="person in filteredTeam"
        :key="person.id"
        class="card flex flex-col p-5"
      >
        <div class="mb-3 flex items-center justify-between gap-3">
          <span class="avatar">{{ initials(person.name) }}</span>
          <span :class="['badge', person.active ? 'badge-success' : 'badge-neutral']">{{
            person.active ? "Activo" : "Inactivo"
          }}</span>
        </div>
        <h3>{{ person.name }}</h3>
        <p class="text-caption text-muted">
          {{ person.title || "Profissional" }}
        </p>
        <div class="mt-2 flex items-center gap-1.5 text-caption text-muted">
          <AppIcon name="mail" :size="15" />
          <span>{{ person.email || "Sem email" }}</span>
        </div>
        <div class="mt-1.5 flex items-center gap-1.5 text-caption text-muted">
          <AppIcon name="phone" :size="15" />
          <span>{{ person.phone || "Sem telefone" }}</span>
        </div>
        <div class="mt-3 flex flex-wrap gap-1.5">
          <span v-for="id in person.serviceIds" :key="id" class="badge badge-neutral">{{
            serviceName(id)
          }}</span>
          <span v-if="!person.serviceIds?.length" class="text-caption text-muted"
            >Sem serviços atribuídos</span
          >
        </div>
        <div class="mt-3 flex items-center gap-1.5 text-caption text-muted">
          <AppIcon name="clock-3" :size="15" />
          <span>{{ person.start }} – {{ person.end }}</span>
        </div>
        <footer class="mt-4 flex flex-wrap items-center gap-1 border-t border-line pt-4">
          <button
            type="button"
            class="icon-btn"
            :aria-label="'Ver histórico de ' + person.name"
            title="Ver histórico"
            @click="showHistory(person)"
          >
            <AppIcon name="history" :size="18" />
          </button>
          <button class="btn btn-secondary" @click="openEditor('staff', person)">
            <AppIcon name="pencil" :size="15" /> Editar
          </button>
          <button
            class="icon-btn"
            title="Ver agenda do profissional"
            @click="
              state.businessAgendaStaffId = person.id;
              navigate('agenda');
            "
          >
            <AppIcon name="calendar-days" :size="17" />
          </button>
          <button
            class="icon-btn icon-btn-danger"
            title="Eliminar membro"
            @click="requestRemoval('staff', person)"
          >
            <AppIcon name="trash-2" :size="17" />
          </button>
        </footer>
      </article>
    </div>
    <BusinessHistoryDialog v-model="historyOpen" :subject="historySubject" />
  </div>
</template>
