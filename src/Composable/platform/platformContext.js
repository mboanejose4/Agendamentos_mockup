import { inject, provide } from "vue";
import { usePlatformManagement } from "./usePlatformManagement.js";
const key = Symbol("PlatformManagement");
export function providePlatformManagement() {
  const context = usePlatformManagement();
  provide(key, context);
  return context;
}
export function usePlatformManagementContext() {
  const context = inject(key);
  if (!context) throw new Error("PlatformManagement provider is missing");
  return context;
}
