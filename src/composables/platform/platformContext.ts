import { inject, provide } from "vue";
import type { InjectionKey } from "vue";
import { usePlatformManagement } from "@/composables/platform/usePlatformManagement.ts";

/* O contexto é o valor devolvido pelo composable: quem o injecta recebe os
   tipos completos, sem os repetir. */
export type PlatformManagementContext = ReturnType<
  typeof usePlatformManagement
>;

const key: InjectionKey<PlatformManagementContext> =
  Symbol("PlatformManagement");

export function providePlatformManagement(): PlatformManagementContext {
  const context = usePlatformManagement();
  provide(key, context);
  return context;
}

export function usePlatformManagementContext(): PlatformManagementContext {
  const context = inject(key);
  if (!context) throw new Error("PlatformManagement provider is missing");
  return context;
}
