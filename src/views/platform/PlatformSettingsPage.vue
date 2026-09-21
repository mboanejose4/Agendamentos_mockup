<script setup lang="ts">
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import { usePlatformManagementContext } from "@/composables/platform/platformContext.ts";
import Select from "primevue/select";
const { settingsForm, settingsError, saveSettings } =
  usePlatformManagementContext();
</script>
<template>
  <div>
    <form class="flex flex-col gap-8" @submit.prevent="saveSettings">
      <section
        class="grid grid-cols-1 gap-5 border-b border-line pb-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]"
      >
        <div class="flex flex-col gap-2">
          <AppIcon name="calendar-clock" class="text-primary-text" />
          <h2 class="mb-0 text-body-lg">Agendamentos</h2>
          <p class="text-caption text-muted">
            Regras aplicadas à disponibilidade de todos os estabelecimentos.
          </p>
        </div>
        <div class="flex flex-col gap-5">
          <label class="field"
            >Intervalo entre horários<Select
              v-model.number="settingsForm.slotMinutes"
              :options="[
                { label: '5 minutos', value: 5 },
                { label: '10 minutos', value: 10 },
                { label: '15 minutos', value: 15 },
                { label: '30 minutos', value: 30 },
                { label: '60 minutos', value: 60 },
                { label: '120 minutos', value: 120 },
              ]"
              option-label="label"
              option-value="value"
              append-to="self" /></label
          ><label class="field"
            ><span>Antecedência máxima de marcação</span>
            <div class="flex items-center gap-2">
              <input
                v-model.number="settingsForm.advanceDays"
                type="number"
                min="1"
                max="365"
                required
              /><span class="shrink-0 text-caption text-muted">dias</span>
            </div></label
          >
        </div>
      </section>
      <section
        class="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]"
      >
        <div class="flex flex-col gap-2">
          <AppIcon name="sliders-horizontal" class="text-primary-text" />
          <h2 class="mb-0 text-body-lg">Serviços da plataforma</h2>
          <p class="text-caption text-muted">
            Disponibilidade global de pagamentos, promoções e notificações.
          </p>
        </div>
        <div class="flex flex-col">
          <label
            class="flex items-center justify-between gap-4 border-b border-line py-4"
            ><span class="min-w-0"
              ><strong class="block text-small text-ink"
                >Pagamentos online</strong
              ><small class="mt-0.5 block text-caption text-muted"
                >Disponibilizar a opção nos estabelecimentos aderentes.</small
              ></span
            ><input
              v-model="settingsForm.onlinePayments"
              type="checkbox"
              role="switch" /></label
          ><label
            class="flex items-center justify-between gap-4 border-b border-line py-4"
            ><span class="min-w-0"
              ><strong class="block text-small text-ink"
                >Promoções e cupões</strong
              ><small class="mt-0.5 block text-caption text-muted"
                >Permitir descontos no processo de marcação.</small
              ></span
            ><input
              v-model="settingsForm.promotions"
              type="checkbox"
              role="switch" /></label
          ><label
            class="flex items-center justify-between gap-4 border-b border-line py-4 last:border-b-0"
            ><span class="min-w-0"
              ><strong class="block text-small text-ink"
                >Notificações na aplicação</strong
              ><small class="mt-0.5 block text-caption text-muted"
                >Registar confirmações, cancelamentos e pagamentos.</small
              ></span
            ><input
              v-model="settingsForm.notifications"
              type="checkbox"
              role="switch"
          /></label>
        </div>
      </section>
      <p v-if="settingsError" class="error-message" role="alert">
        {{ settingsError }}
      </p>
      <div class="form-actions">
        <button type="submit" class="btn btn-primary">
          <AppIcon name="check" /> Guardar configurações
        </button>
      </div>
    </form>
  </div>
</template>
