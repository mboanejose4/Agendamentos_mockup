import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const dialog = () => page.locator("dialog[open]");
async function visit(role, view) {
  await page.evaluate(
    async ({ role, view }) => {
      const { switchRole, go } =
        await import("/src/stores/applicationStore.ts");
      switchRole(role);
      go(view);
    },
    { role, view },
  );
  await page.waitForTimeout(100);
}
async function save() {
  await dialog().getByRole("button", { name: "Guardar", exact: true }).click();
  await dialog().waitFor({ state: "hidden" });
}
try {
  await page.goto(process.env.APP_URL || "http://localhost:5181", {
    waitUntil: "domcontentloaded",
  });
  await visit("manager", "settings");
  assert.equal(
    await page.getByText("Imagem de capa (URL)", { exact: true }).count(),
    0,
  );
  const image = await page
    .locator('fieldset:has(legend:text("Identidade visual"))')
    .screenshot();
  await page
    .locator('input[type=file][accept="image/jpeg,image/png,image/webp"]')
    .setInputFiles({ name: "cover.png", mimeType: "image/png", buffer: image });
  await page
    .locator('button[aria-label="Ver imagem de capa em ecrã inteiro"] img')
    .waitFor();
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page
      .getByRole("button", { name: "Ver imagem de capa em ecrã inteiro" })
      .click();
    assert(
      await page
        .locator("dialog[open]")
        .evaluate((el) => el.getBoundingClientRect().width >= innerWidth - 1),
    );
    await page.keyboard.press("Escape");
    await page.locator("dialog[open]").waitFor({ state: "hidden" });
  }
  await page
    .getByRole("button", { name: "Guardar alterações", exact: true })
    .click();
  await page.reload();
  await visit("manager", "settings");
  assert(
    (
      await page
        .locator('button[aria-label="Ver imagem de capa em ecrã inteiro"] img')
        .getAttribute("src")
    ).startsWith("data:image/jpeg;"),
  );
  await page
    .locator('input[type=file][accept="image/jpeg,image/png,image/webp"]')
    .setInputFiles({
      name: "bad.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("test"),
    });
  await page.getByRole("alert").filter({ hasText: "JPG" }).waitFor();
  await visit("manager", "services");
  await page.getByRole("button", { name: "Novo serviço", exact: true }).click();
  await dialog().getByLabel("Nome do serviço").fill("Diagram Service");
  await dialog().getByLabel("Preço (MZN)").fill("200");
  await save();
  await visit("manager", "team");
  await page
    .getByRole("button", { name: "Adicionar membro", exact: true })
    .click();
  await dialog().getByLabel("Nome completo").fill("Diagram Professional");
  await dialog().getByLabel("Especialidade ou função").fill("Especialista");
  await dialog().getByLabel("Diagram Service", { exact: true }).check();
  await dialog().getByLabel("Início do turno").fill("09:00");
  await dialog().getByLabel("Fim do turno").fill("17:00");
  await save();
  await page
    .getByRole("button", { name: "Ver histórico de Diagram Professional" })
    .click();
  await dialog()
    .getByText("Ainda não existem marcações neste histórico.")
    .waitFor();
  await dialog().getByRole("button", { name: "Fechar", exact: true }).click();
  await page
    .locator("article")
    .filter({ hasText: "Diagram Professional" })
    .getByTitle("Ver agenda do profissional")
    .click();
  assert.equal(
    await page.evaluate(async () => {
      const { state } = await import("/src/stores/applicationStore.ts");
      return state.view;
    }),
    "agenda",
  );
  await visit("manager", "clients");
  await page
    .getByRole("button", { name: /Ver histórico de/ })
    .first()
    .click();
  await dialog()
    .getByText(/marcações neste estabelecimento/)
    .waitFor();
  await dialog().getByRole("button", { name: "Fechar", exact: true }).click();
  await visit("manager", "schedule");
  await page.getByRole("button", { name: "Adicionar", exact: true }).click();
  await dialog().getByLabel("Motivo").fill("Diagram unavailable");
  await dialog().getByLabel("Data", { exact: true }).fill("2026-12-01");
  await save();
  assert(await page.getByText("Diagram unavailable").count());
  await visit("platform", "companies");
  const companyRow = page.locator("tbody tr").first();
  await companyRow.getByTitle("Suspender estabelecimento").click();
  await companyRow.getByTitle("Activar estabelecimento").click();
  await visit("platform", "users");
  const userRow = page
    .locator("tbody tr")
    .filter({
      has: page.locator('button[title="Suspender utilizador"]:not([disabled])'),
    })
    .first();
  await userRow.getByTitle("Suspender utilizador").click();
  await page.getByTitle("Reactivar utilizador").first().click();
  await visit("platform", "platform-settings");
  await page.getByLabel("Antecedência máxima de marcação").fill("45");
  await page.getByRole("button", { name: "Guardar configurações" }).click();
  assert.equal(
    await page.evaluate(async () => {
      const { state } = await import("/src/stores/applicationStore.ts");
      return state.db.settings.advanceDays;
    }),
    45,
  );
  await visit("platform", "monitoring");
  assert(
    await page
      .locator("main")
      .getByText(/Configurações globais actualizadas/)
      .count(),
  );
  // Prepare an isolated available slot, then execute payment, rescheduling and attendance through the UI.
  const bookingDate = await page.evaluate(async () => {
    const { state, switchRole, go, availableSlots } =
      await import("/src/stores/applicationStore.ts");
    const { shiftDate } = await import("/src/services/seed.ts");
    switchRole("client");
    state.db.bookings = [];
    state.db.blocks = [];
    state.db.businesses.find((b) => b.id === "b1").onlinePayment = true;
    state.db.settings.onlinePayments = true;
    state.db.settings.promotions = true;
    let draft;
    for (let i = 2; i < 12; i++) {
      const date = shiftDate(i),
        slots = availableSlots({
          businessId: "b1",
          serviceId: "s1",
          staffId: "p1",
          date,
        });
      if (slots.length > 2) {
        draft = {
          businessId: "b1",
          serviceId: "s1",
          staffId: "p1",
          date,
          time: slots[0],
          paymentMethod: "online",
          resumeStep: 3,
        };
        break;
      }
    }
    if (!draft) throw Error("No test slot");
    state.bookingDraft = draft;
    go("booking");
    return draft.date;
  });
  await page
    .getByRole("button", { name: "Confirmar marcação", exact: true })
    .click();
  await dialog().getByRole("button", { name: "Testar recusa" }).click();
  await dialog().getByRole("alert").waitFor();
  await dialog()
    .getByRole("textbox", { name: "Número de telefone com indicativo +258" })
    .fill("84 123 4567");
  await dialog().getByRole("button", { name: "Pagar", exact: true }).click();
  await page
    .getByRole("heading", { name: "Tem um encontro marcado." })
    .waitFor();
  assert.equal(
    await page.evaluate(async () => {
      const { state } = await import("/src/stores/applicationStore.ts");
      return state.db.bookings[0].paymentStatus;
    }),
    "paid",
  );
  await visit("client", "appointments");
  await page.getByRole("button", { name: "Ver detalhes" }).first().click();
  await dialog()
    .getByRole("button", { name: "Reagendar", exact: true })
    .click();
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page
    .getByRole("button", { name: /^\d{2}:\d{2}$/ })
    .nth(1)
    .click();
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.getByRole("button", { name: "Confirmar alteração" }).click();
  await page
    .getByRole("heading", { name: "Tem um encontro marcado." })
    .waitFor();
  await visit("professional", "professional-agenda");
  await page.getByLabel("Dia da agenda").fill(bookingDate);
  await page
    .getByRole("button", { name: "Confirmar presença", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Concluir atendimento", exact: true })
    .click();
  assert.equal(
    await page.evaluate(async () => {
      const { state } = await import("/src/stores/applicationStore.ts");
      return state.db.bookings[0].status;
    }),
    "completed",
  );
  assert.deepEqual(errors, []);
  console.log(
    "PASS: cover upload/fullscreen/reload/errors; service, professional, assignment, shift, histories, block, company/user activation and global configuration.",
  );
} finally {
  await browser.close();
}
