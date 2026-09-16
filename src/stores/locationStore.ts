import { ref } from "vue";
import type { GeoPoint } from "@/types/domain.ts";

/* Onde está o cliente. Começa num ponto conhecido para a demonstração ser
   previsível, e só vai ao browser quando a pessoa pedir. */

/** Baixa de Maputo. */
export const DEFAULT_POINT: GeoPoint = {
  latitude: -25.9692,
  longitude: 32.5732,
};

export const clientPoint = ref<GeoPoint>({ ...DEFAULT_POINT });
/** Verdadeiro quando o ponto veio mesmo do aparelho. */
export const clientLocated = ref(false);
export const locating = ref(false);
export const locationError = ref("");

export function requestClientLocation(): void {
  if (locating.value) return;
  locationError.value = "";
  if (!navigator.geolocation) {
    locationError.value = "Este browser não permite obter a localização.";
    return;
  }
  locating.value = true;
  navigator.geolocation.getCurrentPosition(
    (position) => {
      clientPoint.value = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      clientLocated.value = true;
      locating.value = false;
    },
    () => {
      locating.value = false;
      locationError.value =
        "Não conseguimos obter a sua localização. A mostrar a partir do centro de Maputo.";
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
  );
}

export function resetClientLocation(): void {
  clientPoint.value = { ...DEFAULT_POINT };
  clientLocated.value = false;
  locationError.value = "";
}
