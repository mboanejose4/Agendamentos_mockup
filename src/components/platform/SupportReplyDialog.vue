<script setup lang="ts">
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import AppModal from "@/components/shared/ui/AppModal.vue";
import { usePlatformManagementContext } from "@/composables/platform/platformContext.ts";
const {
  state,
  business,
  currentUser,
  dateTime,
  ticketStatusNames,
  ticketPriorityNames,
  conversationOpen,
  selectedTicket,
  reply,
  sendReply,
  changeTicketStatus,
} = usePlatformManagementContext();
</script>
<template>
  <AppModal v-model="conversationOpen" title="Pedido de suporte" :width="700"
    ><template v-if="selectedTicket"
      ><div class="mb-1 flex items-center justify-between gap-3">
        <h2 class="mb-0">{{ selectedTicket.subject }}</h2>
        <span
          :class="[
            'badge',
            selectedTicket.status === 'closed'
              ? 'badge-success'
              : 'badge-warning',
          ]"
          >{{
            ticketStatusNames[selectedTicket.status] || selectedTicket.status
          }}</span
        >
      </div>
      <p class="mb-5 text-caption text-muted">
        {{ business(selectedTicket.businessId)?.name }} · Prioridade
        {{
          ticketPriorityNames[selectedTicket.priority] ||
          selectedTicket.priority
        }}
      </p>
      <div class="mb-6 flex max-h-80 flex-col gap-3 overflow-y-auto pr-1">
        <article
          v-for="(message, index) in selectedTicket.messages || []"
          :key="index"
          class="max-w-[88%] rounded-lg border border-line bg-surface-muted p-3.5"
          :class="{
            'ml-auto border-primary-text/30 bg-soft':
              message.userId === state.userId ||
              message.author === currentUser.name,
          }"
        >
          <div
            class="mb-1.5 flex items-center justify-between gap-3 text-caption"
          >
            <strong class="text-ink">{{ message.author }}</strong
            ><time class="text-muted">{{ dateTime(message.createdAt) }}</time>
          </div>
          <p class="text-small">{{ message.body }}</p>
        </article>
      </div>
      <form
        v-if="selectedTicket.status !== 'closed'"
        class="mt-6 border-t border-line pt-6"
        @submit.prevent="sendReply"
      >
        <label class="field"
          >A sua resposta<textarea
            v-model="reply"
            rows="3"
            maxlength="5000"
            required
            placeholder="Escreva a sua mensagem…"
          ></textarea>
        </label>
        <div class="form-actions">
          <button
            type="button"
            class="btn btn-secondary"
            @click="changeTicketStatus('closed')"
          >
            <AppIcon name="circle-check" /> Marcar como resolvido</button
          ><button
            type="submit"
            class="btn btn-primary"
            :disabled="!reply.trim()"
          >
            <AppIcon name="send" /> Responder
          </button>
        </div>
      </form>
      <div v-else class="empty-state">
        <AppIcon name="circle-check" />
        <p>Este pedido está resolvido.</p>
        <button class="btn btn-secondary" @click="changeTicketStatus('open')">
          Reabrir pedido
        </button>
      </div></template
    ></AppModal
  >
</template>
