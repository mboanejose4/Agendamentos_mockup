<script setup>
import BusinessIcon from "@/Component/ui/BusinessIcon.vue";
import AppIcon from "@/Component/ui/AppIcon.vue";
defineProps({
  company: { type: Object, required: true },
  services: { type: Array, default: () => [] },
  startingPrice: { type: String, required: true },
  isFavorite: Boolean,
  categoryIcon: { type: String, default: "building-2" },
});
const emit = defineEmits(["open", "toggle-favorite"]);
function photoError(event) {
  event.target.style.visibility = "hidden";
  event.target.parentElement.classList.add("photo-unavailable");
}
</script>
<template>
  <article
    class="card flex min-w-0 flex-col overflow-hidden transition-shadow duration-200 hover:shadow-card"
  >
    <div class="relative h-[190px] bg-surface-muted sm:h-[178px] 2xl:h-[186px]">
      <button
        class="block size-full border-0 bg-transparent p-0"
        :aria-label="`Ver ${company.name}`"
        @click="emit('open', company)"
      >
        <img
          :src="company.image"
          :alt="company.name"
          class="size-full object-cover"
          @error="photoError"
        /><span
          class="pointer-events-none absolute inset-x-[10px] top-[40%] hidden text-h3 text-muted [.photo-unavailable_&]:block"
          >{{ company.name }}</span
        ></button
      ><span
        class="pointer-events-none absolute top-[13px] left-[13px] flex items-center gap-[5px] rounded bg-scrim px-2 py-[5px] text-white text-muted"
        ><AppIcon :name="categoryIcon" :size="13" />{{ company.category }}</span
      ><button
        :class="[
          'absolute top-3 right-3 grid size-[30px] place-items-center rounded-full border-0 bg-scrim',
          isFavorite ? 'bg-soft text-primary-text' : 'text-muted',
        ]"
        :aria-label="
          isFavorite
            ? `Remover ${company.name} dos favoritos`
            : `Guardar ${company.name} nos favoritos`
        "
        :aria-pressed="isFavorite"
        @click="emit('toggle-favorite', company.id)"
      >
        <AppIcon
          name="heart"
          :size="18"
          :class="isFavorite ? 'fill-danger' : ''"
        />
      </button>
    </div>
    <div
      class="flex min-w-0 flex-1 flex-col pt-[18px] px-[19px] pb-0 sm:pt-[15px] sm:px-[15px] xl:pt-4 xl:px-[18px]"
    >
      <BusinessIcon
        v-if="company.branding?.icon"
        :branding="company.branding"
        :name="company.name"
      />
      <div class="mb-2.5 flex items-center justify-between text-caption sm:text-caption">
        <span class="flex items-center gap-1 text-ink"
          ><AppIcon name="star" :size="14" class="text-muted fill-warning" />{{
            Number(company.rating || 0).toFixed(1)
          }}
          <small class="ml-[3px] text-caption text-muted"
            >({{ company.reviewCount || 0 }})</small
          ></span
        ><span class="text-caption text-muted">{{ company.city }}</span>
      </div>
      <h3 class="mb-2 text-h3">
        <button
          class="border-0 bg-transparent p-0 text-left"
          @click="emit('open', company)"
        >
          {{ company.name }}
        </button>
      </h3>
      <p class="mb-[15px] flex min-h-[17px] items-center gap-[5px] text-caption text-muted">
        <AppIcon name="map-pin" :size="14" />{{ company.address }}
      </p>
      <div class="mb-[15px] flex min-h-[26px] flex-wrap gap-1.5 max-[480px]:mb-[17px]">
        <span
          v-for="item in services.slice(0, 2)"
          :key="item.id"
          class="rounded border border-line px-1.5 py-[3px] text-caption text-muted"
          >{{ item.name }}</span
        >
      </div>
      <div
        class="mt-auto flex items-center justify-between gap-2 border-t border-line py-[13px] max-[480px]:py-[15px]"
      >
        <span class="text-caption text-muted max-[480px]:text-caption"
          >A partir de
          <strong class="ml-[3px] inline-block text-small text-ink max-[480px]:text-body-lg">{{
            startingPrice
          }}</strong></span
        ><button
          class="grid size-[30px] place-items-center rounded-full border border-line bg-surface-muted text-primary-text"
          :aria-label="`Ver serviços de ${company.name}`"
          title="Ver serviços"
          @click="emit('open', company)"
        >
          <AppIcon name="arrow-up-right" :size="19" />
        </button>
      </div>
    </div>
  </article>
</template>
