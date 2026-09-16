<script setup lang="ts">
import AuthIntroduction from "@/components/shared/auth/AuthIntroduction.vue";
import SignInForm from "@/components/shared/auth/SignInForm.vue";
</script>

<template>
  <div
    class="mx-auto grid w-full max-w-[1050px] grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-16"
  >
    <AuthIntroduction />
    <SignInForm />
  </div>
</template>
