<script setup lang="ts">
import { nextTick } from "vue";
import AppIcon from "@/components/shared/ui/AppIcon.vue";
import { go, state } from "@/stores/applicationStore.ts";
import {
  landingLinks,
  type LandingLink,
} from "@/utils/navigation/landingLinks.ts";
import marcaFacilLogo from "@/assets/img/logo-dark.png";

async function activateLink(link: LandingLink): Promise<void> {
  if (link.view) {
    go(link.view);
    return;
  }
  if (state.view !== "explore") {
    go("explore");
    await nextTick();
  }
  document.getElementById(link.section)?.scrollIntoView({ behavior: "smooth" });
}

function registerBusiness(): void {
  state.returnView = "onboard";
  go("auth");
}
</script>

<template>
  <footer class="landing-footer" aria-label="Rodapé do MarcaFácil">
    <div class="landing-footer__glow" aria-hidden="true"></div>
    <div class="landing-footer__main">
      <div class="landing-footer__brand">
        <button
          type="button"
          aria-label="MarcaFácil, início"
          @click="go('explore')"
        >
          <img :src="marcaFacilLogo" alt="MarcaFácil" />
        </button>
        <p>
          Encontre, marque e siga com o seu dia. Serviços de confiança, no
          momento certo.
        </p>
        <span class="landing-footer__location"
          ><AppIcon name="map-pin" :size="16" /> Feito para Moçambique</span
        >
      </div>

      <nav class="landing-footer__nav" aria-label="Ligações do rodapé">
        <span>Descobrir</span>
        <button
          v-for="link in landingLinks"
          :key="link.section || link.view"
          type="button"
          @click="activateLink(link)"
        >
          {{ link.label }}
        </button>
      </nav>

      <div class="landing-footer__business">
        <span>PARA NEGÓCIOS</span>
        <h2>Uma agenda mais simples começa aqui.</h2>
        <p>Organize serviços, equipa e clientes num só lugar.</p>
        <button
          class="landing-footer__cta"
          type="button"
          @click="registerBusiness"
        >
          Registar o meu negócio <AppIcon name="arrow-up-right" :size="17" />
        </button>
      </div>
    </div>

    <div class="landing-footer__bottom">
      <span
        >© {{ new Date().getFullYear() }} MarcaFácil. Todos os direitos
        reservados.</span
      >
      <span>Marcar devia ser a parte fácil.</span>
    </div>
  </footer>
</template>

<style scoped>
.landing-footer {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  margin: 0 16px 16px;
  border-radius: 32px;
  background: linear-gradient(135deg, var(--brand-950), var(--brand-800));
  padding: clamp(32px, 5vw, 64px);
  color: #fff;
}
.landing-footer__glow {
  position: absolute;
  z-index: -1;
  right: -140px;
  bottom: -210px;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: rgba(74, 190, 116, 0.17);
  filter: blur(4px);
}
.landing-footer__main {
  display: grid;
  grid-template-columns: minmax(260px, 1.2fr) minmax(150px, 0.55fr) minmax(
      280px,
      0.9fr
    );
  gap: clamp(34px, 6vw, 84px);
  max-width: 1280px;
  margin: 0 auto;
}
.landing-footer__brand button {
  border: 0;
  background: transparent;
  padding: 0;
}
.landing-footer__brand img {
  width: 190px;
  height: auto;
  object-fit: contain;
  object-position: left;
}
.landing-footer__brand p {
  max-width: 390px;
  margin-top: 22px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  line-height: 1.7;
}
.landing-footer__location {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 24px;
  color: rgba(255, 255, 255, 0.84);
  font-size: 13px;
  font-weight: 600;
}
.landing-footer__nav {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 13px;
}
.landing-footer__nav > span,
.landing-footer__business > span {
  margin-bottom: 5px;
  color: rgba(255, 255, 255, 0.48);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
}
.landing-footer__nav button {
  border: 0;
  background: transparent;
  padding: 0;
  color: rgba(255, 255, 255, 0.78);
  font-size: 14px;
  text-align: left;
}
.landing-footer__nav button:hover {
  color: #fff;
}
.landing-footer__business {
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.07);
  padding: 24px;
}
.landing-footer__business h2 {
  margin-top: 10px;
  color: #fff;
  font-size: 22px;
  font-weight: 650;
  line-height: 1.2;
}
.landing-footer__business p {
  margin-top: 10px;
  color: rgba(255, 255, 255, 0.64);
  font-size: 13px;
  line-height: 1.55;
}
.landing-footer__cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
  border: 0;
  border-radius: 999px;
  background: #fff;
  padding: 11px 16px;
  color: var(--brand-800);
  font-size: 13px;
  font-weight: 700;
}
.landing-footer__cta:hover {
  background: var(--brand-50);
}
.landing-footer__bottom {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  max-width: 1280px;
  margin: 44px auto 0;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  padding-top: 22px;
  color: rgba(255, 255, 255, 0.48);
  font-size: 12px;
}
@media (max-width: 820px) {
  .landing-footer__main {
    grid-template-columns: 1fr 1fr;
  }
  .landing-footer__business {
    grid-column: 1/-1;
  }
  .landing-footer__bottom {
    flex-direction: column;
    gap: 8px;
  }
}
@media (max-width: 560px) {
  .landing-footer {
    margin: 0 10px 10px;
    border-radius: 24px;
    padding: 30px 24px 84px;
  }
  .landing-footer__main {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  .landing-footer__business {
    grid-column: auto;
  }
  .landing-footer__bottom {
    margin-top: 34px;
  }
  .landing-footer__bottom span:last-child {
    display: none;
  }
}
</style>
