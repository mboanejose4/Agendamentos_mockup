<script setup lang="ts">
import CoverImageUpload from "@/components/shared/ui/CoverImageUpload.vue";
import BrandingEditor from "@/components/shared/ui/BrandingEditor.vue";
import PhoneInput from "@/components/shared/ui/PhoneInput.vue";
import { defaultBrand } from "@/utils/theme.ts";
import { onBeforeUnmount, reactive, ref, watch } from "vue";
import { brandPreview } from "@/stores/brandPreview.ts";
import {
  state,
  go,
  notify,
  uid,
  saveRecord,
} from "@/stores/applicationStore.ts";
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
const error = ref("");
const coverBusy = ref(false);
const company = reactive({
  image: "",
  branding: { ...defaultBrand },
  name: "",
  code: "",
  package: 3 as 1 | 2 | 3 | 4,
  noShowPenaltyPercent: 0,
  category: "Beleza",
  city: "Maputo",
  address: "",
  phone: "",
  email: "",
  description: "",
  opens: "08:00",
  closes: "18:00",
});
/* A identidade escolhida acompanha o formulário e é reposta ao sair. */
watch(
  () => company.branding,
  (value) => (brandPreview.value = { ...value }),
  { deep: true, immediate: true },
);
onBeforeUnmount(() => (brandPreview.value = null));
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
  if (record.ok === false) {
    error.value = record.error || "Não foi possível registar a empresa.";
    return;
  }
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
          <span>Nome do estabelecimento</span>
          <InputText
            v-model.trim="company.name"
            required
            maxlength="100"
            autocomplete="organization"
          />
        </label>
        <label class="field">
          <span>Código da empresa</span>
          <InputText
            v-model.trim="company.code"
            maxlength="24"
            :required="company.package <= 2"
            placeholder="Ex.: SALAO-CENTRO"
          />
        </label>
        <label class="field">
          Pacote
          <Select
            v-model.number="company.package"
            :options="[
              { label: '01 · Reservas da própria empresa', value: 1 },
              { label: '02 · Profissionais independentes', value: 2 },
              { label: '03 · Exploração completa', value: 3 },
              { label: '04 · Destaque na plataforma', value: 4 },
            ]"
            option-label="label"
            option-value="value"
            append-to="self"
          />
        </label>
        <label class="field">
          Categoria
          <Select
            v-model="company.category"
            :options="[
              { label: 'Beleza', value: 'Beleza' },
              { label: 'Bem-estar', value: 'Bem-estar' },
              { label: 'Saúde', value: 'Saúde' },
              { label: 'Restauração', value: 'Restauração' },
              { label: 'Outros serviços', value: 'Outros serviços' },
            ]"
            option-label="label"
            option-value="value"
            append-to="self"
          />
        </label>
        <label class="field">
          <span>Cidade</span>
          <InputText v-model.trim="company.city" required />
        </label>
        <label class="field">
          <span>Endereço</span>
          <InputText
            v-model.trim="company.address"
            required
            autocomplete="street-address"
          />
        </label>
        <label class="field">
          <span>Contacto</span>
          <PhoneInput
            v-model.trim="company.phone"
            required
            autocomplete="tel"
          />
        </label>
        <label class="field">
          <span>E-mail</span>
          <InputText
            v-model.trim="company.email"
            type="email"
            required
            autocomplete="email"
          />
        </label>
        <label class="field">
          <span>Abertura</span>
          <input v-model="company.opens" type="time" required />
        </label>
        <label class="field">
          <span>Encerramento</span>
          <input v-model="company.closes" type="time" required />
        </label>
      </div>
      <label class="field">
        <span>Sobre o estabelecimento</span>
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
