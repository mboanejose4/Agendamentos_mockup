import { inject, provide } from "vue";
import type { InjectionKey } from "vue";
import { useBusinessDiscovery } from "@/composables/discovery/useBusinessDiscovery.ts";

/* O contexto é o valor devolvido pelo composable: quem o injecta recebe os
   tipos completos, sem os repetir. */
export type BusinessDiscoveryContext = ReturnType<typeof useBusinessDiscovery>;

const key: InjectionKey<BusinessDiscoveryContext> = Symbol("BusinessDiscovery");

export function provideBusinessDiscovery(): BusinessDiscoveryContext {
  const context = useBusinessDiscovery();
  provide(key, context);
  return context;
}

export function useBusinessDiscoveryContext(): BusinessDiscoveryContext {
  const context = inject(key);
  if (!context) throw new Error("BusinessDiscovery provider is missing");
  return context;
}
