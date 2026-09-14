import { getNavigationGroups } from "@/Utils/navigation/navigationGroups.js";
import { computed, ref, watch } from "vue";
import { state, go, switchRole, logout } from "@/Store/applicationStore.js";
import { workspaceRoles } from "@/Utils/navigation/workspaceRoles.js";
export function useAppNavigation() {
  const mobileMenu = ref(false);
  const workspaceOpen = ref(false);

  const currentRole = computed(() =>
    workspaceRoles.find((r) => r.id === state.role),
  );
  const user = computed(() =>
    state.db.users.find((u) => u.id === state.userId),
  );
  const unread = computed(
    () =>
      state.db.notifications.filter((n) => n.userId === state.userId && !n.read)
        .length,
  );
  const navigation = computed(() => getNavigationGroups(state.role));

  const currentLabel = computed(
    () =>
      navigation.value
        .flatMap((g) => g.items)
        .find((i) => i[0] === state.view)?.[1] ||
      {
        business: "Estabelecimento",
        booking: "Nova marcação",
        auth: "A sua conta",
        onboard: "Registar empresa",
      }[state.view] ||
      "Explorar",
  );
  const professionalList = computed(() =>
    state.db.staff.filter((p) => p.businessId === state.businessId && p.active),
  );

  function navigate(view) {
    mobileMenu.value = false;
    if (
      state.role === "guest" &&
      ["appointments", "profile", "notifications", "onboard"].includes(view)
    ) {
      state.returnView = view;
      go("auth");
    } else go(view);
  }
  function chooseRole(role) {
    switchRole(role);
    workspaceOpen.value = false;
    mobileMenu.value = false;
  }
  watch(
    () => state.view,
    () => {
      mobileMenu.value = false;
      document.title = `${currentLabel.value} · MarcaFácil`;
      window.scrollTo({ top: 0, behavior: "instant" });
    },
    { immediate: true },
  );
  function selectBusiness(id) {
    state.businessId = id;
    state.staffId = professionalList.value[0]?.id || "";
  }
  function selectStaff(id) {
    state.staffId = id;
  }
  function signOut() {
    workspaceOpen.value = false;
    mobileMenu.value = false;
    logout();
  }
  const companyName = computed(
    () =>
      state.db.businesses.find((item) => item.id === state.businessId)?.name ||
      "",
  );
  return {
    state,
    mobileMenu,
    workspaceOpen,
    roles: workspaceRoles,
    currentRole,
    user,
    unread,
    navigation,
    currentLabel,
    professionalList,
    companyName,
    navigate,
    chooseRole,
    selectBusiness,
    selectStaff,
    signOut,
  };
}
