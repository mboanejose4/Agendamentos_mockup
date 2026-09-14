import { watch, onMounted, onBeforeUnmount } from "vue";
import { state, processDueReminders } from "@/Store/applicationStore.js";
export function useBookingReminders() {
  let timer;
  const refresh = () => processDueReminders();
  watch(
    () => [
      state.db.bookings
        .map((b) => [b.id, b.date, b.time, b.status].join("|"))
        .join(";"),
      state.db.settings.notifications,
    ],
    refresh,
    { immediate: true },
  );
  onMounted(() => {
    timer = setInterval(refresh, 60000);
    document.addEventListener("visibilitychange", refresh);
  });
  onBeforeUnmount(() => {
    clearInterval(timer);
    document.removeEventListener("visibilitychange", refresh);
  });
}
