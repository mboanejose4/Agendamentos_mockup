<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from "vue";
import { brandPreview } from "@/stores/brandPreview.ts";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import Select from "primevue/select";
const coverBusy = ref(false);
import CoverImageUpload from "@/components/shared/ui/CoverImageUpload.vue";
import BrandingEditor from "@/components/shared/ui/BrandingEditor.vue";
import PhoneInput from "@/components/shared/ui/PhoneInput.vue";
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import { useBusinessManagementContext } from "@/composables/businesses/businessContext.ts";
const { form, settings, resetSettings, saveSettings } =
  useBusinessManagementContext();
/* Mexer nas cores repinta o ecrã antes de gravar; sair daqui devolve a
   aparência à marca que está guardada. */
watch(
  () => settings.branding,
  (value) => (brandPreview.value = value ? { ...value } : null),
  { deep: true, immediate: true },
);
onBeforeUnmount(() => (brandPreview.value = null));
</script>

<template>
  <div>
    <form @submit.prevent="saveSettings()">
      <BrandingEditor
        v-model="settings.branding"
        :business-name="settings.name"
      />

      <section class="mb-8">
        <div class="mb-5 flex items-center justify-between gap-4">
          <h2 class="mb-0">Perfil do estabelecimento</h2>
        </div>

        <div class="form-grid">
          <label class="field">
            <span>Nome do estabelecimento</span>
            <InputText v-model="settings.name" required maxlength="80" />
          </label>

          <label class="field">
            <span>Código da empresa</span>
            <InputText
              v-model.trim="settings.code"
              maxlength="24"
              :required="(settings.package ?? 3) <= 2"
              placeholder="Ex.: SALAO-CENTRO"
            />
            <small>Os clientes podem procurar pelo código.</small>
          </label>

          <label class="field">
            <span>Pacote</span>
            <Select
              v-model.number="settings.package"
              :options="[
                { label: '01 · Reservas da própria empresa', value: 1 },
                { label: '02 · Profissionais independentes', value: 2 },
                { label: '03 · Exploração completa', value: 3 },
                { label: '04 · Destaque na plataforma', value: 4 },
              ]"
              option-label="label"
              option-value="value"
              append-to="self"
            />
          </label>

          <label class="field">
            <span>Categoria</span>
            <Select
              v-model="settings.category"
              :options="[
                { label: 'Beleza', value: 'Beleza' },
                { label: 'Bem-estar', value: 'Bem-estar' },
                { label: 'Saúde', value: 'Saúde' },
                { label: 'Restauração', value: 'Restauração' },
                { label: 'Consultoria', value: 'Consultoria' },
                { label: 'Desporto', value: 'Desporto' },
                { label: 'Outros serviços', value: 'Outros serviços' },
              ]"
              option-label="label"
              option-value="value"
              append-to="self"
            />
          </label>

          <label class="field form-grid-full">
            <span>Descrição</span>
            <Textarea v-model="settings.description" rows="3" maxlength="600" />
          </label>

          <label class="field">
            <span>Cidade</span>
            <InputText v-model="settings.city" required />
          </label>

          <label class="field">
            <span>Morada</span>
            <InputText v-model="settings.address" required />
          </label>

          <label class="field">
            <span>Telefone</span>
            <PhoneInput v-model="settings.phone" />
          </label>

          <label class="field">
            <span>Email</span>
            <InputText v-model="settings.email" type="email" />
          </label>

          <CoverImageUpload
            v-model="settings.image"
            :name="settings.name"
            @busy-change="coverBusy = $event"
          />
        </div>
      </section>

      <section class="mb-8">
        <div class="mb-5 flex items-center justify-between gap-4">
          <h2 class="mb-0">Preferências de reserva</h2>
        </div>

        <!-- Interruptores: empilham em telefone, alinham em linha a partir de sm. -->
        <div
          class="flex flex-col gap-3 border-b border-line py-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="min-w-0">
            <strong class="block text-small text-ink">
              Aceitar novas reservas
            </strong>
            <p class="mt-1 mb-0 text-caption text-muted">
              Disponibilidade do estabelecimento na plataforma.
            </p>
          </div>

          <label class="check-field shrink-0">
            <input
              v-model="settings.active"
              type="checkbox"
              aria-label="Aceitar novas reservas"
            />
            <span class="text-caption text-muted">
              {{ settings.active ? "Activo" : "Inactivo" }}
            </span>
          </label>
        </div>

        <div
          class="flex flex-col gap-3 border-b border-line py-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="min-w-0">
            <strong class="block text-small text-ink">Pagamento online</strong>
            <p class="mt-1 mb-0 text-caption text-muted">
              Disponibilizar o pagamento no momento da reserva.
            </p>
          </div>

          <label class="check-field shrink-0">
            <input
              v-model="settings.onlinePayment"
              type="checkbox"
              aria-label="Activar pagamento online"
            />
            <span class="text-caption text-muted">
              {{ settings.onlinePayment ? "Activo" : "Inactivo" }}
            </span>
          </label>
        </div>

        <label class="field mt-5 max-w-sm">
          <span>Antecedência mínima para cancelamento (horas)</span>
          <input
            v-model.number="settings.cancelHours"
            type="number"
            min="0"
            max="168"
            required
          />
        </label>
        <label class="field mt-5 max-w-sm">
          <span>Penalização por falta (%)</span>
          <input
            v-model.number="settings.noShowPenaltyPercent"
            type="number"
            min="0"
            max="10"
            step="0.5"
          />
          <small
            >A empresa decide se aplica a taxa. Limite da MarcaFácil: 10% do
            serviço.</small
          >
        </label>
      </section>

      <div class="form-actions">
        <button class="btn btn-secondary" type="button" @click="resetSettings">
          Descartar alterações
        </button>
        <button class="btn btn-primary" type="submit" :disabled="coverBusy">
          <AppIcon name="check" :size="17" /> Guardar alterações
        </button>
      </div>
    </form>
  </div>
</template>
