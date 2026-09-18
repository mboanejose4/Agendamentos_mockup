import { createApp } from "vue";
import PrimeVue from "primevue/config";
import Aura from "@primeuix/themes/aura";
import AnimateOnScroll from "primevue/animateonscroll";
import App from "@/App.vue";
import "primeicons/primeicons.css";
import "@/assets/app.css";

const app = createApp(App);

/* O PrimeVue escreve os seus estilos numa camada própria, declarada no app.css
   depois das do Tailwind: assim as utilidades continuam a poder ajustar um
   componente pontualmente, sem `!important`. O modo escuro segue o mesmo
   atributo que o resto da aplicação, em vez da classe que o preset traz. */
app.use(PrimeVue, {
  ripple: false,
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '[data-theme="dark"]',
      cssLayer: {
        name: "primevue",
        order: "theme, base, components, primevue, utilities",
      },
    },
  },
});

app.directive("animateonscroll", AnimateOnScroll);

app.mount("#app");
