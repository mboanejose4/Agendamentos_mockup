import type { GeoPoint } from "@/types/domain.ts";

/* Distâncias em linha recta. Chega para ordenar resultados e para dar ao
   cliente uma noção de proximidade; não é distância de percurso. */

const EARTH_RADIUS_KM = 6371;

const radians = (degrees: number): number => (degrees * Math.PI) / 180;

/** Distância entre dois pontos, em quilómetros (fórmula de haversine). */
export function distanceKm(from: GeoPoint, to: GeoPoint): number {
  const deltaLat = radians(to.latitude - from.latitude);
  const deltaLng = radians(to.longitude - from.longitude);
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(radians(from.latitude)) *
      Math.cos(radians(to.latitude)) *
      Math.sin(deltaLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.asin(Math.sqrt(a));
}

/** Abaixo do quilómetro conta-se em metros, que é como as pessoas pensam. */
export function distanceLabel(km: number): string {
  if (!Number.isFinite(km)) return "";
  if (km < 1) return `${Math.max(50, Math.round((km * 1000) / 50) * 50)} m`;
  return `${km.toFixed(1).replace(".", ",")} km`;
}

/** Verdadeiro quando a empresa tem coordenadas utilizáveis. */
export function hasPoint(value: Partial<GeoPoint> | null): value is GeoPoint {
  return (
    !!value &&
    Number.isFinite(value.latitude) &&
    Number.isFinite(value.longitude)
  );
}
