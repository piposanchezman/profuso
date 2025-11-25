import sharp from "sharp";
import fs from "fs";
import path from "path";

/**
 * Normaliza caracteres especiales en nombres de archivo
 */
function normalizeFilename(name: string): string {
  return name
    .normalize("NFD") // Descompone caracteres con tildes
    .replace(/[\u0300-\u036f]/g, "") // Elimina los diacríticos (tildes)
    .replace(/ñ/gi, "n") // Reemplaza ñ por n
    .replace(/[^a-z0-9\-]/gi, "_") // Reemplaza otros caracteres no válidos
    .toLowerCase();
}

/**
 * Recibe imagen Blob 
 */
export async function uploadImage({
  blob,
  context,
  name
}: {
  blob: Blob;
  context: string;
  name: string;
}): Promise<string> {

  // Convertimos Blob a Buffer
  const buffer = Buffer.from(await blob.arrayBuffer());

  // Ruta destino
  const uploadDir = path.join(process.cwd(), "public", "uploads", context);
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  // Nombre seguro y único
  const safeName = normalizeFilename(name);
  const filename = `${safeName}-${Date.now()}.webp`;
  const filepath = path.join(uploadDir, filename);

  // Sharp → convertir a WebP comprimido
  await sharp(buffer)
    .resize(1600, 1600, { fit: "inside" }) 
    .webp({ quality: 80 })
    .toFile(filepath);

  // URL pública servida por Astro
  const publicUrl = `/uploads/${context}/${filename}`;
  return publicUrl;
}

/**
 * Elimina una imagen ya subida
 */
export async function deleteImage(url: string): Promise<void> {
  if (!url) return;

  const filePath = path.join(process.cwd(), "public", url.replace(/^\/+/, ""));
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}
