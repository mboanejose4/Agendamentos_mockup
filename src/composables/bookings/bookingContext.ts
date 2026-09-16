import { inject, provide } from "vue";
import type { InjectionKey } from "vue";
import { useBookingFlow } from "@/composables/bookings/useBookingFlow.ts";

/* O contexto é o valor devolvido pelo composable: quem o injecta recebe os
   tipos completos, sem os repetir. */
export type BookingFlowContext = ReturnType<typeof useBookingFlow>;

const key: InjectionKey<BookingFlowContext> = Symbol("BookingFlow");

export function provideBookingFlow(): BookingFlowContext {
  const context = useBookingFlow();
  provide(key, context);
  return context;
}

export function useBookingFlowContext(): BookingFlowContext {
  const context = inject(key);
  if (!context) throw new Error("BookingFlow provider is missing");
  return context;
}
