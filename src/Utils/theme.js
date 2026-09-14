export const defaultBrand = {
  primaryColor: "#008340",
  secondaryColor: "#023627",
  icon: "",
};
export const isHexColor = (value) => /^#[0-9a-f]{6}$/i.test(value || "");
export function normalizeBrand(value = {}) {
  return {
    primaryColor: isHexColor(value.primaryColor)
      ? value.primaryColor
      : defaultBrand.primaryColor,
    secondaryColor: isHexColor(value.secondaryColor)
      ? value.secondaryColor
      : defaultBrand.secondaryColor,
    icon:
      typeof value.icon === "string" &&
      /^data:image\/(png|jpeg|webp);base64,/.test(value.icon)
        ? value.icon
        : "",
  };
}
function rgb(hex) {
  return hex
    .slice(1)
    .match(/../g)
    .map((n) => parseInt(n, 16));
}
function luminance(hex) {
  return rgb(hex)
    .map((n) => {
      n /= 255;
      return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
    })
    .reduce((sum, n, i) => sum + n * [0.2126, 0.7152, 0.0722][i], 0);
}
export function contrast(a, b) {
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
export function textOn(color) {
  return contrast(color, "#ffffff") >= contrast(color, "#000000")
    ? "#ffffff"
    : "#000000";
}
export function accessibleAccent(color, background) {
  let result = color;
  const target = luminance(background) < 0.3 ? "#ffffff" : "#000000";
  for (let i = 0; i <= 100; i++) {
    const amount = i / 100;
    result =
      "#" +
      rgb(color)
        .map((n, j) =>
          Math.round(n + (rgb(target)[j] - n) * amount)
            .toString(16)
            .padStart(2, "0"),
        )
        .join("");
    if (contrast(result, background) >= 6) return result;
  }
  return result;
}
