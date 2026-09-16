<script setup lang="ts">
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import { useSignIn } from "@/composables/auth/useSignIn.ts";
const { state, go, mode, showPassword, busy, error, account, submit } =
  useSignIn();
</script>
<template>
  <section>
    <div
      v-if="state.returnView === 'onboard'"
      class="mb-6 flex items-start gap-3 rounded-lg bg-surface-muted p-4 text-primary-text"
      role="status"
    >
      <AppIcon name="building-2" :size="20" />
      <p class="text-caption leading-[1.6]">
        <strong>Registar a sua empresa</strong><br />Primeiro, crie uma conta ou
        inicie sessão. A seguir, preencha os dados do estabelecimento.
      </p>
    </div>
    <div class="tabs mb-8">
      <button
        :class="{ active: mode === 'login' }"
        @click="
          mode = 'login';
          error = '';
        "
      >
        Iniciar sessão</button
      ><button
        :class="{ active: mode === 'register' }"
        @click="
          mode = 'register';
          error = '';
        "
      >
        Criar conta
      </button>
    </div>
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
    <form @submit.prevent="submit">
      <label v-if="mode === 'register'" class="field"
        >Nome completo<input
          v-model.trim="account.name"
          required
          autocomplete="name"
          placeholder="O seu nome" /></label
      ><label class="field"
        >E-mail<input
          type="email"
          v-model.trim="account.email"
          required
          autocomplete="email"
          placeholder="nome@exemplo.com" /></label
      ><label v-if="mode === 'register'" class="field"
        >Telemóvel<input
          type="tel"
          v-model.trim="account.phone"
          required
          autocomplete="tel"
          placeholder="+258" /></label
      ><label class="field"
        >Palavra-passe
        <div class="relative">
          <input
            v-model="account.password"
            :type="showPassword ? 'text' : 'password'"
            :minlength="mode === 'register' ? 8 : 1"
            required
            :autocomplete="
              mode === 'register' ? 'new-password' : 'current-password'
            "
            :placeholder="
              mode === 'register'
                ? 'Pelo menos 8 caracteres'
                : 'A sua palavra-passe'
            "
            class="pr-[45px]"
          /><button
            class="icon-btn absolute top-[3px] right-[3px]"
            type="button"
            :title="
              showPassword ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'
            "
            :aria-label="
              showPassword ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'
            "
            @click="showPassword = !showPassword"
          >
            <AppIcon :name="showPassword ? 'eye-off' : 'eye'" :size="18" />
          </button></div
      ></label>
      <p v-if="error" class="error-message" role="alert">{{ error }}</p>
      <button :disabled="busy" class="btn btn-primary w-full">
        <AppIcon v-if="busy" name="loader-circle" :size="17" />{{
          busy ? "Aguarde…" : mode === "login" ? "Entrar" : "Criar conta"
        }}<AppIcon name="arrow-right" :size="17" />
      </button>
    </form>
    <button
      v-if="state.returnView !== 'onboard'"
      type="button"
      class="text-button mt-5"
      @click="
        state.returnView = 'onboard';
        mode = 'register';
        error = '';
      "
    >
      <AppIcon name="building-2" :size="17" />Quero registar a minha empresa
    </button>
    <div class="my-6 flex items-start gap-[9px] text-muted">
      <AppIcon name="lock-keyhole" :size="16" />
      <p class="text-caption">
        Conta guardada neste navegador. Use dados de teste neste ambiente local.
      </p>
    </div>
    <button class="text-button" @click="go('explore')">
      <AppIcon name="arrow-left" :size="16" />Continuar a explorar
    </button>
  </section>
</template>
