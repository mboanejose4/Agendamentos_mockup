<script setup lang="ts">
import AppModal from "@/components/shared/ui/AppModal.vue";
import BrandingEditor from "@/components/shared/ui/BrandingEditor.vue";
import PhoneInput from "@/components/shared/ui/PhoneInput.vue";
import { usePlatformManagementContext } from "@/composables/platform/platformContext.ts";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import Select from "primevue/select";
const {
  categories,
  companyOpen,
  companyError,
  companySaving,
  companyForm,
  saveCompany,
  dayOptions,
} = usePlatformManagementContext();
</script>
<template>
  <AppModal
    v-model="companyOpen"
    :title="companyForm.id ? 'Editar estabelecimento' : 'Novo estabelecimento'"
    :width="700"
    ><form @submit.prevent="saveCompany">
      <div class="form-grid">
        <label class="field form-grid-full"
          ><span>Nome do estabelecimento</span
          ><InputText
            v-model="companyForm.name"
            required
            maxlength="100" /></label
        ><label class="field"
          >Sector<Select
            v-model="companyForm.category"
            :options="[
              ...categories.map((category) => ({
                label: category,
                value: category,
              })),
            ]"
            option-label="label"
            option-value="value"
            append-to="self" /></label
        ><label class="field"
          ><span>Cidade</span
          ><InputText v-model="companyForm.city" required /></label
        ><label class="field form-grid-full"
          ><span>Descrição</span
          ><Textarea
            v-model="companyForm.description"
            rows="2"
            maxlength="600"
            required /></label
        ><label class="field form-grid-full"
          ><span>Endereço</span
          ><InputText v-model="companyForm.address" required /></label
        ><label class="field"
          ><span>Email</span
          ><InputText
            v-model="companyForm.email"
            type="email"
            required /></label
        ><label class="field"
          ><span>Telefone</span
          ><PhoneInput v-model="companyForm.phone" required /></label
        ><label class="field form-grid-full"
          >Fotografia (URL)<InputText
            v-model="companyForm.image"
            type="url"
            placeholder="https://..." /></label
        ><label class="field"
          ><span>Abertura</span
          ><input v-model="companyForm.opens" type="time" required /></label
        ><label class="field"
          ><span>Fecho</span
          ><input v-model="companyForm.closes" type="time" required /></label
        ><label class="field"
          ><span>Antecedência para cancelar (horas)</span
          ><input
            v-model.number="companyForm.cancelHours"
            type="number"
            min="0"
            max="168"
            required
        /></label>
        <div class="field">
          <span>Dias de funcionamento</span>
          <div class="mt-1 flex flex-wrap gap-x-4 gap-y-2">
            <label
              v-for="day in dayOptions"
              :key="day.id"
              class="inline-flex items-center gap-1.5 text-caption font-normal text-ink"
              ><input
                v-model="companyForm.days"
                :value="day.id"
                type="checkbox"
              />{{ day.name }}</label
            >
          </div>
        </div>
        <label class="check-field"
          ><input v-model="companyForm.active" type="checkbox" />
          Estabelecimento activo</label
        ><label class="check-field"
          ><input v-model="companyForm.onlinePayment" type="checkbox" /> Aceitar
          pagamento online</label
        >
      </div>
      <!-- A marca é escolhida já na criação: é ela que o cliente vê ao abrir
           a página do estabelecimento e ao marcar. -->
      <section class="mt-6 border-t border-line pt-6">
        <h3>Aparência do estabelecimento</h3>
        <p class="mb-4 text-caption text-muted">
          Estas cores acompanham o cliente na página do estabelecimento e
          durante a marcação.
        </p>
        <BrandingEditor
          v-model="companyForm.branding"
          :business-name="companyForm.name"
        />
      </section>
      <section v-if="!companyForm.id" class="mt-6 border-t border-line pt-6">
        <h3>Conta do gestor</h3>
        <div class="form-grid">
          <label class="field"
            ><span>Nome do gestor</span
            ><InputText
              v-model="companyForm.managerName"
              data-person-name
              :required="Boolean(companyForm.managerEmail)" /></label
          ><label class="field"
            ><span>Email do gestor</span
            ><InputText
              v-model="companyForm.managerEmail"
              type="email"
              :required="
                Boolean(companyForm.managerName || companyForm.managerPassword)
              " /></label
          ><label class="field form-grid-full"
            ><span>Palavra-passe inicial</span
            ><input
              v-model="companyForm.managerPassword"
              type="password"
              autocomplete="new-password"
              minlength="8"
              :required="Boolean(companyForm.managerEmail)"
              placeholder="Pelo menos 8 caracteres"
          /></label>
        </div>
      </section>
      <p v-if="companyError" class="error-message" role="alert">
        {{ companyError }}
      </p>
      <div class="form-actions">
        <button
          type="button"
          class="btn btn-secondary"
          @click="companyOpen = false"
        >
          Cancelar</button
        ><button
          type="submit"
          class="btn btn-primary"
          :disabled="companySaving"
        >
          {{ companySaving ? "A guardar…" : "Guardar estabelecimento" }}
        </button>
      </div>
    </form></AppModal
  >
</template>
