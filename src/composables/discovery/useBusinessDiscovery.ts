import { computed, ref } from "vue";
import {
  state,
  go,
  money,
  today,
  business,
  notify,
} from "@/stores/applicationStore.ts";
import { clientPoint } from "@/stores/locationStore.ts";
import { distanceKm, distanceLabel, hasPoint } from "@/utils/geo.ts";
import type { Business, Service, ViewName } from "@/types/domain.ts";

/** Categoria do directório: o nome é o valor guardado na empresa. */
export interface Category {
  name: string;
  label: string;
  icon: string;
  color: string;
}

/* Estado dos filtros partilhado por todas as vistas de descoberta: passar de
   "Explorar" para a listagem completa, ou entrar num estabelecimento e voltar,
   não deve apagar o que a pessoa escreveu. */
const search = ref("");
const category = ref("Todos");
const city = ref("Todas as localizações");
const sort = ref("recommended");
const maxPrice = ref(10000);
const onlineOnly = ref(false);
const filtersOpen = ref(false);
const detailTab = ref("Serviços");
/* De onde se entrou no estabelecimento, para o botão de voltar não atirar
   sempre para a exploração. */
const originView = ref<ViewName>("explore");

export function useBusinessDiscovery() {
  const categories: Category[] = [
    {
      name: "Todos",
      label: "Todos os serviços",
      icon: "grid-2x2",
      color: "mint",
    },
    {
      name: "Beleza",
      label: "Beleza & estilo",
      icon: "scissors",
      color: "peach",
    },
    {
      name: "Bem-estar",
      label: "Spa & bem-estar",
      icon: "flower-2",
      color: "lavender",
    },
    {
      name: "Saúde",
      label: "Saúde & cuidados",
      icon: "heart-pulse",
      color: "blue",
    },
    {
      name: "Restauração",
      label: "Mesa & sabores",
      icon: "utensils",
      color: "yellow",
    },
  ];
  const cities = computed(() => [
    ...new Set(state.db.businesses.map((b) => b.city)),
  ]);
  const favorites = computed(() => state.db.favorites || []);
  const current = computed(() => business(state.selectedBusinessId));
  const servicesFor = (id: string): Service[] =>
    state.db.services.filter((s) => s.businessId === id && s.active);
  const minPrice = (id: string): number =>
    Math.min(
      ...servicesFor(id).map((s) => Number(s.price)),
      0 === servicesFor(id).length ? 0 : Infinity,
    );
  /* Quem não tem coordenadas fica no fim da ordenação por proximidade. */
  const distanceFor = (company: Business): number =>
    hasPoint(company) ? distanceKm(clientPoint.value, company) : Infinity;
  const distanceFrom = (company: Business): string =>
    hasPoint(company) ? distanceLabel(distanceFor(company)) : "";
  const results = computed(() => {
    const term = search.value.trim().toLocaleLowerCase("pt");
    let list = state.db.businesses.filter(
      (b) =>
        b.active &&
        ((b.package ?? 3) >= 3 ||
          (!!b.code && term === b.code.toLocaleLowerCase("pt"))) &&
        (state.view !== "favorites" || favorites.value.includes(b.id)) &&
        (category.value === "Todos" || b.category === category.value) &&
        (city.value === "Todas as localizações" || b.city === city.value) &&
        (!onlineOnly.value || b.onlinePayment) &&
        minPrice(b.id) <= maxPrice.value &&
        (!term ||
          [
            b.name,
            b.code || "",
            b.city,
            b.address,
            b.category,
            ...servicesFor(b.id).map((s) => s.name),
          ]
            .join(" ")
            .toLocaleLowerCase("pt")
            .includes(term)),
    );
    return list.sort(
      sort.value === "price"
        ? (a, b) => minPrice(a.id) - minPrice(b.id)
        : sort.value === "name"
          ? (a, b) => a.name.localeCompare(b.name)
          : sort.value === "distance"
            ? (a, b) => distanceFor(a) - distanceFor(b)
            : (a, b) =>
                Number(b.package === 4) - Number(a.package === 4) ||
                b.rating - a.rating,
    );
  });
  const promotions = computed(() =>
    state.db.promotions.filter(
      (p) =>
        p.active &&
        p.businessId === current.value?.id &&
        (!p.expires || p.expires >= today()),
    ),
  );
  const selectedCategory = (name: string): Category =>
    categories.find((c) => c.name === name) || categories[0];
  function openCompany(company: Business): void {
    if (
      ["explore", "directory", "favorites", "appointments"].includes(state.view)
    )
      originView.value = state.view;
    state.selectedBusinessId = company.id;
    detailTab.value = "Serviços";
    go("business");
  }
  function favorite(id: string): void {
    const index = state.db.favorites.indexOf(id);
    if (index < 0) state.db.favorites.push(id);
    else state.db.favorites.splice(index, 1);
  }
  function book(serviceId: string): void {
    if (!current.value) return;
    state.bookingDraft = {
      businessId: current.value.id,
      serviceId,
      date: today(),
      staffId: "",
      resourceId: "",
      time: "",
      partySize: 1,
      paymentMethod: "onsite",
      coupon: "",
      notes: "",
    };
    go("booking");
  }
  function clearFilters() {
    search.value = "";
    category.value = "Todos";
    city.value = "Todas as localizações";
    maxPrice.value = 10000;
    onlineOnly.value = false;
  }
  function copyCoupon(code: string): void {
    navigator.clipboard
      ?.writeText(code)
      .then(() => notify("Cupão copiado."))
      .catch(() => notify(`O seu cupão: ${code}`));
  }
  function photoError(event: Event): void {
    const image = event.target as HTMLImageElement;
    image.style.visibility = "hidden";
    image.parentElement?.classList.add("photo-unavailable");
  }
  return {
    state,
    go,
    money,
    today,
    business,
    notify,
    search,
    category,
    city,
    sort,
    maxPrice,
    onlineOnly,
    filtersOpen,
    detailTab,
    categories,
    cities,
    favorites,
    current,
    servicesFor,
    minPrice,
    distanceFrom,
    originView,
    results,
    promotions,
    selectedCategory,
    openCompany,
    favorite,
    book,
    clearFilters,
    copyCoupon,
    photoError,
  };
}
