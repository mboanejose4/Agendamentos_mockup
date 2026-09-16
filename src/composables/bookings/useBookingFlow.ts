import { computed, reactive, ref, watch } from "vue";
import { bookingCode } from "@/utils/formatters.ts";
import {
  state,
  go,
  money,
  today,
  dateLabel,
  business,
  service,
  availableSlots,
  availableProfessionals,
  bookingTotal,
  createBooking,
  updateBooking,
} from "@/stores/applicationStore.ts";
import type {
  Booking,
  BookingDraft,
  CheckoutMethod,
  PaymentStatus,
  PriceBreakdown,
} from "@/types/domain.ts";

export function useBookingFlow() {
  const draft = reactive<BookingDraft & Partial<Booking>>({
    ...{
      businessId: state.selectedBusinessId,
      serviceId: "",
      staffId: "",
      resourceId: "",
      date: today(),
      time: "",
      partySize: 1,
      coupon: "",
      paymentMethod: "onsite" as const,
      notes: "",
    },
    ...(state.bookingDraft || {}),
  });
  const step = ref(draft.resumeStep || 1);
  const error = ref("");
  const couponError = ref("");
  const appliedCoupon = ref(draft.appliedCoupon || draft.coupon || "");
  const paymentOpen = ref(false);
  const paymentMethod = ref<CheckoutMethod>("mpesa");
  const paymentState = ref<"ready" | "declined">("ready");
  const created = ref<Booking | null>(null);
  const current = computed(() => business(draft.businessId));
  const selectedService = computed(() => service(draft.serviceId));
  const options = computed(() =>
    state.db.services.filter(
      (s) => s.businessId === draft.businessId && s.active,
    ),
  );
  const people = computed(() => availableProfessionals({ ...draft }));
  watch(people, (list) => {
    if (
      step.value < 4 &&
      draft.staffId &&
      !list.some((p) => p.id === draft.staffId)
    ) {
      draft.staffId = "";
      draft.time = "";
    }
  });
  const resources = computed(() =>
    state.db.resources.filter(
      (r) =>
        r.active &&
        r.businessId === draft.businessId &&
        r.type === selectedService.value?.resourceType &&
        Number(r.capacity) >= Number(draft.partySize),
    ),
  );
  const isRestaurant = computed(
    () => current.value?.category === "Restauração",
  );
  const slots = computed(() =>
    availableSlots({ ...draft, excludeBookingId: draft.excludeBookingId }),
  );
  const totals = computed<PriceBreakdown>(() => {
    const original = state.db.bookings.find(
      (b) => b.id === draft.excludeBookingId,
    );
    if (
      original &&
      original.serviceId === draft.serviceId &&
      Number(original.partySize || 1) === Number(draft.partySize || 1) &&
      (original.coupon || "") === appliedCoupon.value
    )
      return {
        total: original.total,
        subtotal: original.subtotal ?? original.total,
        discount: original.discount || 0,
        coupon: original.coupon || "",
      };
    return bookingTotal({
      serviceId: draft.serviceId,
      coupon: appliedCoupon.value,
      partySize: draft.partySize,
      businessId: draft.businessId,
    });
  });
  const dates = computed(() =>
    Array.from({ length: 7 }, (_, index) => {
      const date = new Date(`${today()}T12:00:00`);
      date.setDate(date.getDate() + index);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    }),
  );
  const maxDate = computed(() => {
    const date = new Date(`${today()}T12:00:00`);
    date.setDate(date.getDate() + Number(state.db.settings.advanceDays || 60));
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  });
  const totalLabel = computed(() =>
    totals.value.error
      ? money(selectedService.value?.price || 0)
      : money(totals.value.total),
  );
  watch(
    draft,
    () => {
      state.bookingDraft = {
        ...draft,
        resumeStep: step.value,
        appliedCoupon: appliedCoupon.value,
      };
    },
    { deep: true, immediate: true },
  );
  watch(step, () => {
    state.bookingDraft = {
      ...draft,
      resumeStep: step.value,
      appliedCoupon: appliedCoupon.value,
    };
    error.value = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  watch(
    () => [draft.staffId, draft.resourceId, draft.date, draft.partySize],
    () => {
      draft.time = "";
      error.value = "";
    },
  );
  function changeService() {
    draft.staffId = "";
    draft.resourceId = "";
    draft.time = "";
    appliedCoupon.value = "";
    draft.coupon = "";
  }
  function applyCoupon() {
    const price = bookingTotal({
      serviceId: draft.serviceId,
      coupon: draft.coupon,
      partySize: draft.partySize,
      businessId: draft.businessId,
    });
    couponError.value = price.error || "";
    appliedCoupon.value = price.error ? "" : draft.coupon;
    state.bookingDraft = {
      ...draft,
      resumeStep: step.value,
      appliedCoupon: appliedCoupon.value,
    };
  }
  function next() {
    if (step.value === 1 && !draft.serviceId) {
      error.value = "Escolha um serviço.";
      return;
    }
    if (step.value === 2 && !draft.time) {
      error.value = "Escolha um horário disponível.";
      return;
    }
    step.value++;
  }
  function confirm() {
    error.value = "";
    if (state.role === "guest") {
      state.returnView = "booking";
      state.bookingDraft = {
        ...draft,
        resumeStep: 3,
        appliedCoupon: appliedCoupon.value,
      };
      go("auth");
      return;
    }
    if (
      !availableSlots({
        ...draft,
        excludeBookingId: draft.excludeBookingId,
      }).includes(draft.time)
    ) {
      error.value =
        "Este horário já não está disponível. Escolha outro horário.";
      step.value = 2;
      return;
    }
    if (draft.paymentMethod === "online" && !draft.excludeBookingId) {
      paymentState.value = "ready";
      paymentOpen.value = true;
      return;
    }
    finish(draft.paymentStatus || "pending");
  }
  function finish(paymentStatus: PaymentStatus): void {
    const user = state.db.users.find((u) => u.id === state.userId);
    const payload = {
      ...draft,
      coupon: appliedCoupon.value,
      paymentStatus,
      clientId: draft.clientId || state.userId,
      clientName: draft.clientName || user?.name || "Cliente",
      status: "confirmed" as const,
    };
    const result = draft.excludeBookingId
      ? updateBooking(draft.excludeBookingId, payload)
      : createBooking(payload);
    if (!result.ok) {
      error.value = result.error;
      paymentOpen.value = false;
      return;
    }
    created.value = result.record ?? null;
    paymentOpen.value = false;
    step.value = 4;
    state.bookingDraft = null;
  }
  function downloadCalendar() {
    if (!created.value) return;
    const item = created.value;
    const start = new Date(`${item.date}T${item.time}:00`);
    const end = new Date(start.getTime() + item.duration * 60000);
    const stamp = (d: Date): string =>
      d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const escape = (text: string): string =>
      String(text)
        .replace(/\\/g, "\\\\")
        .replace(/\n/g, "\\n")
        .replace(/[,;]/g, (m) => "\\" + m);
    const content = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Elo//PT",
      "BEGIN:VEVENT",
      `UID:${item.id}@elo.local`,
      `DTSTAMP:${stamp(new Date())}`,
      `DTSTART:${stamp(start)}`,
      `DTEND:${stamp(end)}`,
      `SUMMARY:${escape(selectedService.value?.name || "Marcação")}`,
      `LOCATION:${escape(`${current.value?.name || ""}, ${current.value?.address || ""}`)}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const url = URL.createObjectURL(
      new Blob([content], { type: "text/calendar" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `marcacao-${bookingCode(item.id)}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  }
  return {
    state,
    go,
    money,
    today,
    dateLabel,
    business,
    service,
    availableSlots,
    bookingTotal,
    createBooking,
    updateBooking,
    draft,
    step,
    error,
    couponError,
    appliedCoupon,
    paymentOpen,
    paymentMethod,
    paymentState,
    created,
    current,
    selectedService,
    options,
    people,
    resources,
    isRestaurant,
    slots,
    totals,
    dates,
    maxDate,
    totalLabel,
    changeService,
    applyCoupon,
    next,
    confirm,
    finish,
    downloadCalendar,
  };
}
