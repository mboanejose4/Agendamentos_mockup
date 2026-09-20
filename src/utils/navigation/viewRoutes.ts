import type { Role, ViewName } from "@/types/domain.ts";

const publicViews: readonly ViewName[] = [
  "explore",
  "directory",
  "business",
  "auth",
  "shared",
];
const clientViews: readonly ViewName[] = [
  "favorites",
  "booking",
  "appointments",
  "notifications",
  "profile",
  "onboard",
];
const professionalViews: readonly ViewName[] = [
  "professional-agenda",
  "professional-services",
  "professional-schedule",
  "professional-history",
  "professional-performance",
];
const managerViews: readonly ViewName[] = [
  "overview",
  "agenda",
  "clients",
  "services",
  "team",
  "resources",
  "schedule",
  "payments",
  "reports",
  "promotions",
  "settings",
  "support",
];
const platformViews: readonly ViewName[] = [
  "platform-overview",
  "companies",
  "users",
  "monitoring",
  "platform-settings",
  "support",
];

const allViews = new Set<ViewName>([
  ...publicViews,
  ...clientViews,
  ...professionalViews,
  ...managerViews,
  ...platformViews,
]);

export function routeFromLocation(): ViewName | undefined {
  if (typeof window === "undefined") return undefined;
  const params = new URLSearchParams(window.location.search);
  const route = params.get("page");
  if (route === "shared" && !params.has("m")) return undefined;
  return route && allViews.has(route as ViewName)
    ? (route as ViewName)
    : undefined;
}

export function canOpenView(role: Role, view: ViewName): boolean {
  if (publicViews.includes(view)) return true;
  if (role === "guest") return false;
  if (role === "client") return clientViews.includes(view);
  if (role === "professional")
    return (
      professionalViews.includes(view) ||
      view === "notifications" ||
      view === "profile"
    );
  if (role === "manager")
    return (
      managerViews.includes(view) ||
      view === "notifications" ||
      view === "profile" ||
      view === "onboard"
    );
  return (
    platformViews.includes(view) ||
    view === "notifications" ||
    view === "profile"
  );
}

export function writeViewRoute(view: ViewName, replace = false): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (view === "explore") url.searchParams.delete("page");
  else url.searchParams.set("page", view);
  if (view !== "shared") url.searchParams.delete("m");
  url.hash = "";
  const next = `${url.pathname}${url.search}${url.hash}`;
  if (
    next ===
    `${window.location.pathname}${window.location.search}${window.location.hash}`
  )
    return;
  window.history[replace ? "replaceState" : "pushState"]({}, "", next);
}
