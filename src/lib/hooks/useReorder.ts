import { useState } from "react";

interface OrderableItem {
  _id?: any;
  order: number;
}

/**
 * Hook para manejar el reordenamiento de items con persistencia en API
 */
export function useReorder<T extends OrderableItem>(
  setItems: (items: T[]) => void,
  apiEndpoint: string
) {
  const [updating, setUpdating] = useState(false);

  const reorderItems = async (reorderedItems: T[]) => {
    // Actualizar UI inmediatamente
    setItems(reorderedItems);

    // Persistir en backend
    setUpdating(true);
    try {
      const updatePromises = reorderedItems.map((item) => {
        if (!item._id) return Promise.resolve();
        return fetch(`${apiEndpoint}/${item._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: item.order }),
        });
      });

      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Error actualizando orden:", error);
      alert("Error al actualizar el orden");
    } finally {
      setUpdating(false);
    }
  };

  return {
    reorderItems,
    updating,
  };
}
