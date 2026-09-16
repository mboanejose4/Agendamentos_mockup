import SignInPage from "@/views/shared/SignInPage.vue";
import RegisterBusinessPage from "@/views/manager/RegisterBusinessPage.vue";
import CreateBookingPage from "@/views/client/CreateBookingPage.vue";
import BusinessDirectoryPage from "@/views/client/BusinessDirectoryPage.vue";
import BusinessListPage from "@/views/client/BusinessListPage.vue";
import SharedBookingPage from "@/views/client/SharedBookingPage.vue";
import BusinessDetailsPage from "@/views/client/BusinessDetailsPage.vue";
import BusinessManagement from "@/components/manager/BusinessManagement.vue";
import AccountManagement from "@/components/shared/account/AccountManagement.vue";
import PlatformManagement from "@/components/platform/PlatformManagement.vue";
import type { Component } from "vue";
import type { Role, ViewName } from "@/types/domain.ts";

/* Vistas com componente próprio; as restantes são resolvidas pelo papel. */
const pages: Partial<Record<ViewName, Component>> = {
  auth: SignInPage,
  onboard: RegisterBusinessPage,
  booking: CreateBookingPage,
  explore: BusinessDirectoryPage,
  directory: BusinessListPage,
  shared: SharedBookingPage,
  favorites: BusinessDirectoryPage,
  business: BusinessDetailsPage,
};
export function resolvePage(view: ViewName, role: Role): Component {
  const page = pages[view];
  if (page) return page;
  if (
    ["appointments", "notifications", "profile"].includes(view) ||
    view.startsWith("professional-")
  )
    return AccountManagement;
  if (role === "platform" || view === "support") return PlatformManagement;
  if (role === "manager") return BusinessManagement;
  return BusinessDirectoryPage;
}
