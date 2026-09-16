import { inject, provide } from "vue";
import type { InjectionKey } from "vue";
import { useBusinessManagement } from "@/composables/businesses/useBusinessManagement.ts";

/* O contexto é o valor devolvido pelo composable: quem o injecta recebe os
   tipos completos, sem os repetir. */
export type BusinessManagementContext = ReturnType<
  typeof useBusinessManagement
>;

const key: InjectionKey<BusinessManagementContext> =
  Symbol("BusinessManagement");

export function provideBusinessManagement(): BusinessManagementContext {
  const context = useBusinessManagement();
  provide(key, context);
  return context;
}

export function useBusinessManagementContext(): BusinessManagementContext {
  const context = inject(key);
  if (!context) throw new Error("BusinessManagement provider is missing");
  return context;
}
