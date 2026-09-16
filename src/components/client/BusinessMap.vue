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
const emit = defineEmits<{ open: [company: Business] }>();

const host = ref<HTMLElement | null>(null);
const failed = ref("");
let map: LeafletMap | null = null;
let markers: LeafletMarker[] = [];
let leaflet: Awaited<ReturnType<typeof loadLeaflet>> | null = null;

/* Só entram no mapa os que têm coordenadas. */
const located = (): Business[] =>
  props.companies.filter((item) => hasPoint(item));

function pin(background: string, glyph: string): unknown {
  return leaflet?.divIcon({
    className: "",
    html: `<span style="display:grid;place-items:center;width:30px;height:30px;border-radius:50% 50% 50% 4px;transform:rotate(-45deg);background:${background};color:#fff;font:600 12px/1 system-ui;box-shadow:0 2px 6px #0003"><span style="transform:rotate(45deg)">${glyph}</span></span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -28],
  });
}

/* O conteúdo do balão é construído em DOM, não em HTML: os nomes vêm dos
   dados e nunca são interpretados como marcação. */
function balloon(company: Business, from: GeoPoint): HTMLElement {
  const box = document.createElement("div");
  box.style.minWidth = "160px";
  const title = document.createElement("strong");
  title.textContent = company.name;
  title.style.display = "block";
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
  action.style.cssText =
    "border:0;border-radius:6px;padding:6px 10px;background:var(--primary);color:var(--on-primary);cursor:pointer;font:inherit;font-size:12px";
  action.addEventListener("click", () => emit("open", company));
  box.append(title, address, away, action);
  return box;
}

function draw(): void {
  if (!leaflet || !map) return;
  markers.forEach((marker) => marker.remove());
  markers = [];
  const from = clientPoint.value;
  markers.push(
    leaflet
      .marker([from.latitude, from.longitude], {
        icon: pin("var(--secondary)", "&#9679;"),
        title: "A sua localização",
        alt: "A sua localização",
      })
      .bindPopup(clientLocated.value ? "Você está aqui." : "Centro de Maputo.")
      .addTo(map),
  );
  located().forEach((company, index) => {
    if (!leaflet || !map || !hasPoint(company)) return;
    markers.push(
      leaflet
        .marker([company.latitude, company.longitude], {
          icon: pin("var(--primary)", String(index + 1)),
          title: company.name,
          alt: company.name,
        })
        .bindPopup(balloon(company, from))
        .addTo(map),
    );
  });
  if (markers.length > 1) {
    const bounds = leaflet.featureGroup(markers).getBounds();
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [38, 38] });
  } else map.setView([from.latitude, from.longitude], 13);
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
  map = leaflet.map(host.value, { scrollWheelZoom: false });
  leaflet
    .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
      maxZoom: 18,
    })
    .addTo(map);
  draw();
  /* O mapa nasce muitas vezes antes de o painel ter altura definitiva. */
  observer = new ResizeObserver(() => map?.invalidateSize());
  observer.observe(host.value);
});

watch([() => props.companies, clientPoint, clientLocated], draw, {
  deep: true,
});

onBeforeUnmount(() => {
  observer?.disconnect();
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
        class="btn btn-secondary btn-compact"
        :disabled="locating"
        @click="requestClientLocation"
      >
        <AppIcon :name="locating ? 'loader-circle' : 'compass'" :size="17" />
        {{ locating ? "A localizar…" : "Usar a minha localização" }}
      </button>
    </div>
    <p v-if="locationError" class="mb-2.5 text-caption text-warning">
      {{ locationError }}
    </p>
    <!-- isolate: as camadas do Leaflet ficam presas a este contexto e nunca
         sobem por cima da barra lateral ou de um diálogo. -->
    <div class="isolate overflow-hidden rounded-panel border border-line">
      <div
        v-if="failed"
        class="flex h-[300px] flex-col items-center justify-center gap-3 bg-surface-muted px-6 text-center"
      >
        <AppIcon name="map-pin" :size="30" class="text-muted" />
        <p class="text-caption text-muted">
          {{ failed }} Verifique a ligação à Internet e recarregue a página.
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
