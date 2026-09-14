import { inject, provide } from "vue";
import { useAccountManagement } from "./useAccountManagement.js";
const key = Symbol("AccountManagement");
export function provideAccountManagement() {
  const context = useAccountManagement();
  provide(key, context);
  return context;
}
export function useAccountManagementContext() {
  const context = inject(key);
  if (!context) throw new Error("AccountManagement provider is missing");
  return context;
}
