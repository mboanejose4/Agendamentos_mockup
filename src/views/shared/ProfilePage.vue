<script setup lang="ts">
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import { ref } from "vue";
import Tabs from "primevue/tabs";
import TabList from "primevue/tablist";
import Tab from "primevue/tab";
import AvatarUpload from "@/components/shared/ui/AvatarUpload.vue";

/* Qual das três partes do perfil está à vista. */
const tab = ref<"pessoais" | "seguranca" | "preferencias">("pessoais");
import type { Role } from "@/types/domain.ts";
import { useAccountManagementContext } from "@/composables/account/accountContext.ts";
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
</script>

<template>
  <div class="grid grid-cols-1 gap-8 lg:grid-cols-[300px_1fr] lg:gap-10">
    <!-- 0. Identidade e fotografia de perfil -->
    <aside class="card p-6 lg:sticky lg:top-6 lg:self-start">
      <AvatarUpload
        :model-value="profileForm.avatar"
        :name="profileForm.name || currentUser.name || professional.name"
        @update:model-value="updateAvatar"
      />

      <div class="mt-5 border-t border-line pt-5 text-center">
        <h2 class="mb-0.5">{{ currentUser.name || professional.name }}</h2>
        <p class="mb-3 text-caption text-muted">{{ currentUser.email }}</p>
        <span class="badge badge-success">{{ roleNames[state.role] }}</span>
      </div>

      <div
        v-if="isProfessional"
        class="mt-4 flex items-center justify-center gap-2 border-t border-line pt-4 text-caption text-muted"
      >
        <AppIcon name="building-2" />
        <span class="flex flex-col text-left">
          <span class="text-ink">{{ business(state.businessId)?.name }}</span>
          <small class="text-muted">{{ professional.title }}</small>
        </span>
      </div>

      <p class="mt-4 text-center text-caption text-muted">
        A fotografia é guardada assim que a escolhe.
      </p>
    </aside>

    <form class="flex flex-col gap-6" @submit.prevent="saveProfile">
      <!-- Separadores do PrimeVue: as três partes do perfil deixam de estar
           empilhadas e passam a navegar-se aqui. Os painéis mantêm-se no DOM
           para que o formulário continue a ser um só, e o que se escreve num
           separador não se perde ao mudar para outro. -->
      <Tabs v-model:value="tab">
        <TabList>
          <Tab value="pessoais">Informações pessoais</Tab>
          <Tab value="seguranca">Segurança</Tab>
          <Tab value="preferencias">Preferências</Tab>
        </TabList>
      </Tabs>

      <!-- 1. Informações pessoais -->
      <section v-show="tab === 'pessoais'" class="card p-6 sm:p-7">
        <header class="mb-5">
          <h2 class="mb-1">Informações pessoais</h2>
          <p class="mb-0 text-caption text-muted">
            Os dados que identificam a sua conta e a forma de a contactar.
          </p>
        </header>

        <div class="form-grid">
          <label class="field form-grid-full">
            <span>Nome completo</span>
            <input
              v-model="profileForm.name"
              autocomplete="name"
              required
              maxlength="100"
            />
          </label>

          <label class="field">
            <span>Email</span>
            <input
              v-model="profileForm.email"
              type="email"
              autocomplete="email"
              required
            />
          </label>

          <label class="field">
            <span>Telemóvel</span>
            <input
              v-model="profileForm.phone"
              type="tel"
              autocomplete="tel"
              placeholder="+258 84 000 0000"
              required
            />
          </label>
        </div>
      </section>

      <!-- 2. Segurança -->
      <section v-show="tab === 'seguranca'" class="card p-6 sm:p-7">
        <header class="mb-5">
          <h2 class="mb-1">Segurança</h2>
          <p class="mb-0 text-caption text-muted">
            Defina uma nova palavra-passe. Deixe em branco para manter a actual.
          </p>
        </header>

        <div class="form-grid">
          <label class="field">
            <span>Nova palavra-passe</span>
            <input
              v-model="profileForm.password"
              type="password"
              autocomplete="new-password"
              minlength="8"
              placeholder="Pelo menos 8 caracteres"
            />
          </label>

          <label class="field">
            <span>Confirmar palavra-passe</span>
            <input
              v-model="profileForm.confirmPassword"
              type="password"
              autocomplete="new-password"
              :required="Boolean(profileForm.password)"
              placeholder="Repita a nova palavra-passe"
            />
          </label>
        </div>
      </section>

      <!-- 3. Preferências e comunicação -->
      <section v-show="tab === 'preferencias'" class="card p-6 sm:p-7">
        <header class="mb-5">
          <h2 class="mb-1">Preferências e comunicação</h2>
          <p class="mb-0 text-caption text-muted">
            Escolha como quer ser avisado sobre os seus agendamentos.
          </p>
        </header>

        <label
          class="flex items-center justify-between gap-4 border-b border-line py-4"
        >
          <span class="min-w-0">
            <strong class="block text-small text-ink">Email</strong>
            <small class="mt-0.5 block text-caption text-muted">
              Confirmações e alterações de agendamentos.
            </small>
          </span>
          <input
            v-model="profileForm.notificationEmail"
            type="checkbox"
            role="switch"
          />
        </label>

        <label
          class="flex items-center justify-between gap-4 border-b border-line py-4 last:border-b-0"
        >
          <span class="min-w-0">
            <strong class="block text-small text-ink">SMS</strong>
            <small class="mt-0.5 block text-caption text-muted">
              Lembretes no número associado à sua conta.
            </small>
          </span>
          <input
            v-model="profileForm.notificationSms"
            type="checkbox"
            role="switch"
          />
        </label>
      </section>

      <p v-if="profileError" class="error-message" role="alert">
        {{ profileError }}
      </p>

      <div class="form-actions mt-0 border-t-0 pt-0">
        <button class="btn btn-primary" type="submit">
          <AppIcon name="check" /> Guardar alterações
        </button>
      </div>
    </form>
  </div>
</template>
