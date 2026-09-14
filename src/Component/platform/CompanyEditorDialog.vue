<script setup>
import AppModal from "@/Component/ui/AppModal.vue";
import { usePlatformManagementContext } from "@/Composable/platform/platformContext.js";
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
          >Nome do estabelecimento<input
            v-model="companyForm.name"
            required
            maxlength="100" /></label
        ><label class="field"
          >Sector<select v-model="companyForm.category">
            <option v-for="category in categories" :key="category">
              {{ category }}
            </option>
          </select></label
        ><label class="field"
          >Cidade<input v-model="companyForm.city" required /></label
        ><label class="field form-grid-full"
          >Descrição<textarea
            v-model="companyForm.description"
            rows="2"
            maxlength="600"
            required
          ></textarea></label
        ><label class="field form-grid-full"
          >Endereço<input v-model="companyForm.address" required /></label
        ><label class="field"
          >Email<input
            v-model="companyForm.email"
            type="email"
            required /></label
        ><label class="field"
          >Telefone<input
            v-model="companyForm.phone"
            type="tel"
            required /></label
        ><label class="field form-grid-full"
          >Fotografia (URL)<input
            v-model="companyForm.image"
            type="url"
            placeholder="https://..." /></label
        ><label class="field"
          >Abertura<input
            v-model="companyForm.opens"
            type="time"
            required /></label
        ><label class="field"
          >Fecho<input
            v-model="companyForm.closes"
            type="time"
            required /></label
        ><label class="field"
          >Antecedência para cancelar (horas)<input
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
      <section v-if="!companyForm.id" class="mt-6 border-t border-line pt-6">
        <h3>Conta do gestor</h3>
        <div class="form-grid">
          <label class="field"
            >Nome do gestor<input
              v-model="companyForm.managerName"
              :required="Boolean(companyForm.managerEmail)" /></label
          ><label class="field"
            >Email do gestor<input
              v-model="companyForm.managerEmail"
              type="email"
              :required="
                Boolean(companyForm.managerName || companyForm.managerPassword)
              " /></label
          ><label class="field form-grid-full"
            >Palavra-passe inicial<input
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
        ><button type="submit" class="btn btn-primary" :disabled="companySaving">
          {{ companySaving ? "A guardar…" : "Guardar estabelecimento" }}
        </button>
      </div>
    </form></AppModal
  >
</template>
