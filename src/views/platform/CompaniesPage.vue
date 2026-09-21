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
  money,
  categories,
  businesses,
  activeBusinesses,
  suspendedBusinesses,
  totalBookings,
  paidVolume,
  averageRating,
  reviewTotal,
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
    <div class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <InsightCard
        label="Estabelecimentos activos"
        :value="String(activeBusinesses.length)"
        icon="building-2"
        :detail="
          suspendedBusinesses
            ? `de ${businesses.length} registados · ${suspendedBusinesses} suspensos`
            : `de ${plural(businesses.length, 'registado', 'registados')}`
        "
        tone="primary"
      />
      <InsightCard
        label="Marcações confirmadas"
        :value="String(totalBookings.length)"
        icon="calendar-check"
        :detail="'em toda a plataforma, sem contar as canceladas'"
        tone="blue"
      />
      <InsightCard
        label="Volume pago"
        :value="money(paidVolume)"
        icon="wallet"
        :detail="'pagamentos já concluídos'"
        tone="amber"
      />
      <InsightCard
        label="Avaliação média"
        :value="averageRating ? averageRating.toFixed(1) : '—'"
        icon="star"
        :detail="
          reviewTotal
            ? `ponderada por ${plural(reviewTotal, 'avaliação', 'avaliações')}`
            : 'ainda sem avaliações'
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
          v-model="companySearch"
          placeholder="Pesquisar estabelecimento"
          aria-label="Pesquisar estabelecimento"
          class="w-full text-caption"
        />
      </IconField>

      <!-- Filtros alinhados à direita no desktop -->
      <div
        class="flex w-full flex-col gap-3 sm:ml-auto sm:w-auto sm:flex-row sm:items-center"
      >
        <Select
          v-model="companyCategory"
          aria-label="Sector"
          class="w-full text-caption sm:min-w-[180px] sm:w-auto"
          :options="[
            { label: 'Todos os sectores', value: 'all' },
            ...[
              ...new Set([
                ...categories,
                ...businesses.map((item) => item.category),
              ]),
            ].map((category) => ({
              label: category,
              value: category,
            })),
          ]"
          option-label="label"
          option-value="value"
          append-to="self"
        />

        <Select
          v-model="companyStatus"
          aria-label="Estado"
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
            <th>
              <span class="sr-only">Acções</span>
            </th>
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
                />

                <span v-else class="avatar">
                  {{ initials(item.name) }}
                </span>

                <div>
                  <strong class="block text-small text-ink">
                    {{ item.name }}
                  </strong>

                  <small class="mt-0.5 block text-caption text-muted">
                    {{ item.city }}
                  </small>
                </div>
              </div>
            </td>

            <td>{{ item.category }}</td>

            <td>
              {{ item.email }}

              <small class="mt-0.5 block text-caption text-muted">
                {{ item.phone }}
              </small>
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
                  title="Editar estabelecimento"
                  aria-label="Editar estabelecimento"
                  @click="openCompany(item)"
                >
                  <AppIcon name="pencil" />
                </button>

                <button
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
                  <AppIcon :name="item.active ? 'pause' : 'play'" />
                </button>

                <button
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

      <button class="btn btn-primary" type="button" @click="openCompany()">
        Novo estabelecimento
      </button>
    </div>
  </div>
</template>
