<script setup>
import AppIcon from "@/Component/ui/AppIcon.vue";
import { useAccountManagementContext } from "@/Composable/account/accountContext.js";
const {
  state,
  business,
  currentUser,
  professional,
  isProfessional,
  profileForm,
  profileError,
  saveProfile,
} = useAccountManagementContext();
</script>
<template>
  <div>
    <div class="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr] lg:gap-10">
      <aside class="card p-6 text-center lg:sticky lg:top-6 lg:self-start">
        <div class="avatar mx-auto size-16 text-h2">
          {{
            profileForm.name
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((word) => word[0])
              .join("") || "EU"
          }}
        </div>
        <h2 class="mt-3 mb-0.5">{{ currentUser.name || professional.name }}</h2>
        <p class="mb-3 text-caption text-muted">{{ currentUser.email }}</p>
        <span class="badge badge-success">{{
          {
            client: "Cliente",
            professional: "Profissional",
            manager: "Gestor",
            platform: "Administrador da plataforma",
          }[state.role]
        }}</span>
        <div
          v-if="isProfessional"
          class="mt-4 flex items-center justify-center gap-2 border-t border-line pt-4 text-caption text-muted"
        >
          <AppIcon name="building-2" /><span class="flex flex-col text-left"
            ><span class="text-ink">{{
              business(state.businessId)?.name
            }}</span
            ><small class="text-muted">{{ professional.title }}</small></span
          >
        </div>
      </aside>
      <form class="flex flex-col gap-8" @submit.prevent="saveProfile">
        <section>
          <h2 class="mb-5 text-body-lg">Informações pessoais</h2>
          <div class="form-grid">
            <label class="field form-grid-full"
              >Nome completo<input
                v-model="profileForm.name"
                autocomplete="name"
                required
                maxlength="100" /></label
            ><label class="field"
              >Email<input
                v-model="profileForm.email"
                type="email"
                autocomplete="email"
                required /></label
            ><label class="field"
              >Telemóvel<input
                v-model="profileForm.phone"
                type="tel"
                autocomplete="tel"
                placeholder="+258 84 000 0000"
                required
            /></label>
          </div>
        </section>
        <section>
          <h2 class="mb-5 text-body-lg">Segurança</h2>
          <div class="form-grid">
            <label class="field"
              >Nova palavra-passe<input
                v-model="profileForm.password"
                type="password"
                autocomplete="new-password"
                minlength="8"
                placeholder="Pelo menos 8 caracteres" /></label
            ><label class="field"
              >Confirmar palavra-passe<input
                v-model="profileForm.confirmPassword"
                type="password"
                autocomplete="new-password"
                :required="Boolean(profileForm.password)"
                placeholder="Repita a nova palavra-passe"
            /></label>
          </div>
        </section>
        <section>
          <h2 class="mb-5 text-body-lg">Preferências de comunicação</h2>
          <label
            class="flex items-center justify-between gap-4 border-b border-line py-4"
            ><span class="min-w-0"
              ><strong class="block text-small text-ink">Email</strong
              ><small class="mt-0.5 block text-caption text-muted"
                >Confirmações e alterações de agendamentos.</small
              ></span
            ><input
              v-model="profileForm.notificationEmail"
              type="checkbox"
              role="switch" /></label
          ><label
            class="flex items-center justify-between gap-4 border-b border-line py-4 last:border-b-0"
            ><span class="min-w-0"
              ><strong class="block text-small text-ink">SMS</strong
              ><small class="mt-0.5 block text-caption text-muted"
                >Lembretes no número associado à sua conta.</small
              ></span
            ><input
              v-model="profileForm.notificationSms"
              type="checkbox"
              role="switch"
          /></label>
        </section>
        <p v-if="profileError" class="error-message" role="alert">
          {{ profileError }}
        </p>
        <div class="form-actions">
          <button class="btn btn-primary" type="submit">
            <AppIcon name="check" /> Guardar alterações
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
