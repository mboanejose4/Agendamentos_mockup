<script setup>
import { ref } from "vue";
import BusinessHistoryDialog from "@/Component/businesses/BusinessHistoryDialog.vue";
const historyOpen = ref(false),
  historySubject = ref(null);
function showHistory(item) {
  historySubject.value = { type: "staff", id: item.id, name: item.name };
  historyOpen.value = true;
}
import AppIcon from "@/Component/ui/AppIcon.vue";
import { useBusinessManagementContext } from "@/Composable/businesses/businessContext.js";
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
</script>
<template>
  <div>
    <div
      class="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
    >
      <label
        class="flex w-full items-center gap-2.5 rounded-md border border-line bg-surface px-3 text-muted sm:max-w-[390px] sm:flex-1"
      >
        <AppIcon name="search" :size="18" />
        <input
          v-model="query"
          placeholder="Pesquisar na equipa"
          aria-label="Pesquisar na equipa"
          class="w-full border-0 bg-transparent pl-0 text-caption focus-visible:outline-offset-0"
        />
      </label>
      <span class="text-caption text-muted">{{ team.length }} membros</span>
    </div>
    <div v-if="!filteredTeam.length" class="empty-state">
      <AppIcon name="users" :size="34" />
      <h3>Nenhum membro encontrado</h3>
      <p>Adicione profissionais e associe os seus serviços.</p>
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
        <p class="text-caption text-muted">{{ person.title || "Profissional" }}</p>
        <div class="mt-2 flex items-center gap-1.5 text-caption text-muted">
          <AppIcon name="mail" :size="15" />
          <span>{{ person.email || "Sem email" }}</span>
        </div>
        <div class="mt-1.5 flex items-center gap-1.5 text-caption text-muted">
          <AppIcon name="phone" :size="15" />
          <span>{{ person.phone || "Sem telefone" }}</span>
        </div>
        <div class="mt-3 flex flex-wrap gap-1.5">
          <span
            v-for="id in person.serviceIds"
            :key="id"
            class="badge badge-neutral"
            >{{ serviceName(id) }}</span
          >
          <span v-if="!person.serviceIds?.length" class="text-caption text-muted"
            >Sem serviços atribuídos</span
          >
        </div>
        <div class="mt-3 flex items-center gap-1.5 text-caption text-muted">
          <AppIcon name="clock-3" :size="15" />
          <span>{{ person.start }} – {{ person.end }}</span>
        </div>
        <footer
          class="mt-4 flex flex-wrap items-center gap-1 border-t border-line pt-4"
        >
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
