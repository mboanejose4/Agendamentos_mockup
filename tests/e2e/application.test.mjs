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
    "notifications",
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
        await import("/src/stores/applicationStore.ts");
      switchRole(role);
      state.selectedBusinessId = "b1";
      go(view);
    },
    { role, view },
  );
  await page.locator("main").waitFor();
  await page.waitForTimeout(350);
}
try {
  await page.goto(process.env.APP_URL || "http://localhost:5175", {
    waitUntil: "domcontentloaded",
  });
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
          await page.locator("main").count(),
          1,
          `${role}/${view}: main`,
        );
        assert(
          await page.locator("main h1, main h2").count(),
          `${role}/${view}: heading`,
        );
        if (
          [
            "explore",
            "appointments",
            "professional-agenda",
            "overview",
            "platform-overview",
          ].includes(view)
        ) {
          assert.equal(
            await page.locator(".insight-card").count(),
            role === "manager" && view === "overview" ? 12 : 4,
            `${role}/${view}: metric cards`,
          );
          assert.equal(
            await page.locator(".comparison-chart").count(),
            role === "manager" && view === "overview" ? 2 : 1,
            `${role}/${view}: comparison chart`,
          );
          assert.equal(
            await page.locator(".distribution-chart").count(),
            1,
            `${role}/${view}: distribution chart`,
          );
        }
        assert.equal(
          await page.locator('aside[aria-label="Navegação principal"]').count(),
          role === "guest" || view === "auth" ? 0 : 1,
        );
        if (view !== "auth") {
          assert.equal(
            await page
              .getByRole("button", { name: "Escolher espaço de trabalho" })
              .count(),
            role === "guest" ? 1 : 0,
          );
          if (width < 1025) {
            assert.equal(
              await page
                .getByRole("button", { name: "Abrir navegação" })
                .count(),
              role === "guest" ? 0 : 1,
            );
            assert.equal(
              await page
                .locator("header")
                .getByRole("button", { name: "MarcaFácil, início" })
                .count(),
              role === "guest" ? 1 : 0,
            );
          }
        }
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
  await visit("manager", "overview");
  assert.equal(
    await page.getByRole("heading", { name: "Desempenho da equipa" }).count(),
    1,
  );
  assert.equal(
    await page
      .getByRole("heading", { name: "Comparativo de clientes" })
      .count(),
    1,
  );
  await page.getByRole("button", { name: "Mais marcações" }).click();
  assert.equal(
    await page
      .getByRole("button", { name: "Mais marcações" })
      .getAttribute("aria-pressed"),
    "true",
  );
  await page
    .getByRole("combobox", { name: "Período da análise" })
    .selectOption("28");
  assert(await page.getByText("vs 4 semanas anteriores").count());
  await visit("professional", "professional-agenda");
  assert.equal(
    await page
      .getByRole("heading", { name: "O seu desempenho pessoal" })
      .count(),
    1,
  );
  assert.equal(
    await page.getByRole("heading", { name: "Ranking de clientes" }).count(),
    0,
  );
  await visit("manager", "agenda");
  await page.evaluate(async () => {
    const { markPaid } = await import("/src/stores/applicationStore.ts");
    markPaid("a1");
  });
  await page
    .locator("article")
    .filter({ hasText: "Corte & styling" })
    .first()
    .getByTitle("Ver detalhes da reserva")
    .click();
  let bookingDialog = page.locator("dialog[open]");
  assert.equal(
    await bookingDialog
      .getByRole("button", { name: "Cancelar reserva" })
      .count(),
    0,
  );
  assert.equal(
    await bookingDialog.getByRole("button", { name: "Não compareceu" }).count(),
    0,
  );
  await bookingDialog.getByRole("button", { name: "Fechar" }).click();

  await visit("professional", "professional-agenda");
  await page
    .locator("article")
    .filter({ hasText: "Joaquim Bila" })
    .first()
    .getByRole("button", { name: "Detalhes" })
    .click();
  bookingDialog = page.locator("dialog[open]");
  await bookingDialog
    .getByRole("button", { name: "Registar pagamento" })
    .click();
  assert.equal(
    await bookingDialog.getByRole("button", { name: "Registar falta" }).count(),
    0,
  );
  await bookingDialog.getByRole("button", { name: "Fechar" }).click();

  for (const [role, view, button] of [
    ["manager", "services", "Novo serviço"],
    ["manager", "team", "Adicionar membro"],
    ["manager", "resources", "Novo recurso"],
    ["manager", "clients", "Nova reserva"],
  ]) {
    await visit(role, view);
    await page.getByRole("button", { name: button, exact: true }).click();
    await page.locator("dialog[open]").waitFor();
    assert(
      await page.locator("dialog[open] input, dialog[open] select").count(),
    );
    await page
      .locator("dialog[open]")
      .getByRole("button", { name: "Fechar", exact: true })
      .click();
  }
  await visit("guest", "explore");
  await page
    .locator(
      'article button[aria-label^="Guardar"], article button[aria-label^="Remover"]',
    )
    .first()
    .click();
  assert.equal(
    await page
      .locator(
        'article button[aria-label^="Guardar"], article button[aria-label^="Remover"]',
      )
      .first()
      .getAttribute("aria-pressed"),
    "true",
  );
  await page.locator('article button[aria-label^="Ver "]').first().click();
  await page.getByRole("button", { name: "Serviços", exact: true }).waitFor();
  // Each booking step and dialog receives the same draft from its feature provider.
  await page.evaluate(async () => {
    const { state, go, today } =
      await import("/src/stores/applicationStore.ts");
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
  await page.getByRole("button", { name: "Continuar", exact: true }).waitFor();
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.getByRole("heading", { name: "Qual é o melhor dia?" }).waitFor();
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
    const { state } = await import("/src/stores/applicationStore.ts");
    return state.view === "services" && state.role === "manager";
  });
  assert.equal(
    await page.evaluate(async () => {
      const { state } = await import("/src/stores/applicationStore.ts");
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
