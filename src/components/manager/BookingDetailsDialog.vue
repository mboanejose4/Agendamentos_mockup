<script setup lang="ts">
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import { bookingReference } from "@/utils/formatters.ts";
import AppModal from "@/components/shared/ui/AppModal.vue";
import { useBusinessManagementContext } from "@/composables/businesses/businessContext.ts";
const {
  money,
  detailOpen,
  statusNames,
  paymentNames,
  activeBooking,
  serviceName,
  staffName,
  clientName,
  resourceName,
  initials,
  statusClass,
  formatDate,
  selectedBooking,
  openBooking,
  changeStatus,
  collectPayment,
} = useBusinessManagementContext();
</script>
<template>
  <AppModal v-model="detailOpen" title="Detalhes da reserva">
    <template v-if="selectedBooking"
      ><div>
        <div class="mb-5 flex items-center gap-3">
          <span class="avatar">{{
            initials(clientName(selectedBooking))
          }}</span>
          <div class="min-w-0 flex-1">
            <h3 class="mb-0 truncate">{{ clientName(selectedBooking) }}</h3>
            <p class="truncate text-small text-muted">
              {{ serviceName(selectedBooking.serviceId) }}
            </p>
          </div>
          <span
            class="shrink-0"
            :class="['badge', `badge-${statusClass(selectedBooking.status)}`]"
            >{{ statusNames[selectedBooking.status] }}</span
          >
        </div>
        <dl
          class="mb-5 grid grid-cols-1 gap-x-6 gap-y-3 text-caption sm:grid-cols-2"
        >
          <div>
            <dt class="mb-1 text-muted">Data</dt>
            <dd class="font-medium text-ink">
              {{ formatDate(selectedBooking.date) }}
            </dd>
          </div>
          <div>
            <dt class="mb-1 text-muted">Horário</dt>
            <dd class="font-medium text-ink">
              {{ selectedBooking.time }} · {{ selectedBooking.duration }} min
            </dd>
          </div>
          <div>
            <dt class="mb-1 text-muted">Profissional</dt>
            <dd class="font-medium text-ink">
              {{ staffName(selectedBooking.staffId) }}
            </dd>
          </div>
          <div>
            <dt class="mb-1 text-muted">Referência</dt>
            <dd class="font-medium text-ink break-all">
              {{ bookingReference(selectedBooking.id) }}
            </dd>
          </div>
          <div v-if="selectedBooking.resourceId">
            <dt class="mb-1 text-muted">Recurso</dt>
            <dd class="font-medium text-ink">
              {{ resourceName(selectedBooking.resourceId) }}
            </dd>
          </div>
          <div v-if="selectedBooking.partySize > 1">
            <dt class="mb-1 text-muted">Pessoas</dt>
            <dd class="font-medium text-ink">
              {{ selectedBooking.partySize }}
            </dd>
          </div>
        </dl>
        <div v-if="selectedBooking.notes" class="mb-5">
          <strong class="block text-caption text-ink">Observações</strong>
          <p class="mt-1 text-small text-muted">{{ selectedBooking.notes }}</p>
        </div>
        <div
          class="mb-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4"
        >
          <div>
            <strong class="block text-body-lg text-ink">{{
              money(selectedBooking.total)
            }}</strong
            ><span class="text-caption text-muted">{{
              selectedBooking.paymentMethod === "online"
                ? "Pagamento online"
                : "Pagamento no estabelecimento"
            }}</span>
          </div>
          <span
            :class="[
              'badge',
              `badge-${statusClass(selectedBooking.paymentStatus)}`,
            ]"
            >{{ paymentNames[selectedBooking.paymentStatus] }}</span
          >
        </div>
        <div class="form-actions">
          <button
            v-if="selectedBooking.status === 'confirmed'"
            class="btn btn-primary"
            @click="changeStatus(selectedBooking, 'in_progress')"
          >
            <AppIcon name="play" :size="16" /> Iniciar atendimento</button
          ><button
            v-if="['confirmed', 'in_progress'].includes(selectedBooking.status)"
            class="btn btn-primary"
            @click="changeStatus(selectedBooking, 'completed')"
          >
            <AppIcon name="check-check" :size="17" /> Concluir</button
          ><button
            v-if="
              selectedBooking.paymentStatus === 'pending' &&
              activeBooking(selectedBooking)
            "
            class="btn btn-secondary"
            @click="collectPayment(selectedBooking)"
          >
            <AppIcon name="wallet" :size="17" /> Registar pagamento</button
          ><button
            v-if="['confirmed', 'in_progress'].includes(selectedBooking.status)"
            class="btn btn-secondary"
            @click="openBooking(selectedBooking)"
          >
            <AppIcon name="calendar-clock" :size="17" /> Reagendar / editar</button
          ><button
            v-if="selectedBooking.status === 'confirmed'"
            class="btn btn-secondary"
            @click="changeStatus(selectedBooking, 'no_show')"
          >
            <AppIcon name="user-x" :size="16" /> Não compareceu</button
          ><button
            v-if="['confirmed', 'in_progress'].includes(selectedBooking.status)"
            class="btn btn-danger"
            @click="changeStatus(selectedBooking, 'cancelled')"
          >
            <AppIcon name="x" :size="17" /> Cancelar reserva
          </button>
        </div>
      </div></template
    >
  </AppModal>
</template>
