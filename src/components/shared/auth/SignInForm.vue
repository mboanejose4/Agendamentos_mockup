<script setup lang="ts">
import { computed } from "vue";

import AppIcon from "@/components/shared/ui/AppIcon.vue";
import PhoneInput from "@/components/shared/ui/PhoneInput.vue";
import { useSignIn } from "@/composables/auth/useSignIn.ts";

// PrimeVue Free
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import Button from "primevue/button";
import Tabs from "primevue/tabs";
import TabList from "primevue/tablist";
import Tab from "primevue/tab";

const { state, go, mode, busy, error, account, submit } = useSignIn();

/*
 * Mantém o modo de autenticação sincronizado
 * com os separadores do PrimeVue.
 */
const activeTab = computed({
  get: () => mode.value,

  set: (value: "login" | "register") => {
    mode.value = value;
    error.value = "";
  },
});

/*
 * Define o texto do botão principal.
 */
const submitLabel = computed(() => {
  if (busy.value) return "Aguarde…";

  return mode.value === "login" ? "Entrar" : "Criar conta";
});

/*
 * Abre directamente o registo de uma empresa.
 */
function registerBusiness(): void {
  state.returnView = "onboard";
  mode.value = "register";
  error.value = "";
}
</script>

<template>
  <section class="w-full">
    <!-- Informação sobre o registo da empresa -->
    <div
      v-if="state.returnView === 'onboard'"
      class="mb-6 flex items-start gap-3 rounded-4xl bg-surface-muted p-4 text-primary-text"
      role="status"
    >
      <AppIcon name="building-2" :size="20" />

      <p class="text-caption leading-[1.6]">
        <strong>Registar a sua empresa</strong>

        <br />

        Primeiro, crie uma conta ou inicie sessão. A seguir, preencha os dados
        do estabelecimento.
      </p>
    </div>

    <!-- Separadores de autenticação -->
    <Tabs v-model:value="activeTab" class="auth-tabs mb-8">
      <TabList class="auth-tab-list">
        <Tab value="login" class="auth-tab"> Iniciar sessão </Tab>

        <Tab value="register" class="auth-tab"> Criar conta </Tab>
      </TabList>
    </Tabs>

    <!-- Cabeçalho -->
    <h2 class="text-h2">
      {{
        mode === "login"
          ? "É bom ter consigo."
          : "O seu próximo momento começa aqui."
      }}
    </h2>

    <p class="mb-7 text-caption text-muted">
      {{
        mode === "login"
          ? "Entre para acompanhar as suas marcações."
          : "Preencha os seus dados para continuar."
      }}
    </p>

    <!-- Formulário -->
    <form class="flex flex-col gap-5" @submit.prevent="submit">
      <!-- Nome completo -->
      <label v-if="mode === 'register'" class="field">
        <span>Nome completo</span>

        <InputText
          v-model.trim="account.name"
          name="name"
          autocomplete="name"
          data-person-name
          required
          :maxlength="100"
          placeholder="O seu nome"
          class="auth-input !w-full !rounded-4xl"
        />
      </label>

      <!-- E-mail -->
      <label class="field">
        <span>
          {{ mode === "login" ? "Contacto ou email" : "E-mail" }}
          <span v-if="mode === 'register'" class="text-muted">
            (opcional)
          </span>
        </span>

        <InputText
          v-model.trim="account.email"
          :name="mode === 'login' ? 'username' : 'email'"
          :type="mode === 'login' ? 'text' : 'email'"
          :autocomplete="mode === 'login' ? 'username' : 'email'"
          :required="mode === 'login'"
          :placeholder="
            mode === 'login'
              ? '+258 84 000 0000 ou nome@exemplo.com'
              : 'nome@exemplo.com'
          "
          class="auth-input !w-full !rounded-4xl"
        />
      </label>

      <!-- Telemóvel -->
      <label v-if="mode === 'register'" class="field">
        <span>Telemóvel</span>

        <PhoneInput
          v-model.trim="account.phone"
          name="phone"
          autocomplete="tel"
          required
        />
      </label>

      <!-- Palavra-passe -->
      <label class="field">
        <span>Palavra-passe</span>

        <Password
          v-model="account.password"
          name="password"
          :feedback="false"
          toggle-mask
          fluid
          required
          :minlength="mode === 'register' ? 8 : 1"
          :autocomplete="
            mode === 'register' ? 'new-password' : 'current-password'
          "
          :placeholder="
            mode === 'register'
              ? 'Pelo menos 8 caracteres'
              : 'A sua palavra-passe'
          "
          class="auth-password !w-full"
          input-class="!w-full !rounded-4xl"
        />
      </label>

      <!-- Confirmação da palavra-passe -->
      <label v-if="mode === 'register'" class="field">
        <span>Confirmar palavra-passe</span>

        <Password
          v-model="account.confirmPassword"
          name="confirmPassword"
          :feedback="false"
          toggle-mask
          fluid
          required
          :minlength="8"
          autocomplete="new-password"
          placeholder="Repita a palavra-passe"
          :invalid="
            Boolean(account.confirmPassword) &&
            account.password !== account.confirmPassword
          "
          class="auth-password !w-full"
          input-class="!w-full !rounded-4xl"
        />

        <small
          v-if="
            account.confirmPassword &&
            account.password !== account.confirmPassword
          "
          class="text-danger"
        >
          As palavras-passe não coincidem.
        </small>
      </label>

      <!-- Mensagem de erro -->
      <p v-if="error" class="error-message" role="alert">
        {{ error }}
      </p>

      <!-- Botão principal -->
      <Button
        type="submit"
        :disabled="busy"
        class="btn btn-primary !w-full !rounded-4xl"
      >
        <AppIcon
          v-if="busy"
          name="loader-circle"
          :size="17"
          class="animate-spin"
        />

        <span>{{ submitLabel }}</span>

        <AppIcon v-if="!busy" name="arrow-right" :size="17" />
      </Button>
    </form>

    <!-- Registar estabelecimento -->
    <Button
      v-if="state.returnView !== 'onboard'"
      type="button"
      text
      class="text-button mt-5 !rounded-4xl"
      @click="registerBusiness"
    >
      <AppIcon name="building-2" :size="17" />

      Quero registar a minha empresa
    </Button>

    <!-- Voltar à exploração -->
    <Button
      type="button"
      text
      class="text-button !rounded-4xl"
      @click="go('explore')"
    >
      <AppIcon name="arrow-left" :size="16" />

      Continuar a explorar
    </Button>
  </section>
</template>

<style scoped>
/* Os campos seguem os tokens partilhados (`--field-*`): claro a branco,
   escuro a verde com texto branco, sem uma segunda paleta neste ficheiro. */
.auth-input,
.auth-password :deep(.p-password-input) {
  width: 100%;
  border-radius: var(--radius-4xl, 2rem) !important;

  background-color: var(--field-bg) !important;
  color: var(--field-ink) !important;

  border: 1px solid;
  box-shadow: none;
}

/* Placeholder */
.auth-input::placeholder,
.auth-password :deep(.p-password-input::placeholder) {
  color: var(--field-placeholder);
}

/* Foco */
.auth-input:focus,
.auth-password :deep(.p-password-input:focus) {
  border-color: var(--brand-500) !important;
  box-shadow: 0 0 0 1px var(--brand-500) !important;
  outline: none;
}

/* Wrapper do campo de palavra-passe */
.auth-password {
  width: 100%;
}

/* Ícone de mostrar/ocultar palavra-passe */
.auth-password :deep(.p-password-toggle-mask-icon) {
  margin-right: 0.25rem;
}

.auth-tabs {
  width: 100%;
}

/* Remove o fundo e as bordas externas */
.auth-tabs :deep(.p-tabs),
.auth-tabs :deep(.p-tablist) {
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
}

/* Container dos separadores */
.auth-tabs :deep(.p-tablist-tab-list) {
  display: flex;
  gap: 0.25rem;
  padding: 0.25rem;

  border: none !important;
  border-bottom: 0 !important;

  border-radius: var(--radius-4xl, 2rem);

  background: var(--surface-muted) !important;

  box-shadow: none !important;
}

.auth-tabs :deep(.p-tab) {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;

  min-height: 44px;
  padding: 0.75rem 1rem;

  border: none !important;
  border-bottom: 0 !important;

  border-radius: var(--radius-4xl, 2rem);

  background: transparent !important;
  color: var(--muted) !important;

  box-shadow: none !important;
  outline: none;

  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.auth-tabs :deep(.p-tab[aria-selected="true"]) {
  background: var(--selected-bg) !important;
  color: var(--selected-ink) !important;

  border: none !important;
  border-bottom: 0 !important;

  border-radius: var(--radius-4xl, 2rem);

  box-shadow: none !important;
}

/* Remove o indicador inferior do PrimeVue */
.auth-tabs :deep(.p-tablist-active-bar) {
  display: none !important;
}

/* Remove qualquer pseudo-elemento decorativo */
.auth-tabs :deep(.p-tab::before),
.auth-tabs :deep(.p-tab::after) {
  display: none !important;
}

.auth-tabs :deep(.p-tab:hover:not([aria-selected="true"])) {
  background: var(--surface) !important;
  color: var(--ink) !important;
}

/* Mantém o fundo verde quando o tab activo
   recebe hover ou foco */
.auth-tabs :deep(.p-tab[aria-selected="true"]:hover),
.auth-tabs :deep(.p-tab[aria-selected="true"]:focus-visible) {
  background: var(--selected-bg) !important;
  color: var(--selected-ink) !important;
  border-bottom: 0 !important;
}

:global(:root[data-theme="dark"]) .auth-tabs :deep(.p-tablist-tab-list) {
  background: var(--surface-muted) !important;
}

:global(:root[data-theme="dark"])
  .auth-tabs
  :deep(.p-tab:hover:not([aria-selected="true"])) {
  background: var(--surface) !important;
  color: var(--ink) !important;
}
</style>
