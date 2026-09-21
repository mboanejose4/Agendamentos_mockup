<script setup lang="ts">
import { computed } from "vue";

import Select from "primevue/select";
import InputNumber from "primevue/inputnumber";

import { useBookingFlowContext } from "@/composables/bookings/bookingContext.ts";

const {
  money,
  draft,
  selectedService,
  options,
  resources,
  isRestaurant,
  changeService,
} = useBookingFlowContext();

/*
 * Adiciona uma descrição completa para cada serviço,
 * incluindo preço e duração.
 *
 * Mantém o ID como valor seleccionado.
 */
const serviceOptions = computed(() =>
  options.value.map((item) => ({
    ...item,
    label: `${item.name} · ${money(item.price)} · ${item.duration} min`,
  })),
);

/*
 * Formata as opções de salas e mesas.
 */
const resourceOptions = computed(() =>
  resources.value.map((resource) => ({
    ...resource,
    label: `${resource.name} · ${resource.capacity} ${
      resource.capacity === 1 ? "lugar" : "lugares"
    }`,
  })),
);

/*
 * O PrimeVue Select utiliza update:modelValue,
 * em vez do evento change do select HTML.
 */
function onServiceChange(): void {
  changeService();
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <h2 class="mb-0">Como podemos cuidar de si?</h2>

    <!-- Selecção do serviço -->
    <label class="field">
      <span>Serviço</span>

      <Select
        v-model="draft.serviceId"
        :options="serviceOptions"
        option-label="label"
        option-value="id"
        placeholder="Seleccione um serviço"
        filter
        fluid
        required
        class="!w-full !rounded-4xl"
        @update:model-value="onServiceChange"
        append-to="self"
      />
    </label>

    <!-- Descrição do serviço seleccionado -->
    <p v-if="selectedService" class="mb-0 text-caption text-muted">
      {{ selectedService.description }}
    </p>

    <!-- Número de pessoas: apenas restaurantes -->
    <label v-if="isRestaurant" class="field">
      <span>Número de pessoas</span>

      <InputNumber
        v-model="draft.partySize"
        :min="1"
        :max="30"
        :use-grouping="false"
        show-buttons
        button-layout="horizontal"
        fluid
        required
        input-class="!w-full !rounded-4xl"
        class="!w-full !rounded-4xl"
      >
        <template #incrementbuttonicon>
          <span class="pi pi-plus" />
        </template>

        <template #decrementbuttonicon>
          <span class="pi pi-minus" />
        </template>
      </InputNumber>
    </label>

    <!-- Selecção de mesa, sala ou recurso -->
    <label v-if="selectedService?.resourceType" class="field">
      <span>
        {{ isRestaurant ? "Mesa" : "Sala ou recurso" }}
      </span>

      <Select
        v-model="draft.resourceId"
        :options="resourceOptions"
        option-label="label"
        option-value="id"
        placeholder="Atribuição automática"
        show-clear
        fluid
        class="!w-full !rounded-4xl"
        append-to="self"
      />
    </label>
  </div>
</template>

<style scoped>
/*
 * Mantém os campos alinhados com a identidade
 * visual do MarcaFácil.
 */

:deep(.p-select) {
  width: 100%;
  border-radius: var(--radius-4xl, 2rem);
}

/* Campo interno do InputNumber */
:deep(.p-inputnumber-input) {
  width: 100%;
  border-radius: var(--radius-4xl, 2rem);
}

/* Arredondamento do menu de opções */
:global(.p-select-overlay) {
  border-radius: var(--radius-4xl, 2rem);
  overflow: hidden;
}

/* Arredondamento dos itens do menu */
:global(.p-select-option) {
  border-radius: 0.75rem;
}
</style>
