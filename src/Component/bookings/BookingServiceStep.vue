<script setup>
import AppIcon from "@/Component/ui/AppIcon.vue";

import { useBookingFlowContext } from "@/Composable/bookings/bookingContext.js";
const {
  money,
  draft,
  selectedService,
  options,
  resources,
  isRestaurant,
  changeService,
} = useBookingFlowContext();
</script>
<template>
  <div>
    <h2>Como podemos cuidar de si?</h2>
    <label class="field"
      >Serviço<select v-model="draft.serviceId" @change="changeService">
        <option value="" disabled>Seleccione um serviço</option>
        <option v-for="item in options" :key="item.id" :value="item.id">
          {{ item.name }} · {{ money(item.price) }} · {{ item.duration }} min
        </option>
      </select></label
    >
    <p v-if="selectedService" class="text-muted">
      {{ selectedService.description }}
    </p>
    <label v-if="isRestaurant" class="field"
      >Número de pessoas<input
        type="number"
        v-model.number="draft.partySize"
        min="1"
        max="30" /></label
    ><label v-if="selectedService?.resourceType" class="field"
      >{{ isRestaurant ? "Mesa" : "Sala ou recurso"
      }}<select v-model="draft.resourceId">
        <option value="">Atribuição automática</option>
        <option
          v-for="resource in resources"
          :key="resource.id"
          :value="resource.id"
        >
          {{ resource.name }} · {{ resource.capacity }}
          {{ resource.capacity === 1 ? "lugar" : "lugares" }}
        </option>
      </select></label
    >
  </div>
</template>
