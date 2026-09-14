<script setup>
import AppModal from "@/Component/ui/AppModal.vue";
import { usePlatformManagementContext } from "@/Composable/platform/platformContext.js";
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
          >Nome completo<input
            v-model="userForm.name"
            required
            maxlength="100" /></label
        ><label class="field"
          >Email<input v-model="userForm.email" type="email" required /></label
        ><label class="field"
          >Telemóvel<input
            v-model="userForm.phone"
            type="tel"
            required /></label
        ><label class="field"
          >Perfil<select
            v-model="userForm.role"
            :disabled="userForm.id === state.userId"
          >
            <option v-for="(name, role) in roleNames" :key="role" :value="role">
              {{ name }}
            </option>
          </select></label
        ><label
          v-if="['manager', 'professional'].includes(userForm.role)"
          class="field"
          >Estabelecimento<select v-model="userForm.businessId" required>
            <option value="" disabled>Seleccionar estabelecimento</option>
            <option v-for="item in businesses" :key="item.id" :value="item.id">
              {{ item.name }}
            </option>
          </select></label
        ><label class="field form-grid-full"
          >{{
            userForm.id
              ? "Nova palavra-passe (opcional)"
              : "Palavra-passe inicial"
          }}<input
            v-model="userForm.password"
            type="password"
            autocomplete="new-password"
            minlength="8"
            :required="!userForm.id"
            placeholder="Pelo menos 8 caracteres" /></label
        ><template v-if="userForm.role === 'professional'"
          ><label class="field form-grid-full"
            >Especialidade<input
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
        <button type="button" class="btn btn-secondary" @click="userOpen = false">
          Cancelar</button
        ><button type="submit" class="btn btn-primary" :disabled="userSaving">
          {{ userSaving ? "A guardar…" : "Guardar utilizador" }}
        </button>
      </div>
    </form></AppModal
  >
</template>
