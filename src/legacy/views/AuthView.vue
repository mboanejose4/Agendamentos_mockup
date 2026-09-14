<template>
  <main class="auth-page">
    <section class="auth-brand-panel desktop-only">
      <div class="auth-brand-content">
        <span class="brand-mark large">A</span
        ><span class="eyebrow light">Agenda Serviços</span>
        <h1>Uma conta.<br />Todos os seus agendamentos.</h1>
        <p>
          Consulte, marque, pague quando aplicável e acompanhe o histórico com
          uma experiência simples.
        </p>
        <div class="auth-benefits">
          <span>✓ Marcações 24/7</span><span>✓ Histórico numa só área</span
          ><span>✓ Notificações e lembretes</span>
        </div>
      </div>
    </section>
    <section class="auth-form-panel">
      <div class="auth-card">
        <button
          class="back-link"
          @click="
            go(store.previousView === 'auth' ? 'home' : store.previousView)
          "
        >
          ← Voltar
        </button>
        <div class="brand mobile-only">
          <span class="brand-mark">A</span
          ><span class="brand-copy"
            ><strong>Agenda Serviços</strong><small>Área segura</small></span
          >
        </div>
        <span class="eyebrow">{{
          store.authMode === "register" ? "Criar conta" : "Bem-vindo de volta"
        }}</span>
        <h1>
          {{
            store.authMode === "register"
              ? "Comece a marcar online"
              : "Aceder à sua conta"
          }}
        </h1>
        <p class="muted">
          {{
            store.authMode === "register"
              ? "Preencha os dados essenciais para continuar."
              : "Insira as suas credenciais para aceder à conta."
          }}
        </p>
        <form @submit.prevent="submit">
          <div v-if="store.authMode === 'register'" class="form-grid two">
            <label>Nome completo<input required value="José Mboane" /></label
            ><label>Contacto<input required value="+258 84 000 0000" /></label>
          </div>
          <label
            >E-mail<input
              type="email"
              required
              value="jose@example.com" /></label
          ><label
            >Senha
            <div class="password-field">
              <input
                :type="show ? 'text' : 'password'"
                required
                value="12345678"
              /><button type="button" @click="show = !show">
                {{ show ? "Ocultar" : "Ver" }}
              </button>
            </div></label
          >
          <div class="form-inline">
            <label class="check-row"
              ><input type="checkbox" checked /> Lembre-me</label
            ><button type="button" class="text-link" @click="forgot = true">
              Esqueceu a senha?
            </button>
          </div>
          <button class="btn btn-primary full large-btn" type="submit">
            {{ store.authMode === "register" ? "Criar conta" : "Entrar" }}
          </button>
        </form>
        <div class="auth-divider"><span>ou</span></div>
        <button class="btn btn-outline full" @click="switchMode">
          {{ store.authMode === "register" ? "Já tenho conta" : "Criar conta" }}
        </button>
        <div class="secure-note">
          🔒 Sessão segura · Mockup sem transmissão de dados
        </div>
      </div>
    </section>
    <div v-if="forgot" class="modal-backdrop" @click.self="forgot = false">
      <div class="bottom-sheet">
        <div class="sheet-handle"></div>
        <h2>Recuperar senha</h2>
        <p class="muted">
          No produto final, será enviado um código ou ligação de recuperação
          para o contacto registado.
        </p>
        <label>E-mail<input value="jose@example.com" /></label
        ><button class="btn btn-primary full" @click="forgot = false">
          Enviar instruções
        </button>
      </div>
    </div>
  </main>
</template>
<script>
import {
  appStore as store,
  go,
  completeDemoLogin,
  showToast,
} from "../store.js";
export default {
  name: "AuthView",
  data: () => ({ store, show: false, forgot: false }),
  methods: {
    go,
    switchMode() {
      store.authMode = store.authMode === "register" ? "login" : "register";
    },
    submit() {
      const target =
        store.previousView === "booking" ? "booking" : "client-dashboard";
      store.role = "client";
      showToast("Autenticação simulada com sucesso.");
      go(target);
    },
  },
};
</script>
