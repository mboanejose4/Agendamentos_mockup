import { ref } from "vue";

/* Qual a marcação a partilhar. Vive num store para que o gestor e o
   funcionário abram o mesmo diálogo sem o duplicar em cada ecrã. */
export const shareBookingId = ref("");
export const shareOpen = ref(false);

export function openShareBooking(id: string): void {
  if (!id) return;
  shareBookingId.value = id;
  shareOpen.value = true;
}
