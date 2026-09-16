<script setup lang="ts">
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import { plural } from "@/utils/formatters.ts";
import { useAccountManagementContext } from "@/composables/account/accountContext.ts";
const { state, money, business, service, professional, assignedServices } =
  useAccountManagementContext();
</script>
<template>
  <div>
    <div class="mb-5 flex flex-wrap items-center gap-2.5">
      <span class="badge badge-neutral">{{
        plural(
          assignedServices.length,
          "serviço atribuído",
          "serviços atribuídos",
        )
      }}</span
      ><span class="text-muted">{{ business(state.businessId)?.name }}</span>
    </div>
    <div
      v-if="assignedServices.length"
      class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <article
        v-for="item in assignedServices"
        :key="item.id"
        class="card flex flex-col gap-3 p-5"
      >
        <span
          class="inline-flex size-10 items-center justify-center rounded-lg bg-soft text-primary-text"
          ><AppIcon name="sparkles"
        /></span>
        <div class="min-w-0">
          <div class="flex items-center justify-between gap-3">
            <h2 class="mb-0 text-body-lg">{{ item.name }}</h2>
            <span
              :class="[
                'badge',
                item.active === false ? 'badge-neutral' : 'badge-success',
              ]"
              >{{ item.active === false ? "Inactivo" : "Disponível" }}</span
            >
          </div>
          <p class="mt-1 text-caption text-muted">
            {{
              item.description || "Atendimento com marcação no estabelecimento."
            }}
          </p>
          <div
            class="mt-3 flex items-center justify-between gap-3 text-caption text-muted"
          >
            <span class="flex items-center gap-1.5"
              ><AppIcon name="clock-3" :size="14" />
              {{ item.duration }} min</span
            ><strong class="text-body text-ink">{{ money(item.price) }}</strong>
          </div>
        </div>
      </article>
    </div>
    <div v-else class="empty-state">
      <AppIcon name="briefcase-business" />
      <h2>Ainda não tem serviços atribuídos</h2>
      <p>O gestor do estabelecimento pode associar serviços ao seu perfil.</p>
    </div>
  </div>
</template>
