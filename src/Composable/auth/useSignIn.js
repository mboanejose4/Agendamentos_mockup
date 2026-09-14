import { reactive, ref } from "vue";
import {
  state,
  go,
  registerAccount,
  loginAccount,
} from "@/Store/applicationStore.js";
export function useSignIn() {
  const mode = ref(state.returnView === "onboard" ? "register" : "login");
  const showPassword = ref(false);
  const busy = ref(false);
  const error = ref("");
  const account = reactive({ name: "", email: "", phone: "", password: "" });
  async function submit() {
    error.value = "";
    busy.value = true;
    try {
      const target = state.returnView || "appointments";
      const result = await (mode.value === "register"
        ? registerAccount(account)
        : loginAccount(account));
      if (!result.ok) {
        error.value = result.error;
        return;
      }
      state.returnView = null;
      go(target);
    } catch {
      error.value = "Não foi possível iniciar a sessão. Tente novamente.";
    } finally {
      busy.value = false;
    }
  }
  return { state, go, mode, showPassword, busy, error, account, submit };
}
