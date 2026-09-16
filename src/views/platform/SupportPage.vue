<script setup lang="ts">
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import { plural } from "@/utils/formatters.ts";
import { usePlatformManagementContext } from "@/composables/platform/platformContext.ts";
const {
  state,
  business,
  isPlatform,
  dateTime,
  ticketSearch,
  ticketStatus,
  tickets,
  filteredTickets,
  ticketStatusNames,
  ticketPriorityNames,
  openNewTicket,
  openConversation,
} = usePlatformManagementContext();
</script>
<template>
  <div>
    <div class="mb-8 grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-3">
      <div class="min-w-0 border-b border-line py-4 pr-4 sm:py-5 sm:pr-5">
        <span class="text-caption text-muted">Pedidos abertos</span
        ><strong
          class="my-2 block text-2xl leading-tight break-words sm:text-[clamp(24px,7vw,28px)]"
          >{{ tickets.filter((item) => item.status === "open").length }}</strong
        ><span class="text-caption text-muted">a aguardar análise</span>
      </div>
      <div class="min-w-0 border-b border-line py-4 pr-4 sm:py-5 sm:pr-5">
        <span class="text-caption text-muted">Em análise</span
        ><strong
          class="my-2 block text-2xl leading-tight break-words sm:text-[clamp(24px,7vw,28px)]"
          >{{
            tickets.filter((item) => item.status === "in_progress").length
          }}</strong
        ><span class="text-caption text-muted">com acompanhamento</span>
      </div>
      <div class="min-w-0 border-b border-line py-4 pr-4 sm:py-5 sm:pr-5">
        <span class="text-caption text-muted">Resolvidos</span
        ><strong
          class="my-2 block text-2xl leading-tight break-words sm:text-[clamp(24px,7vw,28px)]"
          >{{
            tickets.filter((item) => item.status === "closed").length
          }}</strong
        ><span class="text-caption text-muted">pedidos concluídos</span>
      </div>
    </div>
    <div
      class="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
    >
      <label
        class="flex min-h-11 flex-1 items-center gap-2 rounded-md border border-line bg-surface px-3 text-muted sm:min-w-[170px] sm:max-w-[390px]"
        ><AppIcon name="search" /><input
          v-model="ticketSearch"
          placeholder="Pesquisar pedidos de suporte"
          aria-label="Pesquisar pedidos"
          class="w-full border-0 bg-transparent pl-0 text-caption outline-offset-0"
      /></label>
      <select
        v-model="ticketStatus"
        aria-label="Estado do pedido"
        class="w-full text-caption sm:w-auto"
      >
        <option value="all">Todos os pedidos</option>
        <option value="open">Abertos</option>
        <option value="in_progress">Em análise</option>
        <option value="closed">Resolvidos</option>
      </select>
    </div>
    <div v-if="filteredTickets.length" class="flex flex-col gap-3">
      <button
        v-for="item in filteredTickets"
        :key="item.id"
        class="flex w-full items-start gap-4 rounded-lg border border-line bg-surface p-4 text-left hover:border-primary-text/30 hover:bg-surface-muted sm:items-center"
        @click="openConversation(item)"
      >
        <span
          class="inline-grid size-11 shrink-0 place-items-center rounded-full bg-surface-muted text-muted"
          ><AppIcon
            :name="
              item.status === 'closed' ? 'circle-check' : 'messages-square'
            "
        /></span>
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <h2 class="mb-0 text-body">{{ item.subject }}</h2>
            <span
              :class="[
                'badge',
                item.status === 'closed'
                  ? 'badge-success'
                  : item.status === 'in_progress'
                    ? 'badge-warning'
                    : 'badge-neutral',
              ]"
              >{{ ticketStatusNames[item.status] || item.status }}</span
            >
          </div>
          <p v-if="isPlatform" class="mt-0.5 text-caption text-muted">
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
                'text-danger': ['high', 'urgent'].includes(item.priority),
              }"
              ><AppIcon name="flag" :size="14" /> Prioridade
              {{ ticketPriorityNames[item.priority] || item.priority }}</span
            ><span>{{
              plural(item.messages?.length || 0, "mensagem", "mensagens")
            }}</span
            ><time>{{
              dateTime(
                item.updatedAt ||
                  item.createdAt ||
                  item.messages?.at(-1)?.createdAt,
              )
            }}</time>
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
        {{ ticketSearch ? "Nenhum pedido encontrado" : "Como podemos ajudar?" }}
      </h2>
      <p>
        Crie um pedido para acompanhar uma dúvida ou situação do seu
        estabelecimento.
      </p>
      <button
        v-if="!ticketSearch"
        class="btn btn-primary"
        @click="openNewTicket"
      >
        Novo pedido
      </button>
    </div>
  </div>
</template>
