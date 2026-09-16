/* O Leaflet é carregado da rede em vez de entrar nas dependências: o mapa já
   precisa de Internet para os mosaicos, e assim o mockup continua a instalar-se
   com um `npm install` sem pacotes novos. Para o trocar pelo pacote do npm,
   basta substituir este ficheiro por `import * as L from "leaflet"`. */

const VERSION = "1.9.4";
const BASE = `https://unpkg.com/leaflet@${VERSION}/dist`;

/* Apenas a fatia da API que o mapa usa — o suficiente para ter tipos sem
   depender de @types/leaflet. */
export interface LeafletLayer {
  addTo(map: LeafletMap): LeafletLayer;
  remove(): void;
}
export interface LeafletMarker extends LeafletLayer {
  addTo(map: LeafletMap): LeafletMarker;
  bindPopup(content: HTMLElement | string): LeafletMarker;
  on(event: string, handler: () => void): LeafletMarker;
}
export interface LeafletBounds {
  isValid(): boolean;
}
export interface LeafletMap {
  setView(point: [number, number], zoom: number): LeafletMap;
  fitBounds(
    bounds: LeafletBounds,
    options?: Record<string, unknown>,
  ): LeafletMap;
  invalidateSize(): LeafletMap;
  remove(): void;
}
export interface LeafletApi {
  map(element: HTMLElement, options?: Record<string, unknown>): LeafletMap;
  tileLayer(url: string, options?: Record<string, unknown>): LeafletLayer;
  marker(
    point: [number, number],
    options?: Record<string, unknown>,
  ): LeafletMarker;
  divIcon(options: Record<string, unknown>): unknown;
  featureGroup(layers: LeafletLayer[]): { getBounds(): LeafletBounds };
}

let pending: Promise<LeafletApi> | null = null;

function inject(): Promise<LeafletApi> {
  return new Promise((resolve, reject) => {
    const loaded = (window as { L?: LeafletApi }).L;
    if (loaded) return resolve(loaded);
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = `${BASE}/leaflet.css`;
      document.head.append(link);
    }
    const script = document.createElement("script");
    script.src = `${BASE}/leaflet.js`;
    script.async = true;
    script.addEventListener("load", () => {
      const api = (window as { L?: LeafletApi }).L;
      if (api) resolve(api);
      else reject(new Error("O mapa carregou sem expor a sua interface."));
    });
    script.addEventListener("error", () =>
      reject(new Error("Não foi possível carregar o mapa.")),
    );
    document.head.append(script);
  });
}

export function loadLeaflet(): Promise<LeafletApi> {
  if (!pending)
    /* Uma falha não fica em cache: a tentativa seguinte volta a pedir. */
    pending = inject().catch((error: unknown) => {
      pending = null;
      throw error;
    });
  return pending;
}
