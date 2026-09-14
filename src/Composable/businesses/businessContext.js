import { inject, provide } from "vue";
import { useBusinessManagement } from "./useBusinessManagement.js";
const key = Symbol("BusinessManagement");
export function provideBusinessManagement() {
  const context = useBusinessManagement();
  provide(key, context);
  return context;
}
export function useBusinessManagementContext() {
  const context = inject(key);
  if (!context) throw new Error("BusinessManagement provider is missing");
  return context;
}
