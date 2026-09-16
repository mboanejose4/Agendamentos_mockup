import { inject, provide } from "vue";
import type { InjectionKey } from "vue";
import { useAccountManagement } from "@/composables/account/useAccountManagement.ts";

/* O contexto é o valor devolvido pelo composable: quem o injecta recebe os
   tipos completos, sem os repetir. */
export type AccountManagementContext = ReturnType<typeof useAccountManagement>;

const key: InjectionKey<AccountManagementContext> = Symbol("AccountManagement");

export function provideAccountManagement(): AccountManagementContext {
  const context = useAccountManagement();
  provide(key, context);
  return context;
}

export function useAccountManagementContext(): AccountManagementContext {
  const context = inject(key);
  if (!context) throw new Error("AccountManagement provider is missing");
  return context;
}

/* Contexto partilhado pelas páginas e diálogos da área pessoal. */
