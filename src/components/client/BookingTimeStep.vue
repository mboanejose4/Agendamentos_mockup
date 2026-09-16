<script setup lang="ts">
import ProfessionalPicker from "@/components/client/ProfessionalPicker.vue";
import AppIcon from "@/components/shared/ui/AppIcon.vue";

import { useBookingFlowContext } from "@/composables/bookings/bookingContext.ts";
const { state, today, draft, selectedService, people, slots, dates, maxDate } =
  useBookingFlowContext();
</script>
<template>
  <div>
    <div class="mb-5 flex items-center justify-between gap-[15px]">
      <h2>Qual é o melhor dia?</h2>
      <label
        ><input
          type="date"
          v-model="draft.date"
          :min="today()"
          :max="maxDate"
          aria-label="Data da marcação"
          class="min-h-[36px] p-[7px] text-caption"
      /></label>
    </div>
    <div class="mt-6 mb-[33px] grid grid-cols-4 gap-2 sm:grid-cols-7">
      <button
        v-for="date in dates"
        :key="date"
        class="flex flex-col items-center gap-2 rounded-md border border-line bg-surface px-1 py-[13px]"
        :class="{
          'border-primary-text bg-soft text-primary-text': draft.date === date,
        }"
        @click="draft.date = date"
      >
        <small class="text-caption text-muted">{{
          new Intl.DateTimeFormat("pt-MZ", { weekday: "short" }).format(
            new Date(date + "T12:00:00"),
          )
        }}</small
        ><strong class="text-h3">{{ date.slice(8) }}</strong
        ><span class="text-caption text-muted">{{
          new Intl.DateTimeFormat("pt-MZ", { month: "short" }).format(
            new Date(date + "T12:00:00"),
          )
        }}</span>
      </button>
    </div>
    <ProfessionalPicker
      v-if="selectedService?.resourceType !== 'table'"
      v-model="draft.staffId"
      :professionals="people"
    />
    <div class="mb-5 flex items-center justify-between gap-[15px]">
      <h3>Horários disponíveis</h3>
      <span class="text-muted">{{ selectedService?.duration }} minutos</span>
    </div>
    <div class="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
      <button
        v-for="time in slots"
        :key="time"
        class="min-h-[43px] rounded-[5px] border border-line bg-surface text-caption"
        :class="{
          'border-primary bg-primary text-on-primary': draft.time === time,
          'booking-time-selected': draft.time === time,
        }"
        @click="draft.time = time"
      >
        {{ time }}
      </button>
    </div>
    <div v-if="!slots.length" class="empty-state">
      <AppIcon name="calendar-clock" :size="32" />
      <h3>Sem horários neste dia</h3>
      <p>
        Escolha outra data ou ajuste a preferência de profissional ou recurso.
      </p>
    </div>
  </div>
</template>

<style scoped>
:root:not([data-theme="dark"]) .booking-time-selected {
  background-color: var(--brand-500);
  border-color: var(--white);
  color: var(--neutral-0);
}
</style>
