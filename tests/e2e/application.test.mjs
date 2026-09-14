import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "warning" && message.text().includes("[Vue warn]"))
    errors.push(message.text());
});
const roles = {
  guest: ["explore", "business", "favorites", "auth"],
  client: ["appointments", "notifications", "profile", "onboard"],
  professional: [
    "professional-agenda",
    "professional-services",
    "professional-schedule",
    "professional-history",
  ],
  manager: [
    "overview",
    "agenda",
    "services",
    "team",
    "resources",
    "schedule",
    "clients",
    "payments",
    "reports",
    "promotions",
    "settings",
    "support",
  ],
  platform: [
    "platform-overview",
    "companies",
    "users",
    "monitoring",
    "support",
    "platform-settings",
  ],
};
async function visit(role, view) {
  await page.evaluate(
    async ({ role, view }) => {
      const { state, switchRole, go } =
        await import("/src/Store/applicationStore.js");
      switchRole(role);
      state.selectedBusinessId = "b1";
      go(view);
    },
    { role, view },
  );
  await page
    .locator(view === "auth" ? ".authentication-page" : ".application")
    .waitFor();
  await page.waitForTimeout(80);
}
try {
  await page.goto(process.env.APP_URL || "http://localhost:5175");
  if (process.env.APP_THEME)
    if (
      (await page.locator("html").getAttribute("data-theme")) !==
      process.env.APP_THEME
    )
      await page
        .getByRole("button", {
          name:
            process.env.APP_THEME === "dark"
              ? "Activar modo escuro"
              : "Activar modo claro",
        })
        .click();
  let checked = 0;
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const [role, views] of Object.entries(roles))
      for (const view of views) {
        await visit(role, view);
        assert.equal(
          await page.locator("#main-content").count(),
          1,
          `${role}/${view}: main`,
        );
        assert(
          await page.locator("main h1, main h2").count(),
          `${role}/${view}: heading`,
        );
        assert.equal(
          await page.locator(".sidebar").count(),
          view === "auth" ? 0 : 1,
        );
        assert.equal(await page.locator(".mobile-bottom-nav").count(), 0);
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth + 1,
          ),
          false,
          `${role}/${view}/${width}: overflow`,
        );
        checked++;
      }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const [role, view, button] of [
    ["manager", "services", "Novo serviço"],
    ["manager", "team", "Adicionar membro"],
    ["manager", "resources", "Novo recurso"],
    ["manager", "clients", "Novo cliente"],
  ]) {
    await visit(role, view);
    await page.getByRole("button", { name: button, exact: true }).click();
    await page.locator("dialog[open]").waitFor();
    assert(await page.locator("dialog[open] input").count());
    await page
      .locator("dialog[open]")
      .getByRole("button", { name: "Fechar", exact: true })
      .click();
  }
  await visit("guest", "explore");
  await page.locator(".business-card .favorite-button").first().click();
  assert.equal(
    await page
      .locator(".business-card .favorite-button")
      .first()
      .getAttribute("aria-pressed"),
    "true",
  );
  await page.locator(".business-card .photo-link").first().click();
  await page.locator(".business-detail-layout").waitFor();
  // Each booking step and dialog receives the same draft from its feature provider.
  await page.evaluate(async () => {
    const { state, go, today } = await import("/src/Store/applicationStore.js");
    state.bookingDraft = {
      businessId: "b1",
      serviceId: state.db.services.find(
        (s) => s.businessId === "b1" && s.active,
      ).id,
      date: today(),
      resumeStep: 1,
    };
    go("booking");
  });
  await page.locator(".booking-form-section").waitFor();
  await page.locator(".booking-form-section .form-actions .primary").click();
  await page.locator(".booking-date-grid").waitFor();
  await visit("guest", "auth");
  await page
    .getByRole("button", { name: "Quero registar a minha empresa" })
    .click();
  await page.getByPlaceholder("O seu nome").fill("Regression Owner");
  await page
    .getByPlaceholder("nome@exemplo.com")
    .fill("owner-" + Date.now() + "@example.com");
  await page.getByPlaceholder("+258", { exact: true }).fill("+258840000000");
  await page
    .getByPlaceholder("Pelo menos 8 caracteres")
    .fill("Registration123");
  await page
    .locator("form")
    .getByRole("button", { name: "Criar conta", exact: true })
    .click();
  await page
    .getByRole("heading", { name: "Vamos conhecer o seu negócio." })
    .waitFor();
  await page.getByLabel("Nome do estabelecimento").fill("Regression Business");
  await page.getByLabel("Endereço", { exact: true }).fill("Test street");
  await page.getByLabel("Contacto", { exact: true }).fill("+258840000000");
  await page.getByLabel("E-mail", { exact: true }).fill("business@example.com");
  await page
    .getByLabel("Sobre o estabelecimento")
    .fill("Business created by automated regression check.");
  await page.getByRole("button", { name: "Criar estabelecimento" }).click();
  await page.waitForFunction(async () => {
    const { state } = await import("/src/Store/applicationStore.js");
    return state.view === "services" && state.role === "manager";
  });
  assert.equal(
    await page.evaluate(async () => {
      const { state } = await import("/src/Store/applicationStore.js");
      return state.db.businesses.some(
        (b) => b.name === "Regression Business" && b.ownerId === state.userId,
      );
    }),
    true,
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  assert.equal(
    await page
      .locator(".page-motion")
      .evaluate((el) => getComputedStyle(el).animationName),
    "none",
  );
  assert.deepEqual(errors, []);
  console.log(
    `PASS: ${checked} páginas, diálogos, favoritos e estado partilhado da marcação.`,
  );
} finally {
  await browser.close();
}
