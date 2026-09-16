import { chromium } from "@playwright/test";
const b = await chromium.launch({ channel: "msedge", headless: true });
const p = await b.newPage({ viewport: { width: 320, height: 900 } });
p.on("pageerror", (e) => console.log("ERROR", e.message));
p.on("console", (m) => {
  if (m.type() === "warning") console.log(m.text());
});
await p.goto("http://127.0.0.1:5193", { waitUntil: "domcontentloaded" });
await p.evaluate(async () => {
  const { switchRole, go } = await import("/src/Store/applicationStore.js");
  switchRole("platform");
  go("platform-overview");
});
await p.waitForTimeout(1000);
console.log(
  await p.evaluate(() =>
    Array.from(document.querySelectorAll("main *"))
      .filter((e) => e.getBoundingClientRect().right > innerWidth)
      .map((e) => ({
        tag: e.tagName,
        cls: e.className,
        w: e.getBoundingClientRect().width,
        text: e.textContent.slice(0, 30),
      })),
  ),
);
console.log(
  await p.evaluate(() => ({
    width: innerWidth,
    html: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
    scrolls: Array.from(document.querySelectorAll(".table-scroll")).map(
      (e) => ({
        w: e.clientWidth,
        sw: e.scrollWidth,
        overflow: getComputedStyle(e).overflow,
      }),
    ),
  })),
);
await p.screenshot({ path: "previews/history-debug.png", fullPage: true });
await b.close();
