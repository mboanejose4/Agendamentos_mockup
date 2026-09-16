<script setup lang="ts">
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import type { StaffMember } from "@/types/domain.ts";
defineProps<{ professionals: StaffMember[] }>();
const selected = defineModel({ type: String, default: "" });
</script>
<template>
  <section
    v-if="professionals.length"
    class="my-6"
    aria-label="Profissionais disponíveis"
  >
    <h3>Profissionais disponíveis para este serviço</h3>
    <p class="text-muted">Disponibilidade na data seleccionada.</p>
    <div class="mb-6 grid gap-2.5">
      <button
        type="button"
        class="choice"
        :class="{ 'choice-selected': !selected }"
        :aria-pressed="!selected"
        @click="selected = ''"
      >
        <span class="avatar"><AppIcon name="users" /></span
        ><span class="flex-1"
          ><strong class="block text-caption">Sem preferência</strong
          ><small class="mt-1 block text-caption text-muted"
            >Primeiro profissional disponível</small
          ></span
        ></button
      ><button
        v-for="person in professionals"
        :key="person.id"
        type="button"
        class="choice"
        :class="{ 'choice-selected': selected === person.id }"
        :aria-pressed="selected === person.id"
        @click="selected = person.id"
      >
        <span class="avatar">{{
          person.name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
        }}</span
        ><span class="flex-1"
          ><strong class="block text-caption">{{ person.name }}</strong
          ><small class="mt-1 block text-caption text-muted">{{
            person.title
          }}</small></span
        ><AppIcon
          v-if="selected === person.id"
          name="circle-check"
          :size="18"
        />
      </button>
    </div>
  </section>
</template>
