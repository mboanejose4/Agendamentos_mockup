<script setup lang="ts">
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import { resourceTypes } from "@/utils/resourceTypes.ts";
import AppModal from "@/components/shared/ui/AppModal.vue";
import { useBusinessManagementContext } from "@/composables/businesses/businessContext.ts";
const {
  services,
  team,
  resources,
  clients,
  promotions,
  blocks,
  editorOpen,
  editorType,
  form,
  formError,
  weekdays,
  statusNames,
  serviceName,
  statusClass,
  formatDate,
  editorTitle,
  saveEditor,
  clientBookings,
} = useBusinessManagementContext();
</script>
<template>
  <AppModal v-model="editorOpen" :title="editorTitle">
    <form @submit.prevent="saveEditor">
      <div
        v-if="formError"
        class="error-message mb-[18px] flex items-center gap-2"
        role="alert"
      >
        <AppIcon name="circle-alert" :size="17" /> {{ formError }}
      </div>
      <template v-if="editorType === 'services'"
        ><div class="form-grid">
          <label class="field form-grid-full"
            ><span>Nome do serviço</span
            ><input
              v-model="form.name"
              required
              autofocus
              maxlength="80" /></label
          ><label class="field form-grid-full"
            ><span>Descrição</span
            ><textarea
              v-model="form.description"
              rows="3"
              maxlength="400"
            ></textarea></label
          ><label class="field"
            ><span>Duração (minutos)</span
            ><input
              v-model.number="form.duration"
              type="number"
              min="5"
              max="720"
              step="5"
              required /></label
          ><label class="field"
            ><span>Preço (MZN)</span
            ><input
              v-model.number="form.price"
              type="number"
              min="0"
              step="0.01"
              required /></label
          ><label class="field form-grid-full"
            ><span>Tipo de recurso necessário</span
            ><select v-model="form.resourceType">
              <option value="">Sem recurso obrigatório</option>
              <option
                v-for="type in resourceTypes"
                :key="type.id"
                :value="type.id"
              >
                {{ type.name }}
              </option>
            </select></label
          >
        </div>
        <label class="check-field"
          ><input v-model="form.active" type="checkbox" /> Disponível para
          reserva</label
        ></template
      >
      <template v-else-if="editorType === 'staff'"
        ><div class="form-grid">
          <label class="field"
            ><span>Nome completo</span
            ><input v-model="form.name" required autofocus /></label
          ><label class="field"
            ><span>Especialidade ou função</span
            ><input
              v-model="form.title"
              required
              placeholder="Ex.: Terapeuta, médico, anfitrião" /></label
          ><label class="field"
            ><span>Email</span
            ><input v-model="form.email" type="email" /></label
          ><label class="field"
            ><span>Telefone</span><input v-model="form.phone" type="tel"
          /></label>
        </div>
        <fieldset class="mb-[18px]">
          <legend class="mb-3 block text-caption font-medium">
            Serviços que realiza
          </legend>
          <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <label v-for="item in services" :key="item.id" class="check-field"
              ><input
                v-model="form.serviceIds"
                type="checkbox"
                :value="item.id"
              />
              {{ item.name }}</label
            >
          </div>
          <p v-if="!services.length" class="text-caption text-muted">
            Adicione primeiro um serviço ao catálogo.
          </p>
        </fieldset>
        <fieldset class="mb-[18px]">
          <legend class="mb-3 block text-caption font-medium">
            Dias de trabalho
          </legend>
          <div class="grid grid-cols-4 gap-2 sm:grid-cols-7">
            <label
              v-for="day in weekdays"
              :key="day.id"
              class="choice justify-center gap-2 text-center text-caption"
              :class="form.days?.includes(day.id) ? 'choice-selected' : ''"
              ><input
                v-model="form.days"
                type="checkbox"
                :value="day.id"
              /><span>{{ day.label }}</span></label
            >
          </div>
        </fieldset>
        <div class="form-grid">
          <label class="field"
            ><span>Início do turno</span
            ><input v-model="form.start" type="time" required /></label
          ><label class="field"
            ><span>Fim do turno</span
            ><input v-model="form.end" type="time" required
          /></label>
        </div>
        <label class="check-field"
          ><input v-model="form.active" type="checkbox" /> Profissional
          activo</label
        ></template
      >
      <template v-else-if="editorType === 'resources'"
        ><div class="form-grid">
          <label class="field form-grid-full"
            ><span>Nome do recurso</span
            ><input
              v-model="form.name"
              required
              autofocus
              placeholder="Ex.: Sala 2, Mesa da esplanada" /></label
          ><label class="field"
            ><span>Tipo</span
            ><select v-model="form.type" required>
              <option value="" disabled>Seleccione o tipo</option>
              <option
                v-for="type in resourceTypes"
                :key="type.id"
                :value="type.id"
              >
                {{ type.name }}
              </option>
            </select></label
          ><label class="field"
            ><span>Capacidade (pessoas)</span
            ><input
              v-model.number="form.capacity"
              type="number"
              min="1"
              max="500"
              required
          /></label>
        </div>
        <label class="check-field"
          ><input v-model="form.active" type="checkbox" /> Disponível para
          reserva</label
        ></template
      >
      <template v-else-if="editorType === 'clients'"
        ><div class="form-grid">
          <label class="field form-grid-full"
            ><span>Nome completo</span
            ><input v-model="form.name" required autofocus /></label
          ><label class="field"
            ><span>Telefone</span
            ><input v-model="form.phone" type="tel" placeholder="+258" /></label
          ><label class="field"
            ><span>Email</span><input v-model="form.email" type="email"
          /></label>
        </div>
        <template v-if="form.id"
          ><div class="mb-5 flex items-center justify-between gap-4">
            <h3 class="mb-0">Histórico de reservas</h3>
            <span class="badge badge-neutral">{{
              clientBookings(form.id).length
            }}</span>
          </div>
          <div
            v-if="!clientBookings(form.id).length"
            class="text-caption text-muted"
          >
            Este cliente ainda não tem reservas.
          </div>
          <div
            v-for="item in clientBookings(form.id)
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 8)"
            :key="item.id"
            class="flex items-center justify-between gap-3 border-b border-line py-3 text-caption"
          >
            <div>
              <strong class="block text-ink">{{
                serviceName(item.serviceId)
              }}</strong
              ><small class="mt-0.5 block text-muted"
                >{{ formatDate(item.date) }} · {{ item.time }}</small
              >
            </div>
            <span
              class="shrink-0"
              :class="['badge', `badge-${statusClass(item.status)}`]"
              >{{ statusNames[item.status] }}</span
            >
          </div></template
        ></template
      >
      <template v-else-if="editorType === 'promotions'"
        ><div class="form-grid">
          <label class="field"
            ><span>Código do cupão</span
            ><input
              v-model="form.code"
              required
              autofocus
              maxlength="24"
              class="uppercase"
              placeholder="BEMVINDO10" /></label
          ><label class="field"
            ><span>Desconto (%)</span
            ><input
              v-model.number="form.discount"
              type="number"
              min="1"
              max="100"
              required /></label
          ><label class="field"
            ><span>Serviço</span
            ><select v-model="form.serviceId">
              <option value="">Todos os serviços</option>
              <option v-for="item in services" :key="item.id" :value="item.id">
                {{ item.name }}
              </option>
            </select></label
          ><label class="field"
            ><span>Válida até</span
            ><input v-model="form.expires" type="date" required
          /></label>
        </div>
        <label class="check-field"
          ><input v-model="form.active" type="checkbox" /> Promoção
          activa</label
        ></template
      >
      <template v-else-if="editorType === 'blocks'"
        ><div class="form-grid">
          <label class="field form-grid-full"
            ><span>Motivo</span
            ><input
              v-model="form.reason"
              required
              autofocus
              placeholder="Ex.: Reunião da equipa, férias" /></label
          ><label class="field"
            ><span>Data</span
            ><input v-model="form.date" type="date" required /></label
          ><label class="field"
            ><span>Profissional</span
            ><select v-model="form.staffId">
              <option value="">Toda a equipa</option>
              <option
                v-for="person in team"
                :key="person.id"
                :value="person.id"
              >
                {{ person.name }}
              </option>
            </select></label
          ><label class="field"
            ><span>Início</span
            ><input v-model="form.start" type="time" required /></label
          ><label class="field"
            ><span>Fim</span><input v-model="form.end" type="time" required
          /></label></div
      ></template>
      <div class="form-actions">
        <button
          class="btn btn-secondary"
          type="button"
          @click="editorOpen = false"
        >
          Cancelar</button
        ><button class="btn btn-primary" type="submit">
          <AppIcon name="check" :size="17" /> Guardar
        </button>
      </div>
    </form>
  </AppModal>
</template>
