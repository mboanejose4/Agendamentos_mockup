<script setup lang="ts">
import { ref } from "vue";
const coverBusy = ref(false);
import CoverImageUpload from "@/components/shared/ui/CoverImageUpload.vue";
import BrandingEditor from "@/components/manager/BrandingEditor.vue";
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import { useBusinessManagementContext } from "@/composables/businesses/businessContext.ts";
const { form, settings, resetSettings, saveSettings } =
  useBusinessManagementContext();
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
            <input v-model="settings.name" required maxlength="80" />
          </label>

          <label class="field">
            <span>Categoria</span>
            <select v-model="settings.category">
              <option>Beleza</option>
              <option>Bem-estar</option>
              <option>Saúde</option>
              <option>Restauração</option>
              <option>Consultoria</option>
              <option>Desporto</option>
              <option>Outros serviços</option>
            </select>
          </label>

          <label class="field form-grid-full">
            <span>Descrição</span>
            <textarea
              v-model="settings.description"
              rows="3"
              maxlength="600"
            ></textarea>
          </label>

          <label class="field">
            <span>Cidade</span>
            <input v-model="settings.city" required />
          </label>

          <label class="field">
            <span>Morada</span>
            <input v-model="settings.address" required />
          </label>

          <label class="field">
            <span>Telefone</span>
            <input v-model="settings.phone" type="tel" placeholder="+258" />
          </label>

          <label class="field">
            <span>Email</span>
            <input v-model="settings.email" type="email" />
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
