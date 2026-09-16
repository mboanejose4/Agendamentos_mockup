<script setup lang="ts">
import AppIcon from "@/components/shared/ui/AppIcon.vue";

import { useBookingFlowContext } from "@/composables/bookings/bookingContext.ts";
const {
  money,
  dateLabel,
  service,
  draft,
  error,
  appliedCoupon,
  current,
  selectedService,
  totals,
  totalLabel,
} = useBookingFlowContext();
</script>
<template>
  <aside
    v-if="current"
    class="hidden self-start overflow-hidden rounded-lg border border-line bg-surface lg:sticky lg:top-[22px] lg:block"
  >
    <img
      :src="current.image"
      :alt="current.name"
      class="h-[145px] w-full object-cover"
    />
    <div class="p-[22px]">
      <span class="eyebrow">A SUA MARCAÇÃO</span>
      <h3 class="text-h3">{{ current.name }}</h3>
      <p class="flex items-center gap-[5px] text-caption text-muted">
        <AppIcon name="map-pin" :size="14" />{{ current.city }}
      </p>
      <div
        v-if="selectedService"
        class="flex flex-wrap items-center justify-between gap-2 border-t border-line py-3.5 text-caption"
      >
        <strong>{{ selectedService.name }}</strong
        ><span class="flex items-center gap-[5px] text-muted"
          ><AppIcon name="clock" :size="15" />{{
            selectedService.duration
          }}
          min</span
        >
      </div>
      <div
        v-if="draft.time"
        class="flex flex-wrap items-center justify-between gap-2 border-t border-line py-3.5 text-caption"
      >
        <strong>{{ dateLabel(draft.date) }}</strong
        ><span class="text-muted">{{ draft.time }}</span>
      </div>
      <div
        v-if="appliedCoupon && !totals.error"
        class="flex flex-wrap items-center justify-between gap-2 border-t border-line py-3.5 text-caption"
      >
        <span class="text-muted">Desconto</span
        ><strong>−{{ money(totals.discount) }}</strong>
      </div>
      <div
        class="mt-1 flex items-center justify-between border-t border-line pt-[18px] text-caption"
      >
        <span>Total</span
        ><strong class="text-h2 text-primary-text">{{ totalLabel }}</strong>
      </div>
    </div>
    <p
      class="m-0 flex items-center justify-center gap-[7px] bg-surface-muted p-3 text-center text-caption text-muted"
    >
      <AppIcon name="shield-check" :size="16" />Os seus planos, bem organizados.
    </p>
  </aside>
</template>
