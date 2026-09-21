<script setup lang="ts">
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import InsightCard from "@/components/shared/analytics/InsightCard.vue";

import { plural } from "@/utils/formatters.ts";
import { usePlatformManagementContext } from "@/composables/platform/platformContext.ts";

import InputText from "primevue/inputtext";
import Select from "primevue/select";

const {
  business,
  isPlatform,
  dateTime,
  ticketSearch,
  ticketStatus,
  tickets,
  ticketsByStatus,
  openTickets,
  urgentTickets,
  resolutionRate,
  filteredTickets,
  ticketStatusNames,
  ticketPriorityNames,
  openNewTicket,
  openConversation,
} = usePlatformManagementContext();
</script>

<template>
  <div>
    <div class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <InsightCard
        label="Por resolver"
        :value="String(openTickets.length)"
        icon="ticket"
        :detail="`de ${plural(
          tickets.length,
          'pedido recebido',
          'pedidos recebidos',
        )}`"
        tone="primary"
      />

      <InsightCard
        label="A aguardar análise"
        :value="String(ticketsByStatus.open || 0)"
        icon="clock"
        detail="ainda sem ninguém atribuído"
        tone="blue"
      />

      <InsightCard
        label="Prioridade alta"
        :value="String(urgentTickets)"
        icon="circle-alert"
        :detail="
          urgentTickets
            ? 'por resolver, marcados como altos ou urgentes'
            : 'nada urgente em aberto'
        "
        tone="amber"
      />

      <InsightCard
        label="Resolvidos"
        :value="String(ticketsByStatus.closed || 0)"
        icon="check-check"
        :detail="
          tickets.length
            ? `${resolutionRate}% de tudo o que entrou`
            : 'ainda sem pedidos'
        "
        tone="violet"
      />
    </div>

    <div
      class="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
    >
      <label
        class="flex min-h-11 w-full flex-1 items-center gap-2 rounded-4xl border border-line bg-surface px-3 text-muted sm:min-w-[170px] sm:max-w-[390px]"
      >
        <AppIcon name="search" />

        <InputText
          v-model="ticketSearch"
          placeholder="Pesquisar pedidos de suporte"
          aria-label="Pesquisar pedidos"
          class="w-full border-0 bg-transparent pl-0 text-caption outline-offset-0"
        />
      </label>

      <Select
        v-model="ticketStatus"
        aria-label="Estado do pedido"
        class="w-full text-caption sm:w-auto"
        :options="[
          { label: 'Todos os pedidos', value: 'all' },
          { label: 'Abertos', value: 'open' },
          { label: 'Em análise', value: 'in_progress' },
          { label: 'Resolvidos', value: 'closed' },
        ]"
        option-label="label"
        option-value="value"
        append-to="self"
      />
    </div>

    <div
      v-if="filteredTickets.length"
      class="flex flex-col gap-3"
    >
      <button
        v-for="item in filteredTickets"
        :key="item.id"
        type="button"
        class="flex w-full items-start gap-4 rounded-4xl border border-line bg-surface p-4 text-left transition-colors hover:border-primary-text/30 hover:bg-surface-muted sm:items-center"
        @click="openConversation(item)"
      >
        <span
          class="inline-grid size-11 shrink-0 place-items-center rounded-full bg-surface-muted text-muted"
        >
          <AppIcon
            :name="
              item.status === 'closed'
                ? 'circle-check'
                : 'messages-square'
            "
          />
        </span>

        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <h2 class="mb-0 text-body">
              {{ item.subject }}
            </h2>

            <span
              :class="[
                'badge rounded-4xl',
                item.status === 'closed'
                  ? 'badge-success'
                  : item.status === 'in_progress'
                    ? 'badge-warning'
                    : 'badge-neutral',
              ]"
            >
              {{ ticketStatusNames[item.status] || item.status }}
            </span>
          </div>

          <p
            v-if="isPlatform"
            class="mt-0.5 text-caption text-muted"
          >
            {{ business(item.businessId)?.name || "Plataforma" }}
          </p>

          <p class="mt-1 truncate text-caption text-muted">
            {{ item.messages?.at(-1)?.body }}
          </p>

          <div
            class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-caption text-muted"
          >
            <span
              class="flex items-center gap-1"
              :class="{
                'text-danger': ['high', 'urgent'].includes(
                  item.priority,
                ),
              }"
            >
              <AppIcon name="flag" :size="14" />

              Prioridade
              {{ ticketPriorityNames[item.priority] || item.priority }}
            </span>

            <span>
              {{
                plural(
                  item.messages?.length || 0,
                  "mensagem",
                  "mensagens",
                )
              }}
            </span>

            <time>
              {{
                dateTime(
                  item.updatedAt ||
                    item.createdAt ||
                    item.messages?.at(-1)?.createdAt,
                )
              }}
            </time>
          </div>
        </div>

        <AppIcon
          name="chevron-right"
          class="ml-auto shrink-0 self-center text-muted"
        />
      </button>
    </div>

    <div v-else class="empty-state">
      <AppIcon name="headset" />

      <h2>
        {{
          ticketSearch
            ? "Nenhum pedido encontrado"
            : "Como podemos ajudar?"
        }}
      </h2>

      <p>
        Crie um pedido para acompanhar uma dúvida ou situação do seu
        estabelecimento.
      </p>

      <button
        v-if="!ticketSearch"
        type="button"
        class="btn btn-primary"
        @click="openNewTicket"
      >
        Novo pedido
      </button>
    </div>
  </div>
</template>