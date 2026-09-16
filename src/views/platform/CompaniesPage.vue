<script setup lang="ts">
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import { plural } from "@/utils/formatters.ts";
import { usePlatformManagementContext } from "@/composables/platform/platformContext.ts";
const {
  state,
  categories,
  businesses,
  initials,
  companySearch,
  companyCategory,
  companyStatus,
  filteredCompanies,
  openCompany,
  requestRemoval,
  toggleCompany,
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
          v-model="companySearch"
          placeholder="Pesquisar estabelecimento"
          aria-label="Pesquisar estabelecimento"
          class="w-full border-0 bg-transparent pl-0 text-caption outline-offset-0"
      /></label>
      <select
        v-model="companyCategory"
        aria-label="Sector"
        class="w-full text-caption sm:w-auto"
      >
        <option value="all">Todos os sectores</option>
        <option
          v-for="category in [
            ...new Set([
              ...categories,
              ...businesses.map((item) => item.category),
            ]),
          ]"
          :key="category"
        >
          {{ category }}
        </option></select
      ><select
        v-model="companyStatus"
        aria-label="Estado"
        class="w-full text-caption sm:w-auto"
      >
        <option value="all">Todos os estados</option>
        <option value="active">Activos</option>
        <option value="inactive">Suspensos</option>
      </select>
    </div>
    <div class="mb-4 text-caption text-muted">
      {{
        plural(filteredCompanies.length, "estabelecimento", "estabelecimentos")
      }}
    </div>
    <div v-if="filteredCompanies.length" class="table-scroll">
      <table class="data-table">
        <thead>
          <tr>
            <th>Estabelecimento</th>
            <th>Sector</th>
            <th>Contacto</th>
            <th>Equipa</th>
            <th>Estado</th>
            <th><span class="sr-only">Acções</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredCompanies" :key="item.id">
            <td>
              <div class="flex items-center gap-3">
                <img
                  v-if="item.image"
                  :src="item.image"
                  alt=""
                  class="size-[46px] shrink-0 rounded-full object-cover"
                /><span v-else class="avatar">{{ initials(item.name) }}</span>
                <div>
                  <strong class="block text-small text-ink">{{
                    item.name
                  }}</strong
                  ><small class="mt-0.5 block text-caption text-muted">{{
                    item.city
                  }}</small>
                </div>
              </div>
            </td>
            <td>{{ item.category }}</td>
            <td>
              {{ item.email
              }}<small class="mt-0.5 block text-caption text-muted">{{
                item.phone
              }}</small>
            </td>
            <td>
              {{
                plural(
                  state.db.staff.filter(
                    (person) => person.businessId === item.id && person.active,
                  ).length,
                  "profissional",
                  "profissionais",
                )
              }}
            </td>
            <td>
              <span
                :class="[
                  'badge',
                  item.active ? 'badge-success' : 'badge-neutral',
                ]"
                >{{ item.active ? "Activo" : "Suspenso" }}</span
              >
            </td>
            <td>
              <div class="flex items-center justify-end gap-1.5">
                <button
                  class="icon-btn"
                  title="Editar estabelecimento"
                  aria-label="Editar estabelecimento"
                  @click="openCompany(item)"
                >
                  <AppIcon name="pencil" /></button
                ><button
                  class="icon-btn"
                  :title="
                    item.active
                      ? 'Suspender estabelecimento'
                      : 'Activar estabelecimento'
                  "
                  :aria-label="
                    item.active
                      ? 'Suspender estabelecimento'
                      : 'Activar estabelecimento'
                  "
                  @click="toggleCompany(item)"
                >
                  <AppIcon :name="item.active ? 'pause' : 'play'" /></button
                ><button
                  class="icon-btn"
                  title="Remover estabelecimento"
                  aria-label="Remover estabelecimento"
                  @click="requestRemoval('businesses', item)"
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
      <AppIcon name="building-2" />
      <h2>Nenhum estabelecimento encontrado</h2>
      <p>Altere os filtros ou adicione um estabelecimento à rede.</p>
      <button class="btn btn-primary" @click="openCompany()">
        Novo estabelecimento
      </button>
    </div>
  </div>
</template>
