import SignInPage from "@/Page/auth/SignInPage.vue";
import RegisterBusinessPage from "@/Page/businesses/RegisterBusinessPage.vue";
import CreateBookingPage from "@/Page/bookings/CreateBookingPage.vue";
import BusinessDirectoryPage from "@/Page/discovery/BusinessDirectoryPage.vue";
import BusinessDetailsPage from "@/Page/discovery/BusinessDetailsPage.vue";
import BusinessManagement from "@/Component/businesses/BusinessManagement.vue";
import AccountManagement from "@/Component/account/AccountManagement.vue";
import PlatformManagement from "@/Component/platform/PlatformManagement.vue";
const pages = {
  auth: SignInPage,
  onboard: RegisterBusinessPage,
  booking: CreateBookingPage,
  explore: BusinessDirectoryPage,
  favorites: BusinessDirectoryPage,
  business: BusinessDetailsPage,
};
export function resolvePage(view, role) {
  if (pages[view]) return pages[view];
  if (
    ["appointments", "notifications", "profile"].includes(view) ||
    view.startsWith("professional-")
  )
    return AccountManagement;
  if (role === "platform" || view === "support") return PlatformManagement;
  if (role === "manager") return BusinessManagement;
  return BusinessDirectoryPage;
}
