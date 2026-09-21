<script setup lang="ts">
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import { bookingReference } from "@/utils/formatters.ts";
import AppModal from "@/components/shared/ui/AppModal.vue";
import { useAccountManagementContext } from "@/composables/account/accountContext.ts";
import { computed, ref } from "vue";
import {
  state,
  notify,
  addServiceDuringVisit,
  requestBookingDelay,
  respondBookingDelay,
  markPaid,
} from "@/stores/applicationStore.ts";
import Select from "primevue/select";
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
const delayMinutes = ref(10);
const extraServiceId = ref("");
const extraOptions = computed(() =>
  state.db.services.filter(
    (item) =>
      item.businessId === selected.value?.businessId &&
      item.active &&
      item.id !== selected.value?.serviceId &&
      !selected.value?.extraServiceIds?.includes(item.id),
  ),
);
function requestDelay() {
  if (!selected.value) return;
  const result = requestBookingDelay(selected.value.id, delayMinutes.value);
  notify(
    result.ok ? "Pedido de atraso enviado ao estabelecimento." : result.error,
  );
}
function answerDelay(accept: boolean) {
  if (!selected.value) return;
  const result = respondBookingDelay(selected.value.id, accept);
  notify(
    result.ok ? `Atraso ${accept ? "aceite" : "recusado"}.` : result.error,
  );
}
function addExtra() {
  if (!selected.value) return;
  const result = addServiceDuringVisit(selected.value.id, extraServiceId.value);
  notify(result.ok ? "Serviço acrescentado ao atendimento." : result.error);
  if (result.ok) extraServiceId.value = "";
}
function collectPayment() {
  if (!selected.value || !isProfessional.value) return;
  const result = markPaid(selected.value.id);
  notify(result.ok ? "Pagamento registado." : result.error);
}
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
      <div v-if="selected.extraServiceIds?.length" class="mt-5 text-caption">
        <strong>Serviços adicionais</strong>
        <p>
          {{
            selected.extraServiceIds
              .map((id) => service(id)?.name || "Serviço")
              .join(", ")
          }}
        </p>
      </div>
      <div v-if="selected.noShowPenalty" class="mt-5 text-caption">
        Penalização por falta:
        <strong>{{ money(selected.noShowPenalty) }}</strong>
      </div>
      <div
        v-if="selected.delayMinutes"
        class="mt-5 rounded-4xl bg-surface-muted p-3 text-caption"
      >
        Atraso comunicado: {{ selected.delayMinutes }} min ·
        {{
          selected.delayStatus === "requested"
            ? "A aguardar resposta"
            : selected.delayStatus === "accepted"
              ? "Aceite"
              : "Recusado"
        }}
        <div
          v-if="isProfessional && selected.delayStatus === 'requested'"
          class="mt-3 flex gap-2"
        >
          <button class="btn btn-primary" @click="answerDelay(true)">
            Aceitar
          </button>
          <button class="btn btn-secondary" @click="answerDelay(false)">
            Recusar
          </button>
        </div>
      </div>
      <div
        v-if="!isProfessional && selected.status === 'confirmed'"
        class="mt-5 flex flex-wrap items-end gap-2"
      >
        <label class="field min-w-[180px]"
          ><span>Vou chegar atrasado</span>
          <Select
            v-model.number="delayMinutes"
            :options="[
              ...[5, 10, 15, 20, 30].map((minutes) => ({
                label: `${minutes} minutos`,
                value: minutes,
              })),
            ]"
            option-label="label"
            option-value="value"
            append-to="self"
          />
        </label>
        <button class="btn btn-secondary" @click="requestDelay">
          Avisar estabelecimento
        </button>
      </div>
      <div
        v-if="isProfessional && selected.status === 'in_progress'"
        class="mt-5 flex flex-wrap items-end gap-2"
      >
        <label class="field min-w-[220px] flex-1"
          ><span>Adicionar serviço</span>
          <Select
            v-model="extraServiceId"
            :options="[
              { label: 'Seleccionar serviço', value: '' },
              ...extraOptions.map((item) => ({
                label: `${item.name} · ${money(item.price)}`,
                value: item.id,
              })),
            ]"
            option-label="label"
            option-value="value"
            append-to="self"
          />
        </label>
        <button
          class="btn btn-secondary"
          :disabled="!extraServiceId"
          @click="addExtra"
        >
          Adicionar
        </button>
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
            v-if="
              selected.paymentStatus === 'pending' &&
              ['confirmed', 'in_progress', 'completed'].includes(
                selected.status,
              )
            "
            class="btn btn-secondary"
            @click="collectPayment"
          >
            <AppIcon name="wallet" /> Registar pagamento</button
          ><button
            v-if="
              selected.status === 'confirmed' &&
              selected.paymentStatus !== 'paid'
            "
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
