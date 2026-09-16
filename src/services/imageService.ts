/* Leitura e optimização de imagens para o mockup: tudo acaba em data URL,
   porque não há servidor de ficheiros. */

/* --- Fotografia de perfil ------------------------------------------------ */

/* O avatar é sempre quadrado: recortamos o centro da imagem e reduzimos para
   320 px, o suficiente para o maior sítio onde é mostrado. */
const AVATAR_SIZE = 320;

type CanvasSource = HTMLImageElement | HTMLVideoElement | HTMLCanvasElement;

function squareDataUrl(
  source: CanvasSource,
  width: number,
  height: number,
  { mirror = false }: { mirror?: boolean } = {},
): string {
  if (!width || !height)
    throw new Error("Não foi possível ler a imagem. Tente novamente.");
  const side = Math.min(width, height);
  const canvas = document.createElement("canvas");
  canvas.width = AVATAR_SIZE;
  canvas.height = AVATAR_SIZE;
  const context = canvas.getContext("2d");
  if (!context)
    throw new Error("Não foi possível preparar a imagem neste navegador.");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, AVATAR_SIZE, AVATAR_SIZE);
  if (mirror) {
    context.translate(AVATAR_SIZE, 0);
    context.scale(-1, 1);
  }
  context.drawImage(
    source,
    Math.round((width - side) / 2),
    Math.round((height - side) / 2),
    side,
    side,
    0,
    0,
    AVATAR_SIZE,
    AVATAR_SIZE,
  );
  let result = canvas.toDataURL("image/jpeg", 0.85);
  if (result.length > 220000) result = canvas.toDataURL("image/jpeg", 0.65);
  return result;
}

export async function readAvatarImage(file: File): Promise<string> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw new Error("Escolha uma imagem JPG, PNG ou WebP.");
  if (file.size > 8 * 1024 * 1024)
    throw new Error("A imagem deve ter até 8 MB.");
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    return squareDataUrl(image, image.naturalWidth, image.naturalHeight);
  } catch {
    throw new Error("Não foi possível ler a imagem. Escolha outro ficheiro.");
  } finally {
    URL.revokeObjectURL(url);
  }
}

/* A pré-visualização da câmara é espelhada, como um espelho; a captura segue a
   mesma orientação para que a fotografia seja a que a pessoa viu. */
export function captureAvatarFrame(video: HTMLVideoElement): string {
  return squareDataUrl(video, video.videoWidth, video.videoHeight, {
    mirror: true,
  });
}

export async function readCoverImage(file: File): Promise<string> {
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
    if (!context)
      throw new Error("Não foi possível preparar a imagem neste navegador.");
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
    const message = error instanceof Error ? error.message : "";
    throw new Error(
      message.includes("detalhada")
        ? message
        : "Não foi possível ler a imagem. Escolha outro ficheiro.",
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}
