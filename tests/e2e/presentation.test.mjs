import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
import { writeFile, mkdir } from "node:fs/promises";
const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
page.setDefaultTimeout(10000);
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const results = [];
const modal = () => page.locator("dialog[open]");
const button = (name) => page.getByRole("button", { name, exact: true });
async function visit(role, view) {
  await page.evaluate(
    async ({ role, view }) => {
      const { state, switchRole, go } =
        await import("/src/stores/applicationStore.ts");
      switchRole(role);
      state.businessId = "b1";
      state.selectedBusinessId = "b1";
      go(view);
    },
    { role, view },
  );
  await page.waitForTimeout(300);
}
async function reset() {
  await page.goto(process.env.APP_URL || "http://127.0.0.1:5193", {
    waitUntil: "domcontentloaded",
  });
  await page.evaluate(async () => {
    const { state, go } = await import("/src/stores/applicationStore.ts");
    const { makeSeed } = await import("/src/services/seed.ts");
    state.db = makeSeed();
    state.bookingDraft = null;
    state.role = "guest";
    go("explore");
  });
  await page.waitForTimeout(150);
  errors.length = 0;
}
async function save(name = "Guardar") {
  await modal().getByRole("button", { name, exact: true }).click();
  await modal().waitFor({ state: "hidden" });
}
async function close() {
  await modal().getByRole("button", { name: "Fechar", exact: true }).click();
}
async function run(id, title, fn) {
  try {
    await reset();
    await fn();
    assert.deepEqual(errors, []);
    results.push({ id, title, status: "PASS" });
    console.log("PASS", id, title);
  } catch (e) {
    results.push({ id, title, status: "FAIL", error: e.message });
    console.log("FAIL", id, e.message.slice(0, 500));
    await page
      .screenshot({ path: `previews/presentation-${id}.png`, fullPage: true })
      .catch(() => {});
  }
}
async function seedBooking(payment = "onsite", step = 1) {
  return page.evaluate(
    async ({ payment, step }) => {
      const { state, switchRole, go, availableSlots } =
        await import("/src/stores/applicationStore.ts");
      const { shiftDate } = await import("/src/services/seed.ts");
      switchRole("client");
      state.db.bookings = [];
      state.db.blocks = [];
      const date = shiftDate(2);
      const slots = availableSlots({
        businessId: "b1",
        serviceId: "s1",
        staffId: "p1",
        date,
      });
      state.bookingDraft = {
        businessId: "b1",
        serviceId: "s1",
        staffId: "p1",
        date,
        time: step === 3 ? slots[0] : "",
        paymentMethod: payment,
        resumeStep: step,
      };
      go("booking");
      return date;
    },
    { payment, step },
  );
}
await mkdir("previews", { recursive: true });
try {
  await run(
    "F01",
    "Reserva completa no local, validação de horário, calendário e cancelamento",
    async () => {
      await seedBooking();
      await button("Continuar").click();
      await expect(button("Continuar")).toBeDisabled();
      await page
        .getByRole("button", { name: /^\d{2}:\d{2}$/ })
        .first()
        .click();
      await button("Continuar").click();
      await button("Confirmar marcação").click();
      await expect(
        page.getByRole("heading", { name: "Tem um encontro marcado." }),
      ).toBeVisible();
      const dl = page.waitForEvent("download");
      await button("Adicionar ao calendário").click();
      assert((await dl).suggestedFilename().endsWith(".ics"));
      await button("Ver marcações").click();
      await page.getByRole("button", { name: "Ver detalhes" }).first().click();
      await modal()
        .getByRole("button", { name: "Cancelar", exact: true })
        .click();
      await modal()
        .getByRole("button", { name: /Confirmar cancelamento/ })
        .click();
      await expect
        .poll(() =>
          page.evaluate(async () => {
            const { state } = await import("/src/stores/applicationStore.ts");
            return state.db.bookings[0].status;
          }),
        )
        .toBe("cancelled");
    },
  );
  await run(
    "F02",
    "Carteiras Mkesh Mpesa e eMola, validação do telefone e pagamento",
    async () => {
      await seedBooking("online", 3);
      await button("Confirmar marcação").click();
      await expect(modal().getByLabel("Método de pagamento")).toHaveValue(
        "mobile",
      );
      for (const wallet of ["mkesh", "mpesa", "emola"]) {
        await modal().getByLabel("Carteira móvel").selectOption(wallet);
        await modal()
          .getByRole("textbox", {
            name: "Número de telefone com indicativo +258",
          })
          .fill("841234567");
        await expect(
          modal().getByRole("textbox", {
            name: "Número de telefone com indicativo +258",
          }),
        ).toHaveValue("84 123 4567");
      }
      await modal()
        .getByRole("textbox", {
          name: "Número de telefone com indicativo +258",
        })
        .fill("84");
      await modal().getByRole("button", { name: "Pagar", exact: true }).click();
      await expect(modal()).toBeVisible();
      await modal()
        .getByRole("textbox", {
          name: "Número de telefone com indicativo +258",
        })
        .fill("841234567");
      await modal().getByRole("button", { name: "Pagar", exact: true }).click();
      await expect(
        page.getByRole("heading", { name: "Tem um encontro marcado." }),
      ).toBeVisible();
    },
  );
  await run(
    "F03",
    "Cartão de crédito, campos obrigatórios e dados não persistidos",
    async () => {
      await seedBooking("online", 3);
      await button("Confirmar marcação").click();
      await modal().getByLabel("Método de pagamento").selectOption("card");
      await modal().getByLabel("Nome do titular").fill("Cliente Teste");
      await modal().getByLabel("Número do cartão").fill("4111111111111111");
      await modal().getByLabel("Validade").fill("2030-12");
      await modal().getByLabel("Código de segurança (CVV)").fill("123");
      await modal().getByRole("button", { name: "Pagar", exact: true }).click();
      await expect(
        page.getByRole("heading", { name: "Tem um encontro marcado." }),
      ).toBeVisible();
      assert.equal(
        await page.evaluate(() =>
          JSON.stringify(localStorage).includes("4111"),
        ),
        false,
      );
    },
  );
  await run(
    "F04",
    "Gestor reserva, histórico, desactivação e remoção de cliente sem editar perfil",
    async () => {
      await visit("manager", "clients");
      assert.equal(await page.getByTitle("Editar cliente").count(), 0);
      assert.equal(await button("Novo cliente").count(), 0);
      const row = page.locator("tbody tr").first();
      const name = await row.locator("strong").innerText();
      await row.getByTitle("Reservar para este cliente").click();
      await expect(modal().getByLabel(/^Cliente/)).not.toHaveValue("");
      await close();
      await row.getByTitle("Ver histórico").click();
      await expect(modal()).toBeVisible();
      await close();
      await row.getByTitle("Desactivar cliente").click();
      await expect(row.getByTitle("Reservar para este cliente")).toBeDisabled();
      await row.getByTitle("Ver histórico").click();
      await close();
      await row.getByTitle("Remover cliente da empresa").click();
      await save("Remover");
      assert.equal(
        await page.locator("tbody tr").filter({ hasText: name }).count(),
        0,
      );
    },
  );
  await run("F05", "Recursos criar editar remover", async () => {
    await visit("manager", "resources");
    await button("Novo recurso").click();
    await modal().getByLabel("Nome do recurso").fill("Sala Apresentação");
    await modal().getByLabel(/^Tipo/).fill("Sala");
    await save();
    const card = page
      .locator("article")
      .filter({ hasText: "Sala Apresentação" });
    await card.getByTitle("Editar recurso").click();
    await modal().getByLabel("Capacidade (pessoas)").fill("2");
    await save();
    await card.getByTitle("Eliminar recurso").click();
    await save("Eliminar");
    await expect(card).toHaveCount(0);
  });
  await run(
    "F06",
    "Promoções criar desactivar activar editar e remover",
    async () => {
      await visit("manager", "promotions");
      await button("Nova promoção").click();
      await modal().getByLabel("Código do cupão").fill("APRESENTA10");
      await modal().getByLabel("Válida até").fill("2030-12-31");
      await save();
      const row = page.locator("article").filter({ hasText: "APRESENTA10" });
      await row.getByTitle("Desactivar promoção").click();
      await row.getByTitle("Activar promoção").click();
      await row.getByRole("button").first().click();
      await modal().getByLabel("Desconto (%)").fill("15");
      await save();
      await row.getByTitle("Eliminar promoção").click();
      await save("Eliminar");
      await expect(row).toHaveCount(0);
    },
  );
  await run("F07", "Suporte criar responder resolver e reabrir", async () => {
    await visit("manager", "support");
    await button("Novo pedido").click();
    await modal().getByLabel("Assunto").fill("Apresentação suporte");
    await modal()
      .getByLabel("Descrição")
      .fill("Pedido fictício para demonstrar o acompanhamento.");
    await modal()
      .getByRole("button", { name: "Criar pedido", exact: true })
      .click();
    await expect(modal().getByLabel("A sua resposta")).toBeVisible();
    await modal()
      .getByLabel("A sua resposta")
      .fill("Informação adicional de teste");
    await modal()
      .getByRole("button", { name: "Responder", exact: true })
      .click();
    await expect(
      modal().getByText("Informação adicional de teste", { exact: true }),
    ).toBeVisible();
    await modal()
      .getByRole("button", { name: "Marcar como resolvido" })
      .click();
    await modal().getByRole("button", { name: "Reabrir pedido" }).click();
    await close();
    await visit("platform", "support");
    await expect(
      page.getByText("Apresentação suporte", { exact: true }),
    ).toBeVisible();
  });
  await run(
    "F08",
    "Profissional criar editar remover indisponibilidade e exportar histórico",
    async () => {
      await visit("professional", "professional-schedule");
      await button("Bloquear período").click();
      await modal().getByLabel("Data", { exact: true }).fill("2026-12-02");
      await modal().getByLabel("Motivo").fill("Pausa apresentação");
      await save("Guardar período");
      const row = page
        .locator("article")
        .filter({ hasText: "Pausa apresentação" });
      await row.getByTitle("Editar período").click();
      await modal().getByLabel("Motivo").fill("Pausa revista");
      await save("Guardar período");
      await page
        .locator("article")
        .filter({ hasText: "Pausa revista" })
        .getByTitle("Remover período")
        .click();
      await save("Remover período");
      await visit("professional", "professional-history");
      const dl = page.waitForEvent("download");
      await button("Exportar").click();
      assert((await dl).suggestedFilename().endsWith(".csv"));
    },
  );
  await run("F09", "Perfil do cliente e notificações", async () => {
    await visit("client", "profile");
    await page.getByLabel("Nome completo").fill("Cliente Apresentação");
    await button("Guardar alterações").click();
    await page.reload();
    await visit("client", "profile");
    await expect(page.getByLabel("Nome completo")).toHaveValue(
      "Cliente Apresentação",
    );
    await visit("client", "notifications");
    if (await page.getByTitle("Marcar como lida").count())
      await page.getByTitle("Marcar como lida").first().click();
    if (await button("Marcar todas como lidas").isEnabled())
      await button("Marcar todas como lidas").click();
    await expect(button("Marcar todas como lidas")).toBeDisabled();
  });
  await run(
    "F10",
    "Administração criar editar suspender reactivar e eliminar utilizador",
    async () => {
      await visit("platform", "users");
      await button("Novo utilizador").click();
      await modal().getByLabel("Nome completo").fill("Utilizador Apresentação");
      await modal()
        .getByLabel("Email", { exact: true })
        .fill("apresentacao@example.com");
      await modal().getByLabel("Telemóvel").fill("+258841234567");
      await modal()
        .getByLabel("Palavra-passe inicial")
        .fill("TesteApresenta123");
      await save("Guardar utilizador");
      const row = page
        .locator("tbody tr")
        .filter({ hasText: "Utilizador Apresentação" });
      await row.getByTitle("Editar utilizador").click();
      await modal().getByLabel("Telemóvel").fill("+258841234568");
      await save("Guardar utilizador");
      await row.getByTitle("Suspender utilizador").click();
      await row.getByTitle("Reactivar utilizador").click();
      await row.getByTitle("Eliminar utilizador").click();
      await save("Confirmar remoção");
      await expect(row).toHaveCount(0);
    },
  );
  await run(
    "F11",
    "Administração criar editar e remover empresa sem dependências",
    async () => {
      await visit("platform", "companies");
      await button("Novo estabelecimento").click();
      for (const [label, value] of [
        ["Nome do estabelecimento", "Empresa Apresentação"],
        ["Cidade", "Maputo"],
        ["Descrição", "Empresa fictícia"],
        ["Endereço", "Rua de teste"],
        ["Email", "empresa@example.com"],
        ["Telefone", "+258841234567"],
      ])
        await modal().getByLabel(label, { exact: true }).fill(value);
      await save("Guardar estabelecimento");
      const row = page
        .locator("tbody tr")
        .filter({ hasText: "Empresa Apresentação" });
      await row.getByTitle("Editar estabelecimento").click();
      await modal().getByLabel("Cidade", { exact: true }).fill("Matola");
      await save("Guardar estabelecimento");
      await row.getByTitle("Remover estabelecimento").click();
      await save("Confirmar remoção");
      await expect(row).toHaveCount(0);
    },
  );
} finally {
  await mkdir("docs/validacao", { recursive: true });
  await writeFile(
    "docs/validacao/fluxos-apresentacao.json",
    JSON.stringify({ executedAt: new Date().toISOString(), results }, null, 2),
  );
  await browser.close();
}
if (results.some((r) => r.status === "FAIL")) process.exitCode = 1;
