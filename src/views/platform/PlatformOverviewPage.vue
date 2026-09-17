<script setup lang="ts">
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import RoleDashboard from "@/components/shared/analytics/RoleDashboard.vue";
import { usePlatformManagementContext } from "@/composables/platform/platformContext.ts";
const {
  state,
  go,
  business,
  businesses,
  dateTime,
  initials,
  recentLogs,
  openCompany,
} = usePlatformManagementContext();
</script>
<template>
  <div>
    <RoleDashboard role="platform" />
    <section class="mb-10">
      <div class="mb-5 flex items-center justify-between gap-4">
        <h2 class="mb-0">Estabelecimentos da rede</h2>
        <button class="btn btn-secondary" @click="go('companies')">
          Ver todos <AppIcon name="arrow-right" />
        </button>
      </div>
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>Estabelecimento</th>
              <th>Sector</th>
              <th>Cidade</th>
              <th>Marcações</th>
              <th>Estado</th>
              <th><span class="sr-only">Acções</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in businesses.slice(0, 5)" :key="item.id">
              <td>
                <div class="flex items-center gap-3">
                  <img
                    v-if="item.image"
                    :src="item.image"
                    alt=""
                    class="size-[46px] shrink-0 rounded-full object-cover"
                  /><span v-else class="avatar">{{ initials(item.name) }}</span
                  ><strong class="text-small text-ink">{{ item.name }}</strong>
                </div>
              </td>
              <td>{{ item.category }}</td>
              <td>{{ item.city }}</td>
              <td>
                {{
                  state.db.bookings.filter(
                    (booking) => booking.businessId === item.id,
                  ).length
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
                <button
                  class="icon-btn"
                  title="Editar estabelecimento"
                  aria-label="Editar estabelecimento"
                  @click="openCompany(item)"
                >
                  <AppIcon name="pencil" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
    <section>
      <div class="mb-5 flex items-center justify-between gap-4">
        <h2 class="mb-0">Actividade recente</h2>
        <button class="btn btn-secondary" @click="go('monitoring')">
          Ver registo <AppIcon name="arrow-right" />
        </button>
      </div>
      <div v-if="recentLogs.length">
        <div
          v-for="item in recentLogs"
          :key="item.id"
          class="flex items-center gap-3 border-b border-line py-3 last:border-b-0"
        >
          <span class="size-2 shrink-0 rounded-full bg-primary"></span>
          <div class="min-w-0 flex-1">
            <strong class="block truncate text-small text-ink">{{
              item.action
            }}</strong
            ><small class="block truncate text-caption text-muted"
              >{{
                state.db.users.find((user) => user.id === item.userId)?.name ||
                "Sistema"
              }}<template v-if="business(item.businessId)">
                · {{ business(item.businessId)?.name }}</template
              ></small
            >
          </div>
          <time class="shrink-0 text-caption text-muted">{{
            dateTime(item.createdAt)
          }}</time>
        </div>
      </div>
      <div v-else class="empty-state py-8">
        <AppIcon name="activity" />
        <p>As operações efectuadas na plataforma serão registadas aqui.</p>
      </div>
    </section>
  </div>
</template>
