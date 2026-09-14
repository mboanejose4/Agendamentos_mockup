import { inject, provide } from "vue";
import { useBookingFlow } from "./useBookingFlow.js";
const key = Symbol("BookingFlow");
export function provideBookingFlow() {
  const context = useBookingFlow();
  provide(key, context);
  return context;
}
export function useBookingFlowContext() {
  const context = inject(key);
  if (!context) throw new Error("BookingFlow provider is missing");
  return context;
}
