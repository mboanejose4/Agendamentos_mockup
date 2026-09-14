import { reactive, computed } from "vue";
import {
  salons,
  services,
  professionals,
  initialBookings,
  notifications,
} from "./data/mockData.js";

const defaultBooking = () => ({
  salonId: 1,
  serviceId: null,
  professionalId: null,
  date: "15 Set 2026",
  time: null,
  coupon: "",
  paymentMethod: "onsite",
  paid: false,
});

export const appStore = reactive({
  role: "guest",
  view: "home",
  previousView: "home",
  selectedSalonId: 1,
  authMode: "login",
  sidebarOpen: false,
  roleSwitcherOpen: false,
  toast: "",
  booking: defaultBooking(),
  bookings: [...initialBookings],
  notifications: [...notifications],
  modal: null,
  modalPayload: null,
  user: {
    name: "José Mboane",
    email: "jose@example.com",
    phone: "+258 84 000 0000",
  },
});

export const helpers = {
  salons,
  services,
  professionals,
  salonById: (id) => salons.find((item) => item.id === Number(id)),
  serviceById: (id) => services.find((item) => item.id === Number(id)),
  professionalById: (id) =>
    professionals.find((item) => item.id === Number(id)),
};

export const currentSalon = computed(
  () => helpers.salonById(appStore.selectedSalonId) || salons[0],
);

export function go(view, payload = {}) {
  appStore.previousView = appStore.view;
  appStore.view = view;
  Object.assign(appStore, payload);
  appStore.sidebarOpen = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export function setRole(role) {
  appStore.role = role;
  appStore.roleSwitcherOpen = false;
  const landing = {
    guest: "home",
    client: "client-dashboard",
    professional: "professional-dashboard",
    salonAdmin: "salon-admin",
    platformAdmin: "platform-admin",
  }[role];
  go(landing || "home");
}

export function startBooking(salonId, serviceId = null) {
  appStore.selectedSalonId = Number(salonId);
  appStore.booking = {
    ...defaultBooking(),
    salonId: Number(salonId),
    serviceId,
  };
  go("booking");
}

export function showToast(message) {
  appStore.toast = message;
  window.setTimeout(() => {
    if (appStore.toast === message) appStore.toast = "";
  }, 2600);
}

export function openModal(name, payload = null) {
  appStore.modal = name;
  appStore.modalPayload = payload;
}

export function closeModal() {
  appStore.modal = null;
  appStore.modalPayload = null;
}

export function completeDemoLogin(mode = "client") {
  setRole(mode);
  showToast("Sessão iniciada no modo de demonstração.");
}

export function markNotificationsRead() {
  appStore.notifications.forEach((item) => {
    item.read = true;
  });
  showToast("Notificações marcadas como lidas.");
}

export function addBooking() {
  const service = helpers.serviceById(appStore.booking.serviceId);
  const booking = {
    id: `AG-${Math.floor(25000 + Math.random() * 900)}`,
    salonId: appStore.booking.salonId,
    serviceId: appStore.booking.serviceId,
    professionalId: appStore.booking.professionalId,
    date: appStore.booking.date,
    time: appStore.booking.time,
    status: "Confirmada",
    payment:
      appStore.booking.paymentMethod === "online"
        ? "Pago online"
        : "Pagamento no salão",
    total: service?.price || 0,
  };
  appStore.bookings.unshift(booking);
  return booking;
}
