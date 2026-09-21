<script setup lang="ts">
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import RoleDashboard from "@/components/shared/analytics/RoleDashboard.vue";
import { useAccountManagementContext } from "@/composables/account/accountContext.ts";
import InputText from "primevue/inputtext";
const {
  state,
  go,
  money,
  dateLabel,
  business,
  service,
  staffMember,
  statusNames,
  statusClass,
  upcoming,
  appointmentTab,
  search,
  filteredAppointments,
  openBooking,
  history,
} = useAccountManagementContext();
</script>
<template>
  <div>
    <RoleDashboard role="client" />
    <div
      class="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
    >
      <div class="tabs" aria-label="Filtrar agendamentos">
        <button
          :class="{ active: appointmentTab === 'upcoming' }"
          @click="appointmentTab = 'upcoming'"
        >
          Próximos <span>{{ upcoming.length }}</span></button
        ><button
          :class="{ active: appointmentTab === 'history' }"
          @click="appointmentTab = 'history'"
        >
          Histórico</button
        ><button
          :class="{ active: appointmentTab === 'all' }"
          @click="appointmentTab = 'all'"
        >
          Todos
        </button>
      </div>
      <div
        class="booking-search flex min-w-0 items-center gap-2.5 rounded-4xl border border-line bg-surface px-3 sm:max-w-[390px] sm:flex-1"
      >
        <AppIcon name="search" :size="18" class="shrink-0 text-muted" />

        <InputText
          v-model="search"
          type="search"
          placeholder="Pesquisar agendamentos"
          aria-label="Pesquisar agendamentos"
          class="booking-search__input !min-w-0 !flex-1 !rounded-4xl !border-0 !bg-transparent !pl-0 !text-caption !shadow-none"
        />
      </div>
    </div>
    <div v-if="filteredAppointments.length" class="flex flex-col gap-4">
      <article
        v-for="item in filteredAppointments"
        :key="item.id"
        class="card rounded-4xl flex flex-col overflow-hidden sm:flex-row"
      >
        <img
          v-if="business(item.businessId)?.image"
          :src="business(item.businessId)?.image"
          :alt="business(item.businessId)?.name"
          class="h-40 w-full shrink-0 object-cover sm:h-auto sm:w-48"
        />
        <div
          v-else
          class="flex h-40 w-full shrink-0 items-center justify-center bg-surface-muted text-muted sm:h-auto sm:w-48"
        >
          <AppIcon name="store" :size="28" />
        </div>
        <div class="min-w-0 flex-1 p-4 sm:p-5">
          <div class="mb-1 flex flex-wrap items-center justify-between gap-2">
            <span class="text-caption text-muted">
              {{ business(item.businessId)?.name || "Estabelecimento" }}
            </span>

            <span
              :class="[
                'badge',
                'rounded-4xl',
                `badge-${statusClass(item.status)}`,
              ]"
            >
              {{ statusNames[item.status] }}
            </span>
          </div>
          <h2 class="mb-1 text-body-lg">
            {{ service(item.serviceId)?.name || "Serviço" }}
          </h2>
          <div
            class="flex flex-wrap items-center gap-x-4 gap-y-1 text-caption text-muted"
          >
            <span class="flex items-center gap-1.5">
              <AppIcon name="calendar-days" :size="14" />
              {{ dateLabel(item.date) }} </span
            ><span class="flex items-center gap-1.5">
              <AppIcon name="clock-3" :size="14" /> {{ item.time }} ·
              {{ item.duration }} min </span
            ><span class="flex items-center gap-1.5">
              <AppIcon name="user-round" :size="14" />
              {{
                staffMember(item.staffId)?.name || "Equipa do estabelecimento"
              }}
            </span>
          </div>
          <div
            class="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3"
          >
            <strong class="text-body-lg text-ink">{{
              money(item.total)
            }}</strong
            ><button class="btn btn-secondary" @click="openBooking(item)">
              Ver detalhes
              <AppIcon name="arrow-up-right" />
            </button>
          </div>
        </div>
      </article>
    </div>
    <div v-else class="empty-state">
      <AppIcon name="calendar-days" />
      <h2>
        {{ search ? "Nenhum resultado encontrado" : "A sua agenda tem espaço" }}
      </h2>
      <p>
        {{
          search
            ? "Experimente outro serviço ou estabelecimento."
            : "Encontre um estabelecimento e escolha o melhor horário para si."
        }}
      </p>
      <button v-if="!search" class="btn btn-primary" @click="go('explore')">
        Explorar estabelecimentos
        <AppIcon name="arrow-right" />
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Container exterior */
.booking-search {
  border: 1px solid var(--border-strong);
  border-radius: 2rem;
  background-color: var(--surface);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

/* O foco aparece apenas na borda exterior */
.booking-search:focus-within {
  border-color: var(--primary);
  box-shadow: 0 0 0 1px var(--primary);
}

/* Input PrimeVue sem borda ou ring interno */
.booking-search :deep(.p-inputtext) {
  flex: 1;
  min-width: 0;
  width: 100%;

  border: none !important;
  border-radius: 2rem !important;
  background: transparent !important;
  color: var(--ink) !important;

  outline: none !important;
  box-shadow: none !important;

  /* Remove o ring aplicado pelo Tailwind */
  --tw-ring-shadow: 0 0 #0000 !important;
}

/* Remove o foco interno em todos os estados */
.booking-search :deep(.p-inputtext:focus),
.booking-search :deep(.p-inputtext:focus-visible),
.booking-search :deep(.p-inputtext:active) {
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  --tw-ring-shadow: 0 0 #0000 !important;
}

.booking-search :deep(.p-inputtext::placeholder) {
  color: var(--muted);
}
</style>
