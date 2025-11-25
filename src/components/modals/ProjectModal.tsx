import { useEffect, useRef, useState } from "react";
import ImageCropper from "@components/ui/ImageCropper";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { projectSchema } from "@lib/models";
import { useImageManager } from "@lib/hooks/useImageManager";
import { uploadBlob, deleteRemoteImage } from "@lib/utils/uploadUtils";
import ConfirmModal from "@components/ui/ConfirmModal";

type ProjectForm = z.infer<typeof projectSchema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  initialProject?: any;
}

export default function ProjectModal({ open, onClose, onSave, initialProject }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const showConfirm = (title: string, message: string, action: () => void) => {
    setConfirmTitle(title);
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setConfirmOpen(true);
  };

  const handleDrop = (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) return;
    const newImages = [...images];
    const [draggedItem] = newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, draggedItem);
    setValue("images", newImages);
    setDraggedIndex(null);
  };

  const {
    register,
    watch,
    setValue,
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ProjectForm>({
    resolver: zodResolver(projectSchema) as any,
    defaultValues: { title: "", description: "", images: [] },
  });

  const images = watch("images");
  const {
    cropSource,
    setCropSource,
    setReplaceIndex,
    newImagesBlobs,
    replaceQueue,
    removedImages,
    onCropComplete,
    removeImage,
    restoreImage,
    resetManager,
  } = useImageManager(setValue, images);

  useEffect(() => {
    if (open) {
      if (initialProject) {
        reset({
          title: initialProject.title || "",
          description: initialProject.description || "",
          images: initialProject.images || [],
        });
      } else {
        reset({ title: "", description: "", images: [] });
      }
    }
  }, [open, initialProject, reset]);

  const handleClose = () => {
    resetManager();
    reset();
    onClose();
  };

  if (!open) return null;

  const saveProject = handleSubmit(async (values) => {
    try {
      let finalImages = [...images];

      // Reemplazar imágenes existentes (buscar por URL blob en lugar de índice)
      await Promise.all(
        replaceQueue.map(async ({ url: blobUrl, blob }: { url: string; blob: Blob }) => {
          const uploadedUrl = await uploadBlob(blob, "project", values.title);
          const index = finalImages.findIndex(img => img === blobUrl);
          if (index !== -1) {
            finalImages[index] = uploadedUrl;
          }
        })
      );

      // Subir imágenes nuevas
      const newUrls = await Promise.all(
        newImagesBlobs.map(async (blob: Blob) => {
          return await uploadBlob(blob, "project", values.title);
        })
      );

      // Reemplazar blobs de imágenes nuevas con sus URLs subidas
      let newUrlIndex = 0;
      finalImages = finalImages.map(img => {
        if (img.startsWith("blob:") && !replaceQueue.find(q => q.url === img)) {
          return newUrls[newUrlIndex++];
        }
        return img;
      });

      // Eliminar imágenes antiguas del servidor
      await Promise.all(removedImages.map((url: string) => deleteRemoteImage(url)));

      // Eliminar blobs temporales restantes
      finalImages = finalImages.filter((url: string) => !url.startsWith("blob:"));

      // Guardar cambios en la base de datos
      const response = await fetch(
        initialProject?._id ? `/api/projects/${initialProject._id}` : `/api/projects`,
        {
          method: initialProject?._id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...values, images: finalImages }),
        }
      );

      if (!response.ok) throw new Error("Error al guardar");

      onSave();
    } catch (error) {
      console.error("Error guardando proyecto:", error);
      alert("Error al guardar el proyecto. Por favor intenta de nuevo.");
    }
  });

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-200 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-linear-to-br from-gray-900 to-gray-800 border border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden">
        <div className="bg-gray-900/95 border-b border-gray-700/50 px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold bg-linear-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
              {initialProject ? "Editar Proyecto" : "Nuevo Proyecto"}
            </h2>
            <p className="text-gray-400 text-sm mt-1">Completa la información del proyecto</p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
            aria-label="Cerrar"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={saveProject} className="p-6 space-y-6 overflow-y-auto">
          {/* Título */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Título</label>
            <input
              {...register("title")}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder="Ingresa el título del proyecto"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Descripción</label>
            <textarea
              rows={3}
              {...register("description")}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
              placeholder="Describe el proyecto"
            />
          </div>

          {/* Imágenes */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Imágenes</label>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                if (!e.target.files?.length) return;
                setCropSource(URL.createObjectURL(e.target.files[0]));
                e.target.value = "";
              }}
            />

            {!cropSource && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div
                  onClick={() => {
                    setReplaceIndex(null);
                    fileRef.current?.click();
                  }}
                  className="aspect-4/3 border-2 border-dashed border-gray-700 hover:border-blue-500 rounded-lg flex items-center justify-center text-gray-500 hover:text-blue-500 text-4xl cursor-pointer transition-all bg-gray-800/30 hover:bg-gray-800/50"
                >
                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>

                {images.map((url: string, idx: number) => (
                  <div
                    key={idx}
                    draggable
                    onDragStart={() => setDraggedIndex(idx)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(idx)}
                    className={`relative group border rounded-lg overflow-hidden bg-gray-800 hover:border-blue-500/50 transition-all cursor-move ${
                      draggedIndex === idx ? 'border-blue-500 opacity-50' : 'border-gray-700'
                    }`}
                  >
                    <div className="absolute top-2 left-2 p-1 bg-gray-900/80 rounded z-10">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                      </svg>
                    </div>
                    <img src={url} className="w-full h-full object-cover aspect-4/3" alt={`Imagen ${idx + 1}`} />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all" />
                    <button
                      type="button"
                      className="absolute bottom-2 left-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md opacity-0 group-hover:opacity-100 transition-all shadow-lg z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        setReplaceIndex(idx);
                        fileRef.current?.click();
                      }}
                    >
                      Reemplazar
                    </button>
                    <button 
                      type="button" 
                      className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-md shadow-lg transition-all z-10" 
                      onClick={(e) => { e.stopPropagation(); showConfirm("Eliminar imagen", "¿Seguro que deseas eliminar esta imagen?", () => removeImage(idx)); }}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {cropSource && (
              <ImageCropper
                image={cropSource}
                aspect={4 / 3}
                onCropComplete={onCropComplete}
                onCancel={() => setCropSource(null)}
              />
            )}
          </div>

          {/* Sección de imágenes pendientes de eliminar */}
          {removedImages.length > 0 && (
            <div className="border border-red-500/30 bg-red-500/5 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h4 className="text-sm font-semibold text-red-400">Imágenes que se eliminarán al guardar ({removedImages.length})</h4>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {removedImages.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <img src={url} className="w-full aspect-square object-cover rounded-lg border border-red-500/50" alt={`Eliminar ${idx + 1}`} />
                    <button
                      type="button"
                      onClick={() => {
                        restoreImage(url);
                        setValue("images", [...images, url]);
                      }}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center rounded-lg"
                      title="Restaurar imagen"
                    >
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botones */}
          {!cropSource && (
            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                {isSubmitting ? "Guardando..." : "Guardar"}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-3 bg-gray-800 border border-gray-700 text-gray-300 font-semibold rounded-lg hover:bg-gray-700 transition-all"
              >
                Cancelar
              </button>
            </div>
          )}
        </form>
      </div>
      <ConfirmModal
        open={confirmOpen}
        title={confirmTitle}
        message={confirmMessage}
        onConfirm={() => {
          confirmAction();
          setConfirmOpen(false);
        }}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  );
}
