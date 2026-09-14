<script setup>
import AppIcon from "@/Component/ui/AppIcon.vue";
import { useBusinessManagementContext } from "@/Composable/businesses/businessContext.js";
const {
  state,
  team,
  blocks,
  form,
  settings,
  weekdays,
  staffName,
  initials,
  formatDate,
  navigate,
  openEditor,
  requestRemoval,
  saveSettings,
} = useBusinessManagementContext();
</script>
<template>
  <div>
    <section class="mb-10">
      <div class="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="mb-0">Funcionamento do estabelecimento</h2>
          <p class="mt-1.5 text-caption text-muted">
            Dias e horários em que aceita reservas
          </p>
        </div>
      </div>
      <form @submit.prevent="saveSettings(true)">
        <div class="mb-5 grid grid-cols-4 gap-2 sm:grid-cols-7">
          <label
            v-for="day in weekdays"
            :key="day.id"
            class="choice justify-center gap-2 text-center text-caption"
            :class="settings.days?.includes(day.id) ? 'choice-selected' : ''"
          >
            <input v-model="settings.days" type="checkbox" :value="day.id" />
            <span>{{ day.label }}</span>
          </label>
        </div>
        <div class="flex flex-wrap items-end gap-4">
          <label class="field mb-0 min-w-[140px] flex-1">
            <span>Abertura</span>
            <input v-model="settings.opens" type="time" required />
          </label>
          <label class="field mb-0 min-w-[140px] flex-1">
            <span>Encerramento</span>
            <input v-model="settings.closes" type="time" required />
          </label>
          <button class="btn btn-primary shrink-0" type="submit">
            <AppIcon name="check" :size="17" /> Guardar horário
          </button>
        </div>
      </form>
    </section>
    <section class="mb-10">
      <div class="mb-5 flex flex-wrap items-center justify-between gap-4">
        <h2 class="mb-0">Turnos da equipa</h2>
        <span class="text-caption text-muted">{{ team.length }} membros</span>
      </div>
      <div v-if="!team.length" class="empty-state py-8">
        <h3>Ainda não há profissionais</h3>
        <button class="btn btn-secondary" @click="navigate('team')">
          Gerir equipa
        </button>
      </div>
      <div
        v-for="person in team"
        :key="person.id"
        class="flex flex-wrap items-center gap-3 border-b border-line py-4 last:border-b-0 sm:flex-nowrap"
      >
        <span class="avatar avatar-sm">{{ initials(person.name) }}</span>
        <div class="min-w-0 sm:w-36 sm:shrink-0">
          <strong class="block text-small text-ink">{{ person.name }}</strong>
          <small class="block text-caption text-muted">{{
            person.title
          }}</small>
        </div>
        <div class="flex flex-1 flex-wrap gap-1.5">
          <span
            v-for="day in weekdays"
            :key="day.id"
            class="text-caption"
            :class="
              person.days?.includes(day.id)
                ? 'font-semibold text-primary-text'
                : 'text-muted'
            "
            >{{ day.label }}</span
          >
        </div>
        <span class="shrink-0 text-caption text-muted"
          >{{ person.start }} – {{ person.end }}</span
        >
        <button
          class="icon-btn shrink-0"
          title="Editar turno"
          @click="openEditor('staff', person)"
        >
          <AppIcon name="pencil" :size="17" />
        </button>
      </div>
    </section>
    <section class="mb-10">
      <div class="mb-5 flex flex-wrap items-center justify-between gap-4">
        <h2 class="mb-0">Períodos indisponíveis</h2>
        <button class="btn btn-secondary" @click="openEditor('blocks')">
          <AppIcon name="plus" :size="17" /> Adicionar
        </button>
      </div>
      <div v-if="!blocks.length" class="empty-state py-8">
        <AppIcon name="calendar-check" :size="30" />
        <h3>Sem bloqueios de horário</h3>
        <p>Registe férias, pausas e outros períodos indisponíveis.</p>
      </div>
      <div
        v-for="item in [...blocks].sort((a, b) => a.date.localeCompare(b.date))"
        :key="item.id"
        class="flex flex-col gap-3 border-b border-line py-4 last:border-b-0 sm:flex-row sm:items-center"
      >
        <span class="mt-0.5 shrink-0 text-muted">
          <AppIcon name="calendar-off" :size="20" />
        </span>
        <div class="min-w-0 flex-1">
          <strong class="block text-small text-ink">{{ item.reason }}</strong>
          <small class="block text-caption text-muted"
            >{{ formatDate(item.date) }} · {{ item.start }} –
            {{ item.end }}</small
          >
          <small class="block text-caption text-muted">{{
            item.staffId ? staffName(item.staffId) : "Toda a equipa"
          }}</small>
        </div>
        <div class="flex shrink-0 items-center gap-1 self-start sm:self-center">
          <button
            class="icon-btn"
            title="Editar bloqueio"
            @click="openEditor('blocks', item)"
          >
            <AppIcon name="pencil" :size="17" />
          </button>
          <button
            class="icon-btn icon-btn-danger"
            title="Eliminar bloqueio"
            @click="requestRemoval('blocks', item)"
          >
            <AppIcon name="trash-2" :size="17" />
          </button>
        </div>
      </div>
    </section>
  </div>
</template>
