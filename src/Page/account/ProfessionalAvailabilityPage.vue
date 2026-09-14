<script setup>
import AppIcon from "@/Component/ui/AppIcon.vue";
import { useAccountManagementContext } from "@/Composable/account/accountContext.js";
const {
  state,
  dateLabel,
  business,
  dayOptions,
  selected,
  schedule,
  scheduleError,
  saveSchedule,
  myBlocks,
  openBlock,
  confirmRemoveBlock,
} = useAccountManagementContext();
</script>
<template>
  <div>
    <div class="grid grid-cols-1 gap-8 lg:grid-cols-[1.8fr_1fr] lg:gap-10">
      <form @submit.prevent="saveSchedule">
        <h2 class="mb-1 text-body-lg">Horário regular</h2>
        <p class="mb-5 text-small text-muted">
          {{ business(state.businessId)?.name }}
        </p>
        <fieldset>
          <legend class="mb-3 block text-caption font-medium">
            Dias de trabalho
          </legend>
          <div class="mb-5 grid grid-cols-4 gap-2 sm:grid-cols-7">
            <label
              v-for="day in dayOptions"
              :key="day.id"
              class="choice justify-center gap-2 text-center text-caption"
              :class="schedule.days.includes(day.id) ? 'choice-selected' : ''"
              ><input
                v-model="schedule.days"
                type="checkbox"
                :value="day.id"
              /><span>{{ day.name }}</span></label
            >
          </div>
        </fieldset>
        <div class="form-grid">
          <label class="field"
            >Início do turno<input
              v-model="schedule.start"
              type="time"
              required /></label
          ><label class="field"
            >Fim do turno<input v-model="schedule.end" type="time" required
          /></label>
        </div>
        <p v-if="scheduleError" class="error-message" role="alert">
          {{ scheduleError }}
        </p>
        <div class="form-actions">
          <button class="btn btn-primary" type="submit">
            <AppIcon name="check" /> Guardar horário
          </button>
        </div>
      </form>
      <section>
        <div class="mb-5 flex items-center justify-between gap-4">
          <h2 class="mb-0 text-body-lg">Pausas e ausências</h2>
          <span class="badge badge-neutral">{{ myBlocks.length }}</span>
        </div>
        <div v-if="myBlocks.length" class="flex flex-col">
          <article
            v-for="item in myBlocks"
            :key="item.id"
            class="flex flex-col gap-3 border-b border-line py-4 last:border-b-0 sm:flex-row sm:items-center"
          >
            <span class="mt-0.5 shrink-0 text-muted"
              ><AppIcon name="calendar-off"
            /></span>
            <div class="min-w-0 flex-1">
              <strong class="block text-small text-ink">{{
                item.reason || "Indisponível"
              }}</strong>
              <p class="mt-0.5 text-caption text-muted">
                {{ dateLabel(item.date) }} · {{ item.start }} – {{ item.end }}
              </p>
              <small v-if="!item.staffId" class="mt-0.5 block text-caption text-muted"
                >Todo o estabelecimento</small
              >
            </div>
            <div
              v-if="item.staffId === state.staffId"
              class="flex shrink-0 items-center gap-1 self-start sm:self-center"
            >
              <button
                class="icon-btn"
                title="Editar período"
                aria-label="Editar período"
                @click="openBlock(item)"
              >
                <AppIcon name="pencil" /></button
              ><button
                class="icon-btn"
                title="Remover período"
                aria-label="Remover período"
                @click="confirmRemoveBlock(item)"
              >
                <AppIcon name="trash-2" />
              </button>
            </div>
          </article>
        </div>
        <div v-else class="empty-state">
          <AppIcon name="coffee" />
          <h3>Nenhuma ausência registada</h3>
          <p>O seu horário regular está disponível para marcações.</p>
        </div>
      </section>
    </div>
  </div>
</template>
