<script setup lang="ts">
import AppModal from "@/components/shared/ui/AppModal.vue";
import PhoneInput from "@/components/shared/ui/PhoneInput.vue";
import { usePlatformManagementContext } from "@/composables/platform/platformContext.ts";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
const {
  state,
  roleNames,
  businesses,
  userOpen,
  userForm,
  userError,
  userSaving,
  userServices,
  saveUser,
} = usePlatformManagementContext();
</script>
<template>
  <AppModal
    v-model="userOpen"
    :title="userForm.id ? 'Editar utilizador' : 'Novo utilizador'"
    :width="600"
    ><form @submit.prevent="saveUser">
      <div class="form-grid">
        <label class="field form-grid-full"
          ><span>Nome completo</span
          ><InputText
            v-model="userForm.name"
            data-person-name
            required
            maxlength="100" /></label
        ><label class="field"
          ><span>Email</span
          ><InputText v-model="userForm.email" type="email" required /></label
        ><label class="field"
          ><span>Telemóvel</span
          ><PhoneInput v-model="userForm.phone" required /></label
        ><label class="field"
          >Perfil<Select
            v-model="userForm.role"
            :disabled="userForm.id === state.userId"
            :options="[
              ...Object.entries(roleNames).map(([role, name]) => ({
                label: name,
                value: role,
              })),
            ]"
            option-label="label"
            option-value="value"
            append-to="self" /></label
        ><label
          v-if="['manager', 'professional'].includes(userForm.role)"
          class="field"
          ><span>Estabelecimento</span
          ><Select
            v-model="userForm.businessId"
            required
            :options="[
              { label: 'Seleccionar estabelecimento', value: '' },
              ...businesses.map((item) => ({
                label: item.name,
                value: item.id,
              })),
            ]"
            option-label="label"
            option-value="value"
            append-to="self" /></label
        ><label class="field form-grid-full"
          ><span>{{
            userForm.id
              ? "Nova palavra-passe (opcional)"
              : "Palavra-passe inicial"
          }}</span
          ><input
            v-model="userForm.password"
            type="password"
            autocomplete="new-password"
            minlength="8"
            :required="!userForm.id"
            placeholder="Pelo menos 8 caracteres" /></label
        ><template v-if="userForm.role === 'professional'"
          ><label class="field form-grid-full"
            ><span>Especialidade</span
            ><InputText
              v-model="userForm.title"
              placeholder="Ex.: Terapeuta, médico, especialista"
              required
          /></label>
          <fieldset
            class="form-grid-full mt-1 flex flex-col gap-2 border-t border-line pt-4"
          >
            <legend class="mb-1 text-caption font-medium text-ink">
              Serviços atribuídos
            </legend>
            <label
              v-for="item in userServices"
              :key="item.id"
              class="check-field"
              ><input
                v-model="userForm.serviceIds"
                type="checkbox"
                :value="item.id"
              />{{ item.name }}</label
            >
            <p v-if="!userServices.length" class="text-muted">
              O estabelecimento ainda não tem serviços activos.
            </p>
          </fieldset></template
        ><label class="check-field form-grid-full"
          ><input
            v-model="userForm.active"
            type="checkbox"
            :disabled="userForm.id === state.userId"
          />
          Conta activa</label
        >
      </div>
      <p v-if="userError" class="error-message" role="alert">{{ userError }}</p>
      <div class="form-actions">
        <button
          type="button"
          class="btn btn-secondary"
          @click="userOpen = false"
        >
          Cancelar</button
        ><button type="submit" class="btn btn-primary" :disabled="userSaving">
          {{ userSaving ? "A guardar…" : "Guardar utilizador" }}
        </button>
      </div>
    </form></AppModal
  >
</template>
