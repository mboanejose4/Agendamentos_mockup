import { afterEach, test, vi } from "vitest";
import assert from "node:assert/strict";
import {
  canOpenView,
  routeFromLocation,
  writeViewRoute,
} from "@/utils/navigation/viewRoutes.ts";

afterEach(() => vi.unstubAllGlobals());

test("só abre páginas disponíveis para o perfil", () => {
  assert.equal(canOpenView("guest", "explore"), true);
  assert.equal(canOpenView("guest", "appointments"), false);
  assert.equal(canOpenView("client", "appointments"), true);
  assert.equal(canOpenView("client", "overview"), false);
  assert.equal(canOpenView("manager", "overview"), true);
  assert.equal(canOpenView("professional", "professional-agenda"), true);
  assert.equal(canOpenView("platform", "platform-overview"), true);
});

test("conserva a página no endereço e permite regressar ao início", () => {
  let current = new URL("https://marcafacil.test/?m=abc");
  const history = {
    pushState: (_state: unknown, _title: string, next: string) => {
      current = new URL(next, current);
    },
    replaceState: (_state: unknown, _title: string, next: string) => {
      current = new URL(next, current);
    },
  };
  vi.stubGlobal("window", {
    get location() {
      return current;
    },
    history,
  });

  writeViewRoute("appointments");
  assert.equal(current.searchParams.get("page"), "appointments");
  assert.equal(current.searchParams.has("m"), false);
  assert.equal(routeFromLocation(), "appointments");

  writeViewRoute("explore");
  assert.equal(current.search, "");
  assert.equal(routeFromLocation(), undefined);
});
