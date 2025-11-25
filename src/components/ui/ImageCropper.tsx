import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";

interface Props {
  image: string;
  aspect?: number;
  onCropComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

export default function ImageCropper({
  image,
  aspect = 4 / 3,
  onCropComplete,
  onCancel,
}: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const handleCrop = useCallback(
    () => {
      if (!croppedAreaPixels) return;
      getCroppedImg(image, croppedAreaPixels).then(onCropComplete);
    },
    [croppedAreaPixels, image, onCropComplete]
  );

  return (
    <div
      className="relative h-96 bg-black rounded-lg overflow-hidden"
      role="dialog"
      aria-modal="true"
    >
      {/* ✖ Cerrar SOLO el recorte */}
      <button
        type="button"
        onClick={onCancel}
        className="absolute top-4 left-4 text-white bg-black/50 px-3 py-1 rounded-lg hover:bg-black/70 transition z-10"
      >
        ✕
      </button>

      <Cropper
        image={image}
        crop={crop}
        zoom={zoom}
        aspect={aspect}
        onCropChange={setCrop}
        onCropComplete={(_, croppedPixels) => setCroppedAreaPixels(croppedPixels)}
        onZoomChange={setZoom}
      />

      <div className="absolute bottom-4 right-4">
        <button
          type="button"
          onClick={handleCrop}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition"
        >
          Guardar Recorte
        </button>
      </div>
    </div>
  );
}

/* Helpers */
function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = url;
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
  });
}

async function getCroppedImg(imageSrc: string, crop: Area): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height
  );
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/webp", 0.9);
  });
}
