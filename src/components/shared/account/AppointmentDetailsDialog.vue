<script setup lang="ts">
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import { bookingReference } from "@/utils/formatters.ts";
import AppModal from "@/components/shared/ui/AppModal.vue";
import { useAccountManagementContext } from "@/composables/account/accountContext.ts";
const {
  openShareBooking,
  money,
  dateLabel,
  business,
  service,
  staffMember,
  isProfessional,
  statusNames,
  statusClass,
  paymentNames,
  activeStatus,
  detailOpen,
  confirmCancel,
  detailError,
  selected,
  reschedule,
  handleCancel,
  changeStatus,
} = useAccountManagementContext();
</script>
<template>
  <AppModal v-model="detailOpen" title="Detalhes do agendamento">
    <template v-if="selected"
      ><div class="mb-2 flex flex-wrap items-center gap-2.5">
        <span :class="['badge', `badge-${statusClass(selected.status)}`]">{{
          statusNames[selected.status]
        }}</span
        ><span class="text-caption text-muted">{{
          bookingReference(selected.id)
        }}</span>
      </div>
      <h2 class="mb-1">
        {{ service(selected.serviceId)?.name }}
      </h2>
      <p class="mb-5 text-small text-muted">
        {{ business(selected.businessId)?.name }}
      </p>
      <dl class="flex flex-col text-caption">
        <div
          class="flex items-center justify-between gap-3 border-b border-line py-3"
        >
          <dt class="flex items-center gap-2 text-muted">
            <AppIcon name="calendar-days" :size="15" /> Data
          </dt>
          <dd class="text-right font-medium text-ink">
            {{ dateLabel(selected.date) }}
          </dd>
        </div>
        <div
          class="flex items-center justify-between gap-3 border-b border-line py-3"
        >
          <dt class="flex items-center gap-2 text-muted">
            <AppIcon name="clock-3" :size="15" /> Horário
          </dt>
          <dd class="text-right font-medium text-ink">
            {{ selected.time }} · {{ selected.duration }} min
          </dd>
        </div>
        <div
          class="flex items-center justify-between gap-3 border-b border-line py-3"
        >
          <dt class="flex items-center gap-2 text-muted">
            <AppIcon name="user-round" :size="15" />
            {{ isProfessional ? "Cliente" : "Profissional" }}
          </dt>
          <dd class="text-right font-medium text-ink">
            {{
              isProfessional
                ? selected.clientName
                : staffMember(selected.staffId)?.name || "Equipa"
            }}
          </dd>
        </div>
        <div
          v-if="selected.partySize > 1"
          class="flex items-center justify-between gap-3 border-b border-line py-3"
        >
          <dt class="flex items-center gap-2 text-muted">
            <AppIcon name="users-round" :size="15" /> Pessoas
          </dt>
          <dd class="text-right font-medium text-ink">
            {{ selected.partySize }}
          </dd>
        </div>
        <div
          class="flex items-center justify-between gap-3 border-b border-line py-3"
        >
          <dt class="flex items-center gap-2 text-muted">
            <AppIcon name="map-pin" :size="15" /> Local
          </dt>
          <dd class="text-right font-medium text-ink">
            {{ business(selected.businessId)?.address }},
            {{ business(selected.businessId)?.city }}
          </dd>
        </div>
        <div class="flex items-center justify-between gap-3 py-3">
          <dt class="flex items-center gap-2 text-muted">
            <AppIcon name="wallet" :size="15" /> Pagamento
          </dt>
          <dd class="text-right font-medium text-ink">
            {{ paymentNames[selected.paymentStatus] }} ·
            {{ selected.paymentMethod === "online" ? "Online" : "No local" }}
          </dd>
        </div>
        <div
          class="flex items-center justify-between gap-3 border-t border-line pt-4"
        >
          <dt class="text-small font-medium text-ink">Total</dt>
          <dd class="text-h3 font-semibold text-primary-text">
            {{ money(selected.total) }}
          </dd>
        </div>
      </dl>
      <div v-if="selected.notes" class="mt-5">
        <strong class="block text-caption text-ink">Observações</strong>
        <p class="mt-1 text-small text-muted">{{ selected.notes }}</p>
      </div>
      <div
        v-if="!isProfessional && activeStatus(selected)"
        class="mt-5 flex items-start gap-2 text-muted"
      >
        <AppIcon name="info" />
        <p class="text-caption leading-relaxed">
          Cancelamento e reagendamento até
          {{ business(selected.businessId)?.cancelHours ?? 2 }} horas antes do
          atendimento.
        </p>
      </div>
      <p v-if="detailError" class="error-message" role="alert">
        {{ detailError }}
      </p>
      <div v-if="confirmCancel" class="mt-6">
        <h3>Cancelar este agendamento?</h3>
        <p class="text-small text-muted">
          O horário será disponibilizado para outras marcações.
        </p>
        <div class="form-actions">
          <button class="btn btn-secondary" @click="confirmCancel = false">
            Manter agendamento</button
          ><button class="btn btn-danger" @click="handleCancel">
            Confirmar cancelamento
          </button>
        </div>
      </div>
      <div v-else class="form-actions">
        <template v-if="!isProfessional && selected.status === 'confirmed'"
          ><button class="btn btn-danger" @click="confirmCancel = true">
            Cancelar</button
          ><button class="btn btn-primary" @click="reschedule(selected)">
            <AppIcon name="calendar-clock" /> Reagendar
          </button></template
        ><template v-if="isProfessional"
          ><button
            class="btn btn-secondary"
            @click="openShareBooking(selected.id)"
          >
            <AppIcon name="send" /> Enviar ao cliente</button
          ><button
            v-if="selected.status === 'confirmed'"
            class="btn btn-danger"
            @click="changeStatus(selected, 'no_show')"
          >
            Registar falta</button
          ><button
            v-if="selected.status === 'confirmed'"
            class="btn btn-primary"
            @click="changeStatus(selected, 'in_progress')"
          >
            <AppIcon name="play" /> Confirmar presença</button
          ><button
            v-if="selected.status === 'in_progress'"
            class="btn btn-primary"
            @click="changeStatus(selected, 'completed')"
          >
            <AppIcon name="check" /> Concluir atendimento
          </button></template
        ><button
          v-if="!activeStatus(selected)"
          class="btn btn-secondary"
          @click="detailOpen = false"
        >
          Fechar
        </button>
      </div></template
    >
  </AppModal>
</template>
