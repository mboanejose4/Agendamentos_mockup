<script setup>
import AppIcon from "@/Component/ui/AppIcon.vue";
import { usePlatformManagementContext } from "@/Composable/platform/platformContext.js";
const {
  state,
  go,
  money,
  today,
  business,
  businesses,
  activeBusinesses,
  totalBookings,
  paidVolume,
  activeUsers,
  dateTime,
  initials,
  activityDays,
  maxDayCount,
  categoryDistribution,
  recentLogs,
  openCompany,
  openTickets,
} = usePlatformManagementContext();
</script>
<template>
  <div>
    <div class="mb-8 grid grid-cols-2 gap-x-4 gap-y-5 sm:gap-x-5 lg:grid-cols-4">
      <div class="min-w-0 border-b border-line py-4 pr-4 sm:py-5 sm:pr-5">
        <span class="text-caption text-muted">Estabelecimentos activos</span
        ><strong
          class="my-2 block text-2xl leading-tight break-words sm:text-[clamp(24px,7vw,28px)]"
          >{{ activeBusinesses.length }}</strong
        ><span class="text-caption text-muted"
          >{{ businesses.length }} no total</span
        >
      </div>
      <div class="min-w-0 border-b border-line py-4 pr-4 sm:py-5 sm:pr-5">
        <span class="text-caption text-muted">Utilizadores activos</span
        ><strong
          class="my-2 block text-2xl leading-tight break-words sm:text-[clamp(24px,7vw,28px)]"
          >{{ activeUsers.length }}</strong
        ><span class="text-caption text-muted">em todos os perfis</span>
      </div>
      <div class="min-w-0 border-b border-line py-4 pr-4 sm:py-5 sm:pr-5">
        <span class="text-caption text-muted">Agendamentos</span
        ><strong
          class="my-2 block text-2xl leading-tight break-words sm:text-[clamp(24px,7vw,28px)]"
          >{{ totalBookings.length }}</strong
        ><span class="text-caption text-muted">excluindo cancelamentos</span>
      </div>
      <div class="min-w-0 border-b border-line py-4 pr-4 sm:py-5 sm:pr-5">
        <span class="text-caption text-muted">Pagamentos registados</span
        ><strong
          class="my-2 block text-2xl leading-tight break-words sm:text-[clamp(24px,7vw,28px)]"
          >{{ money(paidVolume) }}</strong
        ><span class="text-caption text-muted">volume acumulado</span>
      </div>
    </div>
    <div
      class="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-8"
    >
      <section>
        <div class="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 class="mb-0">Actividade de agendamentos</h2>
            <p class="mt-1.5 text-caption text-muted">Últimos 7 dias</p>
          </div>
          <AppIcon name="chart-no-axes-column" class="shrink-0 text-muted" />
        </div>
        <div
          class="flex items-end gap-2 sm:gap-3"
          role="img"
          :aria-label="
            activityDays
              .map((day) => `${day.label}: ${day.count} agendamentos`)
              .join(', ')
          "
        >
          <div
            v-for="day in activityDays"
            :key="day.iso"
            class="flex flex-1 flex-col items-center gap-2"
          >
            <span
              class="text-caption font-semibold"
              :class="day.iso === today() ? 'text-ink' : 'text-muted'"
              >{{ day.count }}</span
            >
            <div
              class="flex h-28 w-full items-end overflow-hidden rounded bg-soft sm:h-36"
            >
              <span
                class="w-full rounded bg-primary"
                :style="{
                  height: `${day.count ? Math.max(5, (day.count / maxDayCount) * 100) : 2}%`,
                }"
              ></span>
            </div>
            <span
              class="text-caption"
              :class="day.iso === today() ? 'font-semibold text-ink' : 'text-muted'"
              >{{ day.label }}</span
            >
          </div>
        </div>
      </section>
      <section>
        <h2 class="mb-5">Uma plataforma, vários sectores</h2>
        <div
          v-for="(item, index) in categoryDistribution"
          :key="item.category"
          class="mb-4"
        >
          <div class="mb-1.5 flex items-center gap-2 text-caption">
            <span
              class="size-2 shrink-0 rounded-full"
              :class="
                ['bg-primary', 'bg-secondary', 'bg-warning', 'bg-success', 'bg-danger'][
                  index % 5
                ]
              "
            ></span
            ><span class="min-w-0 flex-1 truncate text-ink">{{
              item.category
            }}</span
            ><strong class="text-ink">{{ item.count }}</strong>
          </div>
          <div class="h-1.5 w-full overflow-hidden rounded-full bg-soft">
            <span
              class="block h-full rounded-full"
              :class="
                ['bg-primary', 'bg-secondary', 'bg-warning', 'bg-success', 'bg-danger'][
                  index % 5
                ]
              "
              :style="{
                width: `${(item.count / Math.max(1, businesses.length)) * 100}%`,
              }"
            ></span>
          </div>
        </div>
        <div class="mt-5 flex items-center gap-3 border-t border-line pt-5">
          <span class="flex flex-1 items-center gap-2 text-small text-muted"
            ><AppIcon name="messages-square" :size="18" /> Pedidos de suporte
            abertos</span
          ><strong class="text-body-lg text-ink">{{ openTickets.length }}</strong
          ><button
            class="icon-btn"
            title="Abrir suporte"
            aria-label="Abrir suporte"
            @click="go('support')"
          >
            <AppIcon name="arrow-up-right" />
          </button>
        </div>
      </section>
    </div>
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
                    class="size-[46px] shrink-0 rounded-full object-cover" /><span
                    v-else
                    class="avatar"
                    >{{ initials(item.name) }}</span
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
                <span :class="['badge', item.active ? 'badge-success' : 'badge-neutral']">{{
                  item.active ? "Activo" : "Suspenso"
                }}</span>
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
                · {{ business(item.businessId).name }}</template
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
