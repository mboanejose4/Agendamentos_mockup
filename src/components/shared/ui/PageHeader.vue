<template>
  <header
    class="mb-7 flex flex-col items-start justify-between gap-4 sm:mb-8 sm:flex-row sm:items-center"
  >
    <div class="min-w-0">
      <slot />
    </div>

    <div
      v-if="$slots.actions"
      class="flex w-full flex-wrap items-center gap-2.5 sm:w-auto"
    >
      <slot name="actions" />
    </div>
  </header>
</template>
