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

  // Ruta destino - Ajustada para Docker
  // En Docker: /app/dist/client/uploads
  // En desarrollo: public/uploads
  const baseDir = fs.existsSync(path.join(process.cwd(), "dist", "client"))
    ? path.join(process.cwd(), "dist", "client", "uploads", context)
    : path.join(process.cwd(), "public", "uploads", context);
    
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }

  // Nombre seguro y único
  const safeName = normalizeFilename(name);
  const filename = `${safeName}-${Date.now()}.webp`;
  const filepath = path.join(baseDir, filename);

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

  // Intentar eliminar de ambas ubicaciones posibles
  const urlPath = url.replace(/^\/+/, "");
  
  // Ruta en desarrollo
  const devPath = path.join(process.cwd(), "public", urlPath);
  
  // Ruta en Docker/producción
  const prodPath = path.join(process.cwd(), "dist", "client", urlPath);
  
  if (fs.existsSync(devPath)) {
    fs.unlinkSync(devPath);
  } else if (fs.existsSync(prodPath)) {
    fs.unlinkSync(prodPath);
  }
}
