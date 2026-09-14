import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => {
  if (m.type() === "warning" && m.text().includes("[Vue warn]"))
    errors.push(m.text());
});
const base = process.env.APP_URL || "http://localhost:5179";
try {
  await page.goto(base);
  await mkdir("previews/appearance", { recursive: true });
  for (const theme of ["light", "dark"]) {
    if ((await page.locator("html").getAttribute("data-theme")) !== theme)
      await page
        .getByRole("button", {
          name: theme === "dark" ? "Activar modo escuro" : "Activar modo claro",
        })
        .click();
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const [role, view] of [
        ["guest", "explore"],
        ["guest", "auth"],
        ["client", "onboard"],
        ["manager", "overview"],
        ["manager", "settings"],
        ["professional", "professional-history"],
        ["platform", "platform-overview"],
        ["platform", "companies"],
      ]) {
        await page.evaluate(
          async ({ role, view }) => {
            const { switchRole, go } =
              await import("/src/Store/applicationStore.js");
            switchRole(role);
            go(view);
          },
          { role, view },
        );
        await page.waitForTimeout(100);
        assert.equal(
          await page.locator("html").getAttribute("data-theme"),
          theme,
        );
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth + 1,
          ),
          false,
          theme + "/" + view + "/" + width,
        );
        if (
          [390, 1440].includes(width) &&
          ["explore", "auth", "onboard"].includes(view)
        )
          await page.screenshot({
            path:
              "previews/appearance/" +
              theme +
              "-" +
              view +
              "-" +
              width +
              ".png",
            fullPage: true,
            animations: "disabled",
          });
      }
    }
  }
  await page.setViewportSize({ width: 390, height: 1000 });
  await page.evaluate(async () => {
    const { switchRole, go } = await import("/src/Store/applicationStore.js");
    switchRole("client");
    go("onboard");
  });
  await page.getByLabel("Nome do estabelecimento").fill("Brand Test");
  await page.getByLabel("Endereço", { exact: true }).fill("Rua Teste");
  await page.getByLabel("Contacto", { exact: true }).fill("+258840000000");
  await page.getByLabel("E-mail", { exact: true }).fill("brand@example.com");
  await page
    .getByLabel("Sobre o estabelecimento")
    .fill("Teste de identidade visual.");
  await page.getByLabel("Cor primária", { exact: true }).fill("#ffff00");
  await page.getByLabel("Cor secundária", { exact: true }).fill("#0000ff");
  const png = await page.locator(".brand-preview").screenshot();
  await page
    .locator(".branding-editor input[type=file]")
    .setInputFiles({ name: "icon.png", mimeType: "image/png", buffer: png });
  await page.locator(".brand-preview img").waitFor();
  await page.getByRole("button", { name: "Criar estabelecimento" }).click();
  await page.waitForFunction(async () => {
    const { state } = await import("/src/Store/applicationStore.js");
    return state.view === "services";
  });
  let branding = await page.evaluate(async () => {
    const { state } = await import("/src/Store/applicationStore.js");
    return state.db.businesses.find((b) => b.id === state.businessId).branding;
  });
  assert.equal(branding.primaryColor, "#ffff00");
  assert.equal(branding.secondaryColor, "#0000ff");
  assert(branding.icon.startsWith("data:image/png;"));
  await page.reload();
  assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
  assert.equal(
    await page.evaluate(() =>
      document.documentElement.style.getPropertyValue("--primary"),
    ),
    "#ffff00",
  );
  await page.evaluate(async () => {
    const { go } = await import("/src/Store/applicationStore.js");
    go("settings");
  });
  await page.getByLabel("Cor primária", { exact: true }).fill("#663399");
  await page
    .locator("form.settings-form button[type=submit]")
    .count()
    .then(async (n) => {
      if (n)
        await page.locator("form.settings-form button[type=submit]").click();
      else
        await page.locator("form.settings-form .form-actions .primary").click();
    });
  await page.evaluate(async () => {
    const { state, go } = await import("/src/Store/applicationStore.js");
    state.selectedBusinessId = state.businessId;
    go("business");
  });
  await page.waitForTimeout(100);
  assert.equal(
    await page.evaluate(() =>
      document.documentElement.style.getPropertyValue("--primary"),
    ),
    "#663399",
  );
  await page.locator(".business-title img").waitFor();
  await page.evaluate(async () => {
    const { go } = await import("/src/Store/applicationStore.js");
    go("explore");
  });
  await page.waitForTimeout(100);
  assert.equal(
    await page.evaluate(() =>
      document.documentElement.style.getPropertyValue("--primary"),
    ),
    "#008340",
  );
  await page.evaluate(() => localStorage.removeItem("marcafacil.appearance"));
  await page.reload();
  await page.emulateMedia({ colorScheme: "light" });
  await page.waitForTimeout(100);
  assert.equal(await page.locator("html").getAttribute("data-theme"), "light");
  await page.emulateMedia({ colorScheme: "dark" });
  await page.waitForTimeout(100);
  assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
  assert.deepEqual(errors, []);
  console.log(
    "PASS: 64 combinações tema/página/ecrã; paleta, ícone, edição, persistência e tema automático.",
  );
} finally {
  await browser.close();
}
