import { computed, ref } from "vue";
import {
  state,
  go,
  money,
  today,
  business,
  notify,
} from "@/Store/applicationStore.js";
export function useBusinessDiscovery() {
  const search = ref("");
  const category = ref("Todos");
  const city = ref("Todas as localizações");
  const sort = ref("recommended");
  const maxPrice = ref(10000);
  const onlineOnly = ref(false);
  const filtersOpen = ref(false);
  const detailTab = ref("Serviços");
  const categories = [
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
  const servicesFor = (id) =>
    state.db.services.filter((s) => s.businessId === id && s.active);
  const minPrice = (id) =>
    Math.min(
      ...servicesFor(id).map((s) => Number(s.price)),
      0 === servicesFor(id).length ? 0 : Infinity,
    );
  const results = computed(() => {
    const term = search.value.trim().toLocaleLowerCase("pt");
    let list = state.db.businesses.filter(
      (b) =>
        b.active &&
        (state.view !== "favorites" || favorites.value.includes(b.id)) &&
        (category.value === "Todos" || b.category === category.value) &&
        (city.value === "Todas as localizações" || b.city === city.value) &&
        (!onlineOnly.value || b.onlinePayment) &&
        minPrice(b.id) <= maxPrice.value &&
        (!term ||
          [
            b.name,
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
          : (a, b) => b.rating - a.rating,
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
  const selectedCategory = (name) =>
    categories.find((c) => c.name === name) || categories[0];
  function openCompany(company) {
    state.selectedBusinessId = company.id;
    detailTab.value = "Serviços";
    go("business");
  }
  function favorite(id) {
    const index = state.db.favorites.indexOf(id);
    if (index < 0) state.db.favorites.push(id);
    else state.db.favorites.splice(index, 1);
  }
  function book(serviceId) {
    state.bookingDraft = {
      businessId: current.value.id,
      serviceId,
      date: today(),
      staffId: "",
      time: "",
      partySize: 1,
      paymentMethod: "onsite",
      coupon: "",
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
  function copyCoupon(code) {
    navigator.clipboard
      ?.writeText(code)
      .then(() => notify("Cupão copiado."))
      .catch(() => notify(`O seu cupão: ${code}`));
  }
  function photoError(event) {
    event.target.style.visibility = "hidden";
    event.target.parentElement.classList.add("photo-unavailable");
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
