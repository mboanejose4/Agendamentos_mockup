import { test } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeBrand,
  defaultBrand,
  contrast,
  textOn,
  accessibleAccent,
} from "../../src/Utils/theme.js";
test("brand defaults reject invalid colors and executable icon URLs", () => {
  assert.deepEqual(
    normalizeBrand({
      primaryColor: "red",
      secondaryColor: "bad",
      icon: "javascript:alert(1)",
    }),
    defaultBrand,
  );
});
test("brand foregrounds remain readable for extreme and saturated palettes", () => {
  for (const c of [
    "#ffffff",
    "#000000",
    "#ffff00",
    "#ff00ff",
    "#0000ff",
    "#019e51",
  ]) {
    assert(contrast(c, textOn(c)) >= 4.5);
    for (const surface of ["#ffffff", "#112018"])
      assert(contrast(accessibleAccent(c, surface), surface) >= 4.5);
  }
});
