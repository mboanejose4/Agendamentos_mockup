<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import { distanceKm, distanceLabel, hasPoint } from "@/utils/geo.ts";
import { loadLeaflet } from "@/services/leafletLoader.ts";
import type { LeafletMap, LeafletMarker } from "@/services/leafletLoader.ts";
import {
  clientLocated,
  clientPoint,
  locating,
  locationError,
  requestClientLocation,
} from "@/stores/locationStore.ts";
import type { Business, GeoPoint } from "@/types/domain.ts";

const props = defineProps<{
  /** Os estabelecimentos já filtrados: o mapa acompanha a pesquisa. */
  companies: Business[];
}>();

const emit = defineEmits<{
  open: [company: Business];
}>();

const host = ref<HTMLElement | null>(null);
const failed = ref("");

let map: LeafletMap | null = null;
let markers: LeafletMarker[] = [];
let leaflet: Awaited<ReturnType<typeof loadLeaflet>> | null = null;

/*
 * Cores próprias do mapa.
 * Não utilizam --primary ou --secondary e, por isso,
 * permanecem iguais nos modos claro e escuro.
 */
const MAP_PIN_COLORS = {
  current: "#e53935",
  business: "#2563eb",
  fallback: "#64748b",
} as const;

type MapPinType = keyof typeof MAP_PIN_COLORS;

/* Só entram no mapa os estabelecimentos que possuem coordenadas. */
function located(): Business[] {
  return props.companies.filter((item) => hasPoint(item));
}

/**
 * Cria o marcador visual do Leaflet.
 *
 * current: localização real do utilizador — vermelho;
 * business: estabelecimentos — azul;
 * fallback: centro de Maputo — cinzento.
 */
function pin(type: MapPinType, glyph: string): unknown {
  const background = MAP_PIN_COLORS[type];

  return leaflet?.divIcon({
    className: "",
    html: `
      <span
        style="
          display:grid;
          place-items:center;
          width:32px;
          height:32px;
          border:2px solid #ffffff;
          border-radius:50% 50% 50% 4px;
          transform:rotate(-45deg);
          background:${background};
          color:#ffffff;
          font:600 12px/1 system-ui;
          box-shadow:0 3px 8px rgb(0 0 0 / 30%);
        "
      >
        <span
          style="
            display:grid;
            place-items:center;
            transform:rotate(45deg);
            color:#ffffff;
          "
        >
          ${glyph}
        </span>
      </span>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 34],
    popupAnchor: [0, -32],
  });
}

/*
 * O conteúdo do popup é construído com elementos DOM.
 * Dessa forma, os dados do estabelecimento não são interpretados como HTML.
 */
function balloon(company: Business, from: GeoPoint): HTMLElement {
  const box = document.createElement("div");
  box.style.minWidth = "170px";

  const title = document.createElement("strong");
  title.textContent = company.name;
  title.style.display = "block";
  title.style.marginBottom = "2px";

  const address = document.createElement("small");
  address.textContent = company.address;
  address.style.cssText = "display:block;margin:2px 0 6px;opacity:.75";

  const away = document.createElement("small");
  away.textContent = hasPoint(company)
    ? `A ${distanceLabel(distanceKm(from, company))} de si`
    : "";
  away.style.cssText = "display:block;margin-bottom:8px";

  const action = document.createElement("button");
  action.type = "button";
  action.textContent = "Ver estabelecimento";
  action.style.cssText = `
    border:1px solid #1d4ed8;
    border-radius:9999px;
    padding:7px 12px;
    background:#2563eb;
    color:#ffffff;
    cursor:pointer;
    font:600 12px/1.2 system-ui;
  `;

  action.addEventListener("mouseenter", () => {
    action.style.backgroundColor = "#1d4ed8";
  });

  action.addEventListener("mouseleave", () => {
    action.style.backgroundColor = "#2563eb";
  });

  action.addEventListener("click", () => {
    emit("open", company);
  });

  box.append(title, address, away, action);

  return box;
}

function draw(): void {
  if (!leaflet || !map) return;

  markers.forEach((marker) => marker.remove());
  markers = [];

  const from = clientPoint.value;

  /*
   * Se a localização foi autorizada, apresenta o pin vermelho.
   * Caso contrário, mostra o centro de Maputo em cinzento para não
   * transmitir a ideia errada de que é a posição exata do utilizador.
   */
  const originType: MapPinType = clientLocated.value ? "current" : "fallback";

  const originGlyph = clientLocated.value ? "●" : "M";

  markers.push(
    leaflet
      .marker([from.latitude, from.longitude], {
        icon: pin(originType, originGlyph),
        title: clientLocated.value ? "A sua localização" : "Centro de Maputo",
        alt: clientLocated.value ? "A sua localização" : "Centro de Maputo",
      })
      .bindPopup(
        clientLocated.value
          ? "Você está aqui."
          : "Localização de referência: centro de Maputo.",
      )
      .addTo(map),
  );

  located().forEach((company, index) => {
    if (!leaflet || !map || !hasPoint(company)) return;

    markers.push(
      leaflet
        .marker([company.latitude, company.longitude], {
          icon: pin("business", String(index + 1)),
          title: company.name,
          alt: company.name,
        })
        .bindPopup(balloon(company, from))
        .addTo(map),
    );
  });

  if (markers.length > 1) {
    const bounds = leaflet.featureGroup(markers).getBounds();

    if (bounds.isValid()) {
      map.fitBounds(bounds, {
        padding: [38, 38],
      });
    }
  } else {
    map.setView([from.latitude, from.longitude], 13);
  }
}

let observer: ResizeObserver | null = null;

onMounted(async () => {
  try {
    leaflet = await loadLeaflet();
  } catch (error) {
    failed.value =
      error instanceof Error
        ? error.message
        : "Não foi possível carregar o mapa.";

    return;
  }

  if (!host.value) return;

  map = leaflet.map(host.value, {
    scrollWheelZoom: false,
  });

  leaflet
    .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
      maxZoom: 18,
    })
    .addTo(map);

  draw();

  /*
   * O mapa pode ser inicializado antes de o contentor possuir
   * a sua altura definitiva.
   */
  observer = new ResizeObserver(() => {
    map?.invalidateSize();
  });

  observer.observe(host.value);
});

watch([() => props.companies, clientPoint, clientLocated], draw, {
  deep: true,
});

onBeforeUnmount(() => {
  observer?.disconnect();
  observer = null;

  markers.forEach((marker) => marker.remove());
  markers = [];

  map?.remove();
  map = null;
});
</script>

<template>
  <section class="mb-[30px] max-sm:mb-[25px]" aria-labelledby="mapa-titulo">
    <div
      class="mb-[14px] flex flex-wrap items-end justify-between gap-3 max-sm:gap-2.5"
    >
      <div>
        <h2 id="mapa-titulo" class="text-h3 font-medium">Perto de si</h2>

        <p class="mt-1.5 text-caption text-muted">
          {{
            clientLocated
              ? "A partir da sua localização."
              : "A partir do centro de Maputo."
          }}

          {{ located().length }}

          {{
            located().length === 1
              ? "estabelecimento no mapa"
              : "estabelecimentos no mapa"
          }}.
        </p>
      </div>

      <button
        class="location-button btn rounded-4xl btn-compact"
        type="button"
        :disabled="locating"
        @click="requestClientLocation"
      >
        <AppIcon
          :name="locating ? 'loader-circle' : 'compass'"
          :size="17"
          :class="{ 'animate-spin': locating }"
        />

        {{ locating ? "A localizar…" : "Usar a minha localização" }}
      </button>
    </div>

    <p
      v-if="locationError"
      class="mb-2.5 text-caption text-warning"
      role="status"
    >
      {{ locationError }}
    </p>

    <!--
      isolate mantém as camadas do Leaflet dentro deste contexto,
      impedindo que apareçam sobre menus, barras laterais e diálogos.
    -->
    <div class="isolate overflow-hidden rounded-panel border border-line">
      <div
        v-if="failed"
        class="flex h-[300px] flex-col items-center justify-center gap-3 bg-surface-muted px-6 text-center"
      >
        <AppIcon name="map-pin" :size="30" class="text-muted" />

        <p class="text-caption text-muted">
          {{ failed }}
          Verifique a ligação à Internet e recarregue a página.
        </p>
      </div>

      <div
        v-else
        ref="host"
        class="h-[300px] w-full bg-surface-muted sm:h-[360px]"
        role="application"
        aria-label="Mapa dos estabelecimentos"
      ></div>
    </div>
  </section>
</template>

<style scoped>
/*
 * Mantém o botão igual aos cards verdes da Hero.
 * Os tokens --brand-* não alternam entre os temas.
 */
.location-button {
  background-color: var(--brand-700);
  border-color: var(--brand-700);
  color: #ffffff;
}

.location-button:hover:not(:disabled) {
  background-color: var(--brand-800);
  border-color: var(--brand-800);
  color: #ffffff;
}

.location-button:active:not(:disabled) {
  background-color: var(--brand-900);
  border-color: var(--brand-900);
}

.location-button:focus-visible {
  box-shadow:
    0 0 0 2px var(--surface),
    0 0 0 4px var(--brand-500);
}

.location-button :deep(svg) {
  color: #ffffff;
  stroke: currentColor;
}

.location-button:disabled {
  background-color: var(--brand-700);
  border-color: var(--brand-700);
  color: #ffffff;
  opacity: 0.55;
}
</style>
