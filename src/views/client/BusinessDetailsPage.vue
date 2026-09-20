<script setup lang="ts">
import BusinessIcon from "@/components/shared/ui/BusinessIcon.vue";
import { plural } from "@/utils/formatters.ts";
import type { Weekday } from "@/types/domain.ts";
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import AppModal from "@/components/shared/ui/AppModal.vue";
import { useBusinessDiscovery } from "@/composables/discovery/useBusinessDiscovery.ts";
const {
  state,
  go,
  money,
  business,
  category,
  city,
  detailTab,
  favorites,
  current,
  originView,
  servicesFor,
  promotions,
  selectedCategory,
  favorite,
  book,
  copyCoupon,
  photoError,
} = useBusinessDiscovery();
</script>
<template>
  <div v-if="current">
    <button
      class="text-button -mt-[5px] mb-[22px] text-caption"
      @click="go(originView)"
    >
      <AppIcon name="arrow-left" :size="17" />{{
        originView === "directory"
          ? "Voltar à lista"
          : originView === "favorites"
            ? "Voltar aos favoritos"
            : originView === "appointments"
              ? "Voltar às marcações"
              : "Voltar a explorar"
      }}
    </button>
    <div
      class="relative mb-[35px] h-[220px] rounded-lg bg-surface-muted max-sm:h-[190px]"
    >
      <img
        :src="current.image"
        :alt="current.name"
        class="size-full rounded-4xl object-cover"
        @error="photoError"
      /><span
        :class="[
          'absolute left-6 -bottom-5 inline-grid size-[46px] shrink-0 place-items-center rounded-4xl border-4 border-background [box-sizing:content-box] max-sm:size-10 max-sm:rounded-[10px] max-[480px]:size-[38px]',
          {
            mint: 'bg-soft text-primary-text',
            peach: 'bg-warning-soft text-warning',
            lavender: 'bg-secondary-soft text-secondary-text',
            blue: 'bg-secondary-soft text-secondary-text',
            yellow: 'bg-warning-soft text-warning',
          }[selectedCategory(current.category).color],
        ]"
        ><AppIcon :name="selectedCategory(current.category).icon" :size="28"
      /></span>
    </div>
    <header
      class="mb-7 flex flex-col items-start justify-between gap-4 sm:mb-8 sm:flex-row sm:items-center"
    >
      <div class="min-w-0">
        <span class="eyebrow"
          >{{ current.category }} <span class="px-[7px] text-muted">·</span>
          {{ current.city }}</span
        >
        <h1 class="flex items-center gap-3 max-sm:text-h1">
          <BusinessIcon
            :branding="current.branding"
            :name="current.name"
            :size="44"
          />{{ current.name }}
        </h1>
        <p class="flex flex-wrap items-center gap-1.5 text-caption">
          <AppIcon name="map-pin" :size="16" />{{ current.address }}
          <span class="px-[7px] text-muted">·</span
          ><AppIcon name="star" :size="15" />{{ current.rating }} ({{
            current.reviewCount
          }}
          avaliações)
        </p>
      </div>
      <button class="btn btn-secondary shrink-0" @click="favorite(current.id)">
        <AppIcon name="heart" :size="17" />{{
          favorites.includes(current.id) ? "Guardado" : "Guardar"
        }}
      </button>
    </header>
    <div
      class="grid grid-cols-1 gap-[25px] lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)] xl:gap-[45px]"
    >
      <section class="min-w-0">
        <div class="tabs">
          <button
            v-for="tab in ['Serviços', 'Informações']"
            :key="tab"
            :class="{ active: detailTab === tab }"
            @click="detailTab = tab"
          >
            {{ tab }}
          </button>
        </div>
        <template v-if="detailTab === 'Serviços'"
          ><div
            v-if="promotions.length"
            class="mb-[25px] flex items-center gap-3 rounded-4xl bg-surface-muted px-4 py-[13px] text-muted"
          >
            <AppIcon name="tag" :size="20" /><span class="flex-1"
              ><strong class="block text-caption"
                >{{ promotions[0].discount }}% para o seu próximo
                momento</strong
              ><small class="mt-1 block text-caption"
                >Cupão {{ promotions[0].code }}</small
              ></span
            ><button
              class="icon-btn"
              title="Copiar cupão"
              aria-label="Copiar cupão"
              @click="copyCoupon(promotions[0].code)"
            >
              <AppIcon name="copy" :size="17" />
            </button>
          </div>
          <div class="mb-5 flex items-center justify-between gap-[15px]">
            <h2>Escolha o seu serviço</h2>
            <span class="text-muted">{{
              plural(servicesFor(current.id).length, "serviço", "serviços")
            }}</span>
          </div>
          <article
            v-for="item in servicesFor(current.id)"
            :key="item.id"
            class="flex items-start gap-4 border-b border-line py-[22px] max-sm:gap-3"
          >
            <span
              :class="[
                'inline-grid size-[46px] shrink-0 place-items-center rounded-4xl max-sm:hidden',
                {
                  mint: 'bg-soft text-primary-text',
                  peach: 'bg-warning-soft text-warning',
                  lavender: 'bg-secondary-soft text-secondary-text',
                  blue: 'bg-secondary-soft text-secondary-text',
                  yellow: 'bg-warning-soft text-warning',
                }[selectedCategory(current.category).color],
              ]"
              ><AppIcon :name="selectedCategory(current.category).icon"
            /></span>
            <div class="min-w-0 flex-1">
              <h3 class="mb-[5px] text-body">{{ item.name }}</h3>
              <p class="mb-2 text-caption text-muted">{{ item.description }}</p>
              <small class="flex items-center gap-[5px] text-caption text-muted"
                ><AppIcon name="clock" :size="13" />{{ item.duration }} min<span
                  v-if="item.pricePerPerson"
                >
                  · Por pessoa</span
                ></small
              >
            </div>
            <div class="flex flex-col items-end gap-2.5">
              <strong class="text-body">{{ money(item.price) }}</strong
              ><button
                class="btn btn-secondary btn-compact"
                @click="book(item.id)"
              >
                Marcar <AppIcon name="plus" :size="16" />
              </button>
            </div>
          </article>
          <div v-if="!servicesFor(current.id).length" class="empty-state">
            <h3>Sem serviços disponíveis</h3>
            <p>Este estabelecimento ainda está a preparar o seu catálogo.</p>
          </div></template
        >

        <div v-else class="py-2.5">
          <h2>Sobre o estabelecimento</h2>
          <p class="text-small text-muted">{{ current.description }}</p>
          <h3 class="mt-[30px]">Horário de funcionamento</h3>
          <div
            v-for="(day, i) in [
              'Domingo',
              'Segunda-feira',
              'Terça-feira',
              'Quarta-feira',
              'Quinta-feira',
              'Sexta-feira',
              'Sábado',
            ]"
            :key="day"
            class="flex justify-between border-b border-line py-3 text-caption"
          >
            <span>{{ day }}</span
            ><strong>{{
              current.days.includes(i as Weekday)
                ? `${current.opens} - ${current.closes}`
                : "Encerrado"
            }}</strong>
          </div>
          <h3 class="mt-[30px]">Cancelamento e reagendamento</h3>
          <p class="text-small text-muted">
            Até {{ current.cancelHours }} horas antes da marcação. Pagamentos já
            efectuados ficam registados como reembolso na simulação local.
          </p>
        </div>
      </section>
      <aside
        class="border-t border-line pt-[25px] lg:border-t-0 lg:border-l lg:pt-0 lg:pl-[22px] xl:pl-[30px]"
      >
        <h3>Encontre o seu momento</h3>
        <p class="text-caption text-muted">{{ current.description }}</p>
        <div class="flex gap-[13px] py-[17px] text-muted">
          <AppIcon name="clock" /><span
            ><strong class="text-caption text-ink [overflow-wrap:anywhere]"
              >{{ current.opens }} - {{ current.closes }}</strong
            ><small class="mt-[5px] block text-caption text-muted"
              >Horário de funcionamento</small
            ></span
          >
        </div>
        <div class="flex gap-[13px] py-[17px] text-muted">
          <AppIcon name="map-pin" /><span
            ><strong class="text-caption text-ink [overflow-wrap:anywhere]">{{
              current.city
            }}</strong
            ><small class="mt-[5px] block text-caption text-muted">{{
              current.address
            }}</small></span
          >
        </div>
        <a
          class="flex gap-[13px] py-[17px] text-muted"
          :href="`tel:${current.phone}`"
          ><AppIcon name="phone" /><span
            ><strong class="text-caption text-ink [overflow-wrap:anywhere]">{{
              current.phone
            }}</strong
            ><small class="mt-[5px] block text-caption text-muted"
              >Contactar estabelecimento</small
            ></span
          ></a
        ><a
          class="flex gap-[13px] py-[17px] text-muted"
          :href="`mailto:${current.email}`"
          ><AppIcon name="mail" /><span
            ><strong class="text-caption text-ink [overflow-wrap:anywhere]">{{
              current.email
            }}</strong
            ><small class="mt-[5px] block text-caption text-muted"
              >E-mail</small
            ></span
          ></a
        >
        <div
          class="flex items-center gap-[9px] border-t border-line pt-5 text-caption text-muted"
        >
          <AppIcon name="shield-check" :size="18" /><span>{{
            current.onlinePayment
              ? "Pagamento online ou no local"
              : "Pagamento no estabelecimento"
          }}</span>
        </div>
      </aside>
    </div>
  </div>
</template>
