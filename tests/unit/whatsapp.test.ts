import { describe, expect, test } from "vitest";
import { isUsablePhone, normalizePhone } from "@/utils/whatsapp.ts";

describe("contactos moçambicanos", () => {
  test("normaliza números nacionais e com indicativo", () => {
    expect(normalizePhone("84 123 4567")).toBe("258841234567");
    expect(normalizePhone("+258 84 123 4567")).toBe("258841234567");
  });

  test("aceita apenas nove dígitos nacionais entre 82 e 88", () => {
    expect(isUsablePhone("82 123 4567")).toBe(true);
    expect(isUsablePhone("+258 88 123 4567")).toBe(true);
    expect(isUsablePhone("81 123 4567")).toBe(false);
    expect(isUsablePhone("89 123 4567")).toBe(false);
    expect(isUsablePhone("84 123 456")).toBe(false);
    expect(isUsablePhone("84 123 45678")).toBe(false);
  });
});
