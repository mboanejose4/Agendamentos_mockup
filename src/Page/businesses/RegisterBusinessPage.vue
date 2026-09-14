<script setup>
import CoverImageUpload from "@/Component/ui/CoverImageUpload.vue";
import BrandingEditor from "@/Component/businesses/BrandingEditor.vue";
import { defaultBrand } from "@/Utils/theme.js";
import { reactive, ref } from "vue";
import {
  state,
  go,
  notify,
  uid,
  saveRecord,
} from "@/Store/applicationStore.js";
import AppIcon from "@/Component/ui/AppIcon.vue";
const error = ref("");
const coverBusy = ref(false);
const company = reactive({
  image: "",
  branding: { ...defaultBrand },
  name: "",
  category: "Beleza",
  city: "Maputo",
  address: "",
  phone: "",
  email: "",
  description: "",
  opens: "08:00",
  closes: "18:00",
});
function createCompany() {
  error.value = "";
  if (
    state.role === "guest" ||
    !state.db.users.some((u) => u.id === state.userId)
  ) {
    state.returnView = "onboard";
    go("auth");
    return;
  }
  if (company.opens >= company.closes) {
    error.value = "A hora de encerramento deve ser posterior à abertura.";
    return;
  }
  const record = saveRecord("businesses", {
    ...company,
    id: uid("b"),
    active: true,
    onlinePayment: false,
    days: [1, 2, 3, 4, 5, 6],
    cancelHours: 2,
    rating: 0,
    reviewCount: 0,
    ownerId: state.userId,
  });
  const user = state.db.users.find((u) => u.id === state.userId);
  if (user)
    saveRecord("users", { ...user, role: "manager", businessId: record.id });
  state.businessId = record.id;
  state.role = "manager";
  go("services");
  notify("Empresa registada. Adicione o primeiro serviço.");
}
</script>
<template>
  <div class="mx-auto max-w-[850px]">
    <header class="mb-8">
      <div>
        <span class="eyebrow">A SUA EMPRESA NA MARCAFÁCIL</span>
        <h1>Vamos conhecer o seu negócio.</h1>
        <p>Comece pelos dados do estabelecimento.</p>
      </div>
    </header>
    <form class="border-t border-line pt-6" @submit.prevent="createCompany">
      <div class="form-grid">
        <label class="field">
          Nome do estabelecimento
          <input
            v-model.trim="company.name"
            required
            maxlength="100"
            autocomplete="organization"
          />
        </label>
        <label class="field">
          Categoria
          <select v-model="company.category">
            <option>Beleza</option>
            <option>Bem-estar</option>
            <option>Saúde</option>
            <option>Restauração</option>
            <option>Outros serviços</option>
          </select>
        </label>
        <label class="field">
          Cidade
          <input v-model.trim="company.city" required />
        </label>
        <label class="field">
          Endereço
          <input
            v-model.trim="company.address"
            required
            autocomplete="street-address"
          />
        </label>
        <label class="field">
          Contacto
          <input
            v-model.trim="company.phone"
            type="tel"
            required
            autocomplete="tel"
          />
        </label>
        <label class="field">
          E-mail
          <input
            v-model.trim="company.email"
            type="email"
            required
            autocomplete="email"
          />
        </label>
        <label class="field">
          Abertura
          <input v-model="company.opens" type="time" required />
        </label>
        <label class="field">
          Encerramento
          <input v-model="company.closes" type="time" required />
        </label>
      </div>
      <label class="field">
        Sobre o estabelecimento
        <textarea
          v-model.trim="company.description"
          rows="3"
          required
          maxlength="600"
        />
      </label>
      <p v-if="error" class="error-message" role="alert">{{ error }}</p>
      <CoverImageUpload
        v-model="company.image"
        :name="company.name"
        @busy-change="coverBusy = $event"
      />
      <BrandingEditor
        v-model="company.branding"
        :business-name="company.name"
      />
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" @click="go('explore')">
          Voltar
        </button>
        <button class="btn btn-primary" :disabled="coverBusy">
          Criar estabelecimento<AppIcon name="arrow-right" :size="17" />
        </button>
      </div>
    </form>
  </div>
</template>
