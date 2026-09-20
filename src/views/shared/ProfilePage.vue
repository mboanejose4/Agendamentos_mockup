<script setup lang="ts">
import { ref } from "vue";

import AppIcon from "@/components/shared/ui/AppIcon.vue";
import AvatarUpload from "@/components/shared/ui/AvatarUpload.vue";

import Tabs from "primevue/tabs";
import TabList from "primevue/tablist";
import Tab from "primevue/tab";

import InputText from "primevue/inputtext";
import Password from "primevue/password";
import ToggleSwitch from "primevue/toggleswitch";

import type { Role } from "@/types/domain.ts";

import { useAccountManagementContext } from "@/composables/account/accountContext.ts";

/* Separador actualmente seleccionado */
const tab = ref<"pessoais" | "seguranca" | "preferencias">(
  "pessoais",
);

const {
  state,
  business,
  currentUser,
  professional,
  isProfessional,
  profileForm,
  profileError,
  saveProfile,
  updateAvatar,
} = useAccountManagementContext();

const roleNames: Record<Role, string> = {
  guest: "Visitante",
  client: "Cliente",
  professional: "Profissional",
  manager: "Gestor",
  platform: "Administrador da plataforma",
};

/* Estilo reutilizável para os campos PrimeVue */
const inputClass =
  "profile-input !w-full !rounded-4xl";
</script>

<template>
  <div class="grid grid-cols-1 gap-8 lg:grid-cols-[300px_1fr] lg:gap-10">
    <!-- Identidade e fotografia de perfil -->
    <aside class="card rounded-4xl p-6 lg:sticky lg:top-6 lg:self-start">
      <AvatarUpload :model-value="profileForm.avatar" :name="profileForm.name ||
        currentUser.name ||
        professional.name
        " @update:model-value="updateAvatar" />

      <div class="mt-5 border-t border-line pt-5 text-center">
        <h2 class="mb-0.5">
          {{ currentUser.name || professional.name }}
        </h2>

        <p class="mb-3 text-caption text-muted">
          {{ currentUser.email }}
        </p>

       
      </div>

      <div v-if="isProfessional"
        class="mt-4 flex items-center justify-center gap-2 border-t border-line pt-4 text-caption text-muted">
        <AppIcon name="building-2" />

        <span class="flex flex-col text-left">
          <span class="text-ink">
            {{ business(state.businessId)?.name }}
          </span>

          <small class="text-muted">
            {{ professional.title }}
          </small>
        </span>
      </div>
    </aside>

    <!-- Formulário de perfil -->
    <form class="flex min-w-0 flex-col gap-6" @submit.prevent="saveProfile">
      <!-- Separadores -->
      <Tabs v-model:value="tab" class="profile-tabs">
        <TabList>
          <Tab value="pessoais">
            Informações pessoais
          </Tab>

          <Tab value="seguranca">
            Segurança
          </Tab>

          <Tab value="preferencias">
            Preferências
          </Tab>
        </TabList>
      </Tabs>

      <!-- Informações pessoais -->
      <section v-show="tab === 'pessoais'" class="card rounded-4xl p-6 sm:p-7">
        <header class="mb-5">
          <h2 class="mb-1">
            Informações pessoais
          </h2>

          <p class="mb-0 text-caption text-muted">
            Os dados que identificam a sua conta e a
            forma de a contactar.
          </p>
        </header>

        <div class="form-grid">
          <!-- Nome completo -->
          <label class="field form-grid-full">
            <span>Nome completo</span>

            <InputText v-model="profileForm.name" name="name" autocomplete="name" required :maxlength="100"
              placeholder="Introduza o seu nome completo" :class="inputClass" />
          </label>

          <!-- Email -->
          <label class="field">
            <span>Email</span>

            <InputText v-model="profileForm.email" name="email" type="email" autocomplete="email" required
              placeholder="exemplo@email.com" :class="inputClass" />
          </label>

          <!-- Telemóvel -->
          <label class="field">
            <span>Telemóvel</span>

            <InputText v-model="profileForm.phone" name="phone" type="tel" autocomplete="tel" required
              placeholder="+258 84 000 0000" :class="inputClass" />
          </label>
        </div>
      </section>

      <!-- Segurança -->
      <section v-show="tab === 'seguranca'" class="card rounded-4xl p-6 sm:p-7">
        <header class="mb-5">
          <h2 class="mb-1">
            Segurança
          </h2>

          <p class="mb-0 text-caption text-muted">
            Defina uma nova palavra-passe. Deixe em
            branco para manter a actual.
          </p>
        </header>

        <div class="form-grid">
          <!-- Nova palavra-passe -->
          <label class="field">
            <span>Nova palavra-passe</span>

            <Password v-model="profileForm.password" name="password" autocomplete="new-password" :minlength="8"
              placeholder="Pelo menos 8 caracteres" :feedback="false" toggle-mask fluid :class="inputClass"
              input-class="!w-full !rounded-4xl" />
          </label>

          <!-- Confirmar palavra-passe -->
          <label class="field">
            <span>Confirmar palavra-passe</span>

            <Password v-model="profileForm.confirmPassword" name="confirmPassword" autocomplete="new-password"
              :required="Boolean(profileForm.password)" placeholder="Repita a nova palavra-passe" :feedback="false"
              toggle-mask fluid :class="inputClass" input-class="!w-full !rounded-4xl" />
          </label>
        </div>
      </section>

      <!-- Preferências e comunicação -->
      <section v-show="tab === 'preferencias'" class="card rounded-4xl p-6 sm:p-7">
        <header class="mb-5">
          <h2 class="mb-1">
            Preferências e comunicação
          </h2>

          <p class="mb-0 text-caption text-muted">
            Escolha como quer ser avisado sobre os
            seus agendamentos.
          </p>
        </header>

        <!-- Notificações por email -->
        <label class="flex items-center justify-between gap-4 border-b border-line py-4">
          <span class="min-w-0">
            <strong class="block text-small text-ink">
              Email
            </strong>

            <small class="mt-0.5 block text-caption text-muted">
              Confirmações e alterações de agendamentos.
            </small>
          </span>

          <ToggleSwitch v-model="profileForm.notificationEmail" />
        </label>

        <!-- Notificações por SMS -->
        <label class="flex items-center justify-between gap-4 border-b border-line py-4 last:border-b-0">
          <span class="min-w-0">
            <strong class="block text-small text-ink">
              SMS
            </strong>

            <small class="mt-0.5 block text-caption text-muted">
              Lembretes no número associado à sua conta.
            </small>
          </span>

          <ToggleSwitch v-model="profileForm.notificationSms" />
        </label>
      </section>

      <!-- Mensagem de erro -->
      <p v-if="profileError" class="error-message" role="alert">
        {{ profileError }}
      </p>

      <!-- Guardar alterações -->
      <div class="form-actions mt-0 border-t-0 pt-0">
        <button class="btn btn-primary rounded-4xl" type="submit">
          <AppIcon name="check" />

          Guardar alterações
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
/*
 * Campos PrimeVue:
 * largura completa, cantos arredondados
 * e cores da identidade visual MarcaFácil.
 */

.profile-input {
  width: 100%;
  border-radius: var(--radius-4xl, 2rem);
}

/* Input interno do componente Password */
.profile-input :deep(.p-password-input) {
  width: 100%;
  border-radius: var(--radius-4xl, 2rem);
}

/* Wrapper do Password */
.profile-input:deep(.p-password) {
  width: 100%;
}


.profile-input :deep(.p-password-toggle-mask-icon) {
  margin-right: 0.25rem;
}

/* Separadores com o mesmo padrão visual */
.profile-tabs :deep(.p-tablist) {
  border-radius: var(--radius-4xl, 2rem);
  overflow: hidden;
}

.profile-tabs :deep(.p-tablist-tab-list) {
  background: var(--surface, transparent);
}

.profile-tabs :deep(.p-tab) {
  border-radius: var(--radius-4xl, 2rem);
}
</style>