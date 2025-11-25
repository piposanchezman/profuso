import { useEffect, useRef, useState } from "react";

/**
 * Hook reutilizable para gestionar imágenes (subir, reemplazar, eliminar, recortar).
 */
export function useImageManager(setValue: any, watchImages: string[]) {
  const [cropSource, setCropSource] = useState<string | null>(null);
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);
  const [newImagesBlobs, setNewImagesBlobs] = useState<Blob[]>([]);
  const [replaceQueue, setReplaceQueue] = useState<{ url: string; blob: Blob }[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const blobPreviews = useRef<string[]>([]);

  // Limpieza: liberar URLs temporales
  useEffect(() => {
    return () => {
      blobPreviews.current.forEach(URL.revokeObjectURL);
      blobPreviews.current = [];
    };
  }, []);

  function onCropComplete(blob: Blob) {
    const preview = URL.createObjectURL(blob);
    blobPreviews.current.push(preview);

    if (replaceIndex !== null) {
      const oldUrl = watchImages[replaceIndex];
      // Solo proteger assets estáticos, todo lo demás (uploads, projects, services) se puede eliminar
      if (oldUrl && !oldUrl.startsWith("blob:") && !/^\/(assets|src)\//.test(oldUrl)) {
        setRemovedImages((prev) => [...prev, oldUrl]);
      }
      // Usar URL en lugar de índice para rastrear reemplazos
      setReplaceQueue((prev) => [...prev, { url: preview, blob }]);
      setValue(
        "images",
        watchImages.map((img: string, idx: number) => (idx === replaceIndex ? preview : img))
      );
      setReplaceIndex(null);
    } else {
      setNewImagesBlobs((prev) => [...prev, blob]);
      setValue("images", [...watchImages, preview]);
    }

    setCropSource(null);
  }

  function removeImage(i: number) {
    const url = watchImages[i];
    // Solo proteger assets estáticos, todo lo demás (uploads, projects, services) se puede eliminar
    if (url && !url.startsWith("blob:") && !/^\/(assets|src)\//.test(url)) {
      setRemovedImages((prev) => [...prev, url]);
    }
    setValue("images", watchImages.filter((_, idx) => idx !== i));
  }

  function restoreImage(url: string) {
    setRemovedImages((prev) => prev.filter((img) => img !== url));
  }

  function resetManager() {
    setCropSource(null);
    setReplaceIndex(null);
    setNewImagesBlobs([]);
    setReplaceQueue([]);
    setRemovedImages([]);
    blobPreviews.current.forEach(URL.revokeObjectURL);
    blobPreviews.current = [];
  }

  return {
    cropSource,
    setCropSource,
    replaceIndex,
    setReplaceIndex,
    newImagesBlobs,
    replaceQueue,
    removedImages,
    onCropComplete,
    removeImage,
    restoreImage,
    resetManager,
  };
}
