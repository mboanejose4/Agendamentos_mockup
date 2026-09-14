export async function readCoverImage(file) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw new Error("Escolha uma imagem JPG, PNG ou WebP.");
  if (file.size > 8 * 1024 * 1024)
    throw new Error("A imagem deve ter até 8 MB.");
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const ratio = Math.min(1, 1600 / image.width, 1200 / image.height);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.width * ratio));
    canvas.height = Math.max(1, Math.round(image.height * ratio));
    const context = canvas.getContext("2d");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    let result = canvas.toDataURL("image/jpeg", 0.82);
    if (result.length > 700000) result = canvas.toDataURL("image/jpeg", 0.55);
    if (result.length > 1000000)
      throw new Error(
        "Esta imagem é demasiado detalhada. Escolha uma imagem mais pequena.",
      );
    return result;
  } catch (error) {
    throw new Error(
      error.message?.includes("detalhada")
        ? error.message
        : "Não foi possível ler a imagem. Escolha outro ficheiro.",
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}
