<script setup lang="ts">
import { computed } from "vue";
import InputText from "primevue/inputtext";

withDefaults(
  defineProps<{
    required?: boolean;
    name?: string;
    autocomplete?: string;
  }>(),
  {
    required: false,
    name: "phone",
    autocomplete: "tel",
  },
);

const model = defineModel<string>({ default: "" });

function nationalDigits(value: string): string {
  let digits = String(value || "").replace(/\D/g, "");
  if (digits.startsWith("258")) digits = digits.slice(3);
  return digits.slice(0, 9);
}

const localNumber = computed({
  get: () => nationalDigits(model.value),
  set: (value: string) => {
    const digits = nationalDigits(value);
    model.value = digits ? `+258 ${digits}` : "";
  },
});
</script>

<template>
  <div class="phone-input-group">
    <span class="phone-input-prefix" aria-hidden="true">+258</span>
    <InputText
      v-model="localNumber"
      :name="name"
      type="tel"
      inputmode="numeric"
      :autocomplete="autocomplete"
      :required="required"
      minlength="9"
      maxlength="9"
      pattern="8[2-8][0-9]{7}"
      title="Introduza nove dígitos: 8, seguido de um dígito entre 2 e 8, e mais sete dígitos."
      placeholder="841234567"
      class="phone-input-control !w-full"
    />
  </div>
</template>

<style scoped>
.phone-input-group {
  display: flex;
  width: 100%;
  min-width: 0;
}

.phone-input-prefix {
  display: flex;
  min-height: 44px;
  align-items: center;
  border: 1px solid var(--field-border);
  border-right: 0;
  border-radius: 2rem 0 0 2rem;
  background: var(--surface-muted);
  padding: 0.625rem 0.875rem;
  color: var(--ink);
  font-weight: 600;
}

.phone-input-control {
  border-radius: 0 2rem 2rem 0 !important;
}
</style>
